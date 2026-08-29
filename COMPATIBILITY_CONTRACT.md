# Compatibility Contract

## Immutable baselines

The published runtime baseline is `once@1.4.0`. The restored prototype export
comes from the signed, ISC-licensed upstream `v1.4.1` tag at commit
`dd31e51b051eeb4c9df26bcea2f9155c4e41efd2`. Decoration behavior is compared
with `wrappy@1.0.2`.

## Preserved

- The root is a callable CommonJS function; `once/once.js` remains available.
- `once(fn)` preserves first-call `this`, arguments, synchronous return or
  Promise identity, then returns the cached value without invoking `fn` again.
- `once.strict(fn)` throws an `Error` after the first call with the historical
  named/anonymous wording and mutable `onceError` override.
- Wrappers expose mutable `called`; `value` is absent before the first call and
  assigned when the first call returns.
- `called` becomes true before invoking `fn`. A synchronous throw is sticky.
  Base-mode re-entry returns the current value (normally `undefined`); strict
  re-entry throws.
- Own enumerable string decorations are read and copied by value. Inherited,
  non-enumerable, and symbol decorations are ignored.
- `once.proto()` is a one-shot initializer. Its prototype methods are
  configurable, non-enumerable, and non-writable and retain historical state,
  return, and strict-error behavior.

## Bounded corrections

- `once.proto` is attached to the public export, as upstream fixed in the
  signed but unpublished v1.4.1 tag.
- Input decorations named `called`, `value`, and `onceError` are reserved and
  cannot overwrite fresh wrapper state. Callers can still intentionally mutate
  those public fields after wrapping.
- An own enumerable `__proto__` decoration becomes an own enumerable data
  property instead of mutating the returned function's prototype.
- The small `wrappy` property-copy contract is internalized, leaving a
  zero-dependency production graph.

## Prototype initializer boundary

`proto()` deliberately mutates `Function.prototype`. As upstream, it marks
itself called before defining properties. A non-configurable collision throws;
if the first definition succeeded before a collision on the second, the
mutation can be partial and the initializer remains called. Libraries should
prefer direct wrappers and must not call `proto()` implicitly.

## Additive surfaces

Conditional package exports cover the root, `once`, `once.js`, and package
metadata. Ordinary ESM default interop, TypeScript 3.9/current declarations,
packed scoped/historical-key consumers, and explicit browser/runtime gates are
additive; there is still one CommonJS runtime implementation.

## Runtime boundary

The supported matrix begins at exact Node.js 0.10.48 and samples every legacy
major family through the active LTS/current line. `once.js` is parsed as ES5,
uses no Node-only API, and is bundled for a browser test. Development, type,
package, and release tooling intentionally runs on current Node and is outside
the production runtime contract.
