const assert = require('node:assert/strict')
const test = require('node:test')

const candidate = require('../once.js')
const upstream = require('once-upstream')

function ordinarySnapshot (implementation) {
  const context = { base: 10 }
  let calls = 0
  function callback (left, right) {
    calls += 1
    return { calls, sum: this.base + left + right }
  }
  callback.marker = { identity: true }
  const wrapped = implementation(callback)
  const before = {
    called: wrapped.called,
    hasValue: Object.hasOwn(wrapped, 'value'),
    markerIdentity: wrapped.marker === callback.marker
  }
  const first = wrapped.call(context, 2, 3)
  const second = wrapped.call({ base: 100 }, 20, 30)
  return {
    before,
    called: wrapped.called,
    calls,
    first,
    repeatedIdentity: first === second,
    valueIdentity: wrapped.value === first
  }
}

function strictSnapshot (implementation) {
  function named () {
    return 42
  }
  named.marker = 'copied'
  const wrapped = implementation.strict(named)
  const result = wrapped()
  let error
  try {
    wrapped()
  } catch (caught) {
    error = { message: caught.message, name: caught.name }
  }
  wrapped.onceError = 'replacement'
  let replacement
  try {
    wrapped()
  } catch (caught) {
    replacement = caught.message
  }
  return {
    called: wrapped.called,
    error,
    marker: wrapped.marker,
    replacement,
    result,
    value: wrapped.value
  }
}

function throwSnapshot (implementation) {
  const expected = new Error('first call failed')
  const wrapped = implementation(function () {
    throw expected
  })
  let sameError = false
  try {
    wrapped()
  } catch (error) {
    sameError = error === expected
  }
  return {
    called: wrapped.called,
    hasValue: Object.hasOwn(wrapped, 'value'),
    sameError,
    second: wrapped()
  }
}

function reentrySnapshot (implementation) {
  let wrapped
  let nested
  wrapped = implementation(function () {
    nested = wrapped('nested')
    return 'outer'
  })
  return {
    first: wrapped('first'),
    nested,
    repeated: wrapped('again')
  }
}

test('ordinary behavior matches the immutable 1.4.0 artifact', () => {
  assert.deepEqual(ordinarySnapshot(candidate), ordinarySnapshot(upstream))
})

test('strict behavior matches the immutable 1.4.0 artifact', () => {
  assert.deepEqual(strictSnapshot(candidate), strictSnapshot(upstream))
})

test('sticky synchronous throws match the immutable 1.4.0 artifact', () => {
  assert.deepEqual(throwSnapshot(candidate), throwSnapshot(upstream))
})

test('base-mode re-entry matches the immutable 1.4.0 artifact', () => {
  assert.deepEqual(reentrySnapshot(candidate), reentrySnapshot(upstream))
})

test('candidate only adds proto to the published static surface', () => {
  assert.deepEqual(Object.keys(upstream), ['strict'])
  assert.deepEqual(Object.keys(candidate), ['strict', 'proto'])
  assert.equal(candidate.length, upstream.length)
})
