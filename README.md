# @stackline/once

> Compatibility-first one-shot function wrappers with safe callback decorations and the restored prototype API.

[![npm version](https://img.shields.io/npm/v/@stackline/once.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/once)
[![license](https://img.shields.io/npm/l/@stackline/once.svg?style=flat-square)](https://github.com/alexandroit/stackline-once)
[![GitHub repository](https://img.shields.io/badge/GitHub-repository-181717?style=flat-square&logo=github)](https://github.com/alexandroit/stackline-once)
[![Docs](https://img.shields.io/badge/docs-alexandro.net-0f766e?style=flat-square)](https://alexandro.net/docs/vanilla/once/)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation](https://alexandro.net/docs/vanilla/once/)** | **[npm](https://www.npmjs.com/package/@stackline/once)** | **[Issues](https://github.com/alexandroit/stackline-once/issues)** | **[Repository](https://github.com/alexandroit/stackline-once)**

**Current package version:** `1.0.3`

---

## Why this package?

Compatibility-first one-shot function wrappers with the documented prototype
initializer restored and callback decorations prevented from corrupting
wrapper state.

This is an independent Stackline continuation of `once`; it is not affiliated
with or endorsed by Isaac Z. Schlueter, npm, or the upstream project.

## Compatibility

| Item | Value |
| --- | --- |
| Package | `@stackline/once@1.0.3` |
| Node.js runtime | `>=0.10.0` |
| CommonJS / primary entry | `./once.js` |
| Type declarations | `./once.d.ts` |

## Installation

<a id="install"></a>

### Install

For new code:

```sh
npm install @stackline/once@1.0.3
```

To preserve an existing `require('once')` without source changes:

```sh
npm install once@npm:@stackline/once@1.0.3
```

## Usage

<a id="commonjs"></a>

### CommonJS

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

## Features and Integrations

<a id="esm-and-typescript"></a>

### ESM and TypeScript

The runtime remains one ES5 CommonJS implementation. Ordinary ESM default
interop works without a second implementation:

```js
import once from '@stackline/once'
```

First-party declarations preserve parameters, `this`, return type, state,
strict state, and the opt-in prototype helpers. They are tested with TypeScript
3.9 and current TypeScript.

<a id="support-boundary"></a>

### Support boundary

The maintained runtime matrix begins at exact Node.js 0.10.48 and covers the
active LTS/current line. The production source is ES5, uses no Node-only API,
and is also bundled for a browser test. Development, type, package, and release
tools require a current Node release; they do not ship. There are no runtime
dependencies. See COMPATIBILITY_CONTRACT.md, MIGRATION.md, SECURITY.md, and
THIRD_PARTY_LICENSES.md for precise boundaries.

## Security

Review inputs and the package-specific compatibility limits before processing untrusted data. Report suspected vulnerabilities as described in the [security policy](https://github.com/alexandroit/stackline-once/blob/main/SECURITY.md).

## API Surface

<a id="strict-mode"></a>

### Strict mode

`once.strict(fn)` executes the function once and throws on every later call.
Its public `onceError` string can be customized after wrapping.

```js
var connect = once.strict(function connect () {})
connect.onceError = 'connect may only run once'
connect()
connect() // throws Error: connect may only run once
```

<a id="public-state-and-decorations"></a>

### Public state and decorations

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

<a id="optional-function-prototype-helpers"></a>

### Optional Function prototype helpers

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

## Local Development

```sh
git clone https://github.com/alexandroit/stackline-once.git
cd stackline-once
npm ci
npm run verify
```

Release tooling uses Node.js 24.20.0 and npm 11.19.0. The consumer runtime contract remains the one documented above.

## Consumer Smoke Test

Run the repository's existing consumer/package check after installing development dependencies:

```sh
npm run test:smoke
```

## Release Checklist

Run `npm run verify` and inspect the package contents before release. Publish a new version through the [GitHub Actions publishing workflow](https://github.com/alexandroit/stackline-once/actions/workflows/publish.yml), using the SHA-512 digest of the reviewed tarball. Verify the exact published version, tarball integrity, and npm provenance after the run.

## License

ISC. See [the license](https://github.com/alexandroit/stackline-once/blob/main/LICENSE) for the complete terms.

Original authorship and third-party attribution are preserved in [NOTICE](https://github.com/alexandroit/stackline-once/blob/main/NOTICE).

## Credits and original authors

- Stackline Maintainers.
- Isaac Z. Schlueter and Contributors.
- Copyright (c) 2012-2022 Isaac Z. Schlueter and Contributors.
- Copyright (c) 2026 Stackline Maintainers.
- Stackline maintenance: [Alexandro Paixao Marques](https://www.linkedin.com/in/aleinfo/) and [Stackline contributors](https://github.com/alexandroit).

Original copyright, license notices and contributor acknowledgements remain part of this distribution. Stackline maintenance does not replace authorship of the original work.

## Community and Links

- [Stackline website](https://alexandro.net/)
- [GitHub projects](https://github.com/alexandroit)
- [npm packages](https://www.npmjs.com/~alex360qc)
- [Reddit community — r/Stackline](https://www.reddit.com/r/Stackline/)
- [Maintainer LinkedIn](https://www.linkedin.com/in/aleinfo/)

Use this repository's issue tracker for reproducible bugs and feature requests. Join r/Stackline for examples, usage questions and release discussions.
