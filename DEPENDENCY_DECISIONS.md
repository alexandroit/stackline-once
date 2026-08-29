# Dependency Decisions

## Production

There are no runtime dependencies.

Published `once@1.4.0` uses `wrappy@1`. The relevant `wrappy@1.0.2` algorithm
copies own enumerable callback properties to a returned wrapper. The behavior
is only a few ES5 lines, so it is internalized with the ISC notice preserved.
This avoids selecting or publishing a separate WATCH package solely for one
small edge and allows state-key and `__proto__` corrections to be tested in the
same contract.

## Development

`once@1.4.0` is exact-pinned under the alias `once-upstream` for differential
tests. TypeScript 3.9 and current TypeScript exercise legacy and modern
declarations. Acorn enforces ES5 syntax, esbuild verifies browser consumption,
and c8, ESLint, publint, and Are the Types Wrong are exact-pinned quality tools.
None ships in the npm artifact.
