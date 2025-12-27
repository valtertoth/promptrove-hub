-- Create storage bucket for material images
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read material images (public bucket)
CREATE POLICY "Material images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'materials');

-- Allow authenticated users to upload material images
CREATE POLICY "Authenticated users can upload material images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'materials' AND auth.role() = 'authenticated');

-- Allow users to update their own uploads
CREATE POLICY "Users can update material images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'materials' AND auth.role() = 'authenticated');

-- Allow users to delete material images
CREATE POLICY "Users can delete material images"
ON storage.objects FOR DELETE
USING (bucket_id = 'materials' AND auth.role() = 'authenticated');