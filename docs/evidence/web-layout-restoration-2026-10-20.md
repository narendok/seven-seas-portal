# Original web layout restored

The authenticated TEST membership early return introduced in b56d3ac replaced the existing portal with SharedTestWorkspace. Corrected presentation routing: TEST sign-in and restored sessions now render the original Portal layout, sidebar, colored cards, department workspaces and existing navigation. Shared records are opt-in from the header and provide Back to portal. New account sign-in/logout resets this optional view.

No backend, credentials, migrations, policies, local store format or existing UI component layout changed. TEST membership resolution and shared transaction guards are retained. The restored legacy screens contain browser-local examples; authenticated edits there remain blocked rather than falsely claiming cloud persistence. Real shared writes continue through the optional shared workspace. Full shared-data adaptation of original forms is a separate remaining integration requirement.

Validation: 88 Node tests pass, TypeScript passes, production build passes. Normal Git sync preserves Lovable history. No public production publish or new backend deployment is required by this frontend correction. Live visual acceptance pending.
