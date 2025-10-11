# Apply Proposals Update Migration

## What This Migration Does

This migration adds missing fields to the `proposals` table to support the contract creation workflow:

- **`proposal_number`**: Auto-generated unique identifier (format: PROP-2025-0001)
- **`monthly_value`**: Monthly subscription value (used when creating contracts)
- **`contract_id`**: Reference to the contract created from this proposal (added by previous migration)

## How to Apply

### Via Supabase Dashboard (Recommended)

1. **Go to SQL Editor**:
   https://supabase.com/dashboard/project/rvufhbkmqfrjdcqoeyal/sql/new

2. **Copy and paste this SQL**:

```sql
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
```

3. **Click "Run"**

4. **Verify**:
   - Go to Table Editor → `proposals` table
   - You should see the new columns: `proposal_number`, `monthly_value`
   - Existing proposals should have auto-generated proposal numbers

---

## What Changed in the Frontend

### 1. **Proposal Entity** (`src/domain/entities/Proposal.ts`)
   - ✅ Added `proposalNumber: string`
   - ✅ Added `monthlyValue?: number`
   - ✅ Added `contractId?: string | null`

### 2. **Proposal Mapper** (`src/data/mappers/ProposalMapper.ts`)
   - ✅ Updated to map new fields from database

### 3. **ContratoForm** (`src/presentation/pages/store-admin/ContratoForm.tsx`)
   - ✅ Fixed: Changed filter from `status === 'approved'` to `status === 'accepted'`
   - ✅ Added: Filter to exclude proposals that already have contracts (`!p.contractId`)
   - ✅ Added: Validation for `monthlyValue` before creating contract
   - ✅ Updated: UI text to use "aceita" instead of "aprovada"

---

## Expected Behavior After Migration

### Creating Contracts:
1. Proposals with status `'accepted'` will appear in the contract creation form
2. Proposals that already have contracts won't appear (filtered out)
3. Each proposal displays its unique proposal number (e.g., PROP-2025-0001)
4. Monthly value is required to create a contract

### Auto-Generated Proposal Numbers:
- New proposals automatically get a unique number: `PROP-YYYY-0001`, `PROP-YYYY-0002`, etc.
- Format resets each year
- Numbers are sequential and never repeat

---

## Testing the Fix

After applying the migration:

1. **Go to Proposals page** (`/propostas`)
   - Existing proposals should now have proposal numbers
   
2. **Create a new proposal**
   - It should automatically get a proposal number like `PROP-2025-0001`
   - You can set a `monthly_value`

3. **Accept a proposal**
   - Change its status to `'accepted'`

4. **Go to Contracts → Create New Contract** (`/contratos/novo`)
   - You should see the accepted proposal in the dropdown
   - It should show the proposal number and monthly value
   - After creating a contract, that proposal should no longer appear in the list

---

## Troubleshooting

### Issue: "Nenhuma proposta aceita disponível"

**Cause**: No proposals with status `'accepted'` exist, or all accepted proposals already have contracts.

**Solution**:
1. Go to Proposals page
2. Create a new proposal (or update an existing one)
3. Set its status to `'accepted'`
4. Make sure it has a `monthly_value` set
5. Try creating a contract again

---

## Next Steps

After applying this migration:
- ✅ Contracts can be created from proposals
- ✅ Proposals are properly tracked with unique numbers
- ✅ Monthly subscription model is supported
- ✅ Proposals with contracts are excluded from new contract creation

You're ready to continue with the next feature! 🎉

