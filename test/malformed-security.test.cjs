const assert = require('node:assert/strict')
const test = require('node:test')

const once = require('../once.js')
const upstream = require('once-upstream')

test('missing and null callbacks fail at wrap time like upstream', () => {
  for (const value of [undefined, null]) {
    assert.throws(() => once(value), TypeError)
    assert.throws(() => upstream(value), TypeError)
  }
})

test('non-function objects preserve lazy apply failure and sticky state', () => {
  const wrapped = once({ marker: 'copied' })
  assert.equal(wrapped.marker, 'copied')
  assert.equal(wrapped.called, false)
  assert.throws(() => wrapped(), TypeError)
  assert.equal(wrapped.called, true)
  assert.equal(wrapped(), undefined)
})

test('strict callback name getter failures remain visible', () => {
  const expected = new Error('name lookup failed')
  const callback = function () {}
  Object.defineProperty(callback, 'name', {
    configurable: true,
    get () {
      throw expected
    }
  })
  assert.throws(() => once.strict(callback), (error) => error === expected)
})

test('constructor and prototype decorations remain ordinary values', () => {
  // Arrow functions do not start with the non-configurable intrinsic
  // `prototype` property of constructable functions, so this fixture can
  // exercise an ordinary enumerable callback decoration instead of failing
  // while arranging the input.
  const callback = () => {}
  Object.defineProperty(callback, 'constructor', {
    configurable: true,
    enumerable: true,
    value: 'decorated constructor',
    writable: true
  })
  Object.defineProperty(callback, 'prototype', {
    configurable: true,
    enumerable: true,
    value: { decorated: true },
    writable: true
  })
  const wrapped = once(callback)
  assert.equal(wrapped.constructor, 'decorated constructor')
  assert.deepEqual(wrapped.prototype, { decorated: true })
  assert.equal(Object.prototype.decorated, undefined)
})
