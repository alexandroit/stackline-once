const assert = require('node:assert/strict')
const test = require('node:test')

const once = require('../once.js')

test('published callable root and signed-tag proto surface are present', () => {
  assert.equal(typeof once, 'function')
  assert.equal(once.length, 0)
  assert.deepEqual(Object.keys(once), ['strict', 'proto'])
  assert.equal(typeof once.strict, 'function')
  assert.equal(typeof once.proto, 'function')
})

test('once(fn) preserves upstream this, arguments, return, state, and decoration', () => {
  let calls = 0
  function fn (increment) {
    assert.equal(calls, 0)
    calls += 1
    return Number(this) + increment + calls
  }
  fn.ownProperty = { retained: true }

  const wrapped = once(fn)
  assert.equal(wrapped.ownProperty, fn.ownProperty)
  assert.equal(wrapped.called, false)
  assert.equal(Object.hasOwn(wrapped, 'value'), false)

  for (let index = 0; index < 1000; index += 1) {
    assert.equal(wrapped.call(1, 1), 3)
    assert.equal(wrapped.called, true)
    assert.equal(wrapped.value, 3)
    assert.equal(calls, 1)
  }
})

test('once.strict preserves named error and custom override', () => {
  let calls = 0
  function fn (increment) {
    calls += 1
    return Number(this) + increment + calls
  }
  fn.ownProperty = { retained: true }

  const wrapped = once.strict(fn)
  assert.equal(wrapped.ownProperty, fn.ownProperty)
  assert.equal(wrapped.called, false)
  assert.equal(wrapped.call(1, 1), 3)
  assert.equal(wrapped.called, true)
  assert.equal(wrapped.value, 3)
  assert.throws(() => wrapped.call(2, 2), {
    name: 'Error',
    message: "fn shouldn't be called more than once"
  })

  const custom = once.strict(function () {})
  custom.onceError = 'custom once error'
  custom()
  assert.throws(() => custom(), { message: 'custom once error' })
})

test('once.strict preserves anonymous error wording', () => {
  const wrapped = once.strict(function () {})
  wrapped()
  assert.throws(() => wrapped(), {
    message: "Function wrapped with `once` shouldn't be called more than once"
  })
})
