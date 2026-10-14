# Admin personas and AI4T lifecycle workspace

## What will be added
- A compact header role switcher for Executive Admin, all department leads, and the DEMO client portal persona.
- Persona-aware department context, filtered queues and records, role-specific approvals, and a visible switch-back-to-admin control with an audit event for each change.
- A dedicated, clearly marked DEMO lifecycle hub for HLPL-AI4T-01 with nine stages, documented deliverables, sign-off states, stage history, project progress, and a 12-document dossier.
- Controls to advance, jump, auto-run, and reset the demonstration without changing operational records.

## Technical details
- Extend the browser-local portal state so persona and simulation state persist across refreshes while remaining separate from real operational data.
- Reuse existing department ownership, role filters, document previews, and audit history patterns.
- Apply the current dark/light theme tokens and responsive layout conventions; no Cloud permissions or live records will change.
