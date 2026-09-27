CREATE TYPE public.app_role AS ENUM ('admin', 'department_lead', 'member', 'viewer');
CREATE TYPE public.portal_record_status AS ENUM ('draft', 'open', 'in_review', 'approved', 'released', 'archived');
CREATE TYPE public.approval_outcome AS ENUM ('pending', 'approved', 'rejected', 'returned');

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  main_location text NOT NULL,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  working_days text NOT NULL DEFAULT 'Monday – Saturday',
  numbering_format text NOT NULL DEFAULT 'SSM-{AREA}-{YYYY}-{####}',
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'member',
  display_name text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT ALL ON public.organization_members TO service_role;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_organization_member(_organization_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = _organization_id AND user_id = auth.uid() AND active = true)
$$;

CREATE OR REPLACE FUNCTION public.has_organization_role(_organization_id uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = _organization_id AND user_id = auth.uid() AND active = true AND role = ANY(_roles))
$$;

CREATE POLICY "Members can view organizations" ON public.organizations FOR SELECT TO authenticated USING (public.is_organization_member(id));
CREATE POLICY "Admins can update organizations" ON public.organizations FOR UPDATE TO authenticated USING (public.has_organization_role(id, ARRAY['admin'::public.app_role])) WITH CHECK (public.has_organization_role(id, ARRAY['admin'::public.app_role]));
CREATE POLICY "Users can create organizations" ON public.organizations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Members can view membership" ON public.organization_members FOR SELECT TO authenticated USING (public.is_organization_member(organization_id));
CREATE POLICY "Admins manage membership" ON public.organization_members FOR ALL TO authenticated USING (public.has_organization_role(organization_id, ARRAY['admin'::public.app_role])) WITH CHECK (public.has_organization_role(organization_id, ARRAY['admin'::public.app_role]));

CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  department_type text NOT NULL,
  code text NOT NULL,
  lead_member_id uuid REFERENCES public.organization_members(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, code),
  UNIQUE (organization_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view departments" ON public.departments FOR SELECT TO authenticated USING (public.is_organization_member(organization_id));
CREATE POLICY "Admins manage departments" ON public.departments FOR ALL TO authenticated USING (public.has_organization_role(organization_id, ARRAY['admin'::public.app_role])) WITH CHECK (public.has_organization_role(organization_id, ARRAY['admin'::public.app_role]));

CREATE TABLE public.department_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  setting_group text NOT NULL,
  setting_key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (department_id, setting_group, setting_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.department_settings TO authenticated;
GRANT ALL ON public.department_settings TO service_role;
ALTER TABLE public.department_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view department settings" ON public.department_settings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.departments d WHERE d.id = department_id AND public.is_organization_member(d.organization_id)));
CREATE POLICY "Admins manage department settings" ON public.department_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.departments d WHERE d.id = department_id AND public.has_organization_role(d.organization_id, ARRAY['admin'::public.app_role]))) WITH CHECK (EXISTS (SELECT 1 FROM public.departments d WHERE d.id = department_id AND public.has_organization_role(d.organization_id, ARRAY['admin'::public.app_role])));

CREATE TABLE public.operational_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  area text NOT NULL,
  record_type text NOT NULL,
  reference text NOT NULL,
  title text NOT NULL,
  status public.portal_record_status NOT NULL DEFAULT 'draft',
  priority text NOT NULL DEFAULT 'normal',
  due_at timestamptz,
  stage text,
  fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_by uuid NOT NULL REFERENCES auth.users(id),
  updated_by uuid NOT NULL REFERENCES auth.users(id),
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, reference)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.operational_records TO authenticated;
GRANT ALL ON public.operational_records TO service_role;
ALTER TABLE public.operational_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view records" ON public.operational_records FOR SELECT TO authenticated USING (public.is_organization_member(organization_id));
CREATE POLICY "Members can create records" ON public.operational_records FOR INSERT TO authenticated WITH CHECK (public.is_organization_member(organization_id) AND created_by = auth.uid() AND updated_by = auth.uid());
CREATE POLICY "Members can update records" ON public.operational_records FOR UPDATE TO authenticated USING (public.is_organization_member(organization_id)) WITH CHECK (public.is_organization_member(organization_id) AND updated_by = auth.uid());

CREATE TABLE public.record_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source_record_id uuid NOT NULL REFERENCES public.operational_records(id) ON DELETE CASCADE,
  target_record_id uuid NOT NULL REFERENCES public.operational_records(id) ON DELETE CASCADE,
  relationship text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_record_id, target_record_id, relationship)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.record_links TO authenticated;
GRANT ALL ON public.record_links TO service_role;
ALTER TABLE public.record_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage record links" ON public.record_links FOR ALL TO authenticated USING (public.is_organization_member(organization_id)) WITH CHECK (public.is_organization_member(organization_id) AND created_by = auth.uid());

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  record_id uuid REFERENCES public.operational_records(id) ON DELETE SET NULL,
  title text NOT NULL,
  task_type text NOT NULL DEFAULT 'Task',
  status text NOT NULL DEFAULT 'Open',
  priority text NOT NULL DEFAULT 'Normal',
  due_at timestamptz,
  blocker text,
  assignee_id uuid REFERENCES public.organization_members(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view tasks" ON public.tasks FOR SELECT TO authenticated USING (public.is_organization_member(organization_id));
CREATE POLICY "Members manage tasks" ON public.tasks FOR ALL TO authenticated USING (public.is_organization_member(organization_id)) WITH CHECK (public.is_organization_member(organization_id) AND created_by = auth.uid());

CREATE TABLE public.approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  record_id uuid REFERENCES public.operational_records(id) ON DELETE CASCADE,
  title text NOT NULL,
  outcome public.approval_outcome NOT NULL DEFAULT 'pending',
  approver_id uuid REFERENCES public.organization_members(id) ON DELETE SET NULL,
  protected_action boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  decided_by uuid REFERENCES auth.users(id),
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.approvals TO authenticated;
GRANT ALL ON public.approvals TO service_role;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view approvals" ON public.approvals FOR SELECT TO authenticated USING (public.is_organization_member(organization_id));
CREATE POLICY "Members can request approvals" ON public.approvals FOR INSERT TO authenticated WITH CHECK (public.is_organization_member(organization_id) AND created_by = auth.uid());
CREATE POLICY "Approvers decide approvals" ON public.approvals FOR UPDATE TO authenticated USING (public.has_organization_role(organization_id, ARRAY['admin'::public.app_role, 'department_lead'::public.app_role]) OR EXISTS (SELECT 1 FROM public.organization_members m WHERE m.id = approver_id AND m.user_id = auth.uid())) WITH CHECK (public.is_organization_member(organization_id));

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  record_id uuid REFERENCES public.operational_records(id) ON DELETE SET NULL,
  title text NOT NULL,
  document_type text NOT NULL,
  reference_url text NOT NULL,
  visibility text NOT NULL DEFAULT 'internal',
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage documents" ON public.documents FOR ALL TO authenticated USING (public.is_organization_member(organization_id)) WITH CHECK (public.is_organization_member(organization_id) AND created_by = auth.uid());

CREATE TABLE public.client_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  record_id uuid NOT NULL REFERENCES public.operational_records(id) ON DELETE CASCADE,
  recipient_label text NOT NULL,
  scope text NOT NULL,
  approved_by uuid NOT NULL REFERENCES auth.users(id),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_shares TO authenticated;
GRANT ALL ON public.client_shares TO service_role;
ALTER TABLE public.client_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view client shares" ON public.client_shares FOR SELECT TO authenticated USING (public.is_organization_member(organization_id));
CREATE POLICY "Admins manage client shares" ON public.client_shares FOR ALL TO authenticated USING (public.has_organization_role(organization_id, ARRAY['admin'::public.app_role])) WITH CHECK (public.has_organization_role(organization_id, ARRAY['admin'::public.app_role]) AND approved_by = auth.uid());

CREATE TABLE public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view audit history" ON public.audit_events FOR SELECT TO authenticated USING (public.is_organization_member(organization_id));
CREATE POLICY "Members can create audit history" ON public.audit_events FOR INSERT TO authenticated WITH CHECK (public.is_organization_member(organization_id) AND actor_id = auth.uid());

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER members_updated_at BEFORE UPDATE ON public.organization_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER department_settings_updated_at BEFORE UPDATE ON public.department_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER records_updated_at BEFORE UPDATE ON public.operational_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER approvals_updated_at BEFORE UPDATE ON public.approvals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.claim_organization_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role, active)
  VALUES (NEW.id, NEW.created_by, 'admin', true)
  ON CONFLICT (organization_id, user_id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER claim_organization_owner AFTER INSERT ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.claim_organization_owner();

ALTER PUBLICATION supabase_realtime ADD TABLE public.departments, public.operational_records, public.tasks, public.approvals, public.documents, public.department_settings;