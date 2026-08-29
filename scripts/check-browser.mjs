import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { build } from 'esbuild'

const result = await build({
  bundle: true,
  entryPoints: [fileURLToPath(new URL('../once.js', import.meta.url))],
  format: 'iife',
  globalName: 'StacklineOnce',
  platform: 'browser',
  target: ['es5'],
  write: false
})

assert.equal(result.outputFiles.length, 1)
const source = result.outputFiles[0].text
assert.doesNotMatch(source, /require\(['"](?:node:)?/)

const context = {}
vm.runInNewContext(source, context, { filename: 'once.browser.js' })
assert.equal(typeof context.StacklineOnce, 'function')
assert.equal(typeof context.StacklineOnce.strict, 'function')
assert.equal(typeof context.StacklineOnce.proto, 'function')

let calls = 0
const wrapped = context.StacklineOnce(function (value) {
  calls += 1
  return value
})
assert.equal(wrapped('browser'), 'browser')
assert.equal(wrapped('ignored'), 'browser')
assert.equal(calls, 1)

const productionSource = await readFile(new URL('../once.js', import.meta.url), 'utf8')
assert.doesNotMatch(productionSource, /\brequire\s*\(/)
console.log('Browser bundle exercised the zero-Node-API CommonJS implementation.')
