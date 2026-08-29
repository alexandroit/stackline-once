# @stackline/once

Compatibility-first one-shot function wrappers with the documented prototype
initializer restored and callback decorations prevented from corrupting
wrapper state.

This is an independent Stackline continuation of `once`; it is not affiliated
with or endorsed by Isaac Z. Schlueter, npm, or the upstream project.

## Install

For new code:

```sh
npm install @stackline/once@1.0.0
```

To preserve an existing `require('once')` without source changes:

```sh
npm install once@npm:@stackline/once@1.0.0
```

## CommonJS

```js
var once = require('@stackline/once')

var initialize = once(function (value) {
  return { value: value }
})

var first = initialize('ready')
var second = initialize('ignored')

console.log(first === second) // true
console.log(initialize.called) // true
console.log(initialize.value === first) // true
```

The historical deep entry is preserved:

```js
var once = require('@stackline/once/once.js')
```

## Strict mode

`once.strict(fn)` executes the function once and throws on every later call.
Its public `onceError` string can be customized after wrapping.

```js
var connect = once.strict(function connect () {})
connect.onceError = 'connect may only run once'
connect()
connect() // throws Error: connect may only run once
```

## Public state and decorations

Wrappers expose mutable `called` state. `value` is created when the first call
completes, including when the value is `undefined`; a synchronous throw leaves
`called === true` and no cached value. Re-entry before the first call returns
sees the same historical state: ordinary mode returns the current `value`, and
strict mode throws.

Own enumerable string decorations on the input function are copied by value.
Inherited, non-enumerable, and symbol properties are not copied, matching
`wrappy@1.0.2`. The reserved keys `called`, `value`, and `onceError` are not
copied because they control wrapper state. An enumerable `__proto__`
decoration is copied as ordinary own data without changing the wrapper's
prototype.

## Optional Function prototype helpers

The upstream README documented `once.proto()`, but published `once@1.4.0`
failed to export it. This package includes the signed upstream v1.4.1 fix:

```js
once.proto()

var load = function load () { return 42 }
load.once()()
load.onceStrict()()
```

Calling `once.proto()` mutates `Function.prototype`. The installed `once` and
`onceStrict` properties are non-enumerable, non-writable, and configurable,
matching upstream. Prefer direct wrappers in libraries; call `proto()` only in
an application that owns this global policy.

## ESM and TypeScript

The runtime remains one ES5 CommonJS implementation. Ordinary ESM default
interop works without a second implementation:

```js
import once from '@stackline/once'
```

First-party declarations preserve parameters, `this`, return type, state,
strict state, and the opt-in prototype helpers. They are tested with TypeScript
3.9 and current TypeScript.

## Support boundary

The maintained runtime matrix begins at exact Node.js 0.10.48 and covers the
active LTS/current line. The production source is ES5, uses no Node-only API,
and is also bundled for a browser test. Development, type, package, and release
tools require a current Node release; they do not ship. There are no runtime
dependencies. See COMPATIBILITY_CONTRACT.md, MIGRATION.md, SECURITY.md, and
THIRD_PARTY_LICENSES.md for precise boundaries.
