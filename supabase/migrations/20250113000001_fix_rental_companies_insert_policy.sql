-- Fix: Allow new users to insert their own rental_company record during signup
-- This policy is essential for the registration flow to work
-- Date: 2025-01-13

-- Drop incomplete policy if exists
DROP POLICY IF EXISTS "Platform admins can insert rental companies" ON rental_companies;

-- Recreate platform admin insert policy (complete version)
CREATE POLICY "Platform admins can insert rental companies"
ON rental_companies FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM platform_admins 
        WHERE id = auth.uid()
    )
);

-- NEW: Allow authenticated users to insert their own rental_company record
-- This is safe because:
-- 1. User can only insert where id = auth.uid() (their own record)
-- 2. Supabase Auth already created the user, so auth.uid() is valid
-- 3. After insertion, other RLS policies restrict further access
CREATE POLICY "Users can insert own rental_company record on signup"
ON rental_companies FOR INSERT
WITH CHECK (id = auth.uid());

COMMENT ON POLICY "Users can insert own rental_company record on signup" ON rental_companies 
IS 'Allows new users to create their rental_company profile during registration. Restricted to own record only (id = auth.uid()).';

