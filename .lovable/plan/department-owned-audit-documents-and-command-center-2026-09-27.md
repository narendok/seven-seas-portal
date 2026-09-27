# Department-owned audit, documents, and command center

## Outcome
- Remove **Audit & Controlled Documents** as a standalone navigation area and dashboard.
- Keep one shared audit/document record model, but assign every audit, document, approval, and queue item to its owning department.
- Make **Home / Command Center** the compact, department-wise management view for the administrator.

## Changes
1. **Navigation and setup**
   - Remove the standalone Audit & Controlled Documents nav item, workspace, standalone metrics, and Audit-specific setup step.
   - Update the setup flow to describe department-owned audit/document configuration, with shared numbering, retention, access, Drive-optional, and reporting rules.
   - Migrate saved browser-local portal data safely so existing records remain usable; audit-tagged items will be reassigned through an explicit owning-department field rather than silently discarded.

2. **Department-owned audit and documents**
   - Extend the shared record/document shape with department ownership, workflow category, linked records, ACL classification, review/retention, approvals, and optional Drive reference/sync metadata.
   - Add appropriate audit, evidence, controlled-document, and related workflow choices to each owning workspace:
     - R&D: design/project audits and project files.
     - Purchasing: supplier audits and purchasing evidence.
     - Production: process audits, travelers, and work instructions.
     - Quality: inspection/NCR/CAPA evidence and quality-system audits.
     - Sales: customer audits, complaints, and client-approved documents.
     - People: training and personnel audit evidence.
   - Keep global Search, Documents index, audit history, and reporting as aggregation views that filter by ownership and access context.
   - Keep Google Drive optional and disconnected by default; preserve the existing no-connection workflow and show connection/sync states without creating files or exposing tokens.

3. **Home management dashboard**
   - Replace the current aggregate progress panel with a sortable, filterable, paginated department table/card grid.
   - Show each configured department’s lead and sub-roles, today, priority/overdue, pending, approvals, progress, blockers/risks, and contextual quick actions.
   - Include all configured departments, including departments whose audit/document work is represented within their own queues.
   - Add click-through into the selected department and its administrator context; retain the clear active-department/acting-role label and a return-to-global control.
   - Log department-context changes and delegated actions in the shared audit history while retaining the same administrator identity.

4. **Access and lifecycle safeguards**
   - Apply the current department-context and role model to record creation, edits, approvals, documents, aggregate indexes, and quick actions so the UI and state behavior use the same ownership checks.
   - Preserve human-only quality releases and financial decisions; no automatic approval, release, sharing, Drive upload, or external access.
   - Retain authorized demo lifecycle behavior and ensure it remains clearly marked, idempotent, and removable without creating new fake audit data.

5. **Verification**
   - Update the browser regression coverage for removed standalone navigation, department-owned audit/document forms, global aggregation views, Home table controls, context switching/return, protected approval behavior, and demo cleanup.
   - Verify the preview on desktop and mobile, inspect current build/runtime diagnostics, and leave the app unpublished.

## Technical notes
- The current portal is a browser-local, versioned prototype. This restructuring will keep that single state model and update the saved-state version/migration instead of introducing partial shared persistence.
- The existing standalone Audit area currently maps to an Administration department. The revised mapping will remove that relationship and store ownership directly on audit/document records.
- Live Google Drive sync remains blocked until a workspace OAuth client is configured. The portal will continue to work without a Drive connection.
