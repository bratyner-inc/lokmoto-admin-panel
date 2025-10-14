-- Update proposals table to support contract creation workflow
-- Add missing fields for proper proposal tracking and monthly subscription model

-- Add proposal_number column with auto-generation
ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS proposal_number TEXT UNIQUE;

-- Add monthly_value for subscription-based pricing
ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS monthly_value NUMERIC(10, 2) CHECK (monthly_value IS NULL OR monthly_value > 0);

-- Create function to generate proposal number
CREATE OR REPLACE FUNCTION public.generate_proposal_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  -- Format: PROP-YYYY-NNNN (e.g., PROP-2025-0001)
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(proposal_number FROM 'PROP-[0-9]{4}-([0-9]{4})') AS INTEGER)
  ), 0) + 1 INTO counter
  FROM public.proposals
  WHERE proposal_number LIKE 'PROP-' || EXTRACT(YEAR FROM NOW())::TEXT || '-%';
  
  new_number := 'PROP-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(counter::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$;

-- Trigger to auto-generate proposal number if not provided
CREATE OR REPLACE FUNCTION public.set_proposal_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.proposal_number IS NULL OR NEW.proposal_number = '' THEN
    NEW.proposal_number := public.generate_proposal_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_set_proposal_number ON public.proposals;

CREATE TRIGGER trigger_set_proposal_number
  BEFORE INSERT ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_proposal_number();

-- Backfill proposal numbers for existing records
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id FROM public.proposals WHERE proposal_number IS NULL ORDER BY created_at
  LOOP
    UPDATE public.proposals
    SET proposal_number = public.generate_proposal_number()
    WHERE id = rec.id;
  END LOOP;
END $$;

-- Make proposal_number NOT NULL after backfill
ALTER TABLE public.proposals
ALTER COLUMN proposal_number SET NOT NULL;

-- Create index for proposal_number
CREATE INDEX IF NOT EXISTS idx_proposals_proposal_number ON public.proposals(proposal_number);

-- Add comments
COMMENT ON COLUMN public.proposals.proposal_number IS 'Unique proposal identifier (auto-generated)';
COMMENT ON COLUMN public.proposals.monthly_value IS 'Monthly subscription value (alternative to daily rate)';
COMMENT ON COLUMN public.proposals.contract_id IS 'Reference to contract created from this proposal';

