# Shared TEST workspace

Authenticated TEST sign-in opens `SharedTestWorkspace`, backed by the existing Lovable/Supabase project. The browser-local DEMO portal and its attachments are preserved independently; TEST never reads, imports, or writes that local record store.

## Shared behavior

- Projects, department evidence records, tasks and assignments, cross-department approval requests/decisions, document metadata, private-file revision access, and audit activity use the normalized backend tables.
- Reads are refreshed after each successful transaction, when the window regains focus, and every ten seconds. The header shows the last server read. A connection failure does not fall back to a local save.
- Admin/Sales create projects. Members can update their assigned tasks; leads manage their department. Only the explicitly requested reviewer department or an administrator can decide a review. Viewers receive no internal records without a separate client-release contract.
- Server transactions derive organization, actor and department from active membership. They serialize TEST writes, reject stale versions, preserve request identities across uncertain network retries, and create attributable audit entries atomically.
- Stage changes call the existing checked gate RPC. The client supplies approval identities and revisions; it cannot set stage/status as a substitute for a gate decision.
- Existing synthetic employees are assigned their known TEST department without creating users or changing passwords. No approval permission is granted to the employee role.

## Boundary

The shared TEST interface exposes the connected workflow modules above. The extensive demonstration-only domain screens, sample lifecycle walkthrough, inventory simulations, and local draft catalogue remain in the local DEMO portal. They are not presented as shared operational screens. Existing local records/files are not silently migrated to the cloud.

## Verification

`tests/shared-test-postgres.test.cjs` runs the real repository migrations against PostgreSQL via PGlite. It verifies independent actor reads, assigned-employee updates, denied cross-department reads/writes, delegated review decisions, atomic stage checks, stale edits, idempotent replay, immutable decisions, viewer restrictions and migration reapplication without data loss. The complete Node test suite, TypeScript check and production build are required before sync/deployment.
