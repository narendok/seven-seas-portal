# SSM One staging setup

Recommended destination: a new Supabase project named `ssm-one-staging` in the same organization, using synthetic data only. A persistent staging branch is an alternative where available. Confirm organization, region and any cost before provisioning. The user requested staging on 19 October 2026; provisioning has not occurred.

## Environment separation

Keep the current Lovable/backend target unchanged. This is a test environment for the same architecture, not a competing business backend. Install and connect the Supabase integration before management actions; no Supabase CLI or Docker command was found in this shell.

After the environment exists, verify project identity from management metadata. Reconcile deployed schema with migrations before choosing a reviewed baseline; do not blindly replay both legacy and SCMS schema sets. Apply approved migrations to staging only. Preserve RLS and keep private controlled files private.

Copy `.env.staging.example` to ignored `.env.staging.local` and set the staging URL and browser publishable key using the variable names expected by `src/integrations/supabase/client.ts`. No privileged key belongs in VITE_* or tracked files. Run `npm run dev -- --mode staging --host 127.0.0.1 --port 8081`. The separate port isolates its browser-local demo state from port 8080. A mode switch alone does not implement shared operational persistence.

## Synthetic acceptance fixture

Create Admin, Client, SAL, EHW, FW, SW, MECH, PUR, QA, EMF, MMF, FIN and HR/OPS identities plus SIT (14 total: admin + client + 12 leads). Use test identities controlled by the owner, not invented deliverable email addresses. Add one linked end-to-end project, one unrelated project, sparse source data, a pending approval and a rejected gate. Add no production stock, customers or communications. Disable outbound real notifications in staging.

Verify independent browser sessions see the same committed data, department/client access is denied outside explicit grants, invalid signer attempts fail, pending/rejected gates stay blocked, retries do not duplicate transactions, audit attribution is correct and private file links expire. Validate document snapshots and released-version immutability. Android staging configuration must be reviewed separately: its current URL is pinned to the existing backend, so do not assume a web environment file changes Android.

Official references: https://supabase.com/docs/guides/deployment/managing-environments and https://supabase.com/docs/guides/deployment/branching .

## Provisioned staging — 19 October 2026

Created ssm-one-staging in SlogFY's Org (wqhifgavepwbbgaeecjk), Mumbai ap-south-1. Project ref: jiqbxcqlywvvmhbgirzl. API URL: https://jiqbxcqlywvvmhbgirzl.supabase.co. Supabase quote at creation: USD 0/month. Management status verified ACTIVE_HEALTHY. The source portal project rzskhndweihuczbdhoxk is not visible to this connected account, so its deployed schema/Auth/storage cannot yet be reconciled. No application migrations, identities or operational data have been applied. Current portal configuration remains unchanged. Do not infer production parity from project creation alone.
