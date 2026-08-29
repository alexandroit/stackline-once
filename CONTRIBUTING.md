# Contributing

Use Node.js 20 or newer for development while keeping `once.js` valid ES5 and
executable on exact Node.js 0.10.48.

1. Install the exact graph with `npm ci`.
2. Add upstream, differential, state, decoration, prototype, malformed-input,
   stress, type, browser, runtime, or packed-consumer proof for every
   observable change.
3. Run `npm run verify`.
4. Review `npm pack --dry-run`; keep fixtures, caches, credentials, decision
   evidence, and development-only tools out of the artifact.

Preserve the callable CommonJS root and deep entry, `strict`, public state,
`this`/arguments/return identity, sticky throw and re-entry behavior, exact
error text, and opt-in prototype descriptors. Do not make `proto()` implicit.

Do not add a runtime dependency without a dated maintenance, security,
compatibility, license, and topology review. Do not add an exactly-once,
security, or global-coordination claim without a corresponding implementation
and adversarial gate.
