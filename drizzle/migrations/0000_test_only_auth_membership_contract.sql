CREATE OR REPLACE FUNCTION public.resolve_test_membership()
RETURNS TABLE (
  organization_id uuid,
  organization_name text,
  membership_id uuid,
  display_name text,
  role public.app_role,
  department_code text,
  department_name text,
  is_client boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.organization_id,
    o.name,
    m.id,
    COALESCE(m.display_name, 'TEST user'),
    m.role,
    d.code,
    d.name,
    m.role = 'viewer'::public.app_role AND d.code = 'CLIENT'
  FROM public.organization_members m
  JOIN public.organizations o ON o.id = m.organization_id
  LEFT JOIN public.departments d
    ON d.organization_id = m.organization_id
    AND d.lead_member_id = m.id
    AND d.active = true
  WHERE m.user_id = auth.uid()
    AND m.active = true
    AND o.name LIKE 'TEST ONLY · %'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_test_membership() TO authenticated;