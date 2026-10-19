# Department workspace UI refinement — consolidated discussion

Date: 19 October 2026. Status: REQUIREMENTS CONSOLIDATED & READY. Document-standardization (Batch 2) is complete and committed in commit `8f014a8`. This plan governs the desktop workspace UI refinements across all 12 departments.

## Scope and evidence

The user reviewed the Purchase lead workspace in Lovable, then explicitly requested that the same shared UI corrections apply across all 12 active departments: SAL, EHW, FW, SW, MECH, PUR, QA, EMF, MMF, FIN, SIT and HR/OPS. Preserve department-specific records, processes, access and naming. Do not turn this into a Purchase-only redesign.

Current shared implementation: src/components/DepartmentProjectWorkspace.tsx, src/components/DepartmentLeadCoordinationCenter.tsx, src/components/RoleAwareSidebar.tsx and the workspace/My Tasks callers in src/routes/index.tsx. The project workspace embeds the task coordination component with its own header; My Tasks uses that component without hiding its Projects/Teams tabs. The observed Purchase page therefore repeats large workspace/coordination headings and stacks projects, tasks, documents, approvals, records and teams into a long surface. Verify current HEAD before implementation because Antigravity may edit shared files.

## User-confirmed requirements

### 1. Overview is the first landing page

- Keep an overview/dashboard as the department's first page. The user accepts its purpose and wants it compact, not removed.
- Use one small department/workspace heading and a short context line; avoid repeating a second large department/coordination title.
- Keep a compact project selector/rollup with an icon and short meaningful label. The current project context must remain visible and understandable.
- Reduce the top gap, header height, card padding and repeated explanatory text so useful content starts near the top and requires less scrolling.
- Use compact summary metrics and short previews linking to the relevant sections. Avoid rendering every complete projects/tasks/team/document list on Overview.
- Preserve readable labels, accessible controls and sensible mobile stacking; compact does not mean tiny text or icon-only navigation with no accessible name.

### 2. Three task presentation modes

- Keep Kanban and Table; add the previously discussed compact Checklist mode.
- All three modes present the same authorized task collection, filters, project scope, assignee, ordering and status. Switching presentation must not duplicate tasks, create another task store or reset scope.
- A task title opens its existing detail view consistently in each mode. Opening tasks from Favourites and normal navigation must resolve to the same destination and state.
- Checklist should use short rows with the task title and compact assignee/due-date/priority/status information rather than repeating large cards and long notes. Keep details available on demand.
- Preserve the existing workflow grouping: Today / In Progress, Review, To Do; Completed is collapsed initially with a count and expand control. A task belongs to one group only.
- A checkbox/Done action must respect existing review and approval guards; selecting a row is not a bypass for controlled completion. The precise checkbox presentation can be finalized during the ongoing review.
- This is a view change, not a new approval engine or a claim of shared operational persistence.

### 3. Separate Tasks, Projects and Team destinations

- My Tasks / Team Tasks should focus on tasks, with Checklist / Kanban / Table controls and relevant filters.
- Department Projects belongs in its own Projects/Project Workspace destination; Department Teams & Capacity belongs in its own Team destination.
- Keep a project filter in Tasks where useful, but do not embed a full Department Projects list or Department Teams tab there.
- Overview may show small project/team counts or previews with links; it should not reproduce all sections at full size.
- Reuse the existing shared project scope so navigation retains the selected project where appropriate. Returning to Overview must have a predictable route.

### 4. Theme consistency

- The project rollup/select control appeared white against the active dark theme. Check the actual rendered control and correct its background, foreground, options, borders and focus treatment using the existing theme system.
- Verify both light and dark themes and the open dropdown state. Do not force dark colors globally to fix one control.

### 5. Favourites and sidebar clutter

- The user observed clutter and raised a Favourites/task-navigation issue while reviewing sidebar groups and arrows.
- Audit favourite destinations, active state, expanded/collapsed groups and duplicate labels; favourite task links must behave like their canonical links.
- Do not delete saved favourites or infer that the user wants the Favourites feature removed. The exact remaining failure/desired grouping is still to be clarified in the ongoing review.

## Boundaries

No UI implementation, backend migration, authentication/account changes, production publishing or Git push is authorized by this planning capture alone. Preserve saved records, local/IndexedDB attachments, auth membership handling, document snapshots, historical IDs, approval guards and project-pinned configuration. Keep the current backend. This plan does not supersede the document-standardization plan or Android roadmap.

## Acceptance checklist for the later implementation

- Overview is the first department landing view; compact heading, project context and useful metrics appear without excessive blank space or duplicate large headers.
- My Tasks contains three synchronized presentation modes and no embedded full Projects/Team tabs. Projects and Team remain independently reachable.
- Task detail, filters, sort, project scope, counts and status agree across modes; review/pending approval blocks remain enforced.
- Completed starts collapsed; keyboard focus, labels, overflow and empty states work.
- Favourites and standard links reach the same intended section and retain appropriate scope; saved favourites survive refresh.
- Light/dark and open selector visuals match the theme. Check narrow/mobile and desktop layouts.
- Reproduce the shared behavior for all 12 departments, using Purchase as the initial visual example rather than the only tested role. Include lead/employee/read-only contexts as applicable.
- Run existing behavior tests, TypeScript and production build after the actual implementation; capture before/after screenshots. Do not claim this discussion capture is an implemented UI fix.

## Open discussion log

Continue appending user feedback here before execution. Pending finer detail: exact Checklist row/action layout; which favourite click or expansion causes the observed issue; target overview density and final labels. These details do not change the confirmed shared-department scope above.
## Additional confirmed UI requirements — record management and workspace controls

Captured from the continued Purchase review; apply the same structural pattern to all departments while retaining their actual supported record types and permissions. Still planning only.

### Compact workspace header alignment

Place the small department/workspace heading on the left and a compact project selector/action on the right where width permits. Retain clear current-project context and an accessible label. Adapt to narrow widths without overlap; do not depend on a particular browser zoom level to make the layout usable.

### Department Records sidebar group and full-page registers

- Creating a department record is only one part of the workflow. Users must also find, inspect, filter and maintain every supported record type afterward.
- Provide a discoverable Records group in the role-aware sidebar, with department-relevant record-type entries. Use the approved record/form registry and existing routes as the source; do not invent record types or expose unsupported mutations.
- Each entry opens a dedicated full-page register in a column/table format, following the existing inventory and PO management pattern. This must not be limited to a dashboard card, a creation modal or a long embedded summary list.
- Dashboard icons and short record summaries remain useful shortcuts to the same canonical registers, not separate copies of records or alternate state stores.
- Registers should offer type-appropriate columns, record/reference identity, project, status, owner and date where supported, plus relevant search/filter/sort and create/open/edit actions. Missing values remain explicit. Column layouts differ by record type when the actual content differs; do not force every report into a generic metadata table.
- Clicking a row opens the exact selected record/detail; back navigation retains sensible register/project/filter context. Preserve existing workflow guards and read-only/approval restrictions. Report unsupported actions instead of showing placeholder success.
- Existing PO, inventory and other specialized registers remain the canonical destinations for those types. Reuse or extend them rather than creating duplicate sidebar entries and competing management pages.
- Relevant operational reports and their underlying records need the same discoverable maintenance pattern where supported; keep a report view distinct from a controlled document export and from a stock/financial posting.
- Keep the sidebar compact through clear grouping and controlled expansion. More record types must not produce an uncontrolled flat list or make Favourites navigation inconsistent.
- Inventory supported record types and current creation/list/detail routes for each department before implementation. Identify orphaned types that can be created but cannot currently be reopened or managed; include their disposition in the UI handoff.

### Additional acceptance checks

For every inventoried supported type, create or select a synthetic record, reach it from the Records sidebar entry, inspect the correct full-page column view, open the exact detail, return with scope retained and verify refresh/persistence according to its declared local/shared mode. Check authorized edit versus read-only and department/project isolation. No type is considered covered merely because its create form opens.

The user observed a larger/more usable viewport on localhost than inside the Lovable editor. Compare equivalent viewport dimensions when reviewing screenshots; editor frame width or zoom must not be confused with a product layout fix. Validate both environments, desktop/narrow widths and theme states independently.

## Scope clarification — desktop web first, Purchase as pilot

The user explicitly limited this current discussion/implementation batch to desktop web. Plan mobile UI separately afterward; earlier narrow/mobile checks are future follow-up criteria, not an instruction to redesign mobile in this batch. Existing mobile behavior must not regress incidentally.

Use Purchase as the first concrete review and pilot: Purchase-specific record types populate its own left sidebar/register destinations. Shared elements (overview density, headers, view controls, navigation patterns and task presentation) are corrected once in shared components and then verified across all departments. Other departments receive their own applicable record types, not Purchase's menus copied globally.

The next ongoing review concerns clicking projects from the overview/dashboard and what context, tasks and detail page opens. Capture that behavior and the user's requested destination after observing it; no final project-navigation redesign has been agreed yet. At this checkpoint localhost was showing the Purchase Orders full-page register, which remains the user's reference for column-based management rather than evidence of the project-click behavior.

## Purchase module navigation and return-path issues — continued review

The user opened PO from department navigation and found an additional broad six-module switcher inside the page (Recordage & Stores, Smart BOM, Adaptive Ingestion, Quotations, POs and Suppliers). This duplicates the sidebar, spreads/wraps the controls and makes it unclear whether the user is in PO management or the entire Purchase workspace.

- A PO destination should primarily show the PO register, its compact metrics, relevant PO filters/actions and selected PO detail. Do not nest every other Purchase module beneath a PO page heading.
- Give Stores/Recordage, Smart BOM, Ingestion, Quotations, POs and Suppliers their own direct main-sidebar destinations using the existing role-aware hierarchy. Do not create a third competing navigation tree. The exact sidebar side/placement follows the overall navigation decision; current app navigation is on the left.
- Replace the oversized/wrapping six-module switcher inside full-page registers with the agreed compact contextual navigation, or remove it where sidebar destinations already cover the same routes. Preserve useful cross-links as explicit contextual actions (for example PO to related receipt), not an unexplained jump to an entire unrelated module.
- The user reported an unclear/non-working return path. A Back to Department Overview button is present in the observed page and invokes the supplied onBack handler; its behavior has not yet been independently reproduced. Do not incorrectly report that no back control exists.
- Inspect browser Back as well as the in-page Back/Overview action and sidebar route changes. Current Purchase subviews are selected with internal view state; the observed address stayed on the same department URL while switching modules. Confirm how this affects history before choosing a fix.
- Make destination, active sidebar selection, breadcrumbs and return target agree. Return from a PO detail/register to its expected parent without losing the relevant project/filter context. Repeated navigation should not trap the user or leave a supplier/stock page under a PO-labelled context.
- Reproduce navigation into each of the six modules from canonical sidebar and Favourites, open detail where supported, then return through in-page navigation and browser Back. Document which issue is actually reproduced versus usability feedback.

Observed latest screen during this discussion: localhost had changed from the PO register to Approved Supplier List & Vendor Governance through the six-module switcher, while the department URL remained unchanged. No data mutation or navigation fix was performed during this requirements capture.

## Confirmed decision — remove duplicate Purchase module navigation

The user explicitly confirmed that all six Purchase modules already exist in the left sidebar, including Smart BOM and Adaptive Ingestion & Gate (Fuzzy Match) under Department Workspace. The earlier uncertainty about a missing ingestion sidebar entry is resolved: do not create another duplicate entry.

- Remove the repeated six-module top switcher from the full-page Purchase surfaces; the left sidebar is the primary module navigation. This supersedes the earlier option to merely compact that same duplicate switcher.
- Each destination must show its own content. The user reported tentative BOM, adaptive PO/invoice ingestion and receipt/governance content appearing with Quotations; verify the actual rendered composition and restrict it to the intended route. Quotation management should not render independent BOM, ingestion or receiving workspaces. Preserve relevant record-level links without embedding other complete modules.
- The redundant Back to Department Overview/header strip was also identified as unnecessary in this repeated navigation block. Remove or simplify that duplicated strip as part of the compact header decision, while retaining a clear canonical Overview destination and predictable detail/back/history behavior. Do not remove all return navigation.
- Keep the active sidebar destination consistent when switching Suppliers, POs, Quotations, Smart BOM, Recordage or Ingestion. Do not solve duplication by hiding useful canonical sidebar destinations.
- Smart BOM opening was observed by the user; functional import correctness is not verified. Add a later synthetic demo-file upload check for supported BOM formats, column mapping, validation, preview, persistence and safe failure. Do not execute imports or mutate stock during this UI discussion. Uploading a BOM must not silently release a baseline, post stock or bypass review.

Status remains planning capture only. No source/UI changes or uploads were performed for this feedback.

## Confirmed decision — move demo lifecycle to Help / Training

The user does not want the demo End-to-End Lifecycle / Engineering Gate walkthrough, animated stage progression or autoplay controls in the everyday operational department workspace or its primary project navigation. These demonstrations are already understood and add clutter to routine work.

- Remove demo lifecycle shortcuts, embedded demo engineering-gate panels and autoplay/player surfaces from the normal department workspace/dashboard and primary operational navigation wherever they occur. Audit existing favourites/deep links so removal does not leave broken entries.
- Preserve the walkthrough and explanatory flow for documentation, Help, Training or Knowledge Base. Provide a clearly labelled training-only destination if the feature remains in the portal. Do not destroy its reference material, examples or historical evidence.
- Preserve actual project lifecycle stages, required evidence, feasibility/requirements freezes, recorded approvals, audit history and controlled transitions. Moving the simulation is not permission to remove production checks or replace actual stage state.
- Keep demo/simulated progression separate from actual project progress; training autoplay must not write operational status, approvals or records. Do not automatically launch the player during ordinary workspace navigation.
- Apply the shared operational-versus-training separation across departments, with Purchase as the reviewed example. Capture the exact Help/Training menu wording during the remaining UI review.

Still planning only: no lifecycle component, record or approval gate has been removed during this discussion.

## Hardware review — real project lifecycle and unified technical deliverables

The user also reviewed Hardware and confirmed the same oversized workspace/project-card/header problems. Keep the task board and the previously requested three task views. Shared layout corrections apply here too, not only to Purchase.

### Real project lifecycle / deliverables workspace

- Moving the training demo out of operational navigation does not remove the need for a real project lifecycle page. Provide a clearly named, project-scoped lifecycle/deliverables destination in the operational project area.
- The selected project's schematic, BOM, Gerber/native release package, requirements/specifications, design-risk/DFMEA records and other applicable technical deliverables should be discoverable together, grouped by lifecycle stage/type, with their actual status, revision, owner, source/native attachments and related review evidence.
- Support management and navigation from this unified project index; do not scatter every technical subtype into disconnected pages with no project-level overview. Reuse canonical department registers and record details, and preserve native file/revision relationships instead of duplicating files or records.
- Keep department record-type sidebar entries for type-based management while this project workspace supplies the cross-type, project-oriented view. Both must resolve the same canonical records and respect department/client access. A unified index is not permission to show all departments' restricted files.
- The intended Project Analysis Board should show the selected project's real available analysis/deliverable content and a meaningful empty/unavailable state. Do not use fixed demo progress or a blank/generic popup as evidence that a project is complete.

### Reported interaction issues, pending reproduction

- The user reported a DFMA/DFMEA-labelled item that did not open as expected and/or opened in an unsuitable popup. Verify the exact label, record subtype and click path before changing it; do not silently rename DFMA to DFMEA because these can represent different concepts.
- Technical Specifications also appeared through an unsuitable or unclear popup/content path. Confirm which project/record opens, whether it matches the clicked label and whether the action should lead to the full-page register/detail rather than a generic modal.
- Main technical-management destinations should be full-page views consistent with the earlier register decision. Retain popups only for focused ancillary actions or previews where appropriate, not as a replacement for the management workspace.
- Test the exact clicked project, record ID, type, revision, file and return target; a visible button or popup alone is not successful record navigation. Verify missing records, unsupported native previews and unavailable evidence explicitly.

These are recorded requirements and user-reported observations, not independently reproduced functional findings. The voice session ended before fresh screen inspection completed. No technical document, lifecycle record or popup implementation was changed during this capture.
