# Issue Triage

Classify reports by the observable contract they affect:

- invocation/state (`called`, `value`, re-entry, synchronous throws);
- strict errors and `onceError`;
- callback decorations and reserved keys;
- `Function.prototype` descriptors/collisions;
- CommonJS, deep entry, ESM default interop, browser, or TypeScript;
- package integrity, provenance, license, or supply chain.

Ask for a minimal reproduction and exact runtime/package versions. Security
reports belong in a private advisory. A behavior difference from upstream must
be matched against COMPATIBILITY_CONTRACT.md before it is labeled a defect.
