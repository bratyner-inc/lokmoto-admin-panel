-- Platform Admins table
-- Stores information about Lokmoto platform administrators

CREATE TABLE platform_admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role platform_admin_role NOT NULL DEFAULT 'support',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_platform_admins_email ON platform_admins(email);
CREATE INDEX idx_platform_admins_role ON platform_admins(role);

-- Trigger for updated_at
CREATE TRIGGER update_platform_admins_updated_at
    BEFORE UPDATE ON platform_admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE platform_admins IS 'Lokmoto platform administrators with various roles';
COMMENT ON COLUMN platform_admins.role IS 'Admin role: super_admin, manager, or support';

