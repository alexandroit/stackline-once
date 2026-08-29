# Adoption targets: `@stackline/once`

Observed: 2026-08-29T07:13:38Z
Reconciled: 2026-08-29T07:48:50Z

Before public outreach, `@stackline/once@1.0.0` had to be verified on official npm, GitHub and Alexandro.Net. The PR and issue had to remain in different repositories and pass a final live deduplication and repository-policy check. Those gates passed before the two contacts below were created.

## Pull request candidate — `restify/clients`

- Pinned evidence commit: `9c37cde35aa8a2bc3eca2cbaf64902ae61510ecb`
- Direct declaration: root `package.json`, `once@^1.4.0`
- Actual use: `lib/HttpClient.js` and `lib/StringClient.js`
- Migration shape: preserve `require('once')` with `"once": "npm:@stackline/once@1.0.0"`
- Required target proof: clean baseline, clean alias install, target test/lint gates, callback-property first-call regression, exact installed identity/integrity/tree
- Reproducible gate: `STACKLINE_DOWNSTREAM=restify-clients npm run test:downstream` clones this commit twice, runs `make lint`, `make codestyle` and `make coverage`, then repeats after installing the packed candidate under the `once` key
- Ambient exception boundary: each observational full run may contain only a subset of the exact seven allowlisted port/non-routable-IP failures and records its set/count separately; the pristine inverted-grep suite must pass 229/229, while the migrated suite adds a real `HttpClient.request` proxyquire regression and must pass 230/230 plus 1/1 focused on `reserved once state`
- Disclosure: the contributor maintains the Stackline replacement

## Disqualified issue candidate — `jsreport/jsreport`

- Pinned evidence commit: `907e27eec404742f5661bc0cd88590c9f77622a7`
- Direct declaration: `packages/jsreport-cli/package.json`, exact `once@1.4.0`
- Actual use: `packages/jsreport-cli/lib/instanceHandler.js`, including direct reads of `resolveInstanceOnce.called`
- Decision: retain the exact public-state/CommonJS contract through a maintained historical-key alias, or remain intentionally pinned
- Required target proof: baseline CLI test/lint, alias test, callback/promise arbitration regression, exact installed identity/integrity/tree
- Disposition: **DISQUALIFIED**. Prior Stackline PR #1294 was closed unmerged after an explicit maintainer decline on 2026-08-26. No issue may be opened.

## Qualified issue candidate — `adobe/alloy`

- Pinned evidence commit: `dea7a2273989a4a1918416e0b03e9495c6ca78a3`
- Repository state: public, Apache-2.0, non-archived, pushed 2026-08-27; current human and automated releases remain active
- Direct declaration: `packages/reactor-extension/package.json`, `once@^1.4.0`; the lock resolves exact `once@1.4.0` plus `wrappy@1.0.2`
- Actual use: `packages/reactor-extension/src/view/utils/monitorForOriginatingErrors.js` imports once and installs its browser error listener once; `packages/reactor-extension/src/view/components/objectEditor/helpers/validate.js` imports once and bounds a recursive notification callback
- Runtime and package manager: latest Node LTS through `.nvmrc`; pnpm 11.11.0 through root `devEngines`; the reactor-extension view is browser-bundled
- Genuine decision: choose whether to internalize the two ordinary at-most-once helpers, preserve imports with `"once": "npm:@stackline/once@1.0.0"`, or intentionally retain the historical dependency
- Concrete benefit: either internalization or the maintained zero-dependency alias removes the unchanged `wrappy@1.0.2` edge owned by these two direct imports; this is a bounded supply-chain and direct-dependency ownership question, not a defect, vulnerability, security, whole-bundle-removal or measured-size claim
- Policy: `CONTRIBUTING.md` directs external proposals to an issue; `.github/PULL_REQUEST_TEMPLATE.md` says changes must relate to an open issue. Authenticated GitHub GraphQL returned `hasIssuesEnabled=true`, `isBlankIssuesEnabled=true`, `issueCreationPolicy=ALL` and `viewerCanCreateIssues=true` for `alexandroit`
- Security routing: the organization security policy points actual vulnerabilities to Adobe's private process. The proposed maintenance question contains no vulnerability disclosure or security assertion
- Live deduplication: zero results for `@stackline`, `stackline`, `isaacs/once`, `once@1.4.0`, `npm:once`, `wrappy`, `author:alexandroit` and `involves:alexandroit`; the broad `once` result set contained no once-package migration
- Cross-package deduplication: no `adobe/alloy` or Adobe Alloy contact exists in local outreach ledgers or canonical mirrors
- Required target proof before outreach: at the pinned commit, run a frozen baseline and an isolated alias migration with the repository's build, lint, format, typecheck and reactor-extension tests; verify the two source imports still resolve through the historical key, the direct lock/importer instance is `@stackline/once@1.0.0` with zero dependencies and no production `wrappy` path, and record unrelated development-only `wrappy` paths plus provenance-comment literals without treating them as the direct edge
- Reproducible gate: `STACKLINE_DOWNSTREAM=adobe-alloy npm run test:downstream` clones this commit twice and runs pnpm 11.11.0 install, build, lint, format check, typecheck and reactor-extension tests before and after the isolated migration
- Local result 2026-08-29: **PASS** on Node 26.8.1/pnpm 11.11.0 for both baseline and migration; the direct migrated production `why` tree contains only `@stackline/once@1.0.0` and no `wrappy`, while exact unrelated development-only paths and the two provenance-comment literals are recorded in the runner output
- Disclosure: identify the contributor as the maintainer of the Stackline option and present retain/internalize/alias neutrally

This candidate is in a different repository from `restify/clients`: **PASS**. Local implementation may resume, but no issue or pull request is eligible before the package is published and the exact live policy/contact/competitor checks are repeated.

## Completed release-local coverage

### Pull request — `restify/clients#252`

- URL: <https://github.com/restify/clients/pull/252>
- Created: `2026-08-29T10:26:59Z`
- Base: `9c37cde35aa8a2bc3eca2cbaf64902ae61510ecb`
- Head: `af0e976d47258ec8c83b5fa0d1ccc6177ea5b23d`
- Scope: only `package.json` and `test/HttpClient.test.js`, 47 additions and
  one deletion
- Migration: `once: npm:@stackline/once@1.0.0`; all source imports unchanged
- Verification: official-registry alias identity/SRI/tree, lint, codestyle,
  commitlint, diff, consumer smoke, 230/230 deterministic tests and 1/1
  focused regression PASS on Node 22, 24 and 26
- Full observational run: 232 passing, six exact allowlisted host failures,
  zero other failures
- Remote: open and mergeable/review-blocked; external-fork workflow run
  `33247849839` awaits maintainer approval with zero jobs, not a test failure
- Disclosure: exact independent-maintainer and non-affiliation disclosure;
  no vulnerability claim

### Issue — `adobe/alloy#1565`

- URL: <https://github.com/adobe/alloy/issues/1565>
- Created: `2026-08-29T10:21:53Z`
- Evidence commit: `dea7a2273989a4a1918416e0b03e9495c6ca78a3`
- Request: choose local ownership, the exact historical-key npm alias, or
  intentional retention
- Verification: direct declaration and both imports remained current; clean
  official-registry alias/ESM smoke and the complete baseline/migration target
  proof passed
- Disclosure: Stackline maintainership stated; no vulnerability or bundle-size
  claim; no exception requested to Adobe's normal two-day release-age hold

The repositories differ: **PASS**. Adoption coverage for
`@stackline/once@1.0.0` is **COMPLETE** and no active release checkpoint
remains. Do not follow up unsolicited.

Canonical Drive adoption record: `1XJh62EjwUZ-EeOAXbaFbyA6b6BGIdT0x`,
<https://drive.google.com/file/d/1XJh62EjwUZ-EeOAXbaFbyA6b6BGIdT0x/view>.

## Excluded current candidates

- `expressjs/express`: prior maintainer decisions reject removal and require discussion; no unsolicited contact.
- `mafintosh/pump`: competing open once-removal PR #63.
- `mafintosh/end-of-stream`: competing open once-removal PR #34.
- `node-formidable/formidable`: internalization already merged in #1083; main no longer directly declares once.
- `jsreport/jsreport`: prior Stackline PR #1294 was closed unmerged after an explicit maintainer decline on 2026-08-26.
