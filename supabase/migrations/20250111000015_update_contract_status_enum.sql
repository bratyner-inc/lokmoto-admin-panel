-- Add missing values to contract_status enum
-- This must be run separately before creating the contracts table

-- Add 'suspended' if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'suspended' AND enumtypid = 'contract_status'::regtype) THEN
    ALTER TYPE contract_status ADD VALUE 'suspended';
  END IF;
END $$;

-- Add 'completed' if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'completed' AND enumtypid = 'contract_status'::regtype) THEN
    ALTER TYPE contract_status ADD VALUE 'completed';
  END IF;
END $$;

-- Add 'cancelled' if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cancelled' AND enumtypid = 'contract_status'::regtype) THEN
    ALTER TYPE contract_status ADD VALUE 'cancelled';
  END IF;
END $$;

