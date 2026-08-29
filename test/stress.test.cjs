const assert = require('node:assert/strict')
const test = require('node:test')

const once = require('../once.js')

test('100,000 wrappers each execute exactly once under repeated load', () => {
  let total = 0
  for (let index = 0; index < 100000; index += 1) {
    const wrapped = once(function (value) {
      total += 1
      return value
    })
    assert.equal(wrapped(index), index)
    assert.equal(wrapped(index + 1), index)
  }
  assert.equal(total, 100000)
})

test('large argument lists preserve every value and this binding', () => {
  const values = Array.from({ length: 10000 }, (_, index) => index)
  const context = { marker: true }
  const wrapped = once(function () {
    assert.equal(this, context)
    assert.equal(arguments.length, values.length)
    return arguments[arguments.length - 1]
  })
  assert.equal(wrapped.apply(context, values), 9999)
  assert.equal(wrapped(), 9999)
})
