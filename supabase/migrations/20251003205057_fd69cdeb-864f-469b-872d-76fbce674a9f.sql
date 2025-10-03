-- Create storage bucket for contracts
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for contracts bucket
CREATE POLICY "Platform admins can upload contract files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contracts' 
  AND is_platform_admin(auth.uid())
);

CREATE POLICY "Rental companies can upload their contract files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contracts' 
  AND is_rental_company(auth.uid())
);

CREATE POLICY "Platform admins can update contract files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND is_platform_admin(auth.uid())
);

CREATE POLICY "Rental companies can update their contract files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND is_rental_company(auth.uid())
);

CREATE POLICY "Platform admins can delete contract files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND is_platform_admin(auth.uid())
);

CREATE POLICY "Rental companies can delete their contract files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND is_rental_company(auth.uid())
);

CREATE POLICY "Users can view contract files they have access to"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'contracts' 
  AND (
    is_platform_admin(auth.uid())
    OR is_rental_company(auth.uid())
    OR is_customer(auth.uid())
  )
);