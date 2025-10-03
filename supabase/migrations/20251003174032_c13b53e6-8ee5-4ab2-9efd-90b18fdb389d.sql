-- Create Storage buckets for licenses, contracts, and banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('licenses', 'licenses', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']),
  ('contracts', 'contracts', false, 52428800, ARRAY['application/pdf']),
  ('banners', 'banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for licenses bucket
CREATE POLICY "Customers can upload their own licenses"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'licenses' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Customers can view their own licenses"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'licenses' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Platform admins can view all licenses"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'licenses' AND
    public.is_platform_admin(auth.uid())
  );

CREATE POLICY "Rental companies can view licenses of their customers"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'licenses' AND
    public.is_rental_company(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.contracts
      JOIN public.customers ON contracts.customer_id = customers.id
      WHERE contracts.rental_company_id = auth.uid()
        AND customers.id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Customers can update their own licenses"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'licenses' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Customers can delete their own licenses"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'licenses' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for contracts bucket
CREATE POLICY "Rental companies can upload contracts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'contracts' AND
    public.is_rental_company(auth.uid())
  );

CREATE POLICY "Customers can view their own contracts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contracts' AND
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.customer_id = auth.uid()
        AND contracts.contract_file = name
    )
  );

CREATE POLICY "Rental companies can view their contracts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contracts' AND
    public.is_rental_company(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.rental_company_id = auth.uid()
        AND contracts.contract_file = name
    )
  );

CREATE POLICY "Platform admins can view all contracts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contracts' AND
    public.is_platform_admin(auth.uid())
  );

CREATE POLICY "Rental companies can update their contracts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'contracts' AND
    public.is_rental_company(auth.uid())
  );

-- Storage policies for banners bucket (public)
CREATE POLICY "Platform admins can upload banners"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'banners' AND
    public.is_platform_admin(auth.uid())
  );

CREATE POLICY "Anyone can view banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "Platform admins can update banners"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'banners' AND
    public.is_platform_admin(auth.uid())
  );

CREATE POLICY "Platform admins can delete banners"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'banners' AND
    public.is_platform_admin(auth.uid())
  );

-- Enable Realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.motorcycles;