var assert = require('assert')
var once = require('../once.js')

assert.strictEqual(typeof once, 'function')
assert.strictEqual(typeof once.strict, 'function')
assert.strictEqual(typeof once.proto, 'function')

var context = { base: 40 }
var calls = 0
function callback (increment) {
  calls += 1
  return this.base + increment
}
callback.marker = 'copied'

var wrapped = once(callback)
assert.strictEqual(wrapped.marker, 'copied')
assert.strictEqual(wrapped.call(context, 2), 42)
assert.strictEqual(wrapped.call({ base: 0 }, 0), 42)
assert.strictEqual(wrapped.called, true)
assert.strictEqual(wrapped.value, 42)
assert.strictEqual(calls, 1)

var strict = once.strict(function named () { return 'ok' })
assert.strictEqual(strict(), 'ok')
assert.throws(function () { strict() }, /named shouldn't be called more than once/)

console.log('runtime compatibility passed on ' + process.version)
