-- Rental Companies table
-- Stores information about rental companies that manage motorcycles on the platform

CREATE TABLE rental_companies (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    trading_name TEXT NOT NULL, -- Razão social
    company_name TEXT NOT NULL, -- Nome fantasia
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    subscription_status subscription_status NOT NULL DEFAULT 'pending',
    subscription_plan TEXT, -- References Safe2Pay plan ID
    subscription_expiration TIMESTAMPTZ,
    bank_account JSONB, -- { agency, account, bankCode }
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_rental_companies_email ON rental_companies(email);
CREATE INDEX idx_rental_companies_cnpj ON rental_companies(cnpj);
CREATE INDEX idx_rental_companies_subscription_status ON rental_companies(subscription_status);

-- Trigger for updated_at
CREATE TRIGGER update_rental_companies_updated_at
    BEFORE UPDATE ON rental_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE rental_companies ENABLE ROW LEVEL SECURITY;

-- Comments for documentation
COMMENT ON TABLE rental_companies IS 'Rental companies that manage motorcycles on the Lokmoto platform';
COMMENT ON COLUMN rental_companies.trading_name IS 'Legal business name (Razão Social)';
COMMENT ON COLUMN rental_companies.company_name IS 'Trade name (Nome Fantasia)';
COMMENT ON COLUMN rental_companies.subscription_plan IS 'Reference to Safe2Pay plan ID';

