CREATE TABLE public.controlled_document_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  revision text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  original_name text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL,
  checksum text NOT NULL,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  superseded_at timestamptz,
  audit_note text NOT NULL DEFAULT '',
  CONSTRAINT controlled_document_files_size_positive CHECK (size_bytes > 0),
  CONSTRAINT controlled_document_files_unique_revision UNIQUE (organization_id, document_id, revision, checksum)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.controlled_document_files TO authenticated;
GRANT ALL ON public.controlled_document_files TO service_role;
ALTER TABLE public.controlled_document_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organization members can view document files"
ON public.controlled_document_files
FOR SELECT
TO authenticated
USING (
  public.has_organization_role(organization_id, ARRAY['admin'::public.app_role])
  OR public.has_department_permission(organization_id, department_id, 'documents:manage')
  OR EXISTS (
    SELECT 1
    FROM public.organization_members member
    WHERE member.organization_id = controlled_document_files.organization_id
      AND member.user_id = auth.uid()
      AND member.active = true
  )
);
CREATE POLICY "Department document managers can register files"
ON public.controlled_document_files
FOR INSERT
TO authenticated
WITH CHECK (
  uploaded_by = auth.uid()
  AND (
    public.has_organization_role(organization_id, ARRAY['admin'::public.app_role])
    OR public.has_department_permission(organization_id, department_id, 'documents:manage')
  )
);
CREATE POLICY "Department document managers can update files"
ON public.controlled_document_files
FOR UPDATE
TO authenticated
USING (
  public.has_organization_role(organization_id, ARRAY['admin'::public.app_role])
  OR public.has_department_permission(organization_id, department_id, 'documents:manage')
)
WITH CHECK (
  public.has_organization_role(organization_id, ARRAY['admin'::public.app_role])
  OR public.has_department_permission(organization_id, department_id, 'documents:manage')
);

CREATE OR REPLACE FUNCTION public.can_access_controlled_document_object(object_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, storage
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.controlled_document_files file
    WHERE file.storage_path = object_name
      AND (
        public.has_organization_role(file.organization_id, ARRAY['admin'::public.app_role])
        OR public.has_department_permission(file.organization_id, file.department_id, 'documents:manage')
        OR EXISTS (
          SELECT 1
          FROM public.organization_members member
          WHERE member.organization_id = file.organization_id
            AND member.user_id = auth.uid()
            AND member.active = true
        )
      )
  );
$$;
GRANT EXECUTE ON FUNCTION public.can_access_controlled_document_object(text) TO authenticated, service_role;

CREATE POLICY "Authorized members can read controlled files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'controlled-documents'
  AND public.can_access_controlled_document_object(name)
);
CREATE POLICY "Authorized managers can upload registered paths"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'controlled-documents'
  AND public.can_access_controlled_document_object(name)
);
CREATE POLICY "Authorized managers can update controlled files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'controlled-documents'
  AND public.can_access_controlled_document_object(name)
)
WITH CHECK (
  bucket_id = 'controlled-documents'
  AND public.can_access_controlled_document_object(name)
);
CREATE POLICY "Authorized managers can remove controlled files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'controlled-documents'
  AND public.can_access_controlled_document_object(name)
);