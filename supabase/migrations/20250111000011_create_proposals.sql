-- Proposals table
-- Stores rental proposals created by customers for motorcycles

CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    motorcycle_id UUID NOT NULL REFERENCES motorcycles(id) ON DELETE CASCADE,
    rental_company_id UUID NOT NULL REFERENCES rental_companies(id) ON DELETE CASCADE,
    status proposal_status NOT NULL DEFAULT 'open',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    proposed_daily_rate NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Business rules
    CONSTRAINT proposals_date_check CHECK (end_date > start_date)
);

-- Indexes
CREATE INDEX idx_proposals_customer_id ON proposals(customer_id);
CREATE INDEX idx_proposals_motorcycle_id ON proposals(motorcycle_id);
CREATE INDEX idx_proposals_rental_company_id ON proposals(rental_company_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_dates ON proposals(start_date, end_date);

-- Trigger for updated_at
CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE proposals IS 'Rental proposals created by customers for specific motorcycles';
COMMENT ON COLUMN proposals.status IS 'Proposal workflow status';

