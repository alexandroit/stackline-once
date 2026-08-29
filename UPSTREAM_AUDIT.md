# Upstream audit: `once`

Date: 2026-08-29
Decision written: 2026-08-29T07:13:38Z
Decision: **GO — BUILDING**
Reason: `UNPUBLISHED_TAGGED_API_FIX_WITH_BOUNDED_LEGACY_CJS_SURFACE_AND_TWO_QUALIFIED_DIRECT_ADOPTION_PATHS`

Update: 2026-08-29T07:38:00Z — the initial GO is revoked and implementation is paused. Live cross-package deduplication found that the proposed issue repository, `jsreport/jsreport`, already received Stackline PR #1294 and explicitly declined it. The shared qualification gate prohibits any prior Stackline contact. Publication is blocked while a different active direct user is researched; if none qualifies, the final transition is `NO_GO`.

Update: 2026-08-29T07:48:50Z — the GO is resumed and the package returns to `BUILDING`. Independent live review qualified `adobe/alloy` at exact commit [`dea7a22`](https://github.com/adobe/alloy/commit/dea7a2273989a4a1918416e0b03e9495c6ca78a3) as the different-repository issue path. The current reactor-extension workspace directly declares and uses once, is active and non-archived, requires an issue before a proposed change, permits the authenticated Stackline account to create issues, and has no prior Stackline contact, competing once migration or maintainer decline. This transition permits local implementation and proof only; publication and public outreach remain blocked on every release gate.

## Selection and demand

`once` is effective rank 1 among unconsumed qualified Scout intake records. There is no unresolved user pin, no `CODEX_READY` queue entry and no active release checkpoint. The preceding intake identity, `graceful-fs`, is terminal `NO_GO`. The canonical package queue contains only WATCH records, so `once` enters through the qualified-intake lane; it is not added to the completed thlorenz roster.

The official npm downloads endpoint reported 133,027,161 downloads for 2026-08-22 through 2026-08-28. This is supporting reach evidence, not proof of direct use and not the GO reason.

- Registry: https://registry.npmjs.org/once
- Complete-week observation: https://api.npmjs.org/downloads/point/2026-08-22:2026-08-28/once
- Upstream: https://github.com/isaacs/once

## Published defect and unpublished upstream fix

The exact `once@1.4.0` artifact documents `once.proto()` but assigns `proto` to the inner `once` function after `module.exports` has already been set to `wrappy(once)`. The installed root export therefore has only the `strict` property and `proto` is `undefined`.

Upstream commit [`dd31e51`](https://github.com/isaacs/once/commit/dd31e51b051eeb4c9df26bcea2f9155c4e41efd2) moves that initializer to `module.exports.proto` and tests it. The annotated `v1.4.1` tag is signed and GitHub reports a valid signature, but npm's latest tag is still 1.4.0 and its packument has no 1.4.1 release.

Characterization also found a separate state-collision defect. `wrappy` copies every enumerable own property from the input callback onto the returned wrapper after `once` initializes `called=false`. A callback decorated with own `called=true` therefore produces a wrapper that never invokes the callback on its nominal first call. `value` and `onceError` can similarly overwrite state. A continuation must preserve ordinary callback decorations while reserving the wrapper's state keys.

## Provenance and license boundary

The published baseline is the ISC-licensed `once@1.4.0` artifact:

- Published: 2016-09-06T21:11:09.367Z
- Tarball: https://registry.npmjs.org/once/-/once-1.4.0.tgz
- SHA-1: `583b1aa775961d4b113ac17d9c50baef9dd76bd1`
- SHA-256: `cf51460ba370c698f68b976e514d113497339ba018b6003e8e8eb569c6fccfcf`
- SRI: `sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==`
- Runtime dependency: `wrappy@1`
- Maintainer: npm identity `isaacs`

The signed v1.4.1 line is also ISC and carries the 2012-2022 Isaac Z. Schlueter and Contributors notice. Current main changed only the repository license to BlueOak-1.0.0 at commit `0fbb41e` on 2025-10-25. Stackline will use the published/tagged ISC provenance, preserve the full notice and attribution, and will not imply affiliation with the original maintainer.

## Alternatives and security evidence

`onetime@8` is ESM-only, requires Node 22 or newer, and does not preserve `once.strict`, `once.proto`, `wrapper.called` or `wrapper.value`. Native JavaScript has no equivalent drop-in stateful wrapper. Exact-version OSV queries for `once@1.4.0` and `wrappy@1.0.2` returned no matches on 2026-08-29; that is not a claim that either package is vulnerability-free.

## Compatibility and build gates

The release must preserve the callable CommonJS root, `strict`, the now-exported one-shot `proto` initializer, `this`, arguments, return identity, repeated-call caching, error wording, public `called`/`value` state, ordinary callback decorations, prototype descriptors and deep `once.js` entry. It must characterize re-entry, thrown calls, unusual functions and property collisions. Reserved wrapper state may not be overwritten by input decorations.

The implementation may remove `wrappy` only if differential tests prove its intended decoration-copy behavior and downstream tests prove that the removed dependency edge is safe. The runtime remains ES5-compatible and must be tested across its explicitly claimed Node range. Any shipped declarations must pass TypeScript 3.9. Packed direct-scoped, historical-key npm-alias, CJS, ordinary ESM interop, browser, malformed-input, stress, `publint`, Are the Types Wrong, license, SBOM, audit and clean-consumer gates are mandatory.

## Concrete adoption plan

The PR candidate is `restify/clients` at commit [`9c37cde`](https://github.com/restify/clients/commit/9c37cde35aa8a2bc3eca2cbaf64902ae61510ecb). Its root manifest directly declares `once@^1.4.0`; `lib/HttpClient.js` and `lib/StringClient.js` wrap caller callbacks in multiple live request paths. A historical-key npm alias can preserve all imports. The target is active, non-archived, Node >=22, and has no prior Stackline contact or competing once migration. Baseline and alias tests must prove the repository and a callback-property regression before a PR is eligible.

The originally proposed different-repository issue candidate, `jsreport/jsreport`, is **disqualified**. Although commit [`907e27e`](https://github.com/jsreport/jsreport/commit/907e27eec404742f5661bc0cd88590c9f77622a7) directly pins and uses once, live cross-package deduplication found prior Stackline PR [#1294](https://github.com/jsreport/jsreport/pull/1294). It was closed unmerged on 2026-08-26 after an explicit maintainer decline. The gate is prior Stackline contact, not prior contact about this package, so no jsreport issue may be opened. A replacement issue target must pass every gate before a new GO is written.

The qualified replacement issue candidate is `adobe/alloy` at exact commit [`dea7a22`](https://github.com/adobe/alloy/commit/dea7a2273989a4a1918416e0b03e9495c6ca78a3). Its private `reactor-extension-alloy@2.37.2-beta.1` workspace directly declares [`once@^1.4.0`](https://github.com/adobe/alloy/blob/dea7a2273989a4a1918416e0b03e9495c6ca78a3/packages/reactor-extension/package.json#L44-L62). It actually imports and calls once in both [`monitorForOriginatingErrors.js`](https://github.com/adobe/alloy/blob/dea7a2273989a4a1918416e0b03e9495c6ca78a3/packages/reactor-extension/src/view/utils/monitorForOriginatingErrors.js#L13-L16), where a browser error listener is installed at most once, and object-editor [`validate.js`](https://github.com/adobe/alloy/blob/dea7a2273989a4a1918416e0b03e9495c6ca78a3/packages/reactor-extension/src/view/components/objectEditor/helpers/validate.js#L13-L42), where a recursive notification callback is bounded to one call.

This target's benefit is deliberately narrow. The two call sites use only ordinary at-most-once execution, while the browser extension build carries the unchanged 2016 once package plus `wrappy@1.0.2`. The issue will ask Adobe maintainers to choose among internalizing the two small helpers, retaining the import through an npm alias to the maintained Stackline continuation, or intentionally keeping the historical dependency. It will disclose Stackline maintainership and make no defect, vulnerability or security claim.

Repository and deduplication gates passed on 2026-08-29. `adobe/alloy` is public, Apache-2.0, non-archived, and was pushed on 2026-08-27; recent human changes and release commits prove current maintenance. Its [contribution guide](https://github.com/adobe/alloy/blob/dea7a2273989a4a1918416e0b03e9495c6ca78a3/CONTRIBUTING.md) directs external proposals to an issue, and its pull-request template states that changes must relate to an open issue. Authenticated GitHub GraphQL reported `hasIssuesEnabled=true`, `isBlankIssuesEnabled=true`, `issueCreationPolicy=ALL` and `viewerCanCreateIssues=true` for `alexandroit`. The Adobe security policy requires private reporting for security issues, but this maintenance question is not a security report. Live searches returned zero results for `@stackline`, `stackline`, `isaacs/once`, `once@1.4.0`, `npm:once`, `wrappy`, `author:alexandroit` and `involves:alexandroit`; a broad `once` search contained no once-package migration. Local outreach ledgers and canonical mirrors contain no Adobe Alloy contact.

Express is excluded because its maintainers have already rejected removal and requested prior discussion. Pump and end-of-stream each have a competing open once-removal PR. Formidable has already merged internalization and current main no longer directly declares once.

## Revocation conditions

This GO is not publication approval. Replace it with a durable `NO_GO` if reserved-state/property-copy behavior cannot be reconciled, the Function prototype contract cannot be proved, either adoption path stops qualifying, any required local or hosted gate is red or missing, immutable registry verification cannot complete, or the Alexandro.Net availability contract cannot be preserved.
