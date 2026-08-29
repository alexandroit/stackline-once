# Project Memory

- Package: `@stackline/once`
- Initial Stackline version: `1.0.0`
- Published baseline: `once@1.4.0`
- Restored fix: signed upstream `v1.4.1`
- Decision: `GO`, state `PUBLISHED`, dated 2026-08-29
- Production graph: zero dependencies
- Runtime: one ES5 CommonJS implementation; exact Node.js 0.10.48+
- Key correction: callback `called`/`value`/`onceError` decorations cannot
  overwrite fresh wrapper state
- Global boundary: `once.proto()` remains explicit and potentially partial on
  non-configurable prototype collisions

The canonical decision evidence remains in decision.json, UPSTREAM_AUDIT.md,
and ADOPTION_TARGETS.md.

## Immutable release

Release source commit `ea00ab9a1ca2badbdfddaeb9236fb689fd064067`
passed the complete hosted matrix and CodeQL before artifact construction.
Main CI run `33244425614` and CodeQL run `33244425647` succeeded. Tag CI run
`33245165470` succeeded after an unchanged failed-job rerun recovered a
target-owned Adobe build hang/cleanup error; tag CodeQL run `33245165508`
succeeded.

The one accepted tarball is `stackline-once-1.0.0.tgz`, 7,488 bytes, 14 files
and 21,145 unpacked bytes:

- SHA-1: `cf9d4679e473f75ae8bc1e61d95a494bd3088cd0`
- SHA-256: `dd95a3455ed26d3e40c8d6fe107662b4475addf4ca6a6ef9fdb1b130ab3e1880`
- SHA-512: `abee3a37fc2898707f6cbb32f9dc33fda6c31618652013f39074db1e6003f537ce19cf99630d8dd7dae3e0b3b6667174bb487e5371a77e5687798748757543cf`
- SRI: `sha512-q+46N/womHB/bLsy+dwz/abDFhhlIBPzkHTbHmAD9TfOGc+ZYw2N19rj4LO2ZnF0u0h+U3GnflaHeYdIdXVDzw==`

The first local artifact build exposed only a file-mode mismatch against the
hosted Linux artifact; its payload was never published. Tracked worktree modes
were normalized to 0644 and the rebuilt final tarball became byte-identical to
the hosted artifact. That exact tarball was published to and fetched from
Verdaccio, then published once to official npm at
`2026-08-29T09:12:21.298Z`. A transient post-write npm edge E404 was allowed to
propagate; nothing was republished. Official scoped and historical-key alias
consumer tests passed against the fetched bytes.

The annotated immutable tag `stackline-v1.0.0` points to the already-green
source commit. The immutable GitHub release was published at
`2026-08-29T10:02:01Z` with nine exact assets; its downloaded tarball and asset
digest match the accepted SHA-256. Never rebuild, replace, republish, move,
delete, recreate or repoint version 1.0.0, its tag or release.

## Adoption coverage

The focused Restify Clients pull request
<https://github.com/restify/clients/pull/252> preserves both source imports and
the historical `once` key through exact npm alias
`once: npm:@stackline/once@1.0.0`. Base
`9c37cde35aa8a2bc3eca2cbaf64902ae61510ecb` and head
`af0e976d47258ec8c83b5fa0d1ccc6177ea5b23d` change only `package.json` and
`test/HttpClient.test.js`. Clean actual-registry install, lint, codestyle,
commitlint, diff, consumer smoke, 230/230 deterministic tests and the 1/1
real-path regression passed on Node 22, 24 and 26. The full observational Node
26 run had 232 passes and six exact pre-recorded host failures, with no other
failure. The external-fork workflow awaits maintainer approval with zero jobs;
that `action_required` state is not a test failure.

The different-repository Adobe Alloy issue
<https://github.com/adobe/alloy/issues/1565> records direct declaration and use
at `dea7a2273989a4a1918416e0b03e9495c6ca78a3`. It asks maintainers to choose a
local helper, the exact historical-key alias, or intentional retention. It
makes no vulnerability or bundle-size claim and requests no exception to
Adobe's normal 2,880-minute release-age hold.

Both contacts disclose independent Stackline maintainership. The repositories
differ and release-local adoption coverage is complete. Do not follow up
unsolicited; respond only to a concrete maintainer question with evidence.

## Documentation record

Production documentation is at
<https://alexandro.net/docs/vanilla/once/>. Private catalog deploy commit
`f0cb153cce5c9fc9631fc3d9441832be1d69ac00` passed CI run `33247256501`;
deployment-memory commit `64b9a7d5d9bf5c67f5731d737eb0cc80bc0be78f`
passed private CI run `33247540347`. Repository privacy was preserved.

The root and compatibility catalogs match their 34-file builds and the
package matches its 18-file build. Both aggregate sitemaps contain all 13
canonical once routes and advertise no compatibility-mirror URL. Origin,
ordinary DNS and Cloudflare IPv4/IPv6 returned expected content and examples.
Cloudflare's email obfuscation initially rewrote the two npm install commands;
the source guard was added, tested and redeployed, and the edge now preserves
both commands without `data-cfemail`, `__cf_email__` or a decoder script.

One hundred IPv4 and twenty IPv6 bounded edge requests all returned 200;
`TcpExtListenDrops` remained 692 and `TcpExtListenOverflows` remained zero.
The shared Nginx configuration was not replaced or reloaded, and every
availability setting, redirect and unknown-host rejection remained intact.
Rollback bytes are at
`/var/backups/stackline-docs/20260829T100824Z-once`.

## Canonical record

Canonical Drive project memory: `1Z-9wbexq8JdUo-g8zhFjaCKKpJMuLFZ1`,
<https://drive.google.com/file/d/1Z-9wbexq8JdUo-g8zhFjaCKKpJMuLFZ1/view>.
