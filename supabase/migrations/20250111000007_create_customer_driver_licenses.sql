-- Customer Driver Licenses table
-- Stores detailed CNH (driver's license) information for customers

CREATE TABLE customer_driver_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL,
    category TEXT NOT NULL, -- A, B, AB, etc.
    expiration_date DATE NOT NULL,
    issuing_state TEXT NOT NULL,
    issuing_date DATE NOT NULL,
    license_file TEXT, -- Reference to Supabase Storage
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customer_driver_licenses_customer_id ON customer_driver_licenses(customer_id);
CREATE INDEX idx_customer_driver_licenses_license_number ON customer_driver_licenses(license_number);
CREATE INDEX idx_customer_driver_licenses_expiration_date ON customer_driver_licenses(expiration_date);

-- Trigger for updated_at
CREATE TRIGGER update_customer_driver_licenses_updated_at
    BEFORE UPDATE ON customer_driver_licenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE customer_driver_licenses ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE customer_driver_licenses IS 'Driver license (CNH) information for customers';
COMMENT ON COLUMN customer_driver_licenses.license_file IS 'Storage path to uploaded license document';

