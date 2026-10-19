# Department scope and document draft correction checkpoint

19 October 2026. Source and browser checks completed; connected preview sync tracked below. Android source and managed database were not changed.

## Implemented locally

- Department approval visibility includes own requests and requests explicitly assigned to that department. Search, counts and filters use that scope; desktop and mobile badges derive from the same records. Canonical Sales and HR aliases are handled. Only the three identified legacy demo IDs receive compatibility metadata.
- Approval buttons and mutation handlers use the same explicit designated-authority rule. Request ownership alone cannot authorize signing; an Admin designation cannot be bypassed by QA. Missing records/authority fail closed. The request form requires title, source reference and explicit authority, supports all eleven leads, and uses linked project options.
- My Tasks opens a separate assigned-task view with a department-only assignee filter. Active Projects opens a department-linked project list and selecting a project opens its department contribution. Coordinator project cards derive from linked records instead of the four hardcoded default projects.
- Service's lifecycle sidebar shortcut is removed. Other department shortcuts are marked as demo walkthroughs. Demo lifecycle progression/kickoff cannot mutate configured non-demo state. A full simulated run no longer records an assertion of verified production synchronization.
- Department team directory uses the same roster as its dashboard and cannot widen to unrelated departments. Added local members persist in portal state. Demo members are used only in demo state. Missing email/contact details remain missing.
- Documents are scoped before summary counts; document opening checks the same ownership/explicit-assignment rule. Titles and filenames do not grant access. Empty unrelated folder categories are hidden; Customer Register appears only for Admin/Sales/Finance. Notification count/list uses department scope.
- The existing twelve document types have separate draft section/field definitions. Preview and Markdown export share one model with source references and explicit missing fields. Generic telematics specifications and fabricated approval/signature tables were removed. Unknown formats show unsupported status. Draft previews do not claim issue, approval or an invented page count. New draft identifiers are visibly provisional; controlled form IDs are preserved. Unlinked documents no longer silently select AI4T.
- Save local draft now creates/updates an unissued department document record instead of merely re-saving template text. It is explicitly browser-local and not issued or cloud-synced.
- Refresh repair previously required `demo-doc-datasheet`, which the actual demo seed does not contain, so it repeatedly replaced saved state with fresh demo data. The completeness check now uses existing seed IDs, and incomplete-state repair preserves existing drafts, revisions, tasks, approvals and roster data while restoring only missing seed collections/documents.

## Verification

- Final TypeScript check and full Vite client/SSR/Nitro production build passed after the hydration repair. Existing build warnings concern deprecated validator calls, chunk size and dependency directives; no build errors remained.
- Fourteen focused Node tests passed (including serialized multi-tab edits, field preservation, concurrent approval decisions and India business dates): cross-department approval visibility for all eleven leads, designated signing authority, canonical aliases, legacy compatibility, project link parsing (including non-HLPL/UUID references), refresh-repair preservation, distinct document formats, source/missing-data behavior and unsupported formats.
- Local browser checks passed for task destination, project destination and department directory across SAL, EHW, ESW, MECH, PUR, QA, EMF, TST, FIN, SIT and HR/OPS.
- Local browser approval checks: SAL 0, EHW 1, ESW 0, MECH 0, PUR 0, QA 2, EMF 0, TST 0, FIN 1, SIT 0, HR/OPS 0. QA retains the EHW review routed to QA; Finance retains its own request. No approval actions were submitted during these checks.
- Service separately verified: backup task opens in My Tasks, linked SLCT project is listed, directory contains Kai Morgan/Sameer Khan/Preeti Joshi, and approval summary/list are zero without unrelated requests.
- Hardware draft viewer verified with type-specific requirements/design-limit sections, missing fields displayed as TBD, and review/approval entries shown as not recorded. The initial refresh test exposed the repair defect described above. After repair, saving, refreshing, saving the same draft again and refreshing again retained exactly one `DRAFT-HLPL-SLCT-01-EHW-PRS` register row. [Visual evidence](department-draft-persistence-2026-10-19.png).

## Production lifecycle and document boundaries

The current portal operational state is saved in browser localStorage. Stage progression uses Ai4tSimulation state and demo callbacks, not a verified server gate transaction. A browser-local task update or successful UI test does not prove shared production persistence, work-floor completion or mobile synchronization.

The local migration `supabase/migrations/20261003_scms_core_schema.sql` defines `controlled_documents` and unrestricted public modify/read policies, while authenticated file functions query `documents` and `controlled_document_files`. This is a source-level contract mismatch; deployment status was not established. Do not apply that migration to production as remediation. Confirm live schema, auth, RLS, storage and existing transaction contracts first. No remote policy/migration was applied.

Full production acceptance still needs approved authenticated test identities and a verified environment; authoritative project/task/gate reads and writes; evidence-backed gate prerequisites; server approval/audit/numbering/idempotency; private document release/download contracts; actual BOM/test/inspection/dispatch records; and Android contract acceptance. Existing contract artifacts must be reconciled with live evidence before wiring these operations. Company-wide and client release permissions have not been certified by these local demo checks.

The full standardization inventory remains planned. Twelve draft field schemas are not finished DOCX/XLSX templates, certified forms, valid external certificates or a complete production document generation engine. Missing information is deliberately exposed for owner review.

## Extended browser acceptance and live environment audit

- Created a browser-local Hardware task, assigned it to the Hardware lead, and requested Quality approval against that exact source record. Quality's already-open tab received the request without refresh. Hardware had no signing action and was blocked from completing the pending task. Quality approved with an explicit local-test rationale; Hardware's open tab received the approved task and notification. The saved result survived refresh. This was local acceptance data, not a production release.
- Service task review and reassignment were exercised. Corrected an area/persona-ID mismatch that prevented its own tasks updating. Reassignment now merges structured fields, retaining project and due date.
- Mutations reload the latest persisted snapshot under a shared browser lock. Storage events refresh other open tabs. Pending/authority checks run inside the saved approval transaction, preventing stale or repeated decisions overwriting a completed review.
- Record edits reset when source values change externally, so an open stale form does not silently restore the previous approval status. New tasks require an actual department roster assignee and explicit project selection; they no longer silently select AI4T.
- Business due dates use Asia/Kolkata by default rather than the UTC date at local midnight.
- Client header Released Deliverables was reproduced opening the internal unified index (including unrelated Hardware and HR records). Client content is now selected before internal route branches; header and sidebar document links open the customer gallery. Internal record/document names never grant customer access. Non-demo customers see no release until a verified release and recipient grant exist.
- Client gallery retained the upstream inspection modal/sample downloads, with an explicit demo banner covering its illustrative milestones, prices, signatures and certificates. It cannot represent production release evidence.
- Sign-out was tested: signed-out landing replaces the former Admin fallback and survives refresh. The picker explicitly identifies browser-local demo roles; it includes Service and HR. Opening Service via the picker and its My Tasks route passed.
- Live Lovable Database UI showed zero rows in organizations, organization_members, departments, department roles/assignments, operational_records, tasks, approvals, documents, controlled_document_files, client_shares, record_links and audit_events. Users UI states **No sign-in methods are enabled yet**. [Live auth evidence](live-auth-not-enabled-2026-10-19.png). No provider was enabled, users created, or database rows/policies changed.

Production acceptance is blocked on the real organization, administrator identity and authentication provisioning, then a full authenticated shared persistence implementation and private file/RLS tests. The browser prototype cannot be called a completed production portal. The real organization name and initial administrator work email have been requested; no password is required in chat.

Final verification: 14 tests, TypeScript and full Vite client/SSR/Nitro build passed. [Approved task browser evidence](approved-task-roundtrip-2026-10-19.png).

Tested source checkpoint: e2c1b84 (preserves upstream customer-document work and local fixes). Production publishing, authentication provisioning, migrations and Android changes were not performed.

## Approved connected preview sync — 19 October 2026

User explicitly approved pushing to narendok/ssm-new-web main. Push succeeded through 3403586, and Lovable history shows the fixes and updated web roadmap received with the latest plan commit selected as Previewing. This resolves the earlier automatic-review push block; it does not publish production or enable authentication/backend operations.

Post-push Lovable browser checks passed: Service My Tasks opened its assigned backup task (one task); Finance approvals listed only its own pending advance-billing request (one record, zero awaiting Finance signature), without unrelated Hardware/Quality requests. These are live-preview demo checks, not authenticated production acceptance.
