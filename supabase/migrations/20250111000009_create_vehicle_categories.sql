-- Vehicle Categories table
-- Lookup table for motorcycle categories

CREATE TABLE vehicle_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vehicle_categories_name ON vehicle_categories(name);

-- Trigger for updated_at
CREATE TRIGGER update_vehicle_categories_updated_at
    BEFORE UPDATE ON vehicle_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE vehicle_categories IS 'Categories for motorcycles (e.g., Sport, Cruiser, Touring)';

