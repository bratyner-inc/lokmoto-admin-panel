-- Storage setup for motorcycle images
-- Creates a bucket and policies for motorcycle image uploads

-- Create the motorcycles-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'motorcycles-images',
  'motorcycles-images',
  true, -- Public bucket so images can be accessed via URL
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated rental companies to upload images
CREATE POLICY "Rental companies can upload motorcycle images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'motorcycles-images' 
  AND auth.uid() IN (SELECT id FROM rental_companies)
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated rental companies to update their own images
CREATE POLICY "Rental companies can update their motorcycle images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'motorcycles-images' 
  AND auth.uid() IN (SELECT id FROM rental_companies)
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'motorcycles-images' 
  AND auth.uid() IN (SELECT id FROM rental_companies)
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated rental companies to delete their own images
CREATE POLICY "Rental companies can delete their motorcycle images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'motorcycles-images' 
  AND auth.uid() IN (SELECT id FROM rental_companies)
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public read access to all motorcycle images
CREATE POLICY "Anyone can view motorcycle images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'motorcycles-images');

-- Comments for documentation
COMMENT ON TABLE storage.buckets IS 'Storage buckets configuration';
COMMENT ON TABLE storage.objects IS 'Storage objects with RLS policies';

