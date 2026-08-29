const assert = require('node:assert/strict')
const test = require('node:test')

const once = require('../once.js')

test('copies own enumerable string decorations by value', () => {
  const inherited = { inherited: true }
  const callback = Object.assign(function callback () { return 'ok' }, inherited)
  Object.setPrototypeOf(callback, inherited)
  const marker = { retained: true }
  callback.marker = marker
  Object.defineProperty(callback, 'hidden', { value: true })
  const symbol = Symbol('decoration')
  callback[symbol] = true

  const wrapped = once(callback)
  assert.equal(wrapped.marker, marker)
  assert.equal(Object.hasOwn(wrapped, 'inherited'), true)
  assert.equal(wrapped.inherited, true)
  assert.equal(Object.hasOwn(wrapped, 'hidden'), false)
  assert.equal(Object.hasOwn(wrapped, symbol), false)
})

test('ignores inherited enumerable decorations', () => {
  const prototype = { inheritedOnly: true }
  const callback = function () {}
  Object.setPrototypeOf(callback, prototype)
  const wrapped = once(callback)
  assert.equal(Object.hasOwn(wrapped, 'inheritedOnly'), false)
})

test('reads enumerable accessors once and creates ordinary data', () => {
  let reads = 0
  const callback = function () {}
  Object.defineProperty(callback, 'computed', {
    configurable: true,
    enumerable: true,
    get () {
      reads += 1
      return { reads }
    }
  })
  const wrapped = once(callback)
  const descriptor = Object.getOwnPropertyDescriptor(wrapped, 'computed')
  assert.equal(reads, 1)
  assert.deepEqual(descriptor.value, { reads: 1 })
  assert.equal(descriptor.enumerable, true)
  assert.equal(descriptor.configurable, true)
  assert.equal(descriptor.writable, true)
})

test('reserved callback decorations cannot suppress the first call', () => {
  let calls = 0
  const callback = function () {
    calls += 1
    return 'real value'
  }
  callback.called = true
  callback.value = 'spoofed value'
  callback.onceError = 'spoofed error'

  const wrapped = once(callback)
  assert.equal(wrapped.called, false)
  assert.equal(Object.hasOwn(wrapped, 'value'), false)
  assert.equal(Object.hasOwn(wrapped, 'onceError'), false)
  assert.equal(wrapped(), 'real value')
  assert.equal(calls, 1)

  const strict = once.strict(callback)
  assert.equal(strict.called, false)
  assert.notEqual(strict.onceError, 'spoofed error')
  assert.equal(strict(), 'real value')
})

test('reserved accessors are skipped without executing untrusted getters', () => {
  const callback = function () { return 'ok' }
  for (const key of ['called', 'value', 'onceError']) {
    Object.defineProperty(callback, key, {
      configurable: true,
      enumerable: true,
      get () {
        throw new Error(`reserved getter executed: ${key}`)
      }
    })
  }
  const wrapped = once(callback)
  assert.equal(wrapped(), 'ok')
})

test('an enumerable __proto__ decoration is own data without prototype mutation', () => {
  const callback = function () { return 'ok' }
  const payload = { polluted: true }
  Object.defineProperty(callback, '__proto__', {
    configurable: true,
    enumerable: true,
    value: payload,
    writable: true
  })
  const wrapped = once(callback)
  assert.equal(Object.getPrototypeOf(wrapped), Function.prototype)
  assert.equal(Object.hasOwn(wrapped, '__proto__'), true)
  assert.equal(wrapped.__proto__, payload)
  assert.equal(Object.prototype.polluted, undefined)
})

test('Object.prototype names remain valid own enumerable decorations', () => {
  const callback = function () { return 'ok' }
  for (const key of ['constructor', 'hasOwnProperty', 'toString', 'valueOf']) {
    Object.defineProperty(callback, key, {
      configurable: true,
      enumerable: true,
      value: `decoration:${key}`,
      writable: true
    })
  }
  const wrapped = once(callback)
  for (const key of ['constructor', 'hasOwnProperty', 'toString', 'valueOf']) {
    assert.equal(Object.hasOwn(wrapped, key), true)
    assert.equal(wrapped[key], `decoration:${key}`)
  }
  assert.equal(wrapped(), 'ok')
})

test('ordinary decoration getter failures remain visible at wrap time', () => {
  const expected = new Error('decoration failed')
  const callback = function () {}
  Object.defineProperty(callback, 'decoration', {
    enumerable: true,
    get () {
      throw expected
    }
  })
  assert.throws(() => once(callback), (error) => error === expected)
})
