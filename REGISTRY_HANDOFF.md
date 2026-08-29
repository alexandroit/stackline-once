# Registry Handoff

Expected package: `@stackline/once@1.0.0`, public access, zero production
dependencies, ISC license, ES5 CommonJS root `once.js`, and integrity matching
the release-candidate manifest.

Verification must cover:

- official packument name/version/license/repository/engines;
- tarball SRI plus SHA-1/SHA-256/SHA-512 against local evidence;
- exact file inventory and absence of decision, test, workflow, cache, and
  credential files;
- `npm audit signatures`, production audit, and zero-dependency SBOM;
- clean direct scoped install;
- clean `once@npm:@stackline/once@1.0.0` historical-key alias install;
- root and `once.js` deep imports through CommonJS and ESM default interop.

This handoff remains pending until official registry publication is explicitly
authorized and completed.
