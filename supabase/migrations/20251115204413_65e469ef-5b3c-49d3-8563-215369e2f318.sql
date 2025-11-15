-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'produtos',
  'produtos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Allow authenticated users to upload images to their own factory's products
CREATE POLICY "Fábricas podem fazer upload de imagens"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'produtos' AND
  EXISTS (
    SELECT 1 FROM fabrica
    WHERE fabrica.user_id = auth.uid()
    AND (storage.foldername(name))[1] = fabrica.id::text
  )
);

-- Allow public read access to product images
CREATE POLICY "Imagens de produtos são públicas"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'produtos');

-- Allow factories to update their own product images
CREATE POLICY "Fábricas podem atualizar suas imagens"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'produtos' AND
  EXISTS (
    SELECT 1 FROM fabrica
    WHERE fabrica.user_id = auth.uid()
    AND (storage.foldername(name))[1] = fabrica.id::text
  )
);

-- Allow factories to delete their own product images
CREATE POLICY "Fábricas podem deletar suas imagens"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'produtos' AND
  EXISTS (
    SELECT 1 FROM fabrica
    WHERE fabrica.user_id = auth.uid()
    AND (storage.foldername(name))[1] = fabrica.id::text
  )
);