# Third-Party Licenses

## `once`

- Upstream: <https://github.com/isaacs/once>
- Published compatibility baseline: `once@1.4.0`
- Unpublished fix baseline: signed tag `v1.4.1`, commit
  `dd31e51b051eeb4c9df26bcea2f9155c4e41efd2`
- Authors: Isaac Z. Schlueter and Contributors
- License: ISC

## `wrappy`

- Upstream: <https://github.com/npm/wrappy>
- Characterized baseline: `wrappy@1.0.2`
- Authors: Isaac Z. Schlueter and Contributors
- License: ISC

The small own-enumerable-property preservation algorithm is internalized so
the published package has no runtime dependency. Stackline reserves wrapper
state keys and treats `__proto__` as an own data decoration; those bounded
corrections are documented in COMPATIBILITY_CONTRACT.md.

The complete upstream ISC notice is retained in LICENSE and the independent
project attribution is recorded in NOTICE. Development and verification tools
are excluded from the production artifact and retain the licenses installed
with those tools.
