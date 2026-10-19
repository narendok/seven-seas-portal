# Antigravity execution handoff: portal completion and improvements

Date: 19 October 2026 (Asia/Kolkata). Status: implementation handed over at the user's request to conserve Codex credits. This document is an execution plan, not a completion claim.

## 1. Start here and preserve existing work

- Web checkout: C:/Users/Admin/AndroidStudioProjects/SSM-new/ssm-new-web; remote narendok/ssm-new-web, main. Latest pushed implementation: **8fabb5f** (one department project workspace). Previous board increment: **1bb29dc**, browser evidence recorded in **ddc4446**. Preserve published history; no force-push/rebase of shared commits.
- Android checkout: C:/Users/Admin/AndroidStudioProjects/SSM-new/SSM-new-app; a separate repository. Android planning/context edits are currently local and uncommitted. Inspect and preserve them. No Android code/APK change was made in this session.
- Read both AGENTS.md files before work. Web authority: [master plan](../SSM_ONE_WEB_PORTAL_MASTER_PLAN.md), sections 25–28. Android authority: [Android build plan](../../SSM-new-app/docs/planning/SSM_ONE_ANDROID_BUILD_PLAN.md), section 9. Historical Android-local web plan copies redirect to the current web authority.
- No production Publish, authentication provisioning, schema deployment, new users or stock-affecting server writes were performed. The user approved pushes to the existing web main branch for Lovable preview sync. This is not approval to create production identities, weaken security or go live.
- Use the existing Lovable project a3399684-daab-4b38-8666-187b96b451af and configured backend project rzskhndweihuczbdhoxk. Reconfirm identity from actual configuration without printing keys. Do not create a competing backend or assume another environment is approved.

## 2. Evidence baseline: what is done versus outstanding

| Item | Recorded evidence | Remaining qualification |
|---|---|---|
| Department scoping/navigation/drafts | Local fixes; all eleven role route/directory checks in the earlier audit; task/project/document/approval scopes corrected. | These are local demo checks, not server authorization acceptance. |
| Shared task board | Lovable browser checked Hardware, Finance and Service; Start worked; completed arrow initially collapsed, expanded and collapsed correctly. | Other eight roles still need independent browser checks. Read [task-board evidence](evidence/TASK_BOARD_STANDARD_2026-10-19.md). |
| Cross-tab approval | Local Hardware-to-Quality request/approval round trip passed, with blocked premature completion, updated task and notification; refresh retained saved state. | Independent authenticated clients/server transactions not verified. Read [audit checkpoint](evidence/DEPARTMENT_SCOPE_FIX_2026-10-19.md). |
| One department project workspace | 8fabb5f pushed. TypeScript, **16 tests** and full Vite client/SSR/Nitro build passed. | **Final browser verification of this newest increment is pending.** A Testing preview tab was opened but only the Lovable shell loaded before handoff. Do not claim project switching was browser-verified. |
| Live backend | Earlier Lovable Users showed no enabled sign-in method; inspected core organization/membership/operational/document/audit tables had zero rows. | Recheck before relying on this dated observation. A populated demo is not shared operational data. |
| Documentation | Web master plan sections 28.5/28.6; Android plan sections 9.4/9.5; document inventory plan maintained. | Full controlled template inventory and mobile contract acceptance remain planned. |

## 3. Required product behavior

1. Every lead gets one consistent department workspace. One project dropdown offers All projects plus authorized department-linked projects. Selecting a project updates identity/customer/stage/date, progress, task board, document/reference list, approvals, records and recorded task owners together.
2. My Tasks remains a separate assigned-task entry using the same board component. Today / In Progress is left, Review middle, To Do right; Completed is below, collapsed by default, with an accessible arrow and count. Responsive stacking retains that order.
3. Department scope applies to lists, details, counts, search, filters, badges, notifications and mutations. Cross-department reviews appear only when explicitly assigned. Admin and client permissions are separate and server-enforced in the final product.
4. Project association is explicit UUID/code/source linkage. A title, filename, sample name or substring is not an authorization grant. Unlinked records/documents are visibly unlinked in All projects, not silently attributed to AI4T or another project.
5. Production operation requires real persisted records and evidence-backed lifecycle prerequisites, not simulated progression or fabricated sign-offs. Missing values remain Not recorded/TBD.

## 4. Priority 0: verify the latest workspace before further feature work

Owner: Antigravity web implementer/QA. Dependency: current source and connected preview only; no production identities needed for prototype checks.

- Inspect src/components/DepartmentProjectWorkspace.tsx, DepartmentLeadCoordinationCenter.tsx, src/lib/project-workspace.ts and the lead queue/summary/project branches in src/routes/index.tsx.
- Load the latest Lovable preview. If it reports out of date, use Update preview and wait for its completed state; do not click Publish.
- Testing: verify department home and Department Project Workspace enter the same consolidated page. Select All projects and its available linked project. Check every section, empty state and department-only roster.
- Hardware: choose two projects with different records. Verify project metadata, task titles/counts, docs, approval counts and assigned owners all change; no prior project's content survives. Return to All projects and verify correct department totals.
- Verify there is one visible project selector in the consolidated workspace. The embedded board hides its duplicate selector and project/team tabs. Assignee and sort controls are independent task controls.
- Test project linked by UUID and code, document linked directly to project and indirectly to a source record, unlinked document, and unavailable/stale selection. Use existing unit fixtures where possible; never widen access to make a test pass.
- Open a record/document, return and confirm the project selection is retained within navigation. Refresh currently resets the in-memory project selection; determine whether persistence is desired before changing it (see improvements below).
- Test Add department record and Assign New Task with the selected project. Verify the stored source link, due date and assignee after refresh. Guard against forms accepting an unavailable project or silently reverting to a sample default.
- Regression check specialist tools: the new lead home branch supersedes the old department-specific landing sections. Inventory, procurement, Sales enquiries and Quality evidence tools must remain discoverable through authorized navigation where needed. Identify any unreachable route; restore a clearly labeled tool link without embedding unrelated global data in the project view.
- Confirm the header/standalone Documents and Approvals destinations either retain the selected project or clearly state they show the whole department. Avoid a selected-project heading above an unfiltered global list.

Acceptance: saved screenshot of All projects and two distinct selected projects, browser steps/results, denial/empty-state evidence, no console/runtime error; fix defects before moving on. Record this under docs/evidence and update master plan section 28.6.

## 5. Priority 1: finish consistent department UX and regression coverage

Owner: Antigravity web implementer; dependency: Priority 0.

- Run the same short checklist for SAL, EHW, ESW, MECH, PUR, QA, EMF, TST, FIN, SIT and HR/OPS: workspace, selector, task board, create/update, project detail, docs/references, approvals, team and notifications. Record actual role-specific results rather than one generic passed checkbox.
- Check no duplicate task between lanes. Approved/Released takes precedence, then In review, then explicit progress or open due-today work, then backlog. Archived tasks stay out. Validate due-date behavior at India midnight.
- Exercise Start, To Do, Review and guarded Done; assignee/project/search/status/priority/due sorting; Kanban and table. Reassignment must retain project and due date. Pending designated approvals must block completion through every edit path.
- Clarify overdue tasks in the combined Today / In Progress lane: choose and document whether overdue open tasks belong there or in backlog; show an overdue badge rather than silently hiding urgency. Do not alter canonical status enums without the backend contract.
- Standardize non-engineering wording (for example Assignee rather than Assigned Engineer in Finance/HR/Service). Ensure task titles open details in both board and table modes; table title navigation is a candidate improvement, not yet verified implemented.
- Keyboard-accessible dropdowns, visible labels/focus, completed aria-expanded state, narrow/mobile layout, long project names and empty roster/document lists must work. Do not add drag-and-drop merely for appearance; keep explicit accessible actions and mutation guards.
- Reference audit: check each link's label, destination, content, permission and project scope. Hide unavailable actions or show a clear unavailable reason; no dead controls or placeholder success messages.

Acceptance: all eleven role rows plus Admin/Client negative checks, responsive screenshots and evidence-backed results. Existing 16 focused tests and build passing are prerequisites, not substitutes for these browser journeys.

## 6. Priority 2: production identity, schema and complete persistence

Owner: backend/security implementer and project owner. Dependencies: real organization name, initial administrator work email, approved provisioning approach/environment. These were requested and remain unprovided. Never ask for passwords in chat or invent production test users.

1. Reinspect deployed schema, migration state, authentication settings and private storage policies. Generated types and authenticated file functions use documents/controlled_document_files; the legacy 20261003_scms_core_schema.sql instead defines controlled_documents and permissive public policies. **Do not deploy that legacy migration as a remediation.** Produce a verified object/RPC/RLS map first.
2. Provision trusted identity/membership with owner-authorized setup. Operational roles derive from protected server membership/claims; local URL/persona/demo credential matching is never authorization. Demo credential UI must remain explicitly isolated.
3. Replace the complete operational data path with shared authenticated queries and mutations; do not combine browser-only writes with a partially cloud-backed workflow. Specify record/status/source/project fields, permission checks, transaction inputs/results, error semantics, numbering and audit before wiring modules.
4. Critical decisions use atomic server transactions with current-state rechecks, idempotency, concurrency control and attributable audit. Test simultaneous decisions and stale clients. Browser locks/localStorage events are prototype safeguards only.
5. Test anonymous access, all department scopes, explicit cross-department assignments, Admin scopes, client field stripping, private uploads/downloads and signed-link expiry. An empty response is not automatically proof of permission correctness.
6. Verify failure/offline/timeout behavior: never present success until the server commits. Keep drafts distinct from released records and show sync/error state. Preserve/partition account-specific cache and clear sensitive state on sign-out.

Acceptance: independent authenticated sessions see the same persisted result, mutations survive a fresh client, denied actions leave no partial writes, audit/numbering comes from the server, documented storage/RLS denial results. No go-live until these gates pass.

## 7. Priority 3: actual lifecycle and document completion

Owner: department owners plus web/backend implementer. Dependencies: verified production contracts and actual project information.

- Create a lifecycle matrix: enquiry → multi-department feasibility → commercial/requirements baseline → hardware/firmware/mechanical design → sourcing/BOM → pilot/build → verification/quality → controlled release → dispatch → installation/service. For each transition list owner, source records, required evidence/revisions, designated signers, rejection/rework path and downstream lock.
- Persist actual BOM revision, material availability/reservations, build/lot/serial traceability, inspection/test results, NCR/CAPA where relevant, dispatch evidence and service records. Do not invent readings, certificates, stock or customer commitments to make the flow look complete.
- Implement gate prerequisites and rejection/rework on the server; verify a downstream operation cannot proceed when evidence is absent, obsolete or rejected. Link requester/reviewer notifications and audit to source IDs.
- Finish [document standardization inventory](DOCUMENT_STANDARDIZATION_PLAN.md): document owner, project source mapping, format-specific DOCX/XLSX/PDF template, revision, review cycle, approval, release, retention and recipient grant. Twelve draft schemas are not the complete template engine.
- Validate generated documents visually and against source fields. Missing data must remain explicit. Sample signatures/certificates/gallery downloads remain marked illustrative and cannot become actual releases.
- Client deliverables require explicit release and recipient authorization. Internal records/documents must never become client-visible through a matching type/title/filename or an index route.

Acceptance: one approved project scenario traverses the full persisted lifecycle; incomplete and rejected scenarios stay blocked; source-backed documents and audit show each handoff. Repeat critical paths with approved test fixtures, not production stock movements.

## 8. Priority 4: Android contract and operational parity

Owner: Android implementer. Dependency: verified current backend handoff. Follow Android build plan section 9 and AGENTS.md; preserve Stage 5A–5G order and the common SyncCoordinator.

- Reconcile existing repositories/models/safe views/RPCs with actual verified web/backend contracts; do not create Android-only business tables or copy browser workStatus as an assumed server column.
- Implement trusted membership, department/project-scoped My Day/tasks, the common project selector, approvals/rework/notifications, controlled document references and private signed downloads. Verify web-to-mobile and mobile-to-web round trips.
- Preserve account-partitioned cache, draft identity, idempotency/conflict handling and clear offline/sync status. Stock, approvals and releases remain ONLINE_REQUIRED until an explicit verified contract says otherwise.
- Verify logout/session expiry and no inherited Admin/other-account cache. Keep unavailable reads/writes fail closed.
- After source changes, compile, run testDebugUnitTest and assembleDebug with Android Studio JDK, then test on emulator/device. Save results under Android docs/evidence. Do not reuse historical test counts as a new result.

Acceptance: authenticated cross-client project/task/approval/document parity plus denied-role tests and device evidence. Updating Android plans or syncing web does not close this gate.

## 9. Optional improvements after correctness

- Persist last selected project per account/organization/department with validation on load; do not use a shared global selection across users. Current selection survives internal navigation but not a full refresh.
- Add section anchors (Overview, Tasks, Documents, Reviews, Records, Owners) and a compact sticky selector if the consolidated page becomes long. Keep one source of project state.
- Add server pagination/query caching for large record/document lists; avoid rendering every record or loading unrelated binary data. Partition cache keys by trusted organization/department/project/session.
- Measure and split large route bundles. Current build warns about bundle size and deprecated validator APIs; address these separately after functional acceptance, preserving behavior.
- Move duplicated area/department mappings and project-scoping rules into shared tested modules. Reuse the same predicates for lists/counts/search/detail guards; do not scatter title-based filtering.
- Add meaningful integration tests for cross-role denial, stale decisions, project switching and private document release. Avoid a large suite that merely mirrors JSX or trivial label changes.

## 10. Execution and reporting discipline

Work one verified increment at a time: inspect → implement → typecheck/tests/build → browser/device acceptance → evidence → plan update → authorized sync. Fix failures before broadening scope. Do not redo completed prototype work or refactor unrelated modules to spend time.

Web checks: node node_modules/typescript/bin/tsc --noEmit --incremental; node --test tests/department-scope.test.cjs tests/document-draft.test.cjs tests/portal-store.test.cjs; node node_modules/vite/bin/vite.js build. Dependencies are linked to a sibling checkout and may require the environment's approved execution permissions. Remove generated tsconfig.tsbuildinfo from untracked output before committing; do not reset user changes.

Use a delivery ledger with columns: item/owner/dependency/source contract/change/check/evidence/status/remaining risk. Status must distinguish Planned, Implemented locally, Built/tested, Browser verified, Synced preview and Production accepted. Update both plans when scope/contracts change. Preserve dated evidence; never relabel an old prototype check as live operational acceptance.

The immediate next action is **Priority 0 browser verification of 8fabb5f**, not another feature expansion. Codex stopped implementation for this handoff at the user's explicit request; Antigravity should continue from this checkpoint.
