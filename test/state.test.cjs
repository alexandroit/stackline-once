const assert = require('node:assert/strict')
const test = require('node:test')

const once = require('../once.js')

test('base wrapper caches object and Promise identity', async () => {
  const object = {}
  const objectWrapper = once(() => object)
  assert.equal(objectWrapper.called, false)
  assert.equal(Object.hasOwn(objectWrapper, 'value'), false)
  assert.equal(objectWrapper(), object)
  assert.equal(objectWrapper(), object)
  assert.equal(objectWrapper.value, object)

  const promise = Promise.resolve('ready')
  const promiseWrapper = once(() => promise)
  assert.equal(promiseWrapper(), promise)
  assert.equal(promiseWrapper(), promise)
  assert.equal(await promiseWrapper.value, 'ready')
})

test('undefined return still creates an own value property', () => {
  const wrapped = once(() => undefined)
  assert.equal(Object.hasOwn(wrapped, 'value'), false)
  assert.equal(wrapped(), undefined)
  assert.equal(Object.hasOwn(wrapped, 'value'), true)
  assert.equal(wrapped.value, undefined)
})

test('synchronous throw is sticky in base mode', () => {
  const expected = new Error('boom')
  let calls = 0
  const wrapped = once(() => {
    calls += 1
    throw expected
  })
  assert.throws(() => wrapped(), (error) => error === expected)
  assert.equal(wrapped.called, true)
  assert.equal(Object.hasOwn(wrapped, 'value'), false)
  assert.equal(wrapped(), undefined)
  assert.equal(calls, 1)
})

test('base and strict re-entry observe called before the callback runs', () => {
  let ordinary
  let ordinaryNested = 'unset'
  ordinary = once(() => {
    ordinaryNested = ordinary()
    return 'outer'
  })
  assert.equal(ordinary(), 'outer')
  assert.equal(ordinaryNested, undefined)

  let strict
  let strictError
  strict = once.strict(() => {
    try {
      strict()
    } catch (error) {
      strictError = error
    }
    return 'outer'
  })
  assert.equal(strict(), 'outer')
  assert.equal(strictError.message, "Function wrapped with `once` shouldn't be called more than once")
})

test('public state remains intentionally mutable after wrapping', () => {
  let calls = 0
  const wrapped = once(() => {
    calls += 1
    return 'called'
  })
  wrapped.value = 'seeded'
  wrapped.called = true
  assert.equal(wrapped(), 'seeded')
  assert.equal(calls, 0)

  wrapped.called = false
  assert.equal(wrapped(), 'called')
  assert.equal(calls, 1)
})
