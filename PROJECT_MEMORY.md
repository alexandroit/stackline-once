# Project Memory

- Package: `@stackline/once`
- Initial Stackline version: `1.0.0`
- Published baseline: `once@1.4.0`
- Restored fix: signed upstream `v1.4.1`
- Decision: `GO`, state `BUILDING`, dated 2026-08-29
- Production graph: zero dependencies
- Runtime: one ES5 CommonJS implementation; exact Node.js 0.10.48+
- Key correction: callback `called`/`value`/`onceError` decorations cannot
  overwrite fresh wrapper state
- Global boundary: `once.proto()` remains explicit and potentially partial on
  non-configurable prototype collisions

The canonical evidence remains in decision.json, UPSTREAM_AUDIT.md, and
ADOPTION_TARGETS.md. Publication, hosted CI, immutable artifact, registry,
GitHub release, documentation deployment, and outreach records must not be
inferred from local build completion.
