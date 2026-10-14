REVOKE EXECUTE ON FUNCTION public.is_organization_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_organization_role(uuid, public.app_role[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_organization_owner() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_organization_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_organization_role(uuid, public.app_role[]) TO authenticated, service_role;

CREATE TABLE public.department_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.departments(id) ON DELETE CASCADE,
  name text NOT NULL,
  role_key text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, department_id, role_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.department_roles TO authenticated;
GRANT ALL ON public.department_roles TO service_role;
ALTER TABLE public.department_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view department roles" ON public.department_roles FOR SELECT TO authenticated USING (public.is_organization_member(organization_id));
CREATE POLICY "Admins manage department roles" ON public.department_roles FOR ALL TO authenticated USING (public.has_organization_role(organization_id, ARRAY['admin'::public.app_role])) WITH CHECK (public.has_organization_role(organization_id, ARRAY['admin'::public.app_role]));

CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.department_roles(id) ON DELETE CASCADE,
  permission_key text NOT NULL,
  allowed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_id, permission_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view role permissions" ON public.role_permissions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.department_roles r WHERE r.id = role_id AND public.is_organization_member(r.organization_id)));
CREATE POLICY "Admins manage role permissions" ON public.role_permissions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.department_roles r WHERE r.id = role_id AND public.has_organization_role(r.organization_id, ARRAY['admin'::public.app_role]))) WITH CHECK (EXISTS (SELECT 1 FROM public.department_roles r WHERE r.id = role_id AND public.has_organization_role(r.organization_id, ARRAY['admin'::public.app_role])));

CREATE TABLE public.department_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.department_roles(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.organization_members(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL REFERENCES auth.users(id),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_id, member_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.department_role_assignments TO authenticated;
GRANT ALL ON public.department_role_assignments TO service_role;
ALTER TABLE public.department_role_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view role assignments" ON public.department_role_assignments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.department_roles r WHERE r.id = role_id AND public.is_organization_member(r.organization_id)));
CREATE POLICY "Admins manage role assignments" ON public.department_role_assignments FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.department_roles r WHERE r.id = role_id AND public.has_organization_role(r.organization_id, ARRAY['admin'::public.app_role]))) WITH CHECK ((EXISTS (SELECT 1 FROM public.department_roles r WHERE r.id = role_id AND public.has_organization_role(r.organization_id, ARRAY['admin'::public.app_role]))) AND assigned_by = auth.uid());

CREATE TRIGGER department_roles_updated_at BEFORE UPDATE ON public.department_roles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER department_role_assignments_updated_at BEFORE UPDATE ON public.department_role_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();