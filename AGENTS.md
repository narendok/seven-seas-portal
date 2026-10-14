# Antigravity Agent Guidelines: Hexense Labs SCMS

## Execution & Tool Permission Rules
- **Allow All Operations**: The user has granted full blanket permission for this project. Execute all commands, file updates, and browser automation tasks autonomously without blocking for manual confirmations.
- **Automotive Integrity**: Ensure all generated models and documentation strictly follow IATF 16949:2016, ISO 9001:2015, AIS-140, and AEC-Q100 standards.
- **Naming Standard**: Strictly adhere to `HLPL-[PROJ_ID]-[DEPT]-[DOC_TYPE]-[REV]`.
- **Lovable Sync**: The primary frontend and cloud backend are hosted on Lovable (`https://lovable.dev/projects/a3399684-daab-4b38-8666-187b96b451af`). Keep local migrations and Lovable schemas aligned.

<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Portal Runtime
- Keep operational prototype data in a versioned browser-local store so records persist between refreshes without creating an unconfigured backend.
- Portal record forms use structured local fields, controlled master options, and record links so created operational data remains traceable without inventing business data.
- Keep the operational command-center prototype in one browser-local state model until authenticated shared-data queries replace the full workflow; do not mix local mutations with partial shared persistence.
- Keep authorized demo data in the same versioned browser-local portal state, clearly marked and replaceable as a whole, so it never blends with configured operational data or creates duplicate records.
- Shared records and documents stay browser-local and are surfaced through access-checked aggregate views; department ownership remains the source of authority.
- Private controlled-document binaries live in Lovable Cloud Storage; server functions create short-lived signed upload/download links only after authenticated database policies authorize the department-scoped document.
- Model department hubs through a canonical SCMS area map, migrating legacy browser-local area IDs at read time so existing records remain usable.
- Keep interactive lifecycle walkthroughs and competency examples in the replaceable DEMO browser-local state, so feature tests never affect configured operational records.
- Keep demo task, project, alert, and document samples inside the replaceable browser-local DEMO state so no illustrative activity can affect configured operations.
- Present connected workflow recommendations as derived, human-reviewable actions; auto-draft templates remain clearly marked DEMO drafts until a person saves and approves them.
