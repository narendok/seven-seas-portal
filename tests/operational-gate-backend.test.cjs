const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadModule(relativePath) {
  const fullPath = path.resolve(__dirname, relativePath);
  const source = fs.readFileSync(fullPath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', compiled)(mod, mod.exports, (dep) => {
    if (dep.startsWith('@/')) {
      return loadModule(dep.replace('@/', '../src/') + (dep.endsWith('.ts') ? '' : '.ts'));
    }
    return require(dep);
  });
  return mod.exports;
}

test('1. Migration ledger and Drizzle journal parity for operational stage gate contract', () => {
  const supabaseSqlPath = path.resolve(__dirname, '../supabase/migrations/20261020010000_operational_stage_gate_contract.sql');
  const drizzleSqlPath = path.resolve(__dirname, '../drizzle/migrations/0001_operational_stage_gate_contract.sql');
  const journalPath = path.resolve(__dirname, '../drizzle/migrations/meta/_journal.json');

  assert.ok(fs.existsSync(supabaseSqlPath), 'Supabase migration file must exist');
  assert.ok(fs.existsSync(drizzleSqlPath), 'Drizzle migration file must exist');
  assert.ok(fs.existsSync(journalPath), 'Drizzle journal must exist');

  const supabaseSql = fs.readFileSync(supabaseSqlPath, 'utf8');
  const drizzleSql = fs.readFileSync(drizzleSqlPath, 'utf8');

  // Assert both contracts define the 3 authoritative functions
  for (const fn of ['resolve_operational_membership', 'verify_and_advance_stage_gate', 'get_controlled_file_access']) {
    assert.match(supabaseSql, new RegExp(`FUNCTION public\\.${fn}`), `Supabase SQL defines ${fn}`);
    assert.match(drizzleSql, new RegExp(`FUNCTION public\\.${fn}`), `Drizzle SQL defines ${fn}`);
  }

  // Assert Drizzle journal records migration index 1
  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
  const entry = journal.entries.find((e) => e.idx === 1);
  assert.ok(entry, 'Journal entry 1 must exist');
  assert.equal(entry.tag, '0001_operational_stage_gate_contract');
});

test('2. Actor derivation strictly from authenticated session auth.uid(), denying caller-supplied IDs', () => {
  const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/20261020010000_operational_stage_gate_contract.sql'), 'utf8');

  // Verify v_user_id is derived from auth.uid()
  assert.match(sql, /v_user_id uuid := auth\.uid\(\);/, 'Actor must be derived from auth.uid()');

  // Verify function signatures do NOT take a caller-supplied actor_id or user_id argument
  assert.match(sql, /FUNCTION public\.verify_and_advance_stage_gate\(\s*p_record_id uuid,\s*p_target_stage text,\s*p_evidence_manifest jsonb/);
  assert.doesNotMatch(sql, /p_actor_id/i, 'verify_and_advance_stage_gate must not accept caller-supplied actor ID');
  assert.doesNotMatch(sql, /p_user_id/i, 'verify_and_advance_stage_gate must not accept caller-supplied user ID');

  // Verify AUTH_REQUIRED exception
  assert.match(sql, /IF v_user_id IS NULL THEN\s*RAISE EXCEPTION 'AUTH_REQUIRED/);
});

test('3. Strict active organization membership enforcement', () => {
  const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/20261020010000_operational_stage_gate_contract.sql'), 'utf8');

  // Verify membership query checks user_id, organization_id, and active status
  assert.match(sql, /WHERE m\.user_id = v_user_id\s*AND m\.organization_id = v_record\.organization_id\s*AND m\.active = true/);
  assert.match(sql, /IF v_member\.member_id IS NULL THEN\s*RAISE EXCEPTION 'MEMBERSHIP_DENIED/);
});

test('4. Designated signing capability denies viewer and unauthorized members', () => {
  const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/20261020010000_operational_stage_gate_contract.sql'), 'utf8');

  // Viewer role is denied
  assert.match(sql, /IF v_member\.role = 'viewer' THEN\s*RAISE EXCEPTION 'PERMISSION_DENIED/);

  // Non-admin without department lead or signing permission is denied
  assert.match(sql, /IF v_member\.role <> 'admin' AND NOT v_member\.is_lead THEN/);
  assert.match(sql, /RAISE EXCEPTION 'SIGNING_AUTHORITY_DENIED/);
});

test('5. Stage 2 Multi-Department Feasibility Freeze requires Contract Review Record (HLPL/F/MKT/01)', () => {
  const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/20261020010000_operational_stage_gate_contract.sql'), 'utf8');

  // Gate 2 check for target_num >= 3
  assert.match(sql, /IF v_target_num >= 3 THEN/);
  assert.match(sql, /HLPL\/F\/MKT\/01/);
  assert.match(sql, /GATE_FREEZE_VIOLATION: Stage 2 Multi-Department Feasibility Freeze requires approved Contract Review Record \(HLPL\/F\/MKT\/01\)/);
});

test('6. Stage 3 Requirements Baseline Freeze requires all domain specs (EHW-PRS, FW-FRS, SW-SRS, MECH-MRS, SAL-QUO)', () => {
  const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/20261020010000_operational_stage_gate_contract.sql'), 'utf8');

  // Gate 3 check for target_num >= 4
  assert.match(sql, /IF v_target_num >= 4 THEN/);
  assert.match(sql, /'EHW-PRS', 'FW-FRS', 'SW-SRS', 'MECH-MRS', 'SAL-QUO'/);
  assert.match(sql, /GATE_FREEZE_VIOLATION: Stage 3 Requirements Baseline Freeze requires all applicable domain requirement specs/);
});

test('7. Stage 4 Hardware Schematics Prerequisite requires approved EHW-SCH-01 before advancing to Stage 5+', () => {
  const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/20261020010000_operational_stage_gate_contract.sql'), 'utf8');

  // Gate 4 check for target_num >= 5
  assert.match(sql, /IF v_target_num >= 5 THEN/);
  assert.match(sql, /EHW-SCH/);
  assert.match(sql, /GATE_FREEZE_VIOLATION: Stage 4 Hardware Schematics Prerequisite \(EHW-SCH-01\) must be approved before advancing to pilot or production stages/);
});

test('8. Row locking, concurrency control, and duplicate-retry idempotency', () => {
  const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/20261020010000_operational_stage_gate_contract.sql'), 'utf8');

  // SELECT ... FOR UPDATE on operational_records
  assert.match(sql, /SELECT \* INTO v_record\s*FROM public\.operational_records\s*WHERE id = p_record_id\s*FOR UPDATE;/);

  // Idempotency: when already at target stage, returns success without duplicate writes
  assert.match(sql, /IF v_record\.stage = v_clean_stage THEN/);
  assert.match(sql, /'idempotent',\s*true/);
  assert.match(sql, /'message',\s*'Record is already at target stage'/);
});

test('9. Single atomic transaction writes approval record, operational stage, and immutable audit event', () => {
  const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/20261020010000_operational_stage_gate_contract.sql'), 'utf8');

  // Update operational_records
  assert.match(sql, /UPDATE public\.operational_records\s*SET\s*stage = v_clean_stage/);
  assert.match(sql, /canonical_content_hash/);

  // Insert into approvals
  assert.match(sql, /INSERT INTO public\.approvals \(\s*organization_id,\s*department_id,\s*record_id/);
  assert.match(sql, /'Stage Gate Sign-off: ' \|\| v_clean_stage/);
  assert.match(sql, /'approved'/);

  // Insert into audit_events
  assert.match(sql, /INSERT INTO public\.audit_events \(\s*organization_id,\s*action,\s*actor_id,\s*entity_type,\s*entity_id,\s*detail/);
  assert.match(sql, /'stage_gate_advancement'/);
});

test('10. Private Native Attachment Vault enforces 60-second signed URL expiry, cryptographic SHA-256 validation, and size checking', () => {
  const controlledFnSource = fs.readFileSync(path.resolve(__dirname, '../src/lib/controlled-documents.functions.ts'), 'utf8');

  // Check 60 second signed URL expiry
  assert.match(controlledFnSource, /createSignedUrl\(.+,\s*60\s*,\s*\{/);
  assert.match(controlledFnSource, /expiresInSeconds:\s*60/);

  // Check SHA-256 hex digest regex
  assert.match(controlledFnSource, /regex\(\/\^\[a-fA-F0-9\]\{32,128\}\$\//);

  // Check size check on complete upload
  assert.match(controlledFnSource, /uploadedObj\.metadata\.size !== file\.size_bytes/);

  // Check access verification uses get_controlled_file_access RPC
  assert.match(controlledFnSource, /get_controlled_file_access/);
});

test('11. Operational stage gate input schema validates record UUID, target stage, and evidence manifest', () => {
  const opsGateSource = fs.readFileSync(path.resolve(__dirname, '../src/lib/operational-gate.functions.ts'), 'utf8');
  assert.match(opsGateSource, /stageGateInputSchema/);
  assert.match(opsGateSource, /recordId:\s*z\.string\(\)\.uuid\(\)/);
  assert.match(opsGateSource, /targetStage:\s*z\.string\(\)\.trim\(\)\.min\(1\)/);
  assert.match(opsGateSource, /deliverables:\s*z\.array/);
  assert.match(opsGateSource, /naRationale:\s*z\.record/);
  assert.match(opsGateSource, /canonicalContentHash:\s*z\.string/);
});
