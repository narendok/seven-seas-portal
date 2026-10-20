-- Additive correction: old approvals remain intact but cannot approve an unbound revision.
ALTER TABLE public.approvals
  ADD COLUMN IF NOT EXISTS evidence_record_id uuid REFERENCES public.operational_records(id),
  ADD COLUMN IF NOT EXISTS evidence_document_id uuid REFERENCES public.documents(id),
  ADD COLUMN IF NOT EXISTS evidence_revision text,
  ADD COLUMN IF NOT EXISTS evidence_checksum text,
  ADD COLUMN IF NOT EXISTS evidence_requirement text,
  ADD COLUMN IF NOT EXISTS evidence_is_na boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.bind_approval_evidence_revision()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_record public.operational_records%ROWTYPE;
  v_document public.documents%ROWTYPE;
  v_file public.controlled_document_files%ROWTYPE;
  v_count integer;
  v_department uuid;
  v_member uuid;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.outcome = 'approved'
    AND (OLD.evidence_record_id IS NOT NULL OR OLD.evidence_document_id IS NOT NULL)
    AND ROW(NEW.evidence_record_id, NEW.evidence_document_id, NEW.evidence_revision,
            NEW.evidence_checksum, NEW.evidence_requirement, NEW.evidence_is_na,
            NEW.organization_id, NEW.record_id, NEW.decided_by, NEW.approver_id, NEW.decided_at)
        IS DISTINCT FROM
        ROW(OLD.evidence_record_id, OLD.evidence_document_id, OLD.evidence_revision,
            OLD.evidence_checksum, OLD.evidence_requirement, OLD.evidence_is_na,
            OLD.organization_id, OLD.record_id, OLD.decided_by, OLD.approver_id, OLD.decided_at) THEN
    RAISE EXCEPTION 'APPROVED_EVIDENCE_IMMUTABLE: Create a new approval for a changed revision';
  END IF;
  IF NEW.evidence_record_id IS NULL AND NEW.evidence_document_id IS NULL THEN RETURN NEW; END IF;
  IF num_nonnulls(NEW.evidence_record_id, NEW.evidence_document_id) <> 1
    OR NULLIF(trim(NEW.evidence_revision), '') IS NULL THEN
    RAISE EXCEPTION 'EVIDENCE_BINDING_REQUIRED: Exactly one evidence identity and revision are required';
  END IF;
  IF NEW.evidence_is_na AND (NEW.evidence_record_id IS NULL OR NULLIF(trim(NEW.evidence_requirement),'') IS NULL) THEN
    RAISE EXCEPTION 'NA_BINDING_REQUIRED: N/A must identify a record revision and requirement';
  END IF;
  IF NEW.outcome <> 'approved' THEN RETURN NEW; END IF;
  IF auth.uid() IS NULL OR NEW.decided_by IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'AUTH_REQUIRED: Evidence decisions must be made by the authenticated signer';
  END IF;
  SELECT id INTO v_member FROM public.organization_members
    WHERE organization_id = NEW.organization_id AND user_id = auth.uid() AND active;
  IF v_member IS NULL OR NEW.approver_id IS DISTINCT FROM v_member THEN
    RAISE EXCEPTION 'SIGNER_MEMBERSHIP_REQUIRED';
  END IF;
  IF NEW.evidence_record_id IS NOT NULL THEN
    SELECT * INTO v_record FROM public.operational_records WHERE id = NEW.evidence_record_id FOR SHARE;
    IF NOT FOUND OR v_record.organization_id <> NEW.organization_id OR v_record.archived_at IS NOT NULL
      OR v_record.fields->>'revision' IS DISTINCT FROM NEW.evidence_revision THEN
      RAISE EXCEPTION 'EVIDENCE_REVISION_MISMATCH';
    END IF;
    v_department := v_record.department_id;
    NEW.evidence_checksum := encode(sha256(convert_to(v_record.fields::text, 'UTF8')), 'hex');
    IF NEW.record_id IS DISTINCT FROM v_record.id THEN RAISE EXCEPTION 'EVIDENCE_RECORD_MISMATCH'; END IF;
  ELSE
    SELECT * INTO v_document FROM public.documents WHERE id = NEW.evidence_document_id FOR SHARE;
    IF NOT FOUND OR v_document.organization_id <> NEW.organization_id
      OR NEW.record_id IS DISTINCT FROM v_document.record_id THEN RAISE EXCEPTION 'EVIDENCE_DOCUMENT_MISMATCH'; END IF;
    SELECT count(*) INTO v_count FROM public.controlled_document_files
      WHERE document_id = v_document.id AND organization_id = NEW.organization_id
        AND revision = NEW.evidence_revision AND superseded_at IS NULL;
    IF v_count <> 1 THEN RAISE EXCEPTION 'ACTIVE_REVISION_REQUIRED: Expected one active file for this document revision'; END IF;
    SELECT * INTO v_file FROM public.controlled_document_files
      WHERE document_id = v_document.id AND organization_id = NEW.organization_id
        AND revision = NEW.evidence_revision AND superseded_at IS NULL FOR SHARE;
    IF v_file.checksum !~ '^[a-fA-F0-9]{64}$' THEN RAISE EXCEPTION 'SHA256_REQUIRED'; END IF;
    v_department := v_file.department_id;
    NEW.evidence_checksum := lower(v_file.checksum);
  END IF;
  IF NOT public.has_organization_role(NEW.organization_id, ARRAY['admin'::public.app_role])
    AND (v_department IS NULL OR NOT public.has_department_permission(NEW.organization_id, v_department, 'approvals:decide')) THEN
    RAISE EXCEPTION 'SIGNING_AUTHORITY_DENIED';
  END IF;
  -- Timestamp and digest are server-derived, never caller claims.
  IF TG_OP = 'INSERT' OR OLD.outcome <> 'approved' THEN NEW.decided_at := now(); END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS bind_approval_evidence_revision ON public.approvals;
CREATE TRIGGER bind_approval_evidence_revision BEFORE INSERT OR UPDATE ON public.approvals
  FOR EACH ROW EXECUTE FUNCTION public.bind_approval_evidence_revision();
REVOKE ALL ON FUNCTION public.bind_approval_evidence_revision() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.verify_approved_stage_deliverable(
  p_organization_id uuid, p_record_id uuid, p_pattern text, p_deliverables jsonb,
  p_na_rationales jsonb, p_allow_na boolean DEFAULT false
) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_item jsonb;
  v_na record;
  v_explicit boolean := false;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_organization_member(p_organization_id) THEN RAISE EXCEPTION 'MEMBERSHIP_DENIED'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.operational_records WHERE id = p_record_id AND organization_id = p_organization_id AND archived_at IS NULL) THEN RETURN false; END IF;
  IF jsonb_typeof(COALESCE(p_deliverables,'[]'::jsonb)) <> 'array'
    OR jsonb_typeof(COALESCE(p_na_rationales,'{}'::jsonb)) <> 'object' THEN RAISE EXCEPTION 'INVALID_EVIDENCE_MANIFEST'; END IF;
  FOR v_item IN SELECT value FROM jsonb_array_elements(COALESCE(p_deliverables,'[]'::jsonb)) LOOP
    IF jsonb_typeof(v_item) <> 'object' OR num_nonnulls(v_item->>'record_id',v_item->>'document_id') <> 1
      OR NULLIF(trim(v_item->>'revision'),'') IS NULL OR v_item->>'approval_id' IS NULL THEN RAISE EXCEPTION 'STRUCTURED_EVIDENCE_REQUIRED'; END IF;
    -- Cast now to reject malformed identifiers even when they do not match a candidate.
    PERFORM (COALESCE(v_item->>'record_id',v_item->>'document_id'))::uuid, (v_item->>'approval_id')::uuid;
    v_explicit := true;
  END LOOP;

  IF EXISTS (
    SELECT 1 FROM public.operational_records r
    JOIN public.approvals a ON a.evidence_record_id = r.id
      AND a.record_id = r.id AND a.organization_id = r.organization_id
      AND a.evidence_revision = r.fields->>'revision'
      AND a.evidence_checksum = encode(sha256(convert_to(r.fields::text,'UTF8')),'hex')
      AND a.outcome = 'approved' AND NOT a.evidence_is_na AND a.decided_at IS NOT NULL
    JOIN public.organization_members m ON m.id = a.approver_id AND m.user_id = a.decided_by
      AND m.organization_id = a.organization_id AND m.active
    WHERE r.organization_id = p_organization_id AND r.archived_at IS NULL
      AND (r.id = p_record_id OR EXISTS (SELECT 1 FROM public.record_links l
        WHERE l.organization_id = p_organization_id AND
          ((l.source_record_id = p_record_id AND l.target_record_id = r.id) OR (l.target_record_id = p_record_id AND l.source_record_id = r.id))))
      AND (r.reference ~* p_pattern OR r.title ~* p_pattern OR r.record_type ~* p_pattern)
      AND r.status IN ('approved','released')
      AND (NOT v_explicit OR EXISTS (SELECT 1 FROM jsonb_array_elements(p_deliverables) e
        WHERE e->>'record_id' = r.id::text AND e->>'revision' = a.evidence_revision AND e->>'approval_id' = a.id::text))
  ) THEN RETURN true; END IF;

  IF EXISTS (
    SELECT 1 FROM public.documents d
    JOIN public.operational_records r ON r.id = d.record_id AND r.organization_id = d.organization_id AND r.archived_at IS NULL
    JOIN public.controlled_document_files f ON f.document_id = d.id AND f.organization_id = d.organization_id
      AND f.superseded_at IS NULL AND f.checksum ~ '^[a-fA-F0-9]{64}$'
    JOIN public.approvals a ON a.evidence_document_id = d.id AND a.organization_id = d.organization_id
      AND a.record_id = d.record_id AND a.evidence_revision = f.revision
      AND a.evidence_checksum = lower(f.checksum) AND a.outcome = 'approved' AND NOT a.evidence_is_na
      AND a.decided_at >= f.uploaded_at
    JOIN public.organization_members m ON m.id = a.approver_id AND m.user_id = a.decided_by
      AND m.organization_id = a.organization_id AND m.active
    WHERE d.organization_id = p_organization_id
      AND (d.record_id = p_record_id OR EXISTS (SELECT 1 FROM public.record_links l
        WHERE l.organization_id = p_organization_id AND
          ((l.source_record_id = p_record_id AND l.target_record_id = d.record_id) OR (l.target_record_id = p_record_id AND l.source_record_id = d.record_id))))
      AND (d.title ~* p_pattern OR d.document_type ~* p_pattern)
      AND (NOT v_explicit OR EXISTS (SELECT 1 FROM jsonb_array_elements(p_deliverables) e
        WHERE e->>'document_id' = d.id::text AND e->>'revision' = f.revision AND e->>'approval_id' = a.id::text))
  ) THEN RETURN true; END IF;

  IF p_allow_na THEN
    FOR v_na IN SELECT key, value FROM jsonb_each(COALESCE(p_na_rationales,'{}'::jsonb)) LOOP
      IF jsonb_typeof(v_na.value) <> 'object' OR v_na.value->>'approval_id' IS NULL THEN RAISE EXCEPTION 'STRUCTURED_NA_REQUIRED'; END IF;
      IF v_na.key ~* p_pattern AND EXISTS (
        SELECT 1 FROM public.approvals a
        JOIN public.operational_records r ON r.id = a.evidence_record_id
          AND r.organization_id = a.organization_id AND r.archived_at IS NULL
          AND a.evidence_revision = r.fields->>'revision'
          AND a.evidence_checksum = encode(sha256(convert_to(r.fields::text,'UTF8')),'hex')
        JOIN public.organization_members m ON m.id = a.approver_id AND m.user_id = a.decided_by AND m.active AND m.organization_id = a.organization_id
        WHERE a.id = (v_na.value->>'approval_id')::uuid AND a.organization_id = p_organization_id
          AND a.record_id = r.id AND a.evidence_is_na AND a.evidence_requirement = v_na.key
          AND a.outcome = 'approved' AND a.decided_at IS NOT NULL
          AND (r.id = p_record_id OR EXISTS (SELECT 1 FROM public.record_links l
            WHERE l.organization_id = p_organization_id AND
              ((l.source_record_id = p_record_id AND l.target_record_id = r.id) OR (l.target_record_id = p_record_id AND l.source_record_id = r.id))))
      ) THEN RETURN true; END IF;
    END LOOP;
  END IF;
  RETURN false;
END; $$;
-- Only the checked stage RPC may use this SECURITY DEFINER helper remotely.
REVOKE ALL ON FUNCTION public.verify_approved_stage_deliverable(uuid,uuid,text,jsonb,jsonb,boolean) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.verify_and_advance_stage_gate(
  p_record_id uuid,
  p_target_stage text,
  p_evidence_manifest jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_record public.operational_records%ROWTYPE;
  v_member record;
  v_clean_stage text := TRIM(p_target_stage);
  v_target_num int;
  v_deliverables jsonb := COALESCE(p_evidence_manifest->'deliverables', '[]'::jsonb);
  v_na_rationale jsonb := COALESCE(p_evidence_manifest->'na_rationale', '{}'::jsonb);
  v_content_hash text := COALESCE(p_evidence_manifest->>'canonical_content_hash', '');
  v_req_item text;
  v_missing text[] := ARRAY[]::text[];
  v_approval_id uuid;
  v_audit_id uuid;
  v_has_doc boolean;
BEGIN
  -- 1. Session verification: strictly derive actor from authenticated session
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED: Authenticated session required for operational stage gate';
  END IF;

  -- 2. Concurrency control: select and lock target operational record
  SELECT * INTO v_record
  FROM public.operational_records
  WHERE id = p_record_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'RECORD_NOT_FOUND: Operational record % does not exist', p_record_id;
  END IF;

  -- 3. Verify active organization membership
  SELECT
    m.id AS member_id,
    m.organization_id,
    m.role,
    m.display_name,
    d.id AS department_id,
    d.code AS department_code,
    (d.lead_member_id = m.id OR m.role = 'department_lead') AS is_lead
  INTO v_member
  FROM public.organization_members m
  LEFT JOIN public.departments d
    ON d.organization_id = m.organization_id
    AND d.lead_member_id = m.id
    AND d.active = true
  WHERE m.user_id = v_user_id
    AND m.organization_id = v_record.organization_id
    AND m.active = true
  LIMIT 1;

  IF v_member.member_id IS NULL THEN
    RAISE EXCEPTION 'MEMBERSHIP_DENIED: User is not an active member of organization %', v_record.organization_id;
  END IF;

  -- 4. Verify designated signing capability
  IF v_member.role = 'viewer' THEN
    RAISE EXCEPTION 'PERMISSION_DENIED: Viewer role cannot approve stage gate transitions';
  END IF;

  -- 4. Verify designated signing capability
  -- Department-lead status for another department must NOT bypass the department check
  IF v_member.role <> 'admin' THEN
    IF v_record.department_id IS NULL OR NOT public.has_department_permission(v_record.organization_id, v_record.department_id, 'approvals:decide') THEN
      RAISE EXCEPTION 'SIGNING_AUTHORITY_DENIED: User lacks signing authority for department %', v_record.department_id;
    END IF;
  END IF;

  -- Accept only canonical APQP stage identities; malformed values cannot bypass freezes.
  IF v_clean_stage IS NULL OR v_clean_stage !~ '^(Stage [1-9]|[1-9])$' THEN
    RAISE EXCEPTION 'INVALID_TARGET_STAGE';
  END IF;
  v_target_num := right(v_clean_stage, 1)::integer;

  v_clean_stage := 'Stage ' || v_target_num::text;

  -- 5. Idempotency: if already at target stage, return success without duplicate writes
  IF v_record.stage = v_clean_stage THEN
    RETURN jsonb_build_object(
      'success', true,
      'record_id', p_record_id,
      'stage', v_clean_stage,
      'previous_stage', v_record.stage,
      'idempotent', true,
      'message', 'Record is already at target stage'
    );
  END IF;

  -- 6. Validate gate freezes against verified approved database records & active revisions
  -- A. Stage 2 Multi-Department Feasibility Freeze (moving to Stage 3 or higher)
  IF v_target_num >= 3 THEN
    IF NOT public.verify_approved_stage_deliverable(
      v_record.organization_id,
      v_record.id,
      'HLPL/F/MKT/01|Contract Review|FEASIBILITY',
      v_deliverables,
      v_na_rationale,
      false -- N/A is strictly disallowed for mandatory Contract Review
    ) THEN
      RAISE EXCEPTION 'GATE_FREEZE_VIOLATION: Stage 2 Multi-Department Feasibility Freeze requires approved Contract Review Record (HLPL/F/MKT/01) with verified revision';
    END IF;
  END IF;

  -- B. Stage 3 Requirements Baseline Freeze (moving to Stage 4 or higher)
  IF v_target_num >= 4 THEN
    v_missing := ARRAY[]::text[];
    FOREACH v_req_item IN ARRAY ARRAY['EHW-PRS', 'FW-FRS', 'SW-SRS', 'MECH-MRS', 'SAL-QUO']
    LOOP
      IF NOT public.verify_approved_stage_deliverable(
        v_record.organization_id,
        v_record.id,
        v_req_item,
        v_deliverables,
        v_na_rationale,
        true -- approved N/A rationale verified via approvals table
      ) THEN
        v_missing := array_append(v_missing, v_req_item);
      END IF;
    END LOOP;

    IF array_length(v_missing, 1) > 0 THEN
      RAISE EXCEPTION 'GATE_FREEZE_VIOLATION: Stage 3 Requirements Baseline Freeze requires all applicable domain requirement specs (EHW-PRS, FW-FRS, SW-SRS, MECH-MRS, SAL-QUO) with verified approved records and revisions. Missing: %', array_to_string(v_missing, ', ');
    END IF;
  END IF;

  -- C. Stage 4 Hardware Schematics Prerequisite (moving to Stage 5 or higher)
  IF v_target_num >= 5 THEN
    IF NOT public.verify_approved_stage_deliverable(
      v_record.organization_id,
      v_record.id,
      'EHW-SCH|SCH-01',
      v_deliverables,
      v_na_rationale,
      false
    ) THEN
      RAISE EXCEPTION 'GATE_FREEZE_VIOLATION: Stage 4 Hardware Schematics Prerequisite (EHW-SCH-01) must have an approved record and revision before advancing to pilot or production stages';
    END IF;
  END IF;

  -- 7. Atomic transaction writes
  UPDATE public.operational_records
  SET
    stage = v_clean_stage,
    updated_by = v_user_id,
    updated_at = now(),
    fields = COALESCE(fields, '{}'::jsonb) || jsonb_build_object(
      'last_stage_gate', jsonb_build_object(
        'target_stage', v_clean_stage,
        'approved_at', now(),
        'approved_by', v_member.member_id,
        'canonical_content_hash', v_content_hash
      )
    )
  WHERE id = v_record.id;

  -- Record approval
  INSERT INTO public.approvals (
    organization_id,
    department_id,
    record_id,
    title,
    outcome,
    approver_id,
    protected_action,
    created_by,
    decided_by,
    decided_at
  ) VALUES (
    v_record.organization_id,
    v_record.department_id,
    v_record.id,
    'Stage Gate Sign-off: ' || v_clean_stage,
    'approved',
    v_member.member_id,
    true,
    v_user_id,
    v_user_id,
    now()
  ) RETURNING id INTO v_approval_id;

  -- Record attributable audit event
  INSERT INTO public.audit_events (
    organization_id,
    action,
    actor_id,
    entity_type,
    entity_id,
    detail
  ) VALUES (
    v_record.organization_id,
    'stage_gate_advancement',
    v_user_id,
    'operational_records',
    v_record.id,
    jsonb_build_object(
      'previous_stage', v_record.stage,
      'target_stage', v_clean_stage,
      'actor_user_id', v_user_id,
      'actor_role', v_member.role,
      'evidence_manifest', p_evidence_manifest,
      'approval_id', v_approval_id,
      'approved_at', now()
    )
  ) RETURNING id INTO v_audit_id;

  RETURN jsonb_build_object(
    'success', true,
    'record_id', v_record.id,
    'previous_stage', v_record.stage,
    'new_stage', v_clean_stage,
    'approver_id', v_member.member_id,
    'approval_id', v_approval_id,
    'audit_id', v_audit_id,
    'approved_at', now(),
    'idempotent', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_and_advance_stage_gate(uuid, text, jsonb) TO authenticated;


REVOKE EXECUTE ON FUNCTION public.verify_and_advance_stage_gate(uuid,text,jsonb) FROM PUBLIC, anon;
