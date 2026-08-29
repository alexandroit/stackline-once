import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const temporary = await mkdtemp(path.join(os.tmpdir(), 'stackline-once-downstreams-'))
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const requested = process.env.STACKLINE_DOWNSTREAM || 'all'
const allowed = new Set(['all', 'restify-clients', 'adobe-alloy'])
const results = []
const emptyUserConfig = path.join(temporary, 'empty-user-npmrc')
const nodeVersion = process.versions.node.split('.').map(Number)
const ansiSequence = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*[A-Za-z]`, 'g')

assert.ok(allowed.has(requested), `STACKLINE_DOWNSTREAM must be one of: ${[...allowed].join(', ')}`)
assert.ok(nodeVersion[0] > 22 || (nodeVersion[0] === 22 && nodeVersion[1] >= 13), 'downstream proof requires Node.js >=22.13')
await writeFile(emptyUserConfig, '')

const downstreamEnv = {
  ...process.env,
  CI: '1',
  NPM_CONFIG_USERCONFIG: emptyUserConfig,
  npm_config_userconfig: emptyUserConfig,
  NO_UPDATE_NOTIFIER: '1'
}
for (const key of Object.keys(downstreamEnv)) {
  if (/^(?:(?:npm_config|yarn)[_-])?(?:proxy|https?[_-]proxy|all[_-]proxy)$/i.test(key)) delete downstreamEnv[key]
}

function run (command, args, cwd, timeout = 1800000, allowedStatuses = [0]) {
  console.log(`> [${path.basename(cwd)}] ${command} ${args.join(' ')}`)
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: downstreamEnv,
    maxBuffer: 128 * 1024 * 1024,
    timeout
  })
  const combined = `${result.stdout || ''}\n${result.stderr || ''}`
  const diagnostic = combined
    .replace(ansiSequence, '')
    .split('\n')
    .filter((line) => /(?:^|\s)(?:not ok|FAIL|failed|timeout|SIG[A-Z]+|ERR_[A-Z_]+|Error:)/i.test(line))
    .slice(-400)
    .join('\n')
  assert.ok(
    allowedStatuses.includes(result.status),
    `${command} ${args.join(' ')} failed in ${cwd}; signal=${result.signal || 'none'}; ` +
      `spawnError=${result.error ? result.error.message : 'none'}\n${diagnostic || combined.slice(-131072)}`
  )
  return result
}

function manager (name, version, args, cwd, timeout) {
  return run(
    npmCommand,
    ['exec', '--yes', `--package=${name}@${version}`, '--', name].concat(args),
    cwd,
    timeout
  )
}

function yarn (args, cwd, timeout) {
  return manager('yarn', '1.22.22', [
    '--no-default-rc',
    '--registry=https://registry.npmjs.org',
    '--proxy=',
    '--https-proxy='
  ].concat(args), cwd, timeout)
}

function pnpm (args, cwd, timeout) {
  return manager('pnpm', '11.11.0', args, cwd, timeout)
}

async function clonePinned (repository, commit, name) {
  const target = path.join(temporary, name)
  run('git', ['clone', '--filter=blob:none', '--no-checkout', repository, target], temporary)
  run('git', ['checkout', '--detach', commit], target)
  assert.equal(run('git', ['rev-parse', 'HEAD'], target).stdout.trim(), commit)
  return target
}

async function replaceDirectOnce (repository, manifestRelative, tarball) {
  const manifestPath = path.join(repository, manifestRelative)
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  assert.ok(manifest.dependencies && manifest.dependencies.once, `${manifestRelative} must directly depend on once`)
  manifest.dependencies.once = `file:${tarball}`
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
}

async function installedIdentity (repository, packageRelative) {
  const manifest = JSON.parse(await readFile(path.join(repository, packageRelative, 'package.json'), 'utf8'))
  assert.equal(manifest.name, '@stackline/once')
  assert.equal(manifest.version, '1.0.0')
  assert.deepEqual(manifest.dependencies, undefined)
  return {
    license: manifest.license,
    name: manifest.name,
    productionDependencies: 0,
    version: manifest.version
  }
}

function assertOnlyTrackedChanges (repository, expected) {
  const changed = run('git', ['diff', '--name-only'], repository).stdout.trim().split('\n').filter(Boolean).sort()
  assert.deepEqual(changed, [...expected].sort())
}

async function adobeBuildMetric (repository) {
  const relative = 'packages/browser/bundlesize.json'
  const before = JSON.parse(run('git', ['show', `HEAD:${relative}`], repository).stdout)
  const after = JSON.parse(await readFile(path.join(repository, relative), 'utf8'))
  const deltas = {}
  for (const [bundle, measurements] of Object.entries(after)) {
    for (const [measurement, value] of Object.entries(measurements)) {
      const delta = value - before[bundle][measurement]
      if (delta !== 0) deltas[`${bundle}:${measurement}`] = delta
    }
  }
  const diff = run('git', ['diff', '--', relative], repository).stdout
  return {
    deltas,
    diffSha256: crypto.createHash('sha256').update(diff).digest('hex'),
    path: relative
  }
}

async function runRestifyGates (repository, expectedFilteredPassing) {
  run('make', ['clean'], repository)
  yarn(['install', '--non-interactive', '--no-progress'], repository)
  run('make', ['lint'], repository)
  run('make', ['codestyle'], repository)

  const full = run('make', ['coverage'], repository, 1800000, [0, 1, 2])
  const fullOutput = `${full.stdout || ''}\n${full.stderr || ''}`
  const failureCount = lastMochaCount(fullOutput, 'failing')
  const passing = lastMochaCount(fullOutput, 'passing')
  const knownEnvironmentalFailures = [
    'exercise callback when server closes socket',
    'StringClient should emit after event on connect timeout',
    'JSONClient should emit after event on connect timeout',
    'HttpClient should emit after event on connect timeout',
    'should return ConnectTimeoutError on connect timeout',
    'JsonClient should increment and decrement inflight on connection timeout',
    'StringClient should increment and decrement inflight on connection timeout'
  ]
  const failureDetails = failureCount === 0
    ? ''
    : fullOutput.slice(fullOutput.lastIndexOf(`${failureCount} failing`))
  const environmentalFailures = knownEnvironmentalFailures.filter((title) => failureDetails.includes(title))
  assert.equal(environmentalFailures.length, failureCount, 'full suite has a non-environmental failure')
  assert.ok(passing >= 230, `full suite reported only ${passing} passing tests`)

  const filtered = run('./node_modules/.bin/mocha', [
    '-R',
    'dot',
    '--full-trace',
    '--grep',
    'connect(?:ion)? timeout|exercise callback when server closes socket',
    '--invert'
  ], repository)
  const filteredOutput = `${filtered.stdout || ''}\n${filtered.stderr || ''}`
  assert.equal(lastMochaCount(filteredOutput, 'passing'), expectedFilteredPassing)
  assert.equal(lastMochaCount(filteredOutput, 'failing'), 0)
  return { environmentalFailures, failureCount, filteredPassing: expectedFilteredPassing, passing }
}

function lastMochaCount (output, state) {
  const matches = [...output.matchAll(new RegExp(`(\\d+) ${state}`, 'g'))]
  return Number(matches.at(-1)?.[1] || 0)
}

async function injectRestifyRegression (repository) {
  const target = path.join(repository, 'test/HttpClient.test.js')
  let source = await readFile(target, 'utf8')
  const importMarker = "var assert = require('chai').assert;"
  const declarationMarker = '    var CLIENT;'
  assert.equal(source.split(importMarker).length - 1, 1)
  assert.equal(source.split(declarationMarker).length - 1, 1)
  source = source.replace(importMarker, `${importMarker}\nvar proxyquire = require('proxyquire');`)
  source = source.replace(declarationMarker, `${declarationMarker}\n\n\n${[
    "    it('should invoke callbacks with reserved once state properties',",
    '    function () {',
    '        var callbackCalls = 0;',
    '        var wrappedCallback;',
    '        var fakeCall = {',
    '            setStrategy: function () {},',
    '            failAfter: function () {},',
    '            on: function () {},',
    '            start: function () {',
    '                assert.isFalse(wrappedCallback.called);',
    '                assert.isUndefined(wrappedCallback.value);',
    "                wrappedCallback(null, {id: 'request'});",
    "                wrappedCallback(new Error('second call'), {id: 'other'});",
    '            }',
    '        };',
    '        var fakeBackoff = {',
    '            call: function (_rawRequest, _opts, wrapped) {',
    '                wrappedCallback = wrapped;',
    '                return fakeCall;',
    '            },',
    '            ExponentialStrategy: function () {}',
    '        };',
    "        var HttpClient = proxyquire('../lib/HttpClient', {",
    '            backoff: fakeBackoff',
    '        });',
    '        var client = {',
    '            audit: {},',
    '            _keep_alive: false,',
    '            emit: function () {}',
    '        };',
    '        function decoratedCallback(err, request) {',
    '            assert.isNull(err);',
    "            assert.deepEqual(request, {id: 'request'});",
    '            callbackCalls += 1;',
    '        }',
    '        decoratedCallback.called = true;',
    "        decoratedCallback.value = 'consumer-owned';",
    '        HttpClient.prototype.request.call(client, {',
    '            retry: {minTimeout: 1, maxTimeout: 1, retries: 1}',
    '        }, decoratedCallback);',
    '        assert.strictEqual(callbackCalls, 1);',
    '        assert.isTrue(wrappedCallback.called);',
    '    });'
  ].join('\n')}`)
  await writeFile(target, source)
  run('git', ['diff', '--check'], repository)
}

async function testRestify (tarball) {
  const commit = '9c37cde35aa8a2bc3eca2cbaf64902ae61510ecb'
  const baseline = await clonePinned('https://github.com/restify/clients.git', commit, 'restify-clients-baseline')
  const baselineSuite = await runRestifyGates(baseline, 229)
  assertOnlyTrackedChanges(baseline, [])

  const migrated = await clonePinned('https://github.com/restify/clients.git', commit, 'restify-clients-migrated')
  await replaceDirectOnce(migrated, 'package.json', tarball)
  await injectRestifyRegression(migrated)
  const migratedSuite = await runRestifyGates(migrated, 230)
  assert.equal(
    migratedSuite.passing + migratedSuite.failureCount,
    baselineSuite.passing + baselineSuite.failureCount + 1,
    'migrated full suite must add only the real-path regression fixture'
  )
  const focused = run('./node_modules/.bin/mocha', [
    '-R',
    'dot',
    '--full-trace',
    '--grep',
    'reserved once state'
  ], migrated)
  assert.equal(lastMochaCount(`${focused.stdout || ''}\n${focused.stderr || ''}`, 'passing'), 1)
  const installed = await installedIdentity(migrated, 'node_modules/once')
  run(process.execPath, ['-e', [
    "const assert=require('node:assert/strict')",
    "const once=require('once')",
    'let calls=0',
    'function callback(value){calls+=1;return value}',
    'callback.called=true',
    "callback.value='seeded'",
    'const wrapped=once(callback)',
    "assert.equal(wrapped('first'),'first')",
    "assert.equal(wrapped('second'),'first')",
    'assert.equal(calls,1)',
    "assert.equal(require('once/package.json').name,'@stackline/once')"
  ].join(';')], migrated)
  assertOnlyTrackedChanges(migrated, ['package.json', 'test/HttpClient.test.js'])
  results.push({
    baseline: ['make lint', 'make codestyle', 'make coverage (observed environmental failures)', '229-test pristine filtered non-environmental suite'],
    baselineSuite,
    commit,
    installed,
    migration: 'once=file:<packed @stackline/once@1.0.0>',
    migratedSuite,
    name: 'restify/clients',
    realPathReservedStateRegression: '1 passing',
    status: 'PASS_BASELINE_AND_MIGRATION',
    yarn: yarn(['--version'], migrated).stdout.trim()
  })
}

async function runAdobeGates (repository) {
  pnpm(['run', 'build'], repository)
  pnpm(['run', 'lint'], repository)
  pnpm(['run', 'format:check'], repository)
  pnpm(['run', 'typecheck'], repository)
  pnpm(['run', 'test:extension'], repository)
}

async function assertAdobeImports (repository) {
  const files = [
    'packages/reactor-extension/src/view/utils/monitorForOriginatingErrors.js',
    'packages/reactor-extension/src/view/components/objectEditor/helpers/validate.js'
  ]
  for (const file of files) {
    const source = await readFile(path.join(repository, file), 'utf8')
    assert.match(source, /import once from ["']once["']/)
    assert.match(source, /once\s*\(/)
  }
}

async function inspectBuiltViewWrappyProvenance (repository) {
  const directory = path.join(repository, 'packages/reactor-extension/dist/view')
  assert.ok((await stat(directory)).isDirectory())
  let files = 0
  let provenanceLiterals = 0
  let wrappyLiterals = 0
  const literalFiles = []
  const provenance = 'observable property-preservation behavior of wrappy@1.0.2'

  async function visit (current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name)
      if (entry.isDirectory()) await visit(target)
      else if (/\.(?:html|js|map)$/i.test(entry.name)) {
        files += 1
        const source = await readFile(target, 'utf8')
        const fileWrappyLiterals = source.split('wrappy').length - 1
        const fileProvenanceLiterals = source.split(provenance).length - 1
        wrappyLiterals += fileWrappyLiterals
        provenanceLiterals += fileProvenanceLiterals
        if (fileWrappyLiterals > 0) literalFiles.push(path.relative(repository, target))
      }
    }
  }

  await visit(directory)
  assert.ok(files > 0, 'reactor-extension build emitted no inspectable view files')
  assert.ok(wrappyLiterals > 0, 'built candidate provenance comment was unexpectedly stripped')
  assert.equal(wrappyLiterals, provenanceLiterals, 'built view contains a wrappy literal outside the candidate provenance comment')
  return { files, literalFiles, provenance, wrappyLiterals }
}

async function assertAdobeDirectOnceEdge (repository) {
  const lock = await readFile(path.join(repository, 'pnpm-lock.yaml'), 'utf8')
  const marker = '  packages/reactor-extension:\n'
  const start = lock.indexOf(marker)
  assert.ok(start >= 0, 'reactor-extension importer is missing from pnpm-lock.yaml')
  const remainder = lock.slice(start + marker.length)
  const nextImporter = remainder.search(/\n {2}\S/)
  const importer = nextImporter === -1 ? remainder : remainder.slice(0, nextImporter)
  assert.match(importer, /\n {6}once:\n {8}specifier: file:[^\n]+stackline-once-1\.0\.0\.tgz\n {8}version: '@stackline\/once@file:[^']+'/)
  assert.doesNotMatch(importer, /wrappy/)
  assert.match(lock, /\n {2}'@stackline\/once@file:[^']+': \{\}\n/)

  const productionWhyOnce = pnpm(['--filter', 'reactor-extension-alloy', 'why', 'once', '--prod'], repository).stdout.trim()
  const productionWhyWrappy = pnpm(['--filter', 'reactor-extension-alloy', 'why', 'wrappy', '--prod'], repository).stdout.trim()
  const developmentWhyWrappy = pnpm(['--filter', 'reactor-extension-alloy', 'why', 'wrappy'], repository).stdout.trim()
  assert.match(productionWhyOnce, /@stackline\/once@1\.0\.0/)
  assert.match(productionWhyOnce, /reactor-extension-alloy@2\.37\.2-beta\.1 \(dependencies\)/)
  assert.equal(productionWhyWrappy, '')
  assert.match(developmentWhyWrappy, /wrappy@1\.0\.2/)
  assert.match(developmentWhyWrappy, /inflight@1\.0\.6/)
  assert.match(developmentWhyWrappy, /once@1\.4\.0/)
  assert.match(developmentWhyWrappy, /\(devDependencies\)/)
  assert.doesNotMatch(developmentWhyWrappy, /@stackline\/once/)
  return { developmentWhyWrappy, productionWhyOnce, productionWhyWrappy: [] }
}

async function testAdobe (tarball) {
  const commit = 'dea7a2273989a4a1918416e0b03e9495c6ca78a3'
  const baseline = await clonePinned('https://github.com/adobe/alloy.git', commit, 'adobe-alloy-baseline')
  pnpm(['install', '--frozen-lockfile'], baseline)
  await assertAdobeImports(baseline)
  await runAdobeGates(baseline)
  assertOnlyTrackedChanges(baseline, ['packages/browser/bundlesize.json'])
  const baselineBuildMetric = await adobeBuildMetric(baseline)

  const migrated = await clonePinned('https://github.com/adobe/alloy.git', commit, 'adobe-alloy-migrated')
  await replaceDirectOnce(migrated, 'packages/reactor-extension/package.json', tarball)
  pnpm(['install', '--no-frozen-lockfile'], migrated)
  await assertAdobeImports(migrated)
  const installed = await installedIdentity(migrated, 'packages/reactor-extension/node_modules/once')
  run(process.execPath, ['-e', [
    "const assert=require('node:assert/strict')",
    "const once=require('once')",
    "assert.equal(require('once/package.json').name,'@stackline/once')",
    'assert.equal(once(function(){return 1})(),1)'
  ].join(';')], path.join(migrated, 'packages/reactor-extension'))
  await runAdobeGates(migrated)
  const builtView = await inspectBuiltViewWrappyProvenance(migrated)
  const directEdge = await assertAdobeDirectOnceEdge(migrated)
  assertOnlyTrackedChanges(migrated, [
    'packages/browser/bundlesize.json',
    'packages/reactor-extension/package.json',
    'pnpm-lock.yaml'
  ])
  const migratedBuildMetric = await adobeBuildMetric(migrated)
  assert.deepEqual(migratedBuildMetric.deltas, baselineBuildMetric.deltas, 'browser bundle metric deltas differ after reactor-extension migration')
  results.push({
    baseline: ['pnpm run build', 'pnpm run lint', 'pnpm run format:check', 'pnpm run typecheck', 'pnpm run test:extension'],
    builtView,
    directEdge,
    generatedBuildMetric: {
      baseline: baselineBuildMetric,
      candidateRelated: false,
      deltasIdentical: true,
      migrated: migratedBuildMetric
    },
    commit,
    installed,
    migration: 'packages/reactor-extension once=file:<packed @stackline/once@1.0.0>',
    name: 'adobe/alloy',
    pnpm: pnpm(['--version'], migrated).stdout.trim(),
    preservedHistoricalImports: 2,
    status: 'PASS_BASELINE_AND_MIGRATION'
  })
}

try {
  const artifacts = path.join(temporary, 'artifacts')
  await mkdir(artifacts)
  run(npmCommand, ['pack', root, '--ignore-scripts', '--pack-destination', artifacts], temporary)
  const tarballs = (await readdir(artifacts)).filter((name) => name.endsWith('.tgz'))
  assert.equal(tarballs.length, 1)
  const tarball = path.join(artifacts, tarballs[0])
  const bytes = await readFile(tarball)
  const artifact = {
    filename: tarballs[0],
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    size: bytes.length
  }

  if (requested === 'all' || requested === 'restify-clients') await testRestify(tarball)
  if (requested === 'all' || requested === 'adobe-alloy') await testAdobe(tarball)

  process.stdout.write(`${JSON.stringify({ artifact, node: process.versions.node, requested, results }, null, 2)}\n`)
} finally {
  if (process.env.STACKLINE_KEEP_DOWNSTREAM === '1') console.log(`Preserved downstream workspace: ${temporary}`)
  else await rm(temporary, { force: true, recursive: true })
}
