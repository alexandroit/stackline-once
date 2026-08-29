import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const destination = path.join(root, 'release-candidate')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function run (command, arguments_, options = {}) {
  return execFileSync(command, arguments_, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options
  })
}

function runNpm (arguments_, options = {}) {
  return run(npm, arguments_, options)
}

function git (arguments_) {
  return run('git', arguments_).trim()
}

const npmVersion = runNpm(['--version']).trim()
assert.equal(npmVersion, '10.8.2', 'artifact preparation requires the exact npm version used by CI')

const sourceCommit = git(['rev-parse', '--verify', 'HEAD'])
assert.match(sourceCommit, /^[0-9a-f]{40}$/, 'artifact preparation requires a full Git HEAD')
assert.match(process.env.STACKLINE_GREEN_COMMIT || '', /^[0-9a-f]{40}$/, 'set STACKLINE_GREEN_COMMIT to the exact hosted-green commit')
assert.equal(process.env.STACKLINE_GREEN_COMMIT, sourceCommit, 'STACKLINE_GREEN_COMMIT does not match HEAD')
assert.equal(git(['status', '--porcelain=v1', '--untracked-files=all']), '', 'artifact preparation requires a clean worktree')

try {
  await access(destination)
  assert.fail('release-candidate already exists; inspect and remove it explicitly before preparing another artifact')
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

const commitTimestamp = new Date(git(['show', '-s', '--format=%cI', sourceCommit])).toISOString()
runNpm(['run', 'verify'], { stdio: 'inherit' })
assert.equal(git(['status', '--porcelain=v1', '--untracked-files=all']), '', 'verification changed tracked source files')

const temporary = await mkdtemp(path.join(os.tmpdir(), 'stackline-once-artifact-'))
const consumer = path.join(temporary, 'consumer')
await mkdir(destination, { recursive: false })

try {
  const output = runNpm(['pack', '--silent', '--json', '--ignore-scripts', '--pack-destination', destination]).trim()
  const start = output.lastIndexOf('\n[')
  const packed = JSON.parse(start === -1 ? output : output.slice(start + 1))
  assert.equal(packed.length, 1)
  const record = packed[0]
  const archive = path.join(destination, record.filename)
  const bytes = await readFile(archive)
  const digests = Object.fromEntries(['sha1', 'sha256', 'sha512'].map((algorithm) => [
    algorithm,
    crypto.createHash(algorithm).update(bytes).digest('hex')
  ]))
  const inventory = record.files
    .map((file) => ({ path: file.path, size: file.size }))
    .sort((left, right) => left.path.localeCompare(right.path))
  const metadata = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))

  await mkdir(consumer)
  await writeFile(path.join(consumer, 'package.json'), `${JSON.stringify({
    name: 'stackline-once-artifact-sbom',
    version: '0.0.0',
    private: true,
    dependencies: { [metadata.name]: `file:${archive}` }
  }, null, 2)}\n`)
  runNpm(['install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund'], { cwd: consumer })
  const sbom = JSON.parse(runNpm(['sbom', '--omit=dev', '--sbom-format=cyclonedx'], { cwd: consumer }))

  const manifest = {
    schema: 'stackline-release-artifact-v1',
    package: `${metadata.name}@${metadata.version}`,
    sourceCommit,
    commitTimestamp,
    npmVersion,
    archive: record.filename,
    bytes: bytes.length,
    fileCount: inventory.length,
    integrity: record.integrity,
    packedSize: record.size,
    unpackedSize: record.unpackedSize,
    digests
  }
  await writeFile(path.join(destination, 'artifact-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  await writeFile(path.join(destination, 'inventory.json'), `${JSON.stringify(inventory, null, 2)}\n`)
  await writeFile(path.join(destination, 'licenses.json'), `${JSON.stringify({
    package: { license: 'ISC', name: metadata.name, version: metadata.version },
    productionDependencies: []
  }, null, 2)}\n`)
  await writeFile(path.join(destination, 'sbom.cdx.json'), `${JSON.stringify(sbom, null, 2)}\n`)
  await writeFile(path.join(destination, 'RELEASE_NOTES.md'), [
    `# ${metadata.name} ${metadata.version}`,
    '',
    'Compatibility-first ES5 one-shot wrappers with restored proto export, reserved-state safety, first-party types, and zero runtime dependencies.',
    '',
    `Source commit: ${sourceCommit}`,
    `Commit timestamp: ${commitTimestamp}`,
    '',
    'See CHANGELOG.md and VERIFICATION.md for the exact contract and gates.',
    ''
  ].join('\n'))
  for (const algorithm of ['sha1', 'sha256', 'sha512']) {
    await writeFile(path.join(destination, `${algorithm.toUpperCase()}SUMS`), `${digests[algorithm]}  ${record.filename}\n`)
  }

  console.log(`Prepared unpublished local artifact ${record.filename} (${bytes.length} bytes).`)
} finally {
  await rm(temporary, { force: true, recursive: true })
}
