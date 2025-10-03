-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for banner images
CREATE POLICY "Anyone can view banner images"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Platform admins can upload banner images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners' AND
  (SELECT is_platform_admin(auth.uid()))
);

CREATE POLICY "Platform admins can update banner images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'banners' AND
  (SELECT is_platform_admin(auth.uid()))
);

CREATE POLICY "Platform admins can delete banner images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'banners' AND
  (SELECT is_platform_admin(auth.uid()))
);