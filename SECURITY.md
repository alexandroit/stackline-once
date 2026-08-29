# Security

Report suspected vulnerabilities through the private GitHub security advisory
form for the eventual project repository. Do not disclose an unfixed issue in
a public ticket. Include the package and Node versions, wrapper mode, callback
decorations, a minimal reproduction, and the observed state/return/error.

## Supported line

The latest `1.x` runtime targets Node.js 0.10.48 and newer. Development and
release tooling requires a current Node release.

## Trust and state boundary

`once` controls invocation count, not authorization, locking, process-wide
coordination, cancellation, or durable exactly-once delivery. Wrapper fields
are intentionally public and mutable; do not expose a security-sensitive
wrapper to untrusted code.

Input callback getters for ordinary enumerable decorations execute during
wrapping, matching the historical contract. Treat callbacks as code, not
untrusted data. Reserved state decorations are ignored and `__proto__` is
copied as own data, but this is defense-in-depth and is not represented as an
assigned vulnerability or CVE.

`once.proto()` mutates `Function.prototype` only when explicitly called. Avoid
it across trust boundaries and prefer direct `once(fn)` wrappers.

Exact-version OSV queries for `once@1.4.0` and `wrappy@1.0.2` returned no
matches during the dated intake. That is not a claim that either project or
this continuation is vulnerability-free.
