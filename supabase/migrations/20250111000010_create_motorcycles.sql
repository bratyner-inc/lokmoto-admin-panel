-- Motorcycles table
-- Stores information about motorcycles managed by rental companies

CREATE TABLE motorcycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_company_id UUID NOT NULL REFERENCES rental_companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES vehicle_categories(id) ON DELETE SET NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    version TEXT NOT NULL,
    year INTEGER NOT NULL,
    plate TEXT UNIQUE NOT NULL,
    renavam TEXT UNIQUE NOT NULL,
    chassis TEXT UNIQUE NOT NULL,
    color TEXT NOT NULL,
    engine_capacity INTEGER NOT NULL, -- Cilindrada em cc
    is_available BOOLEAN NOT NULL DEFAULT true,
    availability_periods JSONB, -- Array of {start: date, end: date}
    daily_rate NUMERIC(10, 2), -- Daily rental rate
    images JSONB, -- Array of image URLs from Storage
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_motorcycles_rental_company_id ON motorcycles(rental_company_id);
CREATE INDEX idx_motorcycles_category_id ON motorcycles(category_id);
CREATE INDEX idx_motorcycles_is_available ON motorcycles(is_available);
CREATE INDEX idx_motorcycles_plate ON motorcycles(plate);
CREATE INDEX idx_motorcycles_brand_model ON motorcycles USING gin((brand || ' ' || model) gin_trgm_ops);

-- Trigger for updated_at
CREATE TRIGGER update_motorcycles_updated_at
    BEFORE UPDATE ON motorcycles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE motorcycles ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE motorcycles IS 'Motorcycles managed by rental companies on the platform';
COMMENT ON COLUMN motorcycles.engine_capacity IS 'Engine displacement in cc';
COMMENT ON COLUMN motorcycles.availability_periods IS 'JSON array of availability date ranges';
COMMENT ON COLUMN motorcycles.daily_rate IS 'Daily rental rate in BRL';

