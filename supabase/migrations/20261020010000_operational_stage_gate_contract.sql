-- ==============================================================================
-- XYZ Pvt Ltd (HLPL) - Smart Company Management System (SCMS)
-- Database Migration: 20261020010000_operational_stage_gate_contract.sql
-- Batch 3: Backend Operational Gate Contracts & Database Policies / Private Native Attachments
-- Adheres to: IATF 16949:2016 APQP Stage Gates, ISO 9001:2015, ISO 14001, AIS-140
-- ==============================================================================

-- 1. Operational Membership Resolution Contract (distinct from test-only helper)
CREATE OR REPLACE FUNCTION public.resolve_operational_membership()
RETURNS TABLE (
  organization_id uuid,
  organization_name text,
  membership_id uuid,
  display_name text,
  role public.app_role,
  department_id uuid,
  department_code text,
  department_name text,
  is_lead boolean,
  can_sign_stage_gates boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED: Authenticated session required';
  END IF;

  RETURN QUERY
  SELECT
    m.organization_id,
    o.name AS organization_name,
    m.id AS membership_id,
    COALESCE(m.display_name, 'Operational User') AS display_name,
    m.role,
    d.id AS department_id,
    d.code AS department_code,
    d.name AS department_name,
    (d.lead_member_id = m.id OR m.role = 'department_lead') AS is_lead,
    (m.role = 'admin' OR d.lead_member_id = m.id OR m.role = 'department_lead') AS can_sign_stage_gates
  FROM public.organization_members m
  JOIN public.organizations o ON o.id = m.organization_id
  LEFT JOIN public.departments d
    ON d.organization_id = m.organization_id
    AND (d.lead_member_id = m.id OR d.code = (
      SELECT dr.code FROM public.department_role_assignments dra
      JOIN public.department_roles dr ON dr.id = dra.role_id
      WHERE dra.member_id = m.id AND dra.active = true LIMIT 1
    ))
    AND d.active = true
  WHERE m.user_id = v_user_id
    AND m.active = true
  ORDER BY (m.role = 'admin') DESC, (d.lead_member_id = m.id) DESC
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_operational_membership() TO authenticated;

-- 2. Authoritative Atomic Operational Stage Gate Advancement Contract
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

  IF v_member.role <> 'admin' AND NOT v_member.is_lead THEN
    IF NOT public.has_department_permission(v_record.organization_id, v_record.department_id, 'approvals:decide') THEN
      RAISE EXCEPTION 'SIGNING_AUTHORITY_DENIED: User lacks department lead or administrative signing authority';
    END IF;
  END IF;

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

  -- Parse stage number
  IF v_clean_stage ~* 'Stage[ _-]?([1-9])' THEN
    v_target_num := (regexp_match(v_clean_stage, 'Stage[ _-]?([1-9])', 'i'))[1]::int;
  ELSIF v_clean_stage ~ '^[1-9]$' THEN
    v_target_num := v_clean_stage::int;
  ELSE
    v_target_num := 0;
  END IF;

  -- 6. Validate gate freezes
  -- A. Stage 2 Multi-Department Feasibility Freeze (moving to Stage 3 or higher)
  IF v_target_num >= 3 THEN
    v_has_doc := FALSE;
    -- Check manifest deliverables
    IF jsonb_path_exists(v_deliverables, '$[*] ? (@ like_regex "HLPL/F/MKT/01" flag "i" || @ like_regex "Contract Review" flag "i" || @ like_regex "FEASIBILITY" flag "i")') THEN
      v_has_doc := TRUE;
    END IF;
    -- Check database documents or records if not in manifest
    IF NOT v_has_doc THEN
      SELECT EXISTS (
        SELECT 1 FROM public.documents doc
        WHERE doc.record_id = v_record.id
          AND (doc.title ~* 'HLPL/F/MKT/01' OR doc.title ~* 'Contract Review' OR doc.document_type ~* 'feasibility')
      ) INTO v_has_doc;
    END IF;
    -- Check N/A rationale
    IF NOT v_has_doc AND (v_na_rationale->>'HLPL/F/MKT/01' IS NOT NULL AND length(trim(v_na_rationale->>'HLPL/F/MKT/01')) > 0) THEN
      v_has_doc := TRUE;
    END IF;

    IF NOT v_has_doc THEN
      RAISE EXCEPTION 'GATE_FREEZE_VIOLATION: Stage 2 Multi-Department Feasibility Freeze requires approved Contract Review Record (HLPL/F/MKT/01)';
    END IF;
  END IF;

  -- B. Stage 3 Requirements Baseline Freeze (moving to Stage 4 or higher)
  IF v_target_num >= 4 THEN
    v_missing := ARRAY[]::text[];
    FOREACH v_req_item IN ARRAY ARRAY['EHW-PRS', 'FW-FRS', 'SW-SRS', 'MECH-MRS', 'SAL-QUO']
    LOOP
      v_has_doc := FALSE;
      -- Check manifest deliverables array
      IF jsonb_path_exists(v_deliverables, ('$[*] ? (@ like_regex "' || v_req_item || '" flag "i")')::jsonpath) THEN
        v_has_doc := TRUE;
      END IF;
      -- Check database documents
      IF NOT v_has_doc THEN
        SELECT EXISTS (
          SELECT 1 FROM public.documents doc
          WHERE doc.record_id = v_record.id
            AND (doc.title ~* v_req_item OR doc.document_type ~* v_req_item)
        ) INTO v_has_doc;
      END IF;
      -- Check approved N/A rationale
      IF NOT v_has_doc AND (v_na_rationale->>v_req_item IS NOT NULL AND length(trim(v_na_rationale->>v_req_item)) > 0) THEN
        v_has_doc := TRUE;
      END IF;

      IF NOT v_has_doc THEN
        v_missing := array_append(v_missing, v_req_item);
      END IF;
    END LOOP;

    IF array_length(v_missing, 1) > 0 THEN
      RAISE EXCEPTION 'GATE_FREEZE_VIOLATION: Stage 3 Requirements Baseline Freeze requires all applicable domain requirement specs (EHW-PRS, FW-FRS, SW-SRS, MECH-MRS, SAL-QUO). Missing: %', array_to_string(v_missing, ', ');
    END IF;
  END IF;

  -- C. Stage 4 Hardware Schematics Prerequisite (moving to Stage 5 or higher)
  IF v_target_num >= 5 THEN
    v_has_doc := FALSE;
    IF jsonb_path_exists(v_deliverables, '$[*] ? (@ like_regex "EHW-SCH" flag "i" || @ like_regex "SCH-01" flag "i")') THEN
      v_has_doc := TRUE;
    END IF;
    IF NOT v_has_doc THEN
      SELECT EXISTS (
        SELECT 1 FROM public.documents doc
        WHERE doc.record_id = v_record.id
          AND (doc.title ~* 'EHW-SCH' OR doc.document_type ~* 'schematic')
      ) INTO v_has_doc;
    END IF;
    IF NOT v_has_doc AND (v_na_rationale->>'EHW-SCH-01' IS NOT NULL AND length(trim(v_na_rationale->>'EHW-SCH-01')) > 0) THEN
      v_has_doc := TRUE;
    END IF;

    IF NOT v_has_doc THEN
      RAISE EXCEPTION 'GATE_FREEZE_VIOLATION: Stage 4 Hardware Schematics Prerequisite (EHW-SCH-01) must be approved before advancing to pilot or production stages';
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
    v_member.member_id,
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

-- 3. Private Native File Access Verification Contract
CREATE OR REPLACE FUNCTION public.get_controlled_file_access(p_file_id uuid)
RETURNS TABLE (
  file_id uuid,
  organization_id uuid,
  department_id uuid,
  document_id uuid,
  revision text,
  storage_path text,
  original_name text,
  content_type text,
  size_bytes bigint,
  checksum text,
  uploaded_by uuid,
  uploaded_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_file public.controlled_document_files%ROWTYPE;
  v_has_access boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED: Authenticated session required for secure file access';
  END IF;

  SELECT * INTO v_file
  FROM public.controlled_document_files
  WHERE id = p_file_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'FILE_NOT_FOUND: Controlled document file % does not exist', p_file_id;
  END IF;

  -- Check organization membership & role
  IF public.has_organization_role(v_file.organization_id, ARRAY['admin'::public.app_role]) THEN
    v_has_access := true;
  ELSIF public.has_department_permission(v_file.organization_id, v_file.department_id, 'documents:manage') THEN
    v_has_access := true;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = v_file.organization_id
        AND m.user_id = v_user_id
        AND m.active = true
    ) INTO v_has_access;
  END IF;

  IF NOT v_has_access THEN
    RAISE EXCEPTION 'FILE_ACCESS_DENIED: User does not possess access to controlled document file %', p_file_id;
  END IF;

  RETURN QUERY
  SELECT
    v_file.id,
    v_file.organization_id,
    v_file.department_id,
    v_file.document_id,
    v_file.revision,
    v_file.storage_path,
    v_file.original_name,
    v_file.content_type,
    v_file.size_bytes,
    v_file.checksum,
    v_file.uploaded_by,
    v_file.uploaded_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_controlled_file_access(uuid) TO authenticated;
