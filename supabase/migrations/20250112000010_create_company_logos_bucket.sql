-- Migration: Create Company Logos Bucket
-- Description: Bucket público para armazenar logos das locadoras
-- Author: Lokmoto Team
-- Date: 2025-01-12

-- ============================================================================
-- STORAGE BUCKET
-- ============================================================================

-- Criar bucket público para logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - STORAGE
-- ============================================================================

-- Store Admin pode fazer upload do próprio logo
CREATE POLICY "Store admin can upload own logo"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'company-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Qualquer pessoa pode ver os logos (bucket público)
CREATE POLICY "Anyone can view logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

-- Store Admin pode atualizar o próprio logo
CREATE POLICY "Store admin can update own logo"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'company-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Store Admin pode deletar o próprio logo
CREATE POLICY "Store admin can delete own logo"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'company-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Global Admin pode gerenciar todos os logos
CREATE POLICY "Global admin can manage all logos"
ON storage.objects FOR ALL
USING (
    bucket_id = 'company-logos' AND
    EXISTS (SELECT 1 FROM platform_admins WHERE id = auth.uid())
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE storage.buckets IS 'Buckets de armazenamento. company-logos: logos das locadoras (público)';

