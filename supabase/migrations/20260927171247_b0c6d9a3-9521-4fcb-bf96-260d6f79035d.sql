CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;
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
REVOKE ALL ON FUNCTION private.can_access_controlled_document_object(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.can_access_controlled_document_object(text) TO authenticated, service_role;
ALTER POLICY "Authorized members can read controlled files" ON storage.objects
USING (
  bucket_id = 'controlled-documents'
  AND private.can_access_controlled_document_object(name)
);
ALTER POLICY "Authorized managers can upload registered paths" ON storage.objects
WITH CHECK (
  bucket_id = 'controlled-documents'
  AND private.can_access_controlled_document_object(name)
);
ALTER POLICY "Authorized managers can update controlled files" ON storage.objects
USING (
  bucket_id = 'controlled-documents'
  AND private.can_access_controlled_document_object(name)
)
WITH CHECK (
  bucket_id = 'controlled-documents'
  AND private.can_access_controlled_document_object(name)
);
ALTER POLICY "Authorized managers can remove controlled files" ON storage.objects
USING (
  bucket_id = 'controlled-documents'
  AND private.can_access_controlled_document_object(name)
);
REVOKE ALL ON FUNCTION public.can_access_controlled_document_object(text) FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION public.can_access_controlled_document_object(text);