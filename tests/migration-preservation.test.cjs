const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Load portal-hydration.ts
const hydrationSource = fs.readFileSync(path.resolve(__dirname, '../src/lib/portal-hydration.ts'), 'utf8');
const compiledHydration = ts.transpileModule(hydrationSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const hydrationScope = { exports: {} };
new Function('module', 'exports', compiledHydration)(hydrationScope, hydrationScope.exports);
const { migratePortalState, repairDemoState, MIGRATION_SCHEMA_VERSION, PRE_MIGRATION_BACKUP_KEY } = hydrationScope.exports;

// Load department-scope.ts
const scopeSource = fs.readFileSync(path.resolve(__dirname, '../src/lib/department-scope.ts'), 'utf8');
const compiledScope = ts.transpileModule(scopeSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const scopeModule = { exports: {} };
new Function('module', 'exports', compiledScope)(scopeModule, scopeModule.exports);
const { departmentCode, approvalInDepartment, canDepartmentSign } = scopeModule.exports;

// Load normalizePersonaId from index.tsx
const indexSource = fs.readFileSync(path.resolve(__dirname, '../src/routes/index.tsx'), 'utf8');
// Extract normalizePersonaId function and VALID_PERSONA_IDS
const normalizeMatch = indexSource.match(/const VALID_PERSONA_IDS = new Set\(\[[\s\S]*?\]\);[\s\S]*?export function normalizePersonaId\(role: string \| null \| undefined\): string \{[\s\S]*?\n\}/);
if (!normalizeMatch) {
  throw new Error("Could not extract normalizePersonaId from src/routes/index.tsx");
}
const compiledNormalize = ts.transpileModule(normalizeMatch[0], { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const normalizeScope = { exports: {} };
new Function('module', 'exports', compiledNormalize)(normalizeScope, normalizeScope.exports);
const { normalizePersonaId } = normalizeScope.exports;

// Mock storage helper
function createMockStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(k) { return store.has(k) ? store.get(k) : null; },
    setItem(k, v) { store.set(k, String(v)); },
    removeItem(k) { store.delete(k); },
    has(k) { return store.has(k); },
    get size() { return store.size; },
  };
}

// 1. Deterministic Legacy ESW Resolution & Scoping Isolation Test
test('1. Deterministic legacy ESW resolution isolates mapped FW and SW records and quarantines unknown/mixed', () => {
  const state = {
    records: [
      { id: 'DEMO-TASK-ESW-BLE-GATT', reference: 'DEMO-TASK-ESW-BLE-GATT', type: 'Task', area: 'esw', title: 'BLE task' },
      { id: 'HLPL-SLCT-ESW-HSI-01', reference: 'HLPL-SLCT-ESW-HSI-01', type: 'HSI', area: 'esw', title: 'HSI spec' },
      { id: 'HLPL-SLCT-ESW-FW-01', reference: 'HLPL-SLCT-ESW-FW-01', type: 'Firmware', area: 'esw', title: 'FW release' },
      { id: 'HLPL-SLCT-CSW-ARCH-01', reference: 'HLPL-SLCT-CSW-ARCH-01', type: 'Architecture', area: 'csw', title: 'Cloud Arch' },
      { id: 'TASK-CSW-MQTT01', reference: 'TASK-CSW-MQTT01', type: 'Task', area: 'csw', title: 'MQTT task' },
      { id: 'CUSTOM-TASK-ESW-99', reference: 'CUSTOM-TASK-ESW-99', type: 'Task', area: 'esw', title: 'Custom legacy unmapped task' },
    ],
  };

  const migrated = migratePortalState(state);

  const bleTask = migrated.records.find(r => r.id === 'DEMO-TASK-ESW-BLE-GATT');
  const hsi = migrated.records.find(r => r.id === 'HLPL-SLCT-ESW-HSI-01');
  const fw = migrated.records.find(r => r.id === 'HLPL-SLCT-ESW-FW-01');
  const cloudArch = migrated.records.find(r => r.id === 'HLPL-SLCT-CSW-ARCH-01');
  const mqttTask = migrated.records.find(r => r.id === 'TASK-CSW-MQTT01');
  const customTask = migrated.records.find(r => r.id === 'CUSTOM-TASK-ESW-99');

  // Explicitly mapped FW records appear strictly in FW (area: "fw")
  assert.equal(bleTask.area, 'fw');
  assert.equal(hsi.area, 'fw');
  assert.equal(fw.area, 'fw');

  // Explicitly mapped SW records appear strictly in SW (area: "sw")
  assert.equal(cloudArch.area, 'sw');
  assert.equal(mqttTask.area, 'sw');

  // Scoping isolation: FW items are NOT in SW
  assert.notEqual(bleTask.area, 'sw');
  assert.notEqual(hsi.area, 'sw');
  assert.notEqual(fw.area, 'sw');

  // Scoping isolation: SW items are NOT in FW
  assert.notEqual(cloudArch.area, 'fw');
  assert.notEqual(mqttTask.area, 'fw');

  // Unknown or unmapped legacy ESW records remain quarantined from BOTH FW and SW
  assert.notEqual(customTask.area, 'fw', 'Unmapped legacy record must not appear in FW');
  assert.notEqual(customTask.area, 'sw', 'Unmapped legacy record must not appear in SW');
  assert.equal(customTask.legacy_area, 'esw');
  assert.equal(customTask.migration_flag, 'unresolved_legacy_esw');
});

// 2. Genuinely Mixed Legacy Ownership Test
test('2. Genuinely mixed legacy ownership preserves full links, denies dual signing authority, and flags for review', () => {
  const mixedApproval = {
    id: 'demo-approval-mixed-legacy-01',
    recordId: 'CUSTOM-COMPLEX-ESW-01',
    department: 'ESW',
    approverAuthority: 'QA',
    requester: 'Priya Sharma · Sales Lead',
    outcome: 'Pending',
    comments: 'Mixed hardware/firmware/cloud architecture gate with cross-discipline dependencies',
    linkedRecords: 'HLPL-BCU-02 · HLPL-SLCT-ESW-FW-01 · HLPL-SLCT-CSW-ARCH-01',
  };

  const state = {
    approvals: [mixedApproval],
  };

  const migrated = migratePortalState(state);
  const result = migrated.approvals.find(a => a.id === 'demo-approval-mixed-legacy-01');

  // Foreign keys, requester, authority, and outcome preserved intact
  assert.equal(result.id, mixedApproval.id);
  assert.equal(result.recordId, mixedApproval.recordId);
  assert.equal(result.approverAuthority, 'QA');
  assert.equal(result.requester, mixedApproval.requester);
  assert.equal(result.outcome, 'Pending');
  assert.equal(result.linkedRecords, mixedApproval.linkedRecords);

  // Quarantined with legacy_department and migration_flag
  assert.equal(result.legacy_department, 'ESW');
  assert.equal(result.migration_flag, 'unresolved_legacy_esw');

  // Dual signing authority is NOT granted to arbitrary or unauthorized departments
  assert.equal(canDepartmentSign(result, 'fw'), false);
  assert.equal(canDepartmentSign(result, 'sw'), false);
  assert.equal(canDepartmentSign(result, 'sales'), false);
  assert.equal(canDepartmentSign(result, 'qa'), true); // QA was explicitly designated
});

// 3. Document Owner, Designer & Approver Preservation Test
test('3. Document owner, designer, approver, revisions, and localFiles are preserved across migration', () => {
  const state = {
    documents: [
      {
        id: 'demo-doc-hsi',
        title: 'Hardware-software interface specification',
        departmentId: 'demo-dept-esw',
        designer: 'Devon Lane',
        approver: 'Jordan Blake',
        revision: '03 · RELEASE',
        lifecycle: 'Approved',
        linkedRecordRefs: ['HLPL-SLCT-ESW-HSI-01', 'HLPL-SLCT-EHW-PRS-02'],
        localFiles: [
          { id: 'f-1', name: 'hsi_v3.pdf', size: 1048576, checksum: 'sha256:abc12345', storage: 'legacy-localstorage' },
        ],
      },
      {
        id: 'user-doc-custom-99',
        title: 'Custom User Protocol Spec',
        departmentId: 'demo-dept-sales',
        designer: 'Custom Author',
        approver: 'Custom Approver',
        revision: '01',
        lifecycle: 'Draft',
        linkedRecordRefs: ['HLPL-CUSTOM-01'],
        localFiles: [
          { id: 'f-2', name: 'custom_spec.docx', size: 524288, checksum: 'sha256:def67890', storage: 'legacy-localstorage' },
        ],
      },
    ],
  };

  const migrated = migratePortalState(state);

  const hsi = migrated.documents.find(d => d.id === 'demo-doc-hsi');
  assert.equal(hsi.departmentId, 'demo-dept-fw');
  assert.equal(hsi.designer, 'Devon Lane');
  assert.equal(hsi.approver, 'Jordan Blake');
  assert.equal(hsi.revision, '03 · RELEASE');
  assert.equal(hsi.lifecycle, 'Approved');
  assert.deepEqual(hsi.linkedRecordRefs, ['HLPL-SLCT-ESW-HSI-01', 'HLPL-SLCT-EHW-PRS-02']);
  assert.equal(hsi.localFiles.length, 1);
  assert.equal(hsi.localFiles[0].checksum, 'sha256:abc12345');

  const userDoc = migrated.documents.find(d => d.id === 'user-doc-custom-99');
  assert.equal(userDoc.departmentId, 'demo-dept-sales');
  assert.equal(userDoc.designer, 'Custom Author');
  assert.equal(userDoc.approver, 'Custom Approver');
  assert.equal(userDoc.revision, '01');
  assert.equal(userDoc.localFiles[0].checksum, 'sha256:def67890');
});

// 4. Approval Requester, Authority, Source Link & Decision History Test
test('4. Approval requester, authority, source link, and decision history preserved without change', () => {
  const approvals = [
    { id: 'app-1', recordId: 'HLPL-SLCT-ESW-FW-01', department: 'ESW', approverAuthority: 'QA', requester: 'Devon Lane', outcome: 'Approved', signedBy: 'Jordan Blake', signedAt: '2026-10-18T10:00:00Z', comments: 'Passed regression suite' },
    { id: 'app-2', recordId: 'HLPL-SLCT-CSW-ARCH-01', department: 'ESW', approverAuthority: 'EHW', requester: 'Siddharth Roy', outcome: 'Returned', signedBy: 'Avery Vale', signedAt: '2026-10-18T11:00:00Z', comments: 'Need clarification on broker limits' },
    { id: 'app-3', recordId: 'CUSTOM-REC-01', department: 'FIN', approverAuthority: 'Admin', requester: 'Priya Voss', outcome: 'Pending', comments: 'Advance deposit verification' },
  ];

  const migrated = migratePortalState({ approvals });

  const a1 = migrated.approvals.find(a => a.id === 'app-1');
  assert.equal(a1.department, 'FW'); // Explicit firmware source mapped to FW
  assert.equal(a1.approverAuthority, 'QA');
  assert.equal(a1.requester, 'Devon Lane');
  assert.equal(a1.outcome, 'Approved');
  assert.equal(a1.signedBy, 'Jordan Blake');
  assert.equal(a1.signedAt, '2026-10-18T10:00:00Z');
  assert.equal(a1.comments, 'Passed regression suite');

  const a2 = migrated.approvals.find(a => a.id === 'app-2');
  assert.equal(a2.department, 'SW'); // Explicit cloud source mapped to SW
  assert.equal(a2.outcome, 'Returned');

  const a3 = migrated.approvals.find(a => a.id === 'app-3');
  assert.equal(a3.department, 'FIN');
  assert.equal(a3.outcome, 'Pending');
});

// 5. Custom Roster & Custom Project References Preservation Test
test('5. Custom roster members and custom projects retain 100% of custom fields', () => {
  const customMember = {
    name: 'Dr. Jane Thorne',
    area: 'sales',
    role: 'Technical Sales Consultant',
    score: '3.95/4',
    level: 'Level 5',
    skills: ['EV Powertrains', 'Telematics Regulatory Compliance'],
    customCertificationId: 'CERT-ISO26262-2026',
    hourlyRateINR: 4500,
  };

  const customProject = {
    id: 'proj-custom-900',
    reference: 'HLPL-CUSTOM-900',
    type: 'Project',
    area: 'ehw',
    title: 'Custom High-Voltage BMS Telemetry Node',
    status: 'In review',
    priority: 'Critical',
    fields: {
      projectId: 'HLPL-CUSTOM-900',
      client: 'Mahindra Electric Mobility Limited',
      voltage: '400V / 800V DC',
      enclosure: 'IP69K Aluminum',
      targetBom: '$72.50',
      customFmeaLevel: 'ASIL-C',
    },
    notes: 'Custom project notes with unique customer requirements',
  };

  const state = {
    teamMembers: [customMember],
    records: [customProject],
  };

  const migrated = migratePortalState(state);

  const m = migrated.teamMembers.find(t => t.name === 'Dr. Jane Thorne');
  assert.deepEqual(m, customMember);

  const p = migrated.records.find(r => r.id === 'proj-custom-900');
  assert.deepEqual(p, customProject);
});

// 6. Explicit Alerts Preservation Test
test('6. Explicit alert IDs map to designated departments; unknown alerts quarantined without access', () => {
  const alerts = [
    { id: 'ALERT_HW_01', severity: 'Critical', title: 'MOSFET', departmentId: 'demo-dept-ehw' },
    { id: 'ALERT_ESW_FW_01', severity: 'Warning', title: 'Stack memory', departmentId: 'demo-dept-esw' },
    { id: 'ALERT_CSW_INGEST_01', severity: 'Warning', title: 'MQTT latency', departmentId: 'demo-dept-csw' },
    { id: 'CUSTOM_ALERT_UNKNOWN_01', severity: 'High', title: 'Unknown legacy alert', departmentId: 'demo-dept-esw' },
  ];

  const migrated = migratePortalState({ alerts });

  const aHw = migrated.alerts.find(a => a.id === 'ALERT_HW_01');
  assert.equal(aHw.departmentId, 'demo-dept-ehw');

  const aFw = migrated.alerts.find(a => a.id === 'ALERT_ESW_FW_01');
  assert.equal(aFw.departmentId, 'demo-dept-fw');

  const aCsw = migrated.alerts.find(a => a.id === 'ALERT_CSW_INGEST_01');
  assert.equal(aCsw.departmentId, 'demo-dept-sw');

  const aUnknown = migrated.alerts.find(a => a.id === 'CUSTOM_ALERT_UNKNOWN_01');
  assert.equal(aUnknown.legacy_departmentId, 'demo-dept-esw');
  assert.equal(aUnknown.departmentId, 'unresolved');
  assert.equal(aUnknown.migration_flag, 'unresolved_legacy_esw');

  // Quarantined alert gains zero visibility in FW or SW
  assert.notEqual(aUnknown.departmentId, 'demo-dept-fw');
  assert.notEqual(aUnknown.departmentId, 'demo-dept-sw');
});

// 7. Notifications Invariance Test
test('7. Notifications array length, string values, and chronological order remain 100% invariant', () => {
  const notifications = [
    '2026-10-18 09:00 - Project HLPL-SLCT-01 Stage 8 authorization active',
    '2026-10-18 10:30 - Devon Lane updated firmware candidate v1.4.2',
    '2026-10-18 11:15 - Human quality release pending; no automatic sign-off permitted',
    '2026-10-18 14:00 - SMT Line 2 lot BATCH-04 reflow thermal profile validated',
  ];

  const originalCopy = JSON.parse(JSON.stringify(notifications));
  const migrated = migratePortalState({ notifications });

  assert.deepEqual(migrated.notifications, originalCopy);
  assert.equal(migrated.notifications.length, originalCopy.length);
  for (let i = 0; i < originalCopy.length; i++) {
    assert.equal(migrated.notifications[i], originalCopy[i]);
  }
});

// 8. Valid Saved Persona Continuity Test
test('8. Valid saved persona survives migration and app hydration without reset or fallback prompt', () => {
  const validPersonas = ['fw', 'sw', 'ehw', 'client', 'admin', 'sales', 'qa'];

  for (const pId of validPersonas) {
    const normalized = normalizePersonaId(pId);
    assert.equal(normalized, pId, `Valid persona ${pId} must normalize to itself`);
    assert.notEqual(normalized, 'unrecognized', `Valid persona ${pId} must not be flagged unrecognized`);
    assert.notEqual(normalized, 'unselected', `Valid persona ${pId} must not be flagged unselected`);
  }

  // Legacy esw persona normalizes to fw
  assert.equal(normalizePersonaId('esw'), 'fw');
  // Transitional efw/csw normalize to fw/sw
  assert.equal(normalizePersonaId('efw'), 'fw');
  assert.equal(normalizePersonaId('csw'), 'sw');
});

// 9. Saved Data Across Refresh Test
test('9. Simulates complete browser refresh: serializes to JSON string and reloads with 100% equivalence', () => {
  const state = {
    schemaVersion: 1,
    records: [
      { id: 'rec-1', reference: 'HLPL-SLCT-ESW-HSI-01', area: 'esw', type: 'HSI', notes: 'Critical user note' },
    ],
    documents: [
      { id: 'demo-doc-hsi', title: 'HSI', departmentId: 'demo-dept-esw', draftHtml: '<p>User modified draft v2</p>' },
    ],
    alerts: [
      { id: 'ALERT_ESW_FW_01', severity: 'Warning', departmentId: 'demo-dept-esw' },
    ],
    notifications: ['Test notification 1', 'Test notification 2'],
  };

  // Run 1: Migration
  const migrated1 = migratePortalState(state);
  const serialized = JSON.stringify(migrated1);

  // Run 2: Refresh reload
  const reloaded = JSON.parse(serialized);
  const migrated2 = migratePortalState(reloaded);

  assert.deepEqual(migrated2, migrated1);
  assert.equal(migrated2.documents[0].draftHtml, '<p>User modified draft v2</p>');
  assert.equal(migrated2.records[0].notes, 'Critical user note');
  assert.equal(migrated2.schemaVersion, MIGRATION_SCHEMA_VERSION);
});

// 10. Stale Saved Role Test
test('10. Stale or invalid saved role normalizes to unrecognized, preventing silent Admin elevation', () => {
  const staleRoles = ['deprecated_role_xyz', 'super_admin_fake', 'esw_invalid_sub', 'random_string_123'];

  for (const stale of staleRoles) {
    const normalized = normalizePersonaId(stale);
    assert.equal(normalized, 'unrecognized', `Stale role ${stale} must normalize to unrecognized`);
    assert.notEqual(normalized, 'admin', `Stale role ${stale} must NEVER elevate to Admin`);
  }
});

// 11. Interrupted Migration Recovery Test
test('11. Interrupted migration recovery uses clean pre-migration backup and completes schemaVersion upgrade', () => {
  const storage = createMockStorage();

  const originalState = {
    schemaVersion: 1,
    records: [
      { id: 'DEMO-TASK-ESW-BLE-GATT', reference: 'DEMO-TASK-ESW-BLE-GATT', type: 'Task', area: 'esw' },
      { id: 'HLPL-SLCT-ESW-HSI-01', reference: 'HLPL-SLCT-ESW-HSI-01', type: 'HSI', area: 'esw' },
    ],
    documents: [
      { id: 'demo-doc-hsi', departmentId: 'demo-dept-esw' },
    ],
  };

  // Pre-seed the backup as if a crash occurred during a prior write
  storage.setItem(PRE_MIGRATION_BACKUP_KEY, JSON.stringify(originalState));

  // Simulating corrupted/half-written state with missing schemaVersion
  const corruptedState = {
    records: [{ id: 'corrupted-half-task' }],
  };

  const recovered = migratePortalState(corruptedState, undefined, storage);

  // Assert recovered state restored clean original records and upgraded them to schemaVersion
  assert.equal(recovered.schemaVersion, MIGRATION_SCHEMA_VERSION);
  const bleTask = recovered.records.find(r => r.id === 'DEMO-TASK-ESW-BLE-GATT');
  assert.ok(bleTask, 'Clean backup state was recovered');
  assert.equal(bleTask.area, 'fw');

  const hsiDoc = recovered.documents.find(d => d.id === 'demo-doc-hsi');
  assert.ok(hsiDoc);
  assert.equal(hsiDoc.departmentId, 'demo-dept-fw');
});

// 12. Idempotency Test
test('12. Migration is strictly idempotent: migrate(migrate(s)) === migrate(s)', () => {
  const state = {
    records: [
      { id: 'DEMO-TASK-ESW-BLE-GATT', reference: 'DEMO-TASK-ESW-BLE-GATT', type: 'Task', area: 'esw' },
      { id: 'TASK-CSW-MQTT01', reference: 'TASK-CSW-MQTT01', type: 'Task', area: 'csw' },
      { id: 'CUSTOM-UNKNOWN-01', reference: 'CUSTOM-UNKNOWN-01', type: 'Task', area: 'esw' },
    ],
    documents: [
      { id: 'demo-doc-hsi', departmentId: 'demo-dept-esw' },
    ],
    alerts: [
      { id: 'ALERT_ESW_FW_01', departmentId: 'demo-dept-esw' },
    ],
    notifications: ['Idempotency check note'],
  };

  const run1 = migratePortalState(state);
  const run2 = migratePortalState(run1);

  assert.deepEqual(run2, run1);
  assert.equal(run2.schemaVersion, MIGRATION_SCHEMA_VERSION);
});

// 13. Legacy & Transitional Alias Compatibility Test
test('13. Transitional efw/csw inputs migrate/read safely to fw/sw, mapped ESW resolves once, ambiguous ESW quarantined, no cross-signing', () => {
  const transitionalState = {
    records: [
      { id: 'rec-efw', reference: 'CUSTOM-TASK-EFW-01', type: 'Task', area: 'efw', title: 'Transitional EFW task' },
      { id: 'rec-csw', reference: 'CUSTOM-TASK-CSW-01', type: 'Task', area: 'csw', title: 'Transitional CSW task' },
      { id: 'rec-mapped-esw', reference: 'HLPL-SLCT-ESW-FW-01', type: 'Firmware', area: 'esw', title: 'Firmware binary' },
      { id: 'rec-ambig-esw', reference: 'CUSTOM-ESW-AMBIG-99', type: 'Gate', area: 'esw', title: 'Ambiguous ESW gate' },
    ],
    documents: [
      { id: 'doc-efw', title: 'EFW Doc', departmentId: 'demo-dept-efw' },
      { id: 'doc-csw', title: 'CSW Doc', departmentId: 'demo-dept-csw' },
      { id: 'doc-ambig-esw', title: 'Ambiguous ESW Doc', departmentId: 'demo-dept-esw' },
    ],
    alerts: [
      { id: 'alert-efw', title: 'EFW Alert', departmentId: 'demo-dept-efw' },
      { id: 'alert-csw', title: 'CSW Alert', departmentId: 'demo-dept-csw' },
      { id: 'alert-ambig-esw', title: 'Ambiguous ESW Alert', departmentId: 'demo-dept-esw' },
    ],
    approvals: [
      { id: 'app-efw', recordId: 'HLPL-SLCT-ESW-FW-01', department: 'EFW', approverAuthority: 'FW' },
      { id: 'app-csw', recordId: 'HLPL-SLCT-CSW-ARCH-01', department: 'CSW', approverAuthority: 'SW' },
      { id: 'app-ambig-esw', recordId: 'CUSTOM-ESW-AMBIG-99', department: 'ESW', approverAuthority: 'Admin' },
    ],
    teamMembers: [
      { name: 'Devon Lane', area: 'efw', role: 'Firmware Lead' },
      { name: 'Siddharth Roy', area: 'csw', role: 'Cloud Lead' },
      { name: 'Old ESW Member', area: 'esw', role: 'Unmapped Engineer' },
    ],
  };

  const result = migratePortalState(transitionalState);

  // Records: transitional efw/csw migrate to fw/sw
  assert.equal(result.records.find(r => r.id === 'rec-efw').area, 'fw');
  assert.equal(result.records.find(r => r.id === 'rec-csw').area, 'sw');

  // Mapped ESW resolves once to fw
  assert.equal(result.records.find(r => r.id === 'rec-mapped-esw').area, 'fw');

  // Ambiguous ESW remains quarantined from both fw and sw
  const ambigRec = result.records.find(r => r.id === 'rec-ambig-esw');
  assert.notEqual(ambigRec.area, 'fw');
  assert.notEqual(ambigRec.area, 'sw');
  assert.equal(ambigRec.migration_flag, 'unresolved_legacy_esw');

  // Documents: transitional efw/csw migrate to fw/sw
  assert.equal(result.documents.find(d => d.id === 'doc-efw').departmentId, 'demo-dept-fw');
  assert.equal(result.documents.find(d => d.id === 'doc-csw').departmentId, 'demo-dept-sw');
  assert.equal(result.documents.find(d => d.id === 'doc-ambig-esw').migration_flag, 'unresolved_legacy_esw');

  // Alerts: transitional efw/csw migrate to fw/sw
  assert.equal(result.alerts.find(a => a.id === 'alert-efw').departmentId, 'demo-dept-fw');
  assert.equal(result.alerts.find(a => a.id === 'alert-csw').departmentId, 'demo-dept-sw');
  assert.equal(result.alerts.find(a => a.id === 'alert-ambig-esw').migration_flag, 'unresolved_legacy_esw');

  // Approvals: transitional EFW/CSW migrate to FW/SW
  const appFw = result.approvals.find(a => a.id === 'app-efw');
  const appSw = result.approvals.find(a => a.id === 'app-csw');
  const appAmbig = result.approvals.find(a => a.id === 'app-ambig-esw');
  assert.equal(appFw.department, 'FW');
  assert.equal(appSw.department, 'SW');
  assert.equal(appAmbig.migration_flag, 'unresolved_legacy_esw');

  // Strict cross-department signing denial between FW and SW
  assert.equal(canDepartmentSign(appFw, 'fw'), true);
  assert.equal(canDepartmentSign(appFw, 'sw'), false);
  assert.equal(canDepartmentSign(appSw, 'sw'), true);
  assert.equal(canDepartmentSign(appSw, 'fw'), false);

  // Ambiguous approval cannot be signed by FW or SW
  assert.equal(canDepartmentSign(appAmbig, 'fw'), false);
  assert.equal(canDepartmentSign(appAmbig, 'sw'), false);

  // Team Members: transitional efw/csw migrate to fw/sw; ambiguous quarantined
  assert.equal(result.teamMembers.find(m => m.name === 'Devon Lane').area, 'fw');
  assert.equal(result.teamMembers.find(m => m.name === 'Siddharth Roy').area, 'sw');
  assert.equal(result.teamMembers.find(m => m.name === 'Old ESW Member').migration_flag, 'unresolved_legacy_esw');
});
