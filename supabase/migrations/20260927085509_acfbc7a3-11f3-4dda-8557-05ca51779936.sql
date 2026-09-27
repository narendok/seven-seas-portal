REVOKE EXECUTE ON FUNCTION public.is_organization_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_organization_role(uuid, public.app_role[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_organization_owner() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_organization_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_organization_role(uuid, public.app_role[]) TO authenticated, service_role;