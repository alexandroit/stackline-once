# Publishing

This file is a gate checklist, not authorization to publish.

1. Freeze one untagged release-candidate commit after `npm ci && npm run verify`
   passes from a clean checkout.
2. Require all Linux, macOS, Windows, runtime-matrix, package, and CodeQL jobs
   on that exact commit to be green.
3. Run `npm run artifact:prepare` once from the green commit and record its
   inventory, hashes, licenses, and CycloneDX SBOM.
   The command requires npm 10.8.2, a clean worktree, and a full
   `STACKLINE_GREEN_COMMIT` equal to `HEAD`; it refuses to replace an existing
   `release-candidate/` and records the source commit and commit timestamp.
4. Publish the exact archive to Verdaccio and verify scoped plus historical-key
   alias consumers.
5. Publish those exact bytes once to official npm using the authorized account;
   verify integrity, signatures, metadata, clean consumers, and production tree.
6. Only then create the immutable `stackline-v1.0.0` tag and GitHub release with
   the exact artifacts, and deploy Alexandro.Net documentation.
7. Re-run live downstream policy/deduplication before any public PR or issue.

Never rebuild between registries, move a published tag, bypass human-factor
authentication, or claim `PUBLISHED` while a required gate is red or missing.
