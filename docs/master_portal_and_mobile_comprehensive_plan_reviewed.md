# Portal and mobile roadmap — reviewed Antigravity handoff

Date: 19 October 2026. Status: future execution plan. Original reference: C:/Users/Test/Downloads/Feem/master_portal_and_mobile_comprehensive_plan.md.

## Accepted baseline and scope

The owner explicitly confirmed Batches 1–2 completed and verified. Commit `8f014a8` (*feat(docs): Batch 2 - 38-family document catalogue, 4-tier viewer, native vault & stage gate freezes*) is committed on `main` in the local web repository, advancing from `7d8243c`. The verified baseline includes 53/53 passing automated tests across all 8 test suites, clean TypeScript check (`tsc --noEmit`), clean production build (`vite build`), and dev server live at `http://localhost:8080/`.

The working tree is clean and reconciled. This plan sets out the execution sequence for the remaining batches under user authorization.

This plan covers backend operational contracts, private attachments, Android parity and optional customer expansion. Desktop UI review remains a separate queue in [department_workspace_ui_refinement_plan.md](department_workspace_ui_refinement_plan.md). Do not merge that unfinished UI discussion into these backend/mobile batches or restore demo autoplay into operational pages. Mobile UI design is a separate follow-up; Android contract parity does not prescribe identical web layout.

## Authorities and environment

- Web: C:/Users/Test/Documents/GitHub/SSM-new-web. Read AGENTS.md, docs/SSM_ONE_MASTER_PLAN.md, SSM_ONE_WEB_PORTAL_MASTER_PLAN.md and docs/DOCUMENT_STANDARDIZATION_PLAN.md.
- Android: C:/Users/Test/Documents/GitHub/SSM-new-app. Read its AGENTS.md, docs/SSM_ONE_PROJECT_CONTEXT.md, docs/planning/SSM_ONE_ANDROID_BUILD_PLAN.md and newest docs/backend-handoff artifacts. Preserve its approved Stage 5A–5G sequence and common SyncCoordinator.
- Keep the current Lovable project and its backend rzskhndweihuczbdhoxk. The separate staging project is unused by owner preference; do not switch either platform to it automatically.
- Real TEST sign-in remains distinct from production authorization and from local DEMO data. Finish/record the localhost and Lovable identity/membership acceptance where it is still pending; do not claim authenticated operational gates based only on a TEST login.
- Normal code work can proceed. Follow applicable repository approval gates for destructive/irreversible migrations, privileged access changes, production identities and production release. Prepare reviewable migrations/contracts before any approval request. Never weaken RLS to make a demo pass.

## Execution order and dependencies

Use explicit batch names because the Android plan has its own stage numbering. Backend/storage inspection can proceed together. Complete the required authoritative backend and attachment contracts before final Android parity acceptance. Do not defer a required file-access contract until after declaring mobile complete.

### Backend operational gates (original Batch 3)

1. Inspect actual deployed schema, migration ledger, auth/membership policies, project stage definitions and existing document/file functions. Produce an object/RPC/signature/authorization map. Tables such as department_chronicles, project_stages, controlled_documents or stage_approvals in the original document are proposed names until verified; existing generated types use documents and controlled_document_files. Do not deploy a competing schema or blindly replay legacy migrations.
2. Keep TEST membership helpers dedicated to TEST. Add/reuse an appropriately named operational server contract backed by trusted server membership and scoped capabilities; a generic admin/department_lead role is not automatic signing authority.
3. Determine required deliverables, applicable departments, accountable owner, signers and N/A rationale from the project's pinned lifecycle/responsibility version. Remove fixed six-HOD approval counts and the assumption that EHW-PRS plus QUO alone closes Stage 3. Validate all applicable requirement sheets and explicit approved evidence revisions.
4. Derive the actor from the authenticated session inside the database transaction. Do not trust a caller-supplied actor ID. Verify project/organization scope, active membership, designated signer capability, valid current stage and permitted next transition.
5. Use one atomic transaction for approval/gate state, source/evidence snapshot, immutable revision manifest and attributable audit. Include row/version concurrency controls, retry idempotency and stale/revoked-session handling. Hash canonical versioned content and actual attachment digests; a hash alone does not prove approval or create a qualified digital signature.
6. Keep operational jump/advance paths behind the same server checks. A UI button, local boolean or demo walkthrough cannot unlock an operational stage. Failed/offline operations remain failed and unavailable.
7. Discover the installed migration tooling; create migrations with that tooling's supported workflow, not an invented fixed timestamp. Reconcile any existing Drizzle and Supabase migration ownership before adding a second history.

Acceptance: approved, missing, rejected, N/A, unrelated-project, wrong-signer, employee/client denial, revoked membership, concurrent and duplicate-retry scenarios; independent sessions observe the same committed result and audit. Report localhost, Lovable preview and deployed backend evidence separately.

### Private native-file contract (original Batch 5; dependency of mobile file parity)

Reuse the existing authenticated controlled-document upload/list/download functions, private bucket and file metadata. Avoid replacing the attachment engine with a second vault. The current inspected download function uses a 60-second signed URL; select expiry from the verified policy rather than silently changing it to 15 minutes.

Bind files to organization, department, project, document and exact revision; validate access before issuing any link. Verify actual uploaded/downloaded bytes against SHA-256 and byte length. A client-submitted digest or a green badge alone is not verification. Record incomplete uploads and cleanup/retry behavior. Do not overclaim application-level encryption from a normal signed upload.

Preserve local/IndexedDB attachments and snapshots with explicit migration status and a verified backup/restore path. No automatic migration to another account/project or public bucket. Test expired/denied links, tampering, duplicate uploads, failed completion, released/superseded revisions and ownership changes.

### Android parity (original Batch 4)

Implement against the verified backend handoff rather than guessed table/RPC names or assumed Kotlin file paths. Extend existing repositories/models/navigation; do not create an independent mobile backend or a parallel sync engine. Backend-owned extensible department configuration must not become a new permanently hard-coded organizational limit.

Consume canonical FW/SW and EMF/MMF, preserve unresolved ESW and retired TST identity/ownership without blanket reassignment. Use shared document ID/revision/classification/source/attachment/signing semantics. Implement readable mobile-specific layout separately from desktop UI plans. No fabricated accreditation badges or electronic-signature compliance claims.

Keep account-partitioned cache, logout/session-expiry isolation and offline draft indicators. Approvals, releases and stock-affecting writes remain ONLINE_REQUIRED until verified contracts explicitly say otherwise. Verify authenticated web/mobile round trips and denied-role cases, then run testDebugUnitTest and assembleDebug using Android Studio's bundled JDK and test on emulator/device. Build success alone is not parity acceptance.

### Optional customer and lab-evidence expansion (original Batch 6)

This is optional and must not delay the current project flow. Add real OEM/project/customer records only from owner-approved source data. The original example project codes, annual volumes and product associations are not verified business facts and must not be seeded as operational data. Synthetic examples stay clearly marked DEMO and separate from real customers.

Only attach authentic, owner-supplied external certificates with verified issuer, scope, product/configuration, dates, evidence file and access classification. Do not fabricate realistic TAC/NABL/WPC/EMC documents, certificate numbers, signatures or passed results. Determine applicable standards and editions from approved requirements and actual issuing-body evidence; the original list is not a compliance determination.

## Verification and completion reporting

Discover current *.test.cjs files and record the actual test count; do not use >=53 or an old build duration as proof of completion. Run the relevant tests, TypeScript and full production build after meaningful web changes. Use the Android repository's required Gradle/JDK workflow after Android changes. Record exact source, changed files, environment, results, screenshots/output artifacts and unresolved dependencies.

No batch closes from documentation, generated files, HTTP 200, a demo URL role, a checksum badge or local stage simulation alone. Preserve the accepted Batches 1–2 baseline while distinguishing owner acceptance from newly reproduced operational evidence. Update the sync ledger and platform handoffs as work completes.

## Antigravity handoff summary

Continue from the owner-confirmed completed and committed Batches 1–2 (`8f014a8`). Implement authoritative backend gate contracts and the private attachment dependency, then Android contract parity; treat customer/lab expansion as optional source-backed scope. Follow this reviewed plan and the existing platform authorities. Keep the desktop UI discussion synchronized in its dedicated track. Report small validated increments without resetting history, switching backend accounts or inventing customer/certification evidence.