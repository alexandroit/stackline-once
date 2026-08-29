# Migration

## Source-compatible alias

Existing CommonJS applications can keep their historical imports:

```json
{
  "dependencies": {
    "once": "npm:@stackline/once@1.0.0"
  }
}
```

Run the downstream's full clean install and test/lint matrix, then verify the
installed package identity and production tree:

```sh
npm ls once @stackline/once --all
node -p "require('once/package.json').name"
```

The identity should be `@stackline/once` while `require('once')` and
`require('once/once.js')` continue to work.

## Direct scoped import

New code can depend on `@stackline/once@1.0.0` and change imports to:

```js
var once = require('@stackline/once')
```

ESM consumers use a default import. There is no parallel ESM implementation.

## Behavior to review

Input callbacks decorated with `called`, `value`, or `onceError` no longer
overwrite new wrapper state. This is the first-call correctness fix. Ordinary
own enumerable string decorations still copy. If code intentionally seeded
wrapper state through callback decorations, set the public state on the
returned wrapper explicitly and add a regression test.

`once.proto()` is now present. It is never called automatically. Adopting the
package does not mutate `Function.prototype` unless application code explicitly
invokes that initializer.
