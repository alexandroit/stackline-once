// Copyright (c) Isaac Z. Schlueter and Contributors
// Copyright (c) 2026 Stackline Maintainers
// Licensed under the ISC License. See LICENSE.

module.exports = wrap(once)
module.exports.strict = wrap(onceStrict)

// Upstream documented this initializer in 1.4.0, but only the signed,
// unpublished 1.4.1 tag attached it to the exported function.
module.exports.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

var reserved = {
  called: true,
  onceError: true,
  value: true
}

// Internalizes the observable property-preservation behavior of wrappy@1.0.2
// while preventing callback decorations from overwriting wrapper state.
function wrap (fn) {
  copyProperties(fn, wrapper)
  return wrapper

  function wrapper () {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }

    var result = fn.apply(this, args)
    var callback = args[args.length - 1]
    if (typeof result === 'function' && result !== callback) {
      copyProperties(callback, result)
    }
    return result
  }
}

function copyProperties (source, target) {
  Object.keys(source).forEach(function (key) {
    if (Object.prototype.hasOwnProperty.call(reserved, key)) return

    var value = source[key]
    if (key === '__proto__') {
      Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        value: value,
        writable: true
      })
    } else {
      target[key] = value
    }
  })
}

function once (fn) {
  var wrapped = function () {
    if (wrapped.called) return wrapped.value
    wrapped.called = true
    return (wrapped.value = fn.apply(this, arguments))
  }
  wrapped.called = false
  return wrapped
}

function onceStrict (fn) {
  var wrapped = function () {
    if (wrapped.called) throw new Error(wrapped.onceError)
    wrapped.called = true
    return (wrapped.value = fn.apply(this, arguments))
  }
  var name = fn.name || 'Function wrapped with `once`'
  wrapped.onceError = name + " shouldn't be called more than once"
  wrapped.called = false
  return wrapped
}
