import assert from 'node:assert/strict'
import once from '@stackline/once'
import deep from '@stackline/once/once.js'

assert.equal(typeof once, 'function')
assert.equal(deep, once)
assert.equal(typeof once.strict, 'function')
assert.equal(typeof once.proto, 'function')

const context = { base: 40 }
const wrapped = once(function (increment) {
  return this.base + increment
})
assert.equal(wrapped.call(context, 2), 42)
assert.equal(wrapped.call({ base: 0 }, 0), 42)
assert.equal(wrapped.value, 42)

const namespace = await import('@stackline/once')
assert.equal(namespace.default, once)

console.log('ESM default and deep CommonJS interop passed.')
