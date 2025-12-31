-- Create storage bucket for tenant logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenant-logos', 'tenant-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for tenant logos
CREATE POLICY "Anyone can view tenant logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'tenant-logos');

CREATE POLICY "Tenant owners can upload their logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tenant-logos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);

CREATE POLICY "Tenant owners can update their logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tenant-logos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);

CREATE POLICY "Tenant owners can delete their logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tenant-logos' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);