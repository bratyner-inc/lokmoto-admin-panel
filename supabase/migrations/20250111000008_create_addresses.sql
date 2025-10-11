-- Addresses table
-- Generic table for storing addresses of customers and rental companies

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_type address_owner_type NOT NULL,
    owner_id UUID NOT NULL, -- References either customers or rental_companies
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    complement TEXT,
    district TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Brazil',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    
    -- Note: Polymorphic relationship validated at application level
    -- owner_id references either customers.id or rental_companies.id based on owner_type
);

-- Indexes
CREATE INDEX idx_addresses_owner ON addresses(owner_type, owner_id);
CREATE INDEX idx_addresses_postal_code ON addresses(postal_code);
CREATE INDEX idx_addresses_city_state ON addresses(city, state);

-- Trigger for updated_at
CREATE TRIGGER update_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE addresses IS 'Generic address table for customers and rental companies';
COMMENT ON COLUMN addresses.owner_type IS 'Type of entity that owns this address';
COMMENT ON COLUMN addresses.owner_id IS 'Foreign key to either customers or rental_companies';

