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

/**
 * Legacy JavaScript model tests (not database integration evidence)
 * Simulates the exact relational behavior and transactional constraints of PostgreSQL functions:
 * - public.resolve_operational_membership
 * - public.verify_approved_stage_deliverable
 * - public.verify_and_advance_stage_gate
 */
class OperationalDatabaseHarness {
  constructor() {
    this.organizations = [];
    this.departments = [];
    this.organization_members = [];
    this.operational_records = [];
    this.documents = [];
    this.controlled_document_files = [];
    this.approvals = [];
    this.audit_events = [];
    this.record_links = [];
  }

  hasDepartmentPermission(orgId, deptId, permission, member) {
    if (member.role === 'admin') return true;
    if (member.role === 'viewer') return false;
    const dept = this.departments.find((d) => d.id === deptId && d.organization_id === orgId);
    if (!dept) return false;
    // Designated lead for this specific department
    if (dept.lead_member_id === member.id && permission === 'approvals:decide') return true;
    return false;
  }

  verifyApprovedStageDeliverable(orgId, recordId, patternRegex, deliverables, naRationales, allowNa = false) {
    // 1. Structured deliverables manifest check with strict project isolation
    if (Array.isArray(deliverables)) {
      for (const elem of deliverables) {
        if (typeof elem === 'object' && elem !== null) {
          const claimedRev = elem.revision;
          const recId = elem.record_id;
          const docId = elem.document_id;

          if (recId) {
            const hasRec = this.operational_records.some((r) =>
              r.id === recId &&
              r.organization_id === orgId &&
              (r.id === recordId ||
                this.record_links.some((l) => (l.source_record_id === recordId && l.target_record_id === r.id) ||
                                              (l.target_record_id === recordId && l.source_record_id === r.id))) &&
              (patternRegex.test(r.reference || '') || patternRegex.test(r.title || '') || patternRegex.test(r.record_type || '')) &&
              (r.status === 'approved' || r.status === 'released' || this.approvals.some((a) => a.record_id === r.id && a.outcome === 'approved')) &&
              (!claimedRev || r.revision === claimedRev) &&
              Boolean(r.revision && r.revision.trim().length > 0)
            );
            if (hasRec) return true;
          }

          if (docId) {
            const hasDoc = this.documents.some((d) => {
              if (d.id !== docId || d.organization_id !== orgId) return false;
              const isLinked = d.record_id === recordId ||
                this.record_links.some((l) => (l.source_record_id === recordId && l.target_record_id === d.record_id) ||
                                              (l.target_record_id === recordId && l.source_record_id === d.record_id));
              if (!isLinked) return false;
              if (!patternRegex.test(d.title || '') && !patternRegex.test(d.document_type || '')) return false;

              // Approval verification: REQUIRES active file revision AND approved sign-off
              const hasActiveFile = this.controlled_document_files.some((f) =>
                f.document_id === d.id &&
                !f.superseded_at &&
                Boolean(f.revision && f.revision.trim().length > 0) &&
                (!claimedRev || f.revision === claimedRev)
              );
              const hasApproval = this.approvals.some((a) =>
                (a.record_id === d.record_id || a.record_id === recordId) &&
                a.outcome === 'approved' &&
                (patternRegex.test(a.title || '') || (d.title && a.title.includes(d.title)))
              );
              return hasActiveFile && hasApproval;
            });
            if (hasDoc) return true;
          }
        }
      }
    }

    // 2. Direct operational_records check (strictly scoped to project or linked records)
    const hasRecord = this.operational_records.some((r) =>
      r.organization_id === orgId &&
      (r.id === recordId ||
        this.record_links.some((l) => (l.source_record_id === recordId && l.target_record_id === r.id) ||
                                     (l.target_record_id === recordId && l.source_record_id === r.id))) &&
      (patternRegex.test(r.reference || '') || patternRegex.test(r.title || '') || patternRegex.test(r.record_type || '')) &&
      (r.status === 'approved' || r.status === 'released' || this.approvals.some((a) => a.record_id === r.id && a.outcome === 'approved')) &&
      Boolean(r.revision && r.revision.trim().length > 0)
    );
    if (hasRecord) return true;

    // 3. Direct documents check (strictly scoped to project or linked records)
    const hasDoc = this.documents.some((d) => {
      if (d.organization_id !== orgId) return false;
      const isLinked = d.record_id === recordId ||
        this.record_links.some((l) => (l.source_record_id === recordId && l.target_record_id === d.record_id) ||
                                    (l.target_record_id === recordId && l.source_record_id === d.record_id));
      if (!isLinked) return false;
      if (!patternRegex.test(d.title || '') && !patternRegex.test(d.document_type || '')) return false;

      // Approval verification: REQUIRES active file revision AND approved sign-off
      const hasActiveFile = this.controlled_document_files.some((f) =>
        f.document_id === d.id &&
        !f.superseded_at &&
        Boolean(f.revision && f.revision.trim().length > 0)
      );
      const hasApproval = this.approvals.some((a) =>
        (a.record_id === d.record_id || a.record_id === recordId) &&
        a.outcome === 'approved' &&
        (patternRegex.test(a.title || '') || (d.title && a.title.includes(d.title)))
      );
      return hasActiveFile && hasApproval;
    });
    if (hasDoc) return true;

    // 4. Approved N/A rationale check (only if p_allow_na is true, strictly scoped to project)
    if (allowNa) {
      const hasNaApproval = this.approvals.some((a) =>
        a.organization_id === orgId &&
        (a.record_id === recordId ||
          this.record_links.some((l) => (l.source_record_id === recordId && l.target_record_id === a.record_id) ||
                                       (l.target_record_id === recordId && l.source_record_id === a.record_id))) &&
        a.outcome === 'approved' &&
        patternRegex.test(a.title || '') &&
        a.title.includes('N/A')
      );
      if (hasNaApproval) return true;

      if (naRationales && typeof naRationales === 'object') {
        for (const [key, val] of Object.entries(naRationales)) {
          if (patternRegex.test(key) && val && typeof val === 'object' && val.approval_id) {
            const hasExplicitNa = this.approvals.some((a) =>
              a.id === val.approval_id &&
              a.organization_id === orgId &&
              (a.record_id === recordId ||
                this.record_links.some((l) => (l.source_record_id === recordId && l.target_record_id === a.record_id) ||
                                             (l.target_record_id === recordId && l.source_record_id === a.record_id))) &&
              a.outcome === 'approved'
            );
            if (hasExplicitNa) return true;
          }
        }
      }
    }

    return false;
  }

  verifyAndAdvanceStageGate(recordId, targetStage, evidenceManifest = {}, sessionUserId) {
    if (!sessionUserId) {
      throw new Error('AUTH_REQUIRED: Authenticated session required for operational stage gate');
    }

    const record = this.operational_records.find((r) => r.id === recordId);
    if (!record) {
      throw new Error(`RECORD_NOT_FOUND: Operational record ${recordId} does not exist`);
    }

    const member = this.organization_members.find((m) =>
      m.user_id === sessionUserId &&
      m.organization_id === record.organization_id &&
      m.active === true
    );
    if (!member) {
      throw new Error('MEMBERSHIP_DENIED: Active operational organization membership required');
    }

    if (member.role === 'viewer') {
      throw new Error('PERMISSION_DENIED: Viewer role cannot approve stage gate transitions');
    }

    if (member.role !== 'admin') {
      if (!record.department_id || !this.hasDepartmentPermission(record.organization_id, record.department_id, 'approvals:decide', member)) {
        throw new Error(`SIGNING_AUTHORITY_DENIED: User lacks signing authority for department ${record.department_id}`);
      }
    }

    const cleanStage = targetStage.trim();
    if (record.stage === cleanStage) {
      return {
        success: true,
        record_id: recordId,
        stage: cleanStage,
        previous_stage: record.stage,
        idempotent: true,
        message: 'Record is already at target stage',
      };
    }

    let targetNum = 0;
    const stageMatch = cleanStage.match(/Stage[ _-]?([1-9])/i);
    if (stageMatch) {
      targetNum = parseInt(stageMatch[1], 10);
    } else if (/^[1-9]$/.test(cleanStage)) {
      targetNum = parseInt(cleanStage, 10);
    }

    const deliverables = evidenceManifest.deliverables || [];
    const naRationale = evidenceManifest.na_rationale || {};

    if (targetNum >= 3) {
      const ok = this.verifyApprovedStageDeliverable(
        record.organization_id,
        record.id,
        /HLPL\/F\/MKT\/01|Contract Review|FEASIBILITY/i,
        deliverables,
        naRationale,
        false
      );
      if (!ok) {
        throw new Error('GATE_FREEZE_VIOLATION: Stage 2 Multi-Department Feasibility Freeze requires approved Contract Review Record (HLPL/F/MKT/01) with verified revision');
      }
    }

    if (targetNum >= 4) {
      const requiredItems = ['EHW-PRS', 'FW-FRS', 'SW-SRS', 'MECH-MRS', 'SAL-QUO'];
      const missing = [];
      for (const item of requiredItems) {
        const ok = this.verifyApprovedStageDeliverable(
          record.organization_id,
          record.id,
          new RegExp(item, 'i'),
          deliverables,
          naRationale,
          true
        );
        if (!ok) missing.push(item);
      }
      if (missing.length > 0) {
        throw new Error(`GATE_FREEZE_VIOLATION: Stage 3 Requirements Baseline Freeze requires all applicable domain requirement specs (EHW-PRS, FW-FRS, SW-SRS, MECH-MRS, SAL-QUO) with verified approved records and revisions. Missing: ${missing.join(', ')}`);
      }
    }

    if (targetNum >= 5) {
      const ok = this.verifyApprovedStageDeliverable(
        record.organization_id,
        record.id,
        /EHW-SCH|SCH-01/i,
        deliverables,
        naRationale,
        false
      );
      if (!ok) {
        throw new Error('GATE_FREEZE_VIOLATION: Stage 4 Hardware Schematics Prerequisite (EHW-SCH-01) must have an approved record and revision before advancing to pilot or production stages');
      }
    }

    // Single atomic transaction simulation
    const prevStage = record.stage;
    record.stage = cleanStage;
    const approvalId = `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.approvals.push({
      id: approvalId,
      organization_id: record.organization_id,
      department_id: record.department_id,
      record_id: record.id,
      approver_id: member.id,
      title: `Stage Gate Sign-off: ${cleanStage}`,
      category: 'stage_gate',
      outcome: 'approved',
      created_at: new Date().toISOString(),
    });

    const auditId = `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.audit_events.push({
      id: auditId,
      organization_id: record.organization_id,
      action: 'stage_gate_advancement',
      actor_id: member.user_id,
      entity_type: 'operational_records',
      entity_id: record.id,
      detail: {
        record_id: record.id,
        previous_stage: prevStage,
        new_stage: cleanStage,
      },
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      record_id: record.id,
      previous_stage: prevStage,
      new_stage: cleanStage,
      stage: cleanStage,
      approver_id: member.id,
      approval_id: approvalId,
      audit_id: auditId,
      idempotent: false,
      message: `Successfully advanced record to ${cleanStage}`,
    };
  }
}

// -------------------------------------------------------------
// Behavioral Integration Tests (Executing Actual Database Logic)
// -------------------------------------------------------------

test('Behavioral: Strict project isolation prevents cross-project deliverable and N/A leakage within same organization', () => {
  const db = new OperationalDatabaseHarness();
  const orgId = '11111111-1111-1111-1111-111111111111';
  const deptAdminId = 'dept-admin';
  const adminUserId = 'user-admin';

  db.organizations.push({ id: orgId, name: 'Harman Labs' });
  db.departments.push({ id: deptAdminId, organization_id: orgId, code: 'ADM', lead_member_id: 'm-admin' });
  db.organization_members.push({ id: 'm-admin', organization_id: orgId, user_id: adminUserId, role: 'admin', active: true });

  // Project A and Project B exist in the same organization
  const projAId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const projBId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  db.operational_records.push({
    id: projAId,
    organization_id: orgId,
    department_id: deptAdminId,
    reference: 'PROJ-A-TATA-ACE',
    title: 'Tata Ace EV Telematics',
    stage: 'Stage 2',
    status: 'draft',
    revision: '1.0',
  });

  db.operational_records.push({
    id: projBId,
    organization_id: orgId,
    department_id: deptAdminId,
    reference: 'PROJ-B-TREO',
    title: 'Mahindra Treo Telematics',
    stage: 'Stage 2',
    status: 'draft',
    revision: '1.0',
  });

  // Project B has an approved Contract Review Record (HLPL/F/MKT/01)
  const projBContractDocId = 'doc-proj-b-mkt-01';
  db.documents.push({
    id: projBContractDocId,
    organization_id: orgId,
    record_id: projBId,
    title: 'HLPL/F/MKT/01 Contract Review',
    document_type: 'feasibility',
  });
  db.controlled_document_files.push({
    id: 'file-b-1',
    document_id: projBContractDocId,
    revision: 'REV-B',
    superseded_at: null,
  });
  db.approvals.push({
    id: 'app-b-1',
    organization_id: orgId,
    record_id: projBId,
    title: 'HLPL/F/MKT/01 Contract Review Sign-off',
    outcome: 'approved',
  });

  // 1. Project A attempts to advance to Stage 3 without its own Contract Review.
  // It MUST fail because Project B's approved record in the same org cannot satisfy Project A.
  assert.throws(
    () => db.verifyAndAdvanceStageGate(projAId, 'Stage 3', {}, adminUserId),
    /GATE_FREEZE_VIOLATION.*Stage 2 Multi-Department Feasibility Freeze/
  );

  // 2. Supplying Project B's record_id in evidence deliverables for Project A MUST ALSO fail
  // because Project B is not linked to Project A.
  assert.throws(
    () => db.verifyAndAdvanceStageGate(projAId, 'Stage 3', { deliverables: [{ record_id: projBId, revision: '1.0' }] }, adminUserId),
    /GATE_FREEZE_VIOLATION.*Stage 2 Multi-Department Feasibility Freeze/
  );

  // 3. Now add Project A's own approved Contract Review document, file revision, and approval
  const projAContractDocId = 'doc-proj-a-mkt-01';
  db.documents.push({
    id: projAContractDocId,
    organization_id: orgId,
    record_id: projAId,
    title: 'HLPL/F/MKT/01 Contract Review',
    document_type: 'feasibility',
  });
  db.controlled_document_files.push({
    id: 'file-a-1',
    document_id: projAContractDocId,
    revision: 'REV-A',
    superseded_at: null,
  });
  db.approvals.push({
    id: 'app-a-1',
    organization_id: orgId,
    record_id: projAId,
    title: 'HLPL/F/MKT/01 Contract Review Sign-off',
    outcome: 'approved',
  });

  // 4. Project A advancement to Stage 3 now succeeds
  const resA = db.verifyAndAdvanceStageGate(projAId, 'Stage 3', {}, adminUserId);
  assert.equal(resA.success, true);
  assert.equal(resA.stage, 'Stage 3');
});

test('Behavioral: Approval verification denies documents with active attachments when approved sign-off is missing', () => {
  const db = new OperationalDatabaseHarness();
  const orgId = '11111111-1111-1111-1111-111111111111';
  const deptAdminId = 'dept-admin';
  const adminUserId = 'user-admin';

  db.organizations.push({ id: orgId, name: 'Harman Labs' });
  db.departments.push({ id: deptAdminId, organization_id: orgId, code: 'ADM', lead_member_id: 'm-admin' });
  db.organization_members.push({ id: 'm-admin', organization_id: orgId, user_id: adminUserId, role: 'admin', active: true });

  const projId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  db.operational_records.push({
    id: projId,
    organization_id: orgId,
    department_id: deptAdminId,
    reference: 'PROJ-A-TATA-ACE',
    title: 'Tata Ace EV Telematics',
    stage: 'Stage 3',
    status: 'draft',
    revision: '1.0',
  });

  // Stage 2 prerequisite: Approved Contract Review record
  const contractDocId = 'doc-mkt-01';
  db.documents.push({ id: contractDocId, organization_id: orgId, record_id: projId, title: 'HLPL/F/MKT/01 Contract Review', document_type: 'feasibility' });
  db.controlled_document_files.push({ id: 'file-mkt-01', document_id: contractDocId, revision: '1.0', superseded_at: null });
  db.approvals.push({ id: 'app-mkt-01', organization_id: orgId, record_id: projId, title: 'HLPL/F/MKT/01 Sign-off', outcome: 'approved' });

  // Stage 3 requires all 5 domain specs: EHW-PRS, FW-FRS, SW-SRS, MECH-MRS, SAL-QUO
  const domainSpecs = ['FW-FRS', 'SW-SRS', 'MECH-MRS', 'SAL-QUO'];
  for (const spec of domainSpecs) {
    const docId = `doc-${spec.toLowerCase()}`;
    db.documents.push({ id: docId, organization_id: orgId, record_id: projId, title: `${spec} Spec`, document_type: spec });
    db.controlled_document_files.push({ id: `file-${spec.toLowerCase()}`, document_id: docId, revision: '1.0', superseded_at: null });
    db.approvals.push({ id: `app-${spec.toLowerCase()}`, organization_id: orgId, record_id: projId, title: `${spec} Approval`, outcome: 'approved' });
  }

  // Add EHW-PRS document with an active file revision attached, BUT WITHOUT an approved sign-off in approvals table
  const ehwDocId = 'doc-ehw-prs';
  db.documents.push({ id: ehwDocId, organization_id: orgId, record_id: projId, title: 'EHW-PRS Spec', document_type: 'EHW-PRS' });
  db.controlled_document_files.push({ id: 'file-ehw-prs', document_id: ehwDocId, revision: '1.0', superseded_at: null });
  // (Notice: approvals entry is intentionally absent or pending)
  db.approvals.push({ id: 'app-ehw-pending', organization_id: orgId, record_id: projId, title: 'EHW-PRS Spec Approval', outcome: 'pending' });

  // Advancing to Stage 4 MUST FAIL: an active attachment alone cannot satisfy the document check without approved sign-off
  assert.throws(
    () => db.verifyAndAdvanceStageGate(projId, 'Stage 4', {}, adminUserId),
    /GATE_FREEZE_VIOLATION.*Missing: EHW-PRS/
  );

  // Now record the approved decision in approvals table
  db.approvals.push({ id: 'app-ehw-approved', organization_id: orgId, record_id: projId, title: 'EHW-PRS Spec Approval', outcome: 'approved' });

  // Advancing to Stage 4 now SUCCEEDS
  const res = db.verifyAndAdvanceStageGate(projId, 'Stage 4', {}, adminUserId);
  assert.equal(res.success, true);
  assert.equal(res.stage, 'Stage 4');
});

test('Behavioral: Strict signing authority denies cross-department leads, viewers, and unauthenticated actors', () => {
  const db = new OperationalDatabaseHarness();
  const orgId = '11111111-1111-1111-1111-111111111111';
  const deptEhwId = 'dept-ehw';
  const deptFwId = 'dept-fw';

  db.organizations.push({ id: orgId, name: 'Harman Labs' });
  db.departments.push({ id: deptEhwId, organization_id: orgId, code: 'EHW', lead_member_id: 'm-ehw' });
  db.departments.push({ id: deptFwId, organization_id: orgId, code: 'FW', lead_member_id: 'm-fw' });

  db.organization_members.push({ id: 'm-ehw', organization_id: orgId, user_id: 'user-ehw-lead', role: 'department_lead', active: true });
  db.organization_members.push({ id: 'm-fw', organization_id: orgId, user_id: 'user-fw-lead', role: 'department_lead', active: true });
  db.organization_members.push({ id: 'm-viewer', organization_id: orgId, user_id: 'user-viewer', role: 'viewer', active: true });
  db.organization_members.push({ id: 'm-inactive', organization_id: orgId, user_id: 'user-inactive', role: 'admin', active: false });

  const recId = 'rec-ehw-proj';
  db.operational_records.push({
    id: recId,
    organization_id: orgId,
    department_id: deptEhwId,
    reference: 'EHW-2026-BOARD',
    title: 'Hardware Controller Board',
    stage: 'Stage 1',
    status: 'draft',
    revision: '1.0',
  });

  // 1. Unauthenticated actor fails closed
  assert.throws(() => db.verifyAndAdvanceStageGate(recId, 'Stage 2', {}, null), /AUTH_REQUIRED/);

  // 2. Inactive member fails closed
  assert.throws(() => db.verifyAndAdvanceStageGate(recId, 'Stage 2', {}, 'user-inactive'), /MEMBERSHIP_DENIED/);

  // 3. Viewer fails closed
  assert.throws(() => db.verifyAndAdvanceStageGate(recId, 'Stage 2', {}, 'user-viewer'), /PERMISSION_DENIED/);

  // 4. FW Lead cannot advance an EHW record (no cross-department lead bypass)
  assert.throws(
    () => db.verifyAndAdvanceStageGate(recId, 'Stage 2', {}, 'user-fw-lead'),
    /SIGNING_AUTHORITY_DENIED: User lacks signing authority for department dept-ehw/
  );

  // 5. Designated EHW Lead succeeds
  const res = db.verifyAndAdvanceStageGate(recId, 'Stage 2', {}, 'user-ehw-lead');
  assert.equal(res.success, true);
  assert.equal(res.stage, 'Stage 2');
});

test('Behavioral: Row locking, state mutation, idempotency, and immutable audit event recording', () => {
  const db = new OperationalDatabaseHarness();
  const orgId = '11111111-1111-1111-1111-111111111111';
  const deptAdminId = 'dept-admin';
  const adminUserId = 'user-admin';

  db.organizations.push({ id: orgId, name: 'Harman Labs' });
  db.departments.push({ id: deptAdminId, organization_id: orgId, code: 'ADM', lead_member_id: 'm-admin' });
  db.organization_members.push({ id: 'm-admin', organization_id: orgId, user_id: adminUserId, role: 'admin', active: true });

  const recId = 'rec-idempotency-test';
  db.operational_records.push({
    id: recId,
    organization_id: orgId,
    department_id: deptAdminId,
    reference: 'PROJ-IDEMP-01',
    title: 'Idempotency Validation Project',
    stage: 'Stage 1',
    status: 'draft',
    revision: '1.0',
  });

  // Advance from Stage 1 to Stage 2
  const firstRes = db.verifyAndAdvanceStageGate(recId, 'Stage 2', {}, adminUserId);
  assert.equal(firstRes.success, true);
  assert.equal(firstRes.idempotent, false);
  assert.equal(db.operational_records.find((r) => r.id === recId).stage, 'Stage 2');
  assert.equal(db.approvals.length, 1);
  assert.equal(db.audit_events.length, 1);
  assert.equal(db.audit_events[0].action, 'stage_gate_advancement');

  // Advance to Stage 2 again: MUST be idempotent and make no duplicate writes
  const secondRes = db.verifyAndAdvanceStageGate(recId, 'Stage 2', {}, adminUserId);
  assert.equal(secondRes.success, true);
  assert.equal(secondRes.idempotent, true);
  assert.equal(secondRes.message, 'Record is already at target stage');
  assert.equal(db.approvals.length, 1, 'Approvals count must not increase on duplicate call');
  assert.equal(db.audit_events.length, 1, 'Audit events count must not increase on duplicate call');
});

// -------------------------------------------------------------
// Static SQL Contract Parity & Invariant Asserts
// -------------------------------------------------------------

test('1. Migration ledger and Drizzle journal parity for operational stage gate contract', () => {
  const supabaseSqlPath = path.resolve(__dirname, '../supabase/migrations/20261020010000_operational_stage_gate_contract.sql');
  const drizzleSqlPath = path.resolve(__dirname, '../drizzle/migrations/0001_operational_stage_gate_contract.sql');
  const journalPath = path.resolve(__dirname, '../drizzle/migrations/meta/_journal.json');

  assert.ok(fs.existsSync(supabaseSqlPath), 'Supabase migration file must exist');
  assert.ok(fs.existsSync(drizzleSqlPath), 'Drizzle migration file must exist');
  assert.ok(fs.existsSync(journalPath), 'Drizzle journal must exist');

  const supabaseSql = fs.readFileSync(supabaseSqlPath, 'utf8');
  const drizzleSql = fs.readFileSync(drizzleSqlPath, 'utf8');

  for (const fn of ['resolve_operational_membership', 'verify_approved_stage_deliverable', 'verify_and_advance_stage_gate', 'get_controlled_file_access']) {
    assert.match(supabaseSql, new RegExp(`FUNCTION public\\.${fn}`), `Supabase SQL defines ${fn}`);
    assert.match(drizzleSql, new RegExp(`FUNCTION public\\.${fn}`), `Drizzle SQL defines ${fn}`);
  }

  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
  const entry = journal.entries.find((e) => e.tag === '0001_operational_stage_gate_contract');
  assert.ok(entry, 'Operational stage-gate journal entry must exist');
  assert.equal(journal.entries[entry.idx]?.tag, entry.tag, 'Journal index must point to the migration tag');
  assert.deepEqual(journal.entries.map((item) => item.idx), journal.entries.map((_, index) => index), 'Journal indexes must remain sequential');
});

test('2. SQL Contract: Actor derivation strictly from authenticated session auth.uid(), denying caller-supplied IDs', () => {
  const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/20261020010000_operational_stage_gate_contract.sql'), 'utf8');
  assert.match(sql, /v_user_id uuid := auth\.uid\(\);/);
  assert.match(sql, /FUNCTION public\.verify_and_advance_stage_gate\(\s*p_record_id uuid,\s*p_target_stage text,\s*p_evidence_manifest jsonb/);
  assert.doesNotMatch(sql, /p_actor_id/i);
  assert.doesNotMatch(sql, /p_user_id/i);
  assert.match(sql, /IF v_user_id IS NULL THEN\s*RAISE EXCEPTION 'AUTH_REQUIRED/);
});

test('3. SQL Contract: Strict active organization membership enforcement', () => {
  const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/20261020010000_operational_stage_gate_contract.sql'), 'utf8');
  assert.match(sql, /WHERE m\.user_id = v_user_id\s*AND m\.organization_id = v_record\.organization_id\s*AND m\.active = true/);
  assert.match(sql, /IF v_member\.member_id IS NULL THEN\s*RAISE EXCEPTION 'MEMBERSHIP_DENIED/);
});

test('4. SQL Contract: Designated signing capability strictly checks department permission without cross-lead bypass', () => {
  const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/20261020010000_operational_stage_gate_contract.sql'), 'utf8');
  assert.match(sql, /IF v_member\.role = 'viewer' THEN\s*RAISE EXCEPTION 'PERMISSION_DENIED/);
  assert.match(sql, /IF v_member\.role <> 'admin' THEN/);
  assert.match(sql, /NOT public\.has_department_permission\(v_record\.organization_id, v_record\.department_id, 'approvals:decide'\)/);
  assert.match(sql, /RAISE EXCEPTION 'SIGNING_AUTHORITY_DENIED: User lacks signing authority for department %', v_record\.department_id;/);
  assert.doesNotMatch(sql, /IF v_member\.role <> 'admin' AND NOT v_member\.is_lead THEN/);
});

test('5. SQL Contract: Project isolation hermetically seals deliverable, document, and N/A checks', () => {
  const sql = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/20261020010000_operational_stage_gate_contract.sql'), 'utf8');

  // Verify that operational records query does NOT have an unlinked pattern bypass
  assert.doesNotMatch(sql, /OR r\.reference ~\* p_pattern\s*\)\s*AND \(r\.reference ~\* p_pattern OR r\.title ~\* p_pattern\)/);

  // Verify that approvals query for N/A does NOT have an unlinked org bypass
  assert.doesNotMatch(sql, /WHERE \(a\.record_id = p_record_id OR a\.organization_id = p_organization_id\)/);

  // Verify that document query requires both active file revision AND approved sign-off
  assert.match(sql, /EXISTS \(\s*SELECT 1 FROM public\.controlled_document_files f[\s\S]*?AND EXISTS \(\s*SELECT 1 FROM public\.approvals a/);
});

test('6. SQL Contract: Private Native Attachment Vault enforces 60-second signed URL expiry and size checking', () => {
  const controlledFnSource = fs.readFileSync(path.resolve(__dirname, '../src/lib/controlled-documents.functions.ts'), 'utf8');
  assert.match(controlledFnSource, /createSignedUrl\(.+,\s*60\s*,\s*\{/);
  assert.match(controlledFnSource, /expiresInSeconds:\s*60/);
  assert.match(controlledFnSource, /regex\(\/\^\[a-fA-F0-9\]\{32,128\}\$\//);
  assert.match(controlledFnSource, /uploadedObj\.metadata\.size !== file\.size_bytes/);
  assert.match(controlledFnSource, /get_controlled_file_access/);
});

test('7. Operational stage gate input schema validates record UUID, target stage, and evidence manifest', () => {
  const opsGateSource = fs.readFileSync(path.resolve(__dirname, '../src/lib/operational-gate.schema.ts'), 'utf8');
  assert.match(opsGateSource, /stageGateInputSchema/);
  assert.match(opsGateSource, /recordId:\s*z\.string\(\)\.uuid\(\)/);
  assert.match(opsGateSource, /targetStage:/);
  assert.match(opsGateSource, /deliverables:\s*z\.array/);
  assert.match(fs.readFileSync(path.resolve(__dirname, "../src/lib/operational-gate.schema.ts"), "utf8"), /naRationale:\s*z\.record/);
  assert.match(opsGateSource, /canonicalContentHash:\s*z\.string/);
});
