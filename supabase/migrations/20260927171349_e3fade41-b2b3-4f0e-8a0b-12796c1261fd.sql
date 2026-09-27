ALTER TABLE public.documents
ADD COLUMN department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL;
CREATE INDEX documents_organization_department_idx ON public.documents (organization_id, department_id);
DROP POLICY IF EXISTS "Members manage documents" ON public.documents;
CREATE POLICY "Authorized users can view documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR (department_id IS NULL AND public.is_organization_member(organization_id))
  OR public.has_organization_role(organization_id, ARRAY['admin'::public.app_role])
  OR (department_id IS NOT NULL AND public.has_department_permission(organization_id, department_id, 'documents:manage'))
);
CREATE POLICY "Authorized users can create documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND (
    (department_id IS NULL AND public.is_organization_member(organization_id))
    OR public.has_organization_role(organization_id, ARRAY['admin'::public.app_role])
    OR (department_id IS NOT NULL AND public.has_department_permission(organization_id, department_id, 'documents:manage'))
  )
);
CREATE POLICY "Authorized users can update documents"
ON public.documents
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR public.has_organization_role(organization_id, ARRAY['admin'::public.app_role])
  OR (department_id IS NOT NULL AND public.has_department_permission(organization_id, department_id, 'documents:manage'))
)
WITH CHECK (
  created_by = auth.uid()
  OR public.has_organization_role(organization_id, ARRAY['admin'::public.app_role])
  OR (department_id IS NOT NULL AND public.has_department_permission(organization_id, department_id, 'documents:manage'))
);
CREATE POLICY "Authorized users can remove documents"
ON public.documents
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR public.has_organization_role(organization_id, ARRAY['admin'::public.app_role])
  OR (department_id IS NOT NULL AND public.has_department_permission(organization_id, department_id, 'documents:manage'))
);
DROP POLICY IF EXISTS "Organization members can view document files" ON public.controlled_document_files;
CREATE POLICY "Authorized users can view document files"
ON public.controlled_document_files
FOR SELECT
TO authenticated
USING (
  uploaded_by = auth.uid()
  OR public.has_organization_role(organization_id, ARRAY['admin'::public.app_role])
  OR public.has_department_permission(organization_id, department_id, 'documents:manage')
);
CREATE OR REPLACE FUNCTION private.can_access_controlled_document_object(object_name text)
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
        file.uploaded_by = auth.uid()
        OR public.has_organization_role(file.organization_id, ARRAY['admin'::public.app_role])
        OR public.has_department_permission(file.organization_id, file.department_id, 'documents:manage')
      )
  );
$$;
REVOKE ALL ON FUNCTION private.can_access_controlled_document_object(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.can_access_controlled_document_object(text) TO authenticated, service_role;