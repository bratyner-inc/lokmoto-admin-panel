-- Banners table
-- Stores promotional banners managed by platform admins

CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('hero', 'sidebar', 'footer')),
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_banners_position ON banners(position);
CREATE INDEX idx_banners_is_active ON banners(is_active);
CREATE INDEX idx_banners_start_date ON banners(start_date);
CREATE INDEX idx_banners_end_date ON banners(end_date);

-- Trigger for updated_at
CREATE TRIGGER update_banners_updated_at
    BEFORE UPDATE ON banners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for banners
-- Global Admin: Full CRUD access
CREATE POLICY "global_admin_all_access_banners" ON banners
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE id = auth.uid()
        )
    );

-- All authenticated users: Read-only access to active banners
CREATE POLICY "authenticated_read_active_banners" ON banners
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND is_active = true
    );

-- Storage bucket for banner images
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "global_admin_upload_banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'banners' AND
    EXISTS (
        SELECT 1 FROM platform_admins 
        WHERE id = auth.uid()
    )
);

CREATE POLICY "global_admin_update_banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'banners' AND
    EXISTS (
        SELECT 1 FROM platform_admins 
        WHERE id = auth.uid()
    )
);

CREATE POLICY "global_admin_delete_banners"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'banners' AND
    EXISTS (
        SELECT 1 FROM platform_admins 
        WHERE id = auth.uid()
    )
);

CREATE POLICY "public_read_banners"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'banners');

-- Comments
COMMENT ON TABLE banners IS 'Promotional banners managed by platform admins';
COMMENT ON COLUMN banners.position IS 'Banner display position: hero, sidebar, or footer';
COMMENT ON COLUMN banners.image_url IS 'URL to banner image in Supabase Storage';


