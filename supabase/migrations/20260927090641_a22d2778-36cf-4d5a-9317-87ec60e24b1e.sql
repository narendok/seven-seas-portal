ALTER TABLE public.operational_records
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.has_department_permission(
  _organization_id uuid,
  _department_id uuid,
  _permission_key text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_organization_role(_organization_id, ARRAY['admin'::public.app_role])
  OR EXISTS (
    SELECT 1
    FROM public.departments d
    JOIN public.organization_members m ON m.id = d.lead_member_id
    WHERE d.id = _department_id
      AND d.organization_id = _organization_id
      AND m.user_id = auth.uid()
      AND m.active = true
  )
  OR EXISTS (
    SELECT 1
    FROM public.department_role_assignments a
    JOIN public.department_roles r ON r.id = a.role_id
    JOIN public.role_permissions p ON p.role_id = r.id
    JOIN public.organization_members m ON m.id = a.member_id
    WHERE r.organization_id = _organization_id
      AND r.department_id = _department_id
      AND m.user_id = auth.uid()
      AND m.active = true
      AND a.active = true
      AND r.active = true
      AND p.allowed = true
      AND p.permission_key = _permission_key
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_department_permission(uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_department_permission(uuid, uuid, text) TO authenticated, service_role;

DROP POLICY IF EXISTS "Members can update records" ON public.operational_records;
CREATE POLICY "Members can update records"
ON public.operational_records
FOR UPDATE
TO authenticated
USING (
  public.is_organization_member(organization_id)
  AND (
    updated_by = auth.uid()
    OR public.has_organization_role(organization_id, ARRAY['admin'::public.app_role, 'department_lead'::public.app_role])
    OR (department_id IS NOT NULL AND public.has_department_permission(organization_id, department_id, 'records:edit'))
  )
)
WITH CHECK (
  public.is_organization_member(organization_id)
  AND (
    updated_by = auth.uid()
    OR public.has_organization_role(organization_id, ARRAY['admin'::public.app_role, 'department_lead'::public.app_role])
    OR (department_id IS NOT NULL AND public.has_department_permission(organization_id, department_id, 'records:edit'))
  )
);