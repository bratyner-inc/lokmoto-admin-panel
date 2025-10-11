-- Customers table
-- Stores information about customers who rent motorcycles

CREATE TABLE customers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    document_id TEXT NOT NULL, -- CPF
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_document_id ON customers(document_id);
CREATE INDEX idx_customers_full_name ON customers USING gin(full_name gin_trgm_ops);

-- Trigger for updated_at
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE customers IS 'Customers who rent motorcycles from rental companies';
COMMENT ON COLUMN customers.document_id IS 'Customer CPF document';

