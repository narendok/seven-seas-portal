# Operational gate revision correction

This local correction uses an additive migration in both Supabase and Drizzle; prior migrations and existing approvals remain intact. It has not been deployed to the Lovable backend.

## Evidence contract

Each deliverable is an object with exactly one of record_id or document_id, plus revision and approval_id. N/A entries map requirement keys to objects containing approval_id. Strings and ambiguous identities are rejected by the API. Stage values are 1–9 or Stage 1–Stage 9.

Approvals must bind evidence_record_id or evidence_document_id and evidence_revision. A record approval binds the server-computed SHA-256 of its JSON fields. A document approval binds the active controlled file revision and SHA-256 metadata. The authenticated authorized signer and timestamp are derived and checked on the server; approved evidence identities cannot be edited. N/A additionally binds evidence_is_na and evidence_requirement.

Unbound historical approvals are preserved but do not satisfy these gates. Before operational use, apply the migration and ensure approval producers supply these binding fields and obtain fresh approvals. Browser-local DEMO and TEST sign-in behavior are unaffected.

## Verification

Run npm run test:gate-db for actual PostgreSQL execution using the pinned PGlite engine. Tests load repository application migrations and exercise the SQL trigger and stage RPC, including revision replacement, stale manifests, checksum changes, unrelated projects, N/A, authentication, atomic writes, audit foreign keys and idempotency. Supabase auth identity and storage platform tables are isolated fixtures; no remote backend is contacted. Legacy JavaScript model tests are not database verification.

The full suite runs with npm run test:department. This isolated verification does not establish deployed RLS/storage access, multi-session contention, or end-to-end operational UI readiness. Live deployment and authenticated backend smoke testing remain separate steps.
