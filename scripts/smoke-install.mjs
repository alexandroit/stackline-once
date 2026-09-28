import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const temporary = await mkdtemp(path.join(os.tmpdir(), 'stackline-once-smoke-'))
const consumer = path.join(temporary, 'consumer')

function run (command, arguments_, cwd = root, stdio = ['ignore', 'pipe', 'pipe']) {
  return execFileSync(command, arguments_, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
    stdio
  })
}

try {
  await mkdir(consumer)
  const output = run(npm, ['pack', '--silent', '--json', '--ignore-scripts', '--pack-destination', temporary]).trim()
  const start = output.lastIndexOf('\n[')
  const packed = JSON.parse(start === -1 ? output : output.slice(start + 1))
  assert.equal(packed.length, 1)
  const archive = packed[0].filename

  await writeFile(path.join(consumer, 'package.json'), `${JSON.stringify({
    name: 'stackline-once-packed-consumer',
    private: true,
    type: 'module',
    dependencies: {
      '@stackline/once': `file:../${archive}`,
      once: `file:../${archive}`
    }
  }, null, 2)}\n`)
  run(npm, ['install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund'], consumer)

  await writeFile(path.join(consumer, 'commonjs.cjs'), `
const assert = require('node:assert/strict')
const scoped = require('@stackline/once')
const scopedDeep = require('@stackline/once/once.js')
const historical = require('once')
const historicalDeep = require('once/once.js')
assert.equal(scopedDeep, scoped)
assert.equal(historicalDeep, historical)
for (const implementation of [scoped, historical]) {
  let calls = 0
  const callback = function (value) { calls += 1; return value }
  callback.called = true
  callback.value = 'spoofed'
  const wrapped = implementation(callback)
  assert.equal(wrapped('packed'), 'packed')
  assert.equal(wrapped('ignored'), 'packed')
  assert.equal(calls, 1)
  assert.equal(typeof implementation.strict, 'function')
  assert.equal(typeof implementation.proto, 'function')
}
console.log('packed scoped and historical-key CommonJS passed')
`)
  await writeFile(path.join(consumer, 'module.mjs'), `
import assert from 'node:assert/strict'
import once from '@stackline/once'
import deep from '@stackline/once/once.js'
assert.equal(deep, once)
const wrapped = once((value) => value)
assert.equal(wrapped('esm'), 'esm')
assert.equal(wrapped('ignored'), 'esm')
console.log('packed ESM default interop passed')
`)
  run(process.execPath, ['commonjs.cjs'], consumer, 'inherit')
  run(process.execPath, ['module.mjs'], consumer, 'inherit')

  for (const installation of [
    path.join(consumer, 'node_modules', '@stackline', 'once'),
    path.join(consumer, 'node_modules', 'once')
  ]) {
    const installed = JSON.parse(await readFile(path.join(installation, 'package.json'), 'utf8'))
    assert.equal(installed.name, '@stackline/once')
    assert.equal(installed.version, '1.0.1')
    assert.equal(installed.dependencies, undefined)
  }

  const tree = JSON.parse(run(npm, ['ls', '--omit=dev', '--all', '--json'], consumer))
  assert.equal(tree.problems, undefined)
  console.log('Packed direct-scoped, historical-key file alias, deep-entry, ESM, and zero-dependency consumers passed.')
} finally {
  await rm(temporary, { force: true, recursive: true })
}
