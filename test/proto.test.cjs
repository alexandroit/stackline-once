const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const path = require('node:path')
const test = require('node:test')

const modulePath = path.resolve(__dirname, '../once.js')

function restore (key, descriptor) {
  if (descriptor) Object.defineProperty(Function.prototype, key, descriptor)
  else delete Function.prototype[key]
}

test('proto is a one-shot initializer with exact historical descriptors', () => {
  const previousOnce = Object.getOwnPropertyDescriptor(Function.prototype, 'once')
  const previousStrict = Object.getOwnPropertyDescriptor(Function.prototype, 'onceStrict')
  delete require.cache[modulePath]
  const once = require(modulePath)

  try {
    assert.equal(once.proto.called, false)
    assert.equal(once.proto(), undefined)
    assert.equal(once.proto.called, true)
    assert.equal(once.proto(), undefined)

    for (const key of ['once', 'onceStrict']) {
      const descriptor = Object.getOwnPropertyDescriptor(Function.prototype, key)
      assert.equal(typeof descriptor.value, 'function')
      assert.equal(descriptor.configurable, true)
      assert.equal(descriptor.enumerable, false)
      assert.equal(descriptor.writable, false)
    }

    let calls = 0
    function callback (increment) {
      calls += 1
      return Number(this) + increment + calls
    }
    const ordinary = callback.once()
    assert.equal(ordinary.call(1, 1), 3)
    assert.equal(ordinary.call(5, 5), 3)
    assert.equal(calls, 1)

    const strict = callback.onceStrict()
    assert.equal(strict.call(0, 0), 2)
    assert.throws(() => strict(), { message: "callback shouldn't be called more than once" })
  } finally {
    restore('once', previousOnce)
    restore('onceStrict', previousStrict)
    delete require.cache[modulePath]
  }
})

test('non-configurable second collision preserves historical partial failure', () => {
  const source = `
    const assert = require('node:assert/strict')
    const once = require(${JSON.stringify(modulePath)})
    Object.defineProperty(Function.prototype, 'onceStrict', {
      configurable: false,
      value: function blocked () {}
    })
    assert.throws(() => once.proto(), TypeError)
    assert.equal(once.proto.called, true)
    assert.equal(typeof Function.prototype.once, 'function')
    assert.equal(Function.prototype.onceStrict.name, 'blocked')
  `
  const result = spawnSync(process.execPath, ['-e', source], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
})

test('non-configurable first collision throws before the second mutation', () => {
  const source = `
    const assert = require('node:assert/strict')
    const once = require(${JSON.stringify(modulePath)})
    Object.defineProperty(Function.prototype, 'once', {
      configurable: false,
      value: function blocked () {}
    })
    assert.throws(() => once.proto(), TypeError)
    assert.equal(once.proto.called, true)
    assert.equal(Function.prototype.once.name, 'blocked')
    assert.equal(Object.hasOwn(Function.prototype, 'onceStrict'), false)
  `
  const result = spawnSync(process.execPath, ['-e', source], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
})
