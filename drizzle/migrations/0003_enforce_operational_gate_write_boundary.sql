-- A direct Data API write must not bypass the checked stage RPC.
-- SECURITY INVOKER is intentional: a checked SECURITY DEFINER RPC executes with
-- its owner's role; ordinary callers (including organization admins) do not.
CREATE OR REPLACE FUNCTION public.guard_operational_stage_write()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' THEN
      IF (NEW.stage IS NOT NULL AND NEW.stage NOT IN ('1', 'Stage 1'))
        OR NEW.fields ? 'last_stage_gate'
        OR (NEW.fields ? 'lifecycleStage' AND NEW.fields->>'lifecycleStage' NOT IN ('1', 'Stage 1')) THEN
        RAISE EXCEPTION 'STAGE_RPC_REQUIRED: Initial records start at Stage 1; advance through the checked stage gate';
      END IF;
    ELSIF NEW.stage IS DISTINCT FROM OLD.stage
      OR NEW.fields->'last_stage_gate' IS DISTINCT FROM OLD.fields->'last_stage_gate'
      OR NEW.fields->'lifecycleStage' IS DISTINCT FROM OLD.fields->'lifecycleStage' THEN
      RAISE EXCEPTION 'STAGE_RPC_REQUIRED: Stage changes require the checked stage gate';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS guard_operational_stage_write ON public.operational_records;
CREATE TRIGGER guard_operational_stage_write BEFORE INSERT OR UPDATE ON public.operational_records
FOR EACH ROW EXECUTE FUNCTION public.guard_operational_stage_write();
REVOKE ALL ON FUNCTION public.guard_operational_stage_write() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.resolve_operational_membership()
RETURNS TABLE (
  organization_id uuid, organization_name text, membership_id uuid,
  display_name text, role public.app_role, department_id uuid,
  department_code text, department_name text, is_lead boolean,
  can_sign_stage_gates boolean
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  RETURN QUERY
  SELECT m.organization_id, o.name, m.id, COALESCE(m.display_name, 'Operational user'),
    m.role, d.id, d.code, d.name,
    COALESCE(d.lead_member_id = m.id, false),
    (m.role = 'admin' OR (m.role <> 'viewer' AND d.id IS NOT NULL
      AND public.has_department_permission(m.organization_id, d.id, 'approvals:decide')))
  FROM public.organization_members m
  JOIN public.organizations o ON o.id = m.organization_id
  LEFT JOIN public.departments d ON d.organization_id = m.organization_id AND d.active
    AND (d.lead_member_id = m.id OR EXISTS (
      SELECT 1 FROM public.department_role_assignments a
      JOIN public.department_roles r ON r.id = a.role_id
      WHERE a.member_id = m.id AND a.active AND r.active
        AND r.organization_id = m.organization_id AND r.department_id = d.id
    ))
  WHERE m.user_id = auth.uid() AND m.active
  ORDER BY (m.role = 'admin') DESC, COALESCE(d.lead_member_id = m.id, false) DESC,
    m.created_at, m.id, d.id
  LIMIT 1;
END; $$;
REVOKE ALL ON FUNCTION public.resolve_operational_membership() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_operational_membership() TO authenticated;

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

  IF v_record.archived_at IS NOT NULL THEN RAISE EXCEPTION 'RECORD_ARCHIVED'; END IF;

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
