# Local master-plan reconciliation — 19 October 2026

Source baseline: web main 1f74dc1 plus the uncommitted working-tree changes in this checkout.
Checkout: C:/Users/Test/Documents/GitHub/SSM-new-web. No push or deployment performed.

## Implemented locally

- Active role selector and demo credential entry exclude retired TST. Migration schema 4 marks the legacy department inactive, preserves records/owners/IDs/decisions and does not restore an obsolete schema-3 backup. Admin can review legacy records separately; ordinary record/task changes are blocked there.
- Dashboard metrics derive project, task, department, pending-approval and missing/interim-owner counts from saved records. Historical TST is excluded from the active checklist. Shared persistence is explicitly unverified; no fixed 11/11 or 100% audit assertion.
- Active manufacturing task, stage, template and lifecycle presentation uses outsourced-PCBA acceptance, box-build, controlled programming and functional checks. Historical document IDs and native technical references remain intact. Existing saved custom content is not silently rewritten; owner review is still required.
- Local responsibility configuration edits retain snapshots. Existing projects pin the previous configuration, new projects pin the latest configuration, and lifecycle deliverables/handoff routing resolve the pinned snapshot. All versions are explicitly Draft; this does not establish backend authorization, signed acceptance, a governed department registry or production change approval.
- Twelve document formats expose template version, missing fields and copied source/project snapshots. Ambiguous or substring-only template matches fail closed. Saved local drafts retain populated snapshots; JSON export supports provenance inspection. New PDI drafts use EMF while historical TST documents preserve their identity. Full catalogue coverage and DOCX/XLSX production formats remain outstanding.
- Lifecycle player is lazy loaded. Measured main route client chunk changed from 1,223.92 kB to approximately 1,164.79 kB before the final documentation increment; the >500 kB warning remains. Further module extraction is still needed.
- Deprecated controlled-document inputValidator calls use validator; authentication middleware is retained.

## Reproduced validation

- 39 automated tests passed, including chronicles, department scope, migration preservation, document drafting, portal transactions and project version history.
- TypeScript noEmit passed. Production client/SSR/Nitro build passed before the final snapshot/guard increment; final rerun is required and recorded below when complete.
- Browser localhost: all twelve lead workspace routes rendered the project workspace and all four lanes with Completed collapsed. This is a rendering smoke test, not full per-role mutation, negative-access, mobile or persistence acceptance.
- Admin dashboard showed 12 active departments, an isolated legacy-TST entry, one interim/missing owner and unverified shared persistence. NDA viewer showed template version, 8 missing fields, source snapshot export and unissued review status.

## Remaining gates

1. Provision a separate staging environment and approved synthetic identities. No connected Supabase management capability is currently confirmed. Existing project rzskhndweihuczbdhoxk is not treated as disposable.
2. Reconcile deployed schema and policies against repository migrations before applying anything. Replace the whole operational flow with authenticated persistence; verify independent clients, audit, numbering, atomic approvals, denied access and expiry.
3. Complete backend-owned extensible department registry, versioned matrix applicability, separate signer capabilities, impact preview and reviewed existing-project changes. Local snapshots are only preservation groundwork.
4. Finish full role/action/project/mobile regression, controlled document catalogue and editable exports with layout verification. No certification, signatures, measured results or financial facts may be inferred from demo content.
5. After verified server contracts, run Android compilation, tests, device checks and web/mobile round trips. No Android code was changed in this increment.

Final validation: 39 tests passed; TypeScript noEmit passed; final client/SSR/Nitro production build passed; standard git diff --check passed. Staging provisioning remains pending installation and connection of the Supabase integration. Dashboard screenshot: C:/Users/Test/.codex/visualizations/2026/10/19/01a154b0-66de-74a0-8016-7e783ba70d68/updated-web-dashboard.png.
