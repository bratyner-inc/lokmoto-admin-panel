-- Create contracts table
-- This table stores rental contracts created from approved proposals
-- NOTE: Run 20250111000015_update_contract_status_enum.sql first!

CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT NOT NULL UNIQUE,
  rental_company_id UUID NOT NULL REFERENCES public.rental_companies(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE RESTRICT,
  motorcycle_id UUID NOT NULL REFERENCES public.motorcycles(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE, -- NULL for open-ended contracts
  monthly_value NUMERIC(10, 2) NOT NULL CHECK (monthly_value > 0),
  payment_day INTEGER NOT NULL CHECK (payment_day >= 1 AND payment_day <= 28),
  status contract_status NOT NULL DEFAULT 'active',
  cancellation_date TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Business rules
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date > start_date),
  CONSTRAINT cancellation_requires_reason CHECK (
    (status = 'cancelled' AND cancellation_date IS NOT NULL AND cancellation_reason IS NOT NULL) OR
    (status != 'cancelled' AND cancellation_date IS NULL AND cancellation_reason IS NULL)
  )
);

-- Add contract_id to proposals to track which contract was created
ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contracts_rental_company_id ON public.contracts(rental_company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_customer_id ON public.contracts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_proposal_id ON public.contracts(proposal_id);
CREATE INDEX IF NOT EXISTS idx_contracts_motorcycle_id ON public.contracts(motorcycle_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_start_date ON public.contracts(start_date);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number ON public.contracts(contract_number);
CREATE INDEX IF NOT EXISTS idx_proposals_contract_id ON public.proposals(contract_id);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts

-- Rental Companies: Can view and manage their own contracts
CREATE POLICY "Rental companies can view their own contracts"
  ON public.contracts
  FOR SELECT
  TO authenticated
  USING (
    rental_company_id = auth.uid()
  );

CREATE POLICY "Rental companies can create contracts"
  ON public.contracts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    rental_company_id = auth.uid()
  );

CREATE POLICY "Rental companies can update their own contracts"
  ON public.contracts
  FOR UPDATE
  TO authenticated
  USING (
    rental_company_id = auth.uid()
  )
  WITH CHECK (
    rental_company_id = auth.uid()
  );

-- Customers: Can view their own contracts
CREATE POLICY "Customers can view their own contracts"
  ON public.contracts
  FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid()
  );

-- Platform Admins: Full access to all contracts
CREATE POLICY "Platform admins have full access to contracts"
  ON public.contracts
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM public.platform_admins)
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.platform_admins)
  );

-- Function to generate contract number
CREATE OR REPLACE FUNCTION public.generate_contract_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  -- Get current year
  -- Format: CTR-YYYY-NNNN (e.g., CTR-2025-0001)
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(contract_number FROM 'CTR-[0-9]{4}-([0-9]{4})') AS INTEGER)
  ), 0) + 1 INTO counter
  FROM public.contracts
  WHERE contract_number LIKE 'CTR-' || EXTRACT(YEAR FROM NOW())::TEXT || '-%';
  
  new_number := 'CTR-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(counter::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$;

-- Trigger to auto-generate contract number if not provided
CREATE OR REPLACE FUNCTION public.set_contract_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.contract_number IS NULL OR NEW.contract_number = '' THEN
    NEW.contract_number := public.generate_contract_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_contract_number
  BEFORE INSERT ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_contract_number();

-- Function to update motorcycle availability when contract is created/updated
CREATE OR REPLACE FUNCTION public.update_motorcycle_availability_on_contract()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- When a contract becomes active, mark motorcycle as unavailable
  IF NEW.status = 'active' THEN
    UPDATE public.motorcycles
    SET is_available = false
    WHERE id = NEW.motorcycle_id;
  END IF;
  
  -- When a contract is cancelled or completed, mark motorcycle as available
  IF NEW.status IN ('cancelled', 'completed') THEN
    UPDATE public.motorcycles
    SET is_available = true
    WHERE id = NEW.motorcycle_id
    AND NOT EXISTS (
      -- Check if there are other active contracts for this motorcycle
      SELECT 1 FROM public.contracts
      WHERE motorcycle_id = NEW.motorcycle_id
      AND status = 'active'
      AND id != NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_motorcycle_availability_on_contract
  AFTER INSERT OR UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_motorcycle_availability_on_contract();

-- Function to update proposal status when contract is created
CREATE OR REPLACE FUNCTION public.update_proposal_on_contract_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Link contract to proposal
  UPDATE public.proposals
  SET contract_id = NEW.id
  WHERE id = NEW.proposal_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_proposal_on_contract_creation
  AFTER INSERT ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_proposal_on_contract_creation();

-- Add comments for documentation
COMMENT ON TABLE public.contracts IS 'Stores rental contracts between rental companies and customers';
COMMENT ON COLUMN public.contracts.contract_number IS 'Unique contract identifier (auto-generated)';
COMMENT ON COLUMN public.contracts.payment_day IS 'Day of month for recurring payments (1-28)';
COMMENT ON COLUMN public.contracts.end_date IS 'Contract end date (NULL for open-ended contracts)';
COMMENT ON COLUMN public.contracts.status IS 'Current contract status';

