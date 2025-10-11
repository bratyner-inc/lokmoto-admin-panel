# Apply Transactions Migration - Manual Guide

## 📋 Overview

This guide will help you manually apply the transactions migration to your Supabase database.

---

## ⚠️ Important Notes

1. **This migration requires that previous migrations are applied first**
   - Especially the contracts migration
   - Enums must already exist

2. **Run this in the Supabase Dashboard SQL Editor**
   - Go to your Supabase project
   - Navigate to: SQL Editor → New query
   - Copy and paste the SQL below

3. **The migration is safe to run multiple times**
   - Uses `IF NOT EXISTS` checks where appropriate
   - Won't duplicate data

---

## 🗄️ Migration SQL

Copy and paste this entire SQL script into Supabase SQL Editor:

```sql
-- ============================================================================
-- Transactions Table Migration
-- Creates table for payment transactions with Safe2Pay integration
-- ============================================================================

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    rental_company_id UUID NOT NULL REFERENCES rental_companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    -- Transaction details
    transaction_type transaction_type NOT NULL DEFAULT 'rental_payment',
    payment_method payment_method NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    
    -- Amounts
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    
    -- Safe2Pay integration
    safe2pay_transaction_id TEXT,
    safe2pay_payment_url TEXT,
    safe2pay_barcode TEXT,
    safe2pay_pix_qrcode TEXT,
    safe2pay_response JSONB,
    
    -- Dates
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    
    -- Additional info
    description TEXT,
    reference_month INTEGER CHECK (reference_month >= 1 AND reference_month <= 12),
    reference_year INTEGER CHECK (reference_year >= 2024),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_contract_id ON transactions(contract_id);
CREATE INDEX IF NOT EXISTS idx_transactions_rental_company_id ON transactions(rental_company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_safe2pay_transaction_id ON transactions(safe2pay_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_year, reference_month);

-- Trigger for updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_transactions_updated_at'
    ) THEN
        CREATE TRIGGER update_transactions_updated_at
            BEFORE UPDATE ON transactions
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Rental companies can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Rental companies can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Rental companies can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Customers can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Platform admins can view all transactions" ON transactions;

-- Rental companies can view their own transactions
CREATE POLICY "Rental companies can view their own transactions"
    ON public.transactions
    FOR SELECT
    TO authenticated
    USING (
        rental_company_id = auth.uid()
    );

-- Rental companies can insert their own transactions
CREATE POLICY "Rental companies can insert their own transactions"
    ON public.transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        rental_company_id = auth.uid()
    );

-- Rental companies can update their own transactions
CREATE POLICY "Rental companies can update their own transactions"
    ON public.transactions
    FOR UPDATE
    TO authenticated
    USING (
        rental_company_id = auth.uid()
    );

-- Customers can view their own transactions
CREATE POLICY "Customers can view their own transactions"
    ON public.transactions
    FOR SELECT
    TO authenticated
    USING (
        customer_id = auth.uid()
    );

-- Platform admins can view all transactions
CREATE POLICY "Platform admins can view all transactions"
    ON public.transactions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE id = auth.uid()
        )
    );

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE transactions IS 'Payment transactions for contracts and platform subscriptions';
COMMENT ON COLUMN transactions.safe2pay_transaction_id IS 'Safe2Pay transaction ID for tracking';
COMMENT ON COLUMN transactions.safe2pay_payment_url IS 'Payment URL generated by Safe2Pay (boleto/pix)';
COMMENT ON COLUMN transactions.safe2pay_response IS 'Complete Safe2Pay API response for debugging';
COMMENT ON COLUMN transactions.reference_month IS 'Month reference for rental payments (1-12)';
COMMENT ON COLUMN transactions.reference_year IS 'Year reference for rental payments';

-- ============================================================================
-- Auto-Generation Function
-- Function to generate monthly transactions for active contracts
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_monthly_transactions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    contract_record RECORD;
    transaction_count INTEGER := 0;
    current_month INTEGER;
    current_year INTEGER;
    transaction_due_date DATE;
BEGIN
    -- Get current month and year
    current_month := EXTRACT(MONTH FROM NOW());
    current_year := EXTRACT(YEAR FROM NOW());
    
    -- Loop through active contracts
    FOR contract_record IN 
        SELECT 
            c.id,
            c.rental_company_id,
            c.customer_id,
            c.monthly_value,
            c.payment_day
        FROM public.contracts c
        WHERE 
            c.status = 'active'
            AND (c.end_date IS NULL OR c.end_date >= CURRENT_DATE)
            -- Check if transaction for this month doesn't exist yet
            AND NOT EXISTS (
                SELECT 1 FROM public.transactions t
                WHERE 
                    t.contract_id = c.id
                    AND t.reference_month = current_month
                    AND t.reference_year = current_year
            )
    LOOP
        -- Calculate due date (payment_day of current month)
        transaction_due_date := make_date(
            current_year, 
            current_month, 
            LEAST(contract_record.payment_day, 28) -- Ensure valid day
        );
        
        -- Create transaction
        INSERT INTO public.transactions (
            contract_id,
            rental_company_id,
            customer_id,
            transaction_type,
            payment_method,
            status,
            amount,
            due_date,
            description,
            reference_month,
            reference_year
        ) VALUES (
            contract_record.id,
            contract_record.rental_company_id,
            contract_record.customer_id,
            'rental_payment',
            'boleto',
            'pending',
            contract_record.monthly_value,
            transaction_due_date,
            'Mensalidade de aluguel - ' || TO_CHAR(NOW(), 'Month/YYYY'),
            current_month,
            current_year
        );
        
        transaction_count := transaction_count + 1;
    END LOOP;
    
    RETURN transaction_count;
END;
$$;

COMMENT ON FUNCTION public.generate_monthly_transactions() IS 'Auto-generates monthly transactions for active contracts';

-- ============================================================================
-- Success Message
-- ============================================================================

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Transactions migration applied successfully!';
    RAISE NOTICE '📊 Table created: transactions';
    RAISE NOTICE '🔐 RLS policies applied';
    RAISE NOTICE '🤖 Auto-generation function created: generate_monthly_transactions()';
END $$;
```

---

## ✅ Verify Migration

After running the migration, verify it was successful:

### 1. Check if table exists
```sql
SELECT * FROM transactions LIMIT 5;
```

Expected: Query should run without errors (may return 0 rows if no transactions yet)

### 2. Check RLS policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'transactions';
```

Expected: Should show 5 policies

### 3. Check function exists
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'generate_monthly_transactions';
```

Expected: Should return `generate_monthly_transactions`

---

## 🧪 Test Transaction Generation

### Manually Generate Transactions

```sql
-- This will create pending transactions for all active contracts
SELECT generate_monthly_transactions();
```

**Output:** Number of transactions created (integer)

### Check Created Transactions

```sql
SELECT 
    id,
    contract_id,
    amount,
    due_date,
    status,
    reference_month,
    reference_year,
    description
FROM transactions
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔄 Schedule Auto-Generation (Optional)

### Option 1: Using pg_cron (Recommended)

```sql
-- Enable pg_cron extension (requires superuser)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule to run on the 1st of every month at 00:00
SELECT cron.schedule(
    'generate-monthly-transactions',
    '0 0 1 * *',
    'SELECT generate_monthly_transactions();'
);
```

### Option 2: Using Supabase Edge Function

Create a Supabase Edge Function that calls:
```typescript
await supabase.rpc('generate_monthly_transactions');
```

Schedule it via:
- Supabase Cron Jobs
- External cron service (e.g., GitHub Actions, Vercel Cron)

---

## 🛠️ Troubleshooting

### Error: `relation "contracts" does not exist`
**Cause:** Contracts table not created yet  
**Solution:** Apply contracts migration first

### Error: `type "transaction_type" does not exist`
**Cause:** ENUMs not created  
**Solution:** Apply enum migration first (`20250111000002_create_enums.sql`)

### Error: `function update_updated_at_column() does not exist`
**Cause:** Trigger function not created  
**Solution:** Apply trigger migration first (`20250111000003_create_updated_at_trigger.sql`)

### No transactions generated when calling function
**Possible Causes:**
1. No active contracts exist
2. Transactions already exist for current month
3. Contracts have invalid `payment_day` values

**Debug:**
```sql
-- Check active contracts
SELECT id, contract_number, status, monthly_value, payment_day
FROM contracts
WHERE status = 'active';

-- Check existing transactions for current month
SELECT * FROM transactions
WHERE reference_month = EXTRACT(MONTH FROM NOW())
  AND reference_year = EXTRACT(YEAR FROM NOW());
```

---

## 📚 Related Documentation

- `PAYMENTS_MODULE_SUMMARY.md` - Full module documentation
- `APPLY_CONTRACTS_MIGRATION.md` - Contracts migration guide
- `20250111000018_create_transactions.sql` - Original migration file

---

## 🎉 Next Steps

After applying this migration:

1. ✅ Verify table and policies
2. ✅ Test transaction generation
3. ✅ Configure Safe2Pay (see `PAYMENTS_MODULE_SUMMARY.md`)
4. ✅ Set up auto-generation schedule (optional)
5. ✅ Access `/pagamentos` in the app

---

## 🆘 Need Help?

If migration fails:
1. Check error message carefully
2. Verify all previous migrations are applied
3. Check database logs in Supabase Dashboard
4. Review `APPLY_CONTRACTS_MIGRATION.md` for dependency issues

