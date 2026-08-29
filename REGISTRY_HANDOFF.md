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

## Published result

- source commit: `ea00ab9a1ca2badbdfddaeb9236fb689fd064067`
- final tarball: 7,488 bytes, 14 files, 21,145 unpacked bytes
- SHA-1: `cf9d4679e473f75ae8bc1e61d95a494bd3088cd0`
- SHA-256: `dd95a3455ed26d3e40c8d6fe107662b4475addf4ca6a6ef9fdb1b130ab3e1880`
- SHA-512: `abee3a37fc2898707f6cbb32f9dc33fda6c31618652013f39074db1e6003f537ce19cf99630d8dd7dae3e0b3b6667174bb487e5371a77e5687798748757543cf`
- integrity: `sha512-q+46N/womHB/bLsy+dwz/abDFhhlIBPzkHTbHmAD9TfOGc+ZYw2N19rj4LO2ZnF0u0h+U3GnflaHeYdIdXVDzw==`
- Verdaccio: exact artifact published, fetched and consumer-tested
- official npm: published once at `2026-08-29T09:12:21.298Z`, exact fetched
  bytes and clean scoped/historical-key consumers PASS
- npm: <https://www.npmjs.com/package/@stackline/once>
- repository: <https://github.com/alexandroit/stackline-once>
- immutable release:
  <https://github.com/alexandroit/stackline-once/releases/tag/stackline-v1.0.0>
- release: `immutable: true`, nine exact assets, published
  `2026-08-29T10:02:01Z`
- documentation: <https://alexandro.net/docs/vanilla/once/>
- catalog deploy commit:
  `f0cb153cce5c9fc9631fc3d9441832be1d69ac00`, CI `33247256501`
- deployment-memory commit:
  `64b9a7d5d9bf5c67f5731d737eb0cc80bc0be78f`, CI `33247540347`
- production: 34 root files, 34 compatibility files, 18 package files and
  13 canonical routes; origin/public/Cloudflare IPv4+IPv6 PASS
- availability: 100 IPv4 plus 20 IPv6 bounded requests PASS; listen drops
  remained 692 and overflows remained zero

Use the published npm bytes and immutable release. Never rebuild, replace,
republish, move or recreate version 1.0.0 or its tag.

## Adoption handoff

- Pull request: <https://github.com/restify/clients/pull/252>, base
  `9c37cde35aa8a2bc3eca2cbaf64902ae61510ecb`, head
  `af0e976d47258ec8c83b5fa0d1ccc6177ea5b23d`; only `package.json` and
  `test/HttpClient.test.js` change.
- Pull-request validation: clean official-registry Yarn install, exact alias
  identity/SRI/tree, lint, codestyle, commitlint, diff check, consumer smoke,
  230/230 deterministic tests and 1/1 focused regression on Node 22/24/26.
- Pull-request remote state: open and mergeable/review-blocked. External-fork
  workflow run `33247849839` awaits maintainer approval with zero jobs; this is
  not a test failure.
- Different-repository issue: <https://github.com/adobe/alloy/issues/1565>,
  evidence base `dea7a2273989a4a1918416e0b03e9495c6ca78a3`, no target mutation.
- Both contacts disclose Stackline maintainership, offer neutral choices and
  make no vulnerability claim.
- Different-repository check: `PASS`; adoption coverage: `COMPLETE`.
- Do not send an unsolicited follow-up. Respond only to a concrete maintainer
  question with evidence.

## Canonical Drive records

- GO decision: `1Y96CBcaUunsjBJmczOzcAhgvS35VoDe8`
- project memory: `1Z-9wbexq8JdUo-g8zhFjaCKKpJMuLFZ1`
- release verification: `1qT20g8pF3pJUImXJhzwqW2Pvw6x1H_qT`
- adoption targets: `1XJh62EjwUZ-EeOAXbaFbyA6b6BGIdT0x`
- registry handoff: `1Ime65bOSxtSZVME_gYaFzpA7JwOXigKe`
- Restify PR event: `1DdBfvC2nUeF5seEB4jhtin8C5KrE92MT`
- Adobe issue event: `1gV7bXpM-KmwkSjZ8vje2d9YnMwzI_847`
