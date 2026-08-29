import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { access, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { parse } from 'acorn'

const root = fileURLToPath(new URL('../', import.meta.url))
const required = ['once.js', 'once.d.ts', 'once.d.cts']
await Promise.all(required.map((filename) => access(new URL(`../${filename}`, import.meta.url))))

const source = await readFile(new URL('../once.js', import.meta.url), 'utf8')
parse(source, { ecmaVersion: 5, sourceType: 'script' })
execFileSync(process.execPath, ['--check', 'once.js'], { cwd: root, stdio: 'inherit' })

const metadata = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
assert.equal(metadata.main, './once.js')
assert.equal(metadata.types, './once.d.ts')
assert.equal(metadata.engines.node, '>=0.10.0')
assert.deepEqual(metadata.dependencies, undefined)
assert.equal(metadata.exports['./once.js'].require, './once.js')
for (const entry of ['.', './once', './once.js']) {
  assert.equal(metadata.exports[entry].types, './once.d.cts')
  assert.equal(metadata.exports[entry].import, './once.js')
  assert.equal(metadata.exports[entry].require, './once.js')
}

console.log('Validated ES5 CommonJS source, truthful CJS declarations, root/deep exports, and zero-dependency metadata.')
