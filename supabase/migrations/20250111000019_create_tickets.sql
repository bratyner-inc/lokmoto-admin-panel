-- Tickets table
-- Stores support tickets and maintenance requests from customers

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    rental_company_id UUID NOT NULL REFERENCES rental_companies(id) ON DELETE CASCADE,
    
    -- Ticket details
    ticket_type ticket_type NOT NULL,
    status ticket_status NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Assignment
    assigned_to UUID REFERENCES platform_admins(id) ON DELETE SET NULL,
    
    -- Resolution
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tickets_contract_id ON tickets(contract_id);
CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX idx_tickets_rental_company_id ON tickets(rental_company_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);

-- Trigger for updated_at
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Customers can view their own tickets
CREATE POLICY "Customers can view their own tickets"
    ON public.tickets
    FOR SELECT
    TO authenticated
    USING (
        customer_id = auth.uid()
    );

-- Customers can create tickets for their contracts
CREATE POLICY "Customers can create tickets"
    ON public.tickets
    FOR INSERT
    TO authenticated
    WITH CHECK (
        customer_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.contracts
            WHERE id = contract_id
            AND customer_id = auth.uid()
        )
    );

-- Customers can update their own tickets (only if not closed)
CREATE POLICY "Customers can update their own tickets"
    ON public.tickets
    FOR UPDATE
    TO authenticated
    USING (
        customer_id = auth.uid()
        AND status != 'closed'
    );

-- Rental companies can view tickets for their contracts
CREATE POLICY "Rental companies can view their tickets"
    ON public.tickets
    FOR SELECT
    TO authenticated
    USING (
        rental_company_id = auth.uid()
    );

-- Rental companies can update tickets for their contracts
CREATE POLICY "Rental companies can update their tickets"
    ON public.tickets
    FOR UPDATE
    TO authenticated
    USING (
        rental_company_id = auth.uid()
    );

-- Platform admins can view all tickets
CREATE POLICY "Platform admins can view all tickets"
    ON public.tickets
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE id = auth.uid()
        )
    );

-- Comments
COMMENT ON TABLE tickets IS 'Support tickets and maintenance requests from customers';
COMMENT ON COLUMN tickets.ticket_type IS 'Type of ticket: defect, accident, or other';
COMMENT ON COLUMN tickets.priority IS 'Priority level: low, medium, high, or urgent';
COMMENT ON COLUMN tickets.assigned_to IS 'Platform admin assigned to handle the ticket';

