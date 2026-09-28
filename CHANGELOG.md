# Changelog

## [1.0.1] - 2026-09-28

- Organize package documentation, preserve API and migration examples, and add Stackline community links.
- Improve package discovery keywords with precise domain terms and `stackline`.
- Pin GitHub Actions release tooling and require an explicit missing-version response before publication.


## 1.0.0 - 2026-08-29

- Preserve the callable ES5 CommonJS, strict wrapper, public state, return
  identity, re-entry, throw, deep-entry, and ordinary decoration behavior of
  `once@1.4.0`.
- Restore the documented `once.proto()` export from the signed, unpublished
  upstream v1.4.1 tag.
- Prevent input decorations named `called`, `value`, or `onceError` from
  suppressing a first call or corrupting wrapper state.
- Preserve enumerable `__proto__` as own data rather than changing the
  wrapper's prototype.
- Internalize the bounded `wrappy@1.0.2` behavior and remove the runtime
  dependency.
- Add TypeScript 3.9/current declarations, ESM interop, browser, runtime,
  differential, packed alias-consumer, package-quality, audit, license, SBOM,
  and release-artifact gates.
