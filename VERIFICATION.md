# Verification

The local red gate is `npm ci && npm run verify`. It covers ES5 parsing, lint,
the upstream suite, differential behavior against `once@1.4.0`, state,
decorations, prototype mutation/collisions, malformed inputs, stress, browser
bundling, ESM default interop, TypeScript 3.9/current declarations, the declared
Node range, coverage, packed scoped/historical-key consumers, publint, Are the
Types Wrong, frozen decision metadata, package inventory, licenses, SBOM,
documentation, and npm audits/signatures.

Downstream qualification additionally pins and tests:

- `restify/clients@9c37cde35aa8a2bc3eca2cbaf64902ae61510ecb`;
- `adobe/alloy@dea7a2273989a4a1918416e0b03e9495c6ca78a3`.

Run both isolated baseline/migration lanes on Node.js 22.13 or newer:

```sh
npm run test:downstream
```

Run one lane while diagnosing a target-specific failure:

```sh
STACKLINE_DOWNSTREAM=restify-clients npm run test:downstream
STACKLINE_DOWNSTREAM=adobe-alloy npm run test:downstream
```

The runner packs the local candidate, clones each exact commit twice, uses
Yarn 1.22.22 or pnpm 11.11.0 through exact npm-exec package pins, runs the
unchanged target first, then installs the tarball under the historical `once`
key in the second clone and repeats the target gates. It verifies installed
name/version/dependency identity, Restify's callback-decoration regression,
Adobe's two unchanged imports, and removal of the direct reactor-extension
`once -> wrappy` edge.

Adobe proof is deliberately importer-scoped. The migrated historical key must
resolve to `@stackline/once@1.0.0` with zero dependencies; its lock importer and
empty package snapshot must not link that direct instance to `wrappy`; and
`pnpm why --prod` must show the candidate as the sole direct `once` while
returning no production `wrappy` path. Non-production `pnpm why wrappy` output
is retained: build/test tooling still reaches `wrappy@1.0.2` through
`inflight -> glob` and through unrelated `once@1.4.0 -> end-of-stream/pump`,
including reactor packager/sandbox, Babel CLI, TestCafe, Puppeteer, archiver,
rimraf, and globby paths. Those development paths are outside this direct
adoption decision.

The built view still contains the word `wrappy` only in this package's
provenance comment (and its source map). The runner classifies and records those
literals instead of mistaking them for a module edge. No whole-bundle removal
or byte-size saving is claimed.

Adobe's root build rewrites the tracked target-owned
`packages/browser/bundlesize.json`. The runner allows only that generated file
in baseline and only that file plus the intended reactor-extension manifest and
lockfile in migration. It records both metric-delta maps and requires them to
be identical, establishing that the reactor-extension dependency migration did
not affect the separate browser package's generated bundle metrics.

Restify's complete suite is still executed for both baseline and migration. On
this host, seven tests are environmental: one binds the already-occupied fixed
port 8080 and six assume `10.255.255.1` stalls instead of failing immediately.
Each run may observe a different subset as the host network changes, but the
runner accepts no title outside that exact seven-title allowlist and records
each set and count separately. Deterministic comparison then requires 229/229
from the pristine target's precise non-environmental filter:

```sh
./node_modules/.bin/mocha -R dot --full-trace \
  --grep 'connect(?:ion)? timeout|exercise callback when server closes socket' \
  --invert
```

That filter also omits the otherwise-passing inflight HttpClient connect-timeout
case, so all timeout assumptions are treated consistently. In the isolated
migration clone, the runner adds a target-style `HttpClient.request` regression
using proxyquire's real backoff boundary. The migrated filtered suite must then
pass 230/230 and the focused `reserved once state` selection must pass 1/1,
proving callback-owned `called` and `value` decorations do not suppress the
first invocation. The immutable upstream package fails that same real-path
probe. A separate packed consumer smoke verifies installed identity and cache
behavior without being counted as a target Mocha test.

This networked gate is intentionally separate from `verify`: it clones two
external repositories, resolves their current lock/no-lock dependency graphs,
and Adobe installs browser tooling and runs its extension suite. The dedicated
hosted matrix makes it mandatory without turning every package-only quality
run into a long, network-dependent downstream rebuild.

### Local downstream result — 2026-08-29

Both lanes passed with Node.js 26.8.1 against packed candidate SHA-256
`1bbd1ac687c81eb8d402e8ef899008157bcb955ed32af74553085eace54256d1`
(7,489 bytes):

- `restify/clients@9c37cde35aa8a2bc3eca2cbaf64902ae61510ecb`
  used Yarn 1.22.22. Lint and codestyle passed; the full baseline and migration
  each recorded the same seven allowlisted environmental failures; the
  deterministic suites passed 229/229 baseline and 230/230 migration; the real
  HttpClient reserved-state selection passed 1/1; installed identity and the
  packed consumer smoke passed.
- `adobe/alloy@dea7a2273989a4a1918416e0b03e9495c6ca78a3` used pnpm
  11.11.0. Baseline and migration build, lint, format check, typecheck, and
  reactor-extension tests passed. Both source imports remained unchanged; the
  migrated direct production tree contained only `@stackline/once@1.0.0` with
  zero dependencies and no `wrappy` path. All 86 built view files were scanned;
  their only two `wrappy` literals were the candidate provenance comment and
  its source map. Baseline/migration generated bundle-metric deltas and diff
  hashes were identical.

Artifact preparation is a separate one-shot release operation, not a routine
verification step. It requires npm 10.8.2, a clean Git worktree, and a full
`STACKLINE_GREEN_COMMIT` equal to `HEAD`; it records that commit and its commit
timestamp in both the artifact manifest and release notes, and refuses to
delete or replace an existing `release-candidate/`.

The malformed-decoration fixture uses an arrow callback so its own enumerable
`prototype` is a normal decoration; a constructable function's intrinsic
`prototype` is non-configurable and would make the fixture fail before the
wrapper is exercised. The prototype strict-wrapper fixture supplies explicit
`this` and argument values, making its expected second callback result
deterministic rather than relying on `undefined` arithmetic.

The coverage command includes the prototype suite explicitly because
`once.proto()` is part of the shipped root API. Omitting that already-green
suite from c8 would report its initializer as uncovered even though `npm test`
exercises it.

All export-map conditions resolve the real CommonJS runtime to the `export =`
`.d.cts` declaration. ESM consumers receive Node's CommonJS default interop;
the package does not publish a parallel ESM-shaped declaration that would
misrepresent the runtime or its named exports.

The license checker treats line wrapping as whitespace when matching the
required non-affiliation sentence. It still requires the complete wording in
NOTICE rather than coupling the gate to one Markdown line length.

Local success does not substitute for hosted CI/CodeQL, Verdaccio, official
npm, GitHub release, or Alexandro.Net verification. Record those separately
only after they actually occur.
