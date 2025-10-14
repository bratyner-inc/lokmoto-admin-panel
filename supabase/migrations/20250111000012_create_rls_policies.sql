-- Row-Level Security Policies
-- These policies control who can access what data based on their role

-- Helper function to get user role from auth.users metadata
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    'anonymous'
  );
$$ LANGUAGE SQL STABLE;

-- Helper function to check if user is a platform admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM platform_admins WHERE id = auth.uid()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function to check if user is a rental company
CREATE OR REPLACE FUNCTION is_rental_company()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM rental_companies WHERE id = auth.uid()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function to check if user is a customer
CREATE OR REPLACE FUNCTION is_customer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM customers WHERE id = auth.uid()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- =============================================================================
-- RENTAL COMPANIES RLS POLICIES
-- =============================================================================

-- Platform admins can view all rental companies
CREATE POLICY "Platform admins can view all rental companies"
    ON rental_companies FOR SELECT
    USING (is_platform_admin());

-- Rental companies can view their own record
CREATE POLICY "Rental companies can view own record"
    ON rental_companies FOR SELECT
    USING (id = auth.uid());

-- Rental companies can update their own record
CREATE POLICY "Rental companies can update own record"
    ON rental_companies FOR UPDATE
    USING (id = auth.uid());

-- Platform admins can insert new rental companies
CREATE POLICY "Platform admins can insert rental companies"
    ON rental_companies FOR INSERT
    WITH CHECK (is_platform_admin());

-- Platform admins can update rental companies
CREATE POLICY "Platform admins can update rental companies"
    ON rental_companies FOR UPDATE
    USING (is_platform_admin());

-- =============================================================================
-- PLATFORM ADMINS RLS POLICIES
-- =============================================================================

-- Platform admins can view all admin records
CREATE POLICY "Platform admins can view all admins"
    ON platform_admins FOR SELECT
    USING (is_platform_admin());

-- Super admins can insert new admins
CREATE POLICY "Super admins can insert new admins"
    ON platform_admins FOR INSERT
    WITH CHECK (
        is_platform_admin() AND
        EXISTS (SELECT 1 FROM platform_admins WHERE id = auth.uid() AND role = 'super_admin')
    );

-- Platform admins can update their own record
CREATE POLICY "Platform admins can update own record"
    ON platform_admins FOR UPDATE
    USING (id = auth.uid());

-- =============================================================================
-- CUSTOMERS RLS POLICIES
-- =============================================================================

-- Customers can view their own record
CREATE POLICY "Customers can view own record"
    ON customers FOR SELECT
    USING (id = auth.uid());

-- Customers can update their own record
CREATE POLICY "Customers can update own record"
    ON customers FOR UPDATE
    USING (id = auth.uid());

-- Platform admins can view all customers
CREATE POLICY "Platform admins can view all customers"
    ON customers FOR SELECT
    USING (is_platform_admin());

-- Rental companies can view customers who have proposals for their motorcycles
CREATE POLICY "Rental companies can view their proposal customers"
    ON customers FOR SELECT
    USING (
        is_rental_company() AND
        EXISTS (
            SELECT 1 FROM proposals
            WHERE proposals.customer_id = customers.id
            AND proposals.rental_company_id = auth.uid()
        )
    );

-- =============================================================================
-- CUSTOMER DRIVER LICENSES RLS POLICIES
-- =============================================================================

-- Customers can manage their own licenses
CREATE POLICY "Customers can manage own licenses"
    ON customer_driver_licenses FOR ALL
    USING (customer_id = auth.uid());

-- Platform admins can view all licenses
CREATE POLICY "Platform admins can view all licenses"
    ON customer_driver_licenses FOR SELECT
    USING (is_platform_admin());

-- Rental companies can view licenses of customers with proposals
CREATE POLICY "Rental companies can view proposal customer licenses"
    ON customer_driver_licenses FOR SELECT
    USING (
        is_rental_company() AND
        EXISTS (
            SELECT 1 FROM proposals
            WHERE proposals.customer_id = customer_driver_licenses.customer_id
            AND proposals.rental_company_id = auth.uid()
        )
    );

-- =============================================================================
-- ADDRESSES RLS POLICIES
-- =============================================================================

-- Users can view their own addresses
CREATE POLICY "Users can view own addresses"
    ON addresses FOR SELECT
    USING (owner_id = auth.uid());

-- Users can manage their own addresses
CREATE POLICY "Users can manage own addresses"
    ON addresses FOR ALL
    USING (owner_id = auth.uid());

-- Platform admins can view all addresses
CREATE POLICY "Platform admins can view all addresses"
    ON addresses FOR SELECT
    USING (is_platform_admin());

-- =============================================================================
-- VEHICLE CATEGORIES RLS POLICIES
-- =============================================================================

-- Everyone can view vehicle categories (public data)
CREATE POLICY "Anyone can view vehicle categories"
    ON vehicle_categories FOR SELECT
    TO authenticated
    USING (true);

-- Platform admins can manage categories
CREATE POLICY "Platform admins can manage categories"
    ON vehicle_categories FOR ALL
    USING (is_platform_admin());

-- =============================================================================
-- MOTORCYCLES RLS POLICIES
-- =============================================================================

-- Rental companies can view their own motorcycles
CREATE POLICY "Rental companies can view own motorcycles"
    ON motorcycles FOR SELECT
    USING (rental_company_id = auth.uid());

-- Rental companies can manage their own motorcycles
CREATE POLICY "Rental companies can manage own motorcycles"
    ON motorcycles FOR ALL
    USING (rental_company_id = auth.uid());

-- Platform admins can view all motorcycles
CREATE POLICY "Platform admins can view all motorcycles"
    ON motorcycles FOR SELECT
    USING (is_platform_admin());

-- Customers can view available motorcycles
CREATE POLICY "Customers can view available motorcycles"
    ON motorcycles FOR SELECT
    USING (is_customer() AND is_available = true);

-- =============================================================================
-- PROPOSALS RLS POLICIES
-- =============================================================================

-- Customers can view their own proposals
CREATE POLICY "Customers can view own proposals"
    ON proposals FOR SELECT
    USING (customer_id = auth.uid());

-- Customers can create proposals
CREATE POLICY "Customers can create proposals"
    ON proposals FOR INSERT
    WITH CHECK (customer_id = auth.uid());

-- Customers can update their own proposals (only certain statuses)
CREATE POLICY "Customers can update own proposals"
    ON proposals FOR UPDATE
    USING (customer_id = auth.uid() AND status IN ('open', 'answered_company'));

-- Rental companies can view proposals for their motorcycles
CREATE POLICY "Rental companies can view own proposals"
    ON proposals FOR SELECT
    USING (rental_company_id = auth.uid());

-- Rental companies can update proposals for their motorcycles
CREATE POLICY "Rental companies can update own proposals"
    ON proposals FOR UPDATE
    USING (rental_company_id = auth.uid());

-- Platform admins can view all proposals
CREATE POLICY "Platform admins can view all proposals"
    ON proposals FOR SELECT
    USING (is_platform_admin());

-- Enable realtime for proposals
ALTER PUBLICATION supabase_realtime ADD TABLE proposals;

-- Enable realtime for motorcycles
ALTER PUBLICATION supabase_realtime ADD TABLE motorcycles;

