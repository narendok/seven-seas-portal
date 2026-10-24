# Shared business repair — 24 October 2026

This is implementation/verification evidence. The consolidated handoff remains the specification; this is not a replacement prompt or a claim that every master-plan feature is finished.

## Source and backend

Baseline: web `b6de4c3`, Android `5d10316`. GitHub fetch on 24 October found both local baselines equal to origin/main before these edits. Existing unrelated local files were preserved.

The approved backend remains `rzskhndweihuczbdhoxk`. The Supabase connector lacked access to it; no substitute project was used. Migration `20261021134427_business_workspace_contract.sql` was tested in a rollback-only transaction through Lovable, then deployed through its SQL editor. Verification showed RLS enabled, anonymous RPC access false, direct authenticated table access false, 27 memberships preserved, and zero seeded business items immediately after deployment.

Migration `20261024084915_business_workspace_validation_guards.sql` contains the final RPC corrections. **Deployment is awaiting fresh user confirmation at Lovable's Run anyway warning.** Automatic approval review rejected that action on 24 October; do not report this migration as deployed until its result is checked. Source tests include it.

## Implemented in this repair

| Area | Result |
|---|---|
| Identity | TEST profiles use exact authenticated membership; missing employment details stay Not recorded. Android no longer converts failed sign-in into a synthetic authenticated session. |
| Session restoration | Web initialization no longer calls a persona callback from an uninitialized render. Failed verification blocks access without silently replacing it with DEMO data or signing out a valid session for a transient failure. |
| Operational workspace | Reuses the existing colored DepartmentProjectWorkspace with shared records, member identities, tasks, documents and approvals. Employee task projection contains the actual assignee's work. Compact record edits write the original record. |
| Finance | Guarded server transactions, exact allocation matching, self-approval denial, version checks and idempotent retries. Approval reserves commitment; evidence-backed posting clears commitment and posts actual expenditure once. Finance employees do not inherit Finance-lead authority. |
| Tickets | Actual requester IDs; internal tickets exclude Sales; client-ticket notes are stripped from client results; Service controls transitions. No inferred email or organization-name identity. |
| HR | Shared directory/employment details, immutable policy/training/form publications, real responses, required-answer validation including false/zero, audiences and recurring assignment cycles. Training submission requires separate evidence-backed HR verification. |
| Response privacy | Anonymous answer rows do not store member/assignment IDs. Completion is separate; detailed reports are withheld below five responses. No claim of operator-proof anonymity or automatic certification. |
| Communication | Explicit private channel membership, real senders, tags, polls, vote switching/deduplication, closed-poll denial and recipient events. Admin does not receive private channels automatically. |
| Search | Compact popup; authenticated search uses permitted shared sources, excludes personnel profiles and raw survey answers, and does not substitute local examples. |
| Project Analysis | Real original records/project links, tasks and authorized document metadata. Explicit dependencies and enquiry associations; missing mappings remain unknown. Removed hardcoded AI4T/readiness fallback. |
| Tasks/layout | Today and Tomorrow/Planned, priority ordering, collapsed Completed; no third admin review lane. Calendar refresh while open; overdue retains deadlines. Smaller DEMO badge and operational lifecycle walkthrough removed from the dashboard. |

The final validation migration additionally fixes the existing record_fields SQL ambiguity, preserves task priority at creation, blocks direct completion of In review tasks, and rejects missing ticket states. These particular backend corrections remain gated by deployment approval.

## Evidence

- Web: final regression suite 123/123 passed and production build succeeded after the session fix. Focused database integration tests pass including final migration, original record editing, task priorities and review lock, budget ledger, privacy, recurring assignments and permission failures. TypeScript passed after session correction.
- Android: 54 unit tests, zero failures/errors; testDebugUnitTest and assembleDebug succeeded. This is not a physical-device round trip.
- Browser: authenticated EHW employee opened its actual shared project/task rather than lead examples. My Profile showed that employee and Not recorded for absent verified details, without lead letters.
- A single clearly labelled synthetic TEST claim, INR 1.23, was created for the persistence scenario: visible reference `EXP-f6fbf5f9`, purpose `TEST verification only — persistence 24 Oct`. It is test evidence, not an approved payable, and no allocation/payment was created.
- Browser reload after session correction retained the authenticated EHW identity. Reload preserved the same EXP-f6fbf5f9 claim; the second-account lead visibility check is recorded separately.
- Earlier screenshots: `portal-popup-search-verified.png`, `shared-business-lovable-deployment.png`. Current deployment confirmation prompt: `final-migration-awaiting-approval.png` in the SSM-new working folder.

## Explicit limits / pending inputs

- Final migration approval and subsequent Lovable Git import must be verified, not inferred from a local build.
- Device installation and web↔Android same-record verification have not been performed in this repair.
- HR letter generation/issue requires the actual approved templates, verified employee fields and designated signer policy. No signatures or employment facts were invented.
- The shared builder currently supports text, number, date, choice, rating and boolean. Attachments, conditional sections, advanced quiz scoring, configurable reminder delivery and attendance capture remain unverified/incomplete; basic training submission is not an issued certificate.
- Recurring assignments catch up idempotently on authorized reads; the owner-only scheduler function is prepared, but an unattended background job and email/push transport have not been configured.
- Existing inventory/asset registers and document binaries were not replaced or duplicated. Shared asset linkage/custody and ticket attachments require their existing canonical backend contract; they are not proved complete by this business adapter.
- Project Analysis derives explicit dependency links and authorized summaries. Missing company mappings and source inputs are not manufactured. Full enquiry authoring before project creation and inline editing of every analysis field are not established by this read adapter.
- Decision Log and the other R01–R15 refinements retain their existing implementations; this repair does not claim every browser-local module has been migrated to shared persistence.
- Private PDF/OCR and PCB tooling integrations remain excluded from this fixing batch.

## Recovery / rollout

The migrations add guarded business storage and replace RPC bodies without deleting existing organizations, members, operational records, tasks, documents, inventory or assets. Do not run DROP/CASCADE as a rollback after real data exists. Revert the client integration to the previous Git commit if necessary; preserve new business records and restore previous RPC definitions from Git inside a reviewed migration. The browser-local DEMO store is never imported into authenticated tables.

Stage only the source/tests/migrations for this repair. Never add the unrelated screenshots, launch scripts, sample files, supabase/.temp or local credentials. Use normal Git pushes without rewriting history.
