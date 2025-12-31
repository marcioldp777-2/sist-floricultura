-- Criar bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Usuários autenticados podem fazer upload de imagens do seu tenant
CREATE POLICY "Tenant users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);

-- Policy: Usuários autenticados podem atualizar imagens do seu tenant
CREATE POLICY "Tenant users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);

-- Policy: Usuários autenticados podem deletar imagens do seu tenant
CREATE POLICY "Tenant users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);

-- Policy: Qualquer pessoa pode ver imagens (bucket público)
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');