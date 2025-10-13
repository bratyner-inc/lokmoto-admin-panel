-- Row Level Security Policies for Global Admin (Platform Admin)
-- Provides unrestricted access to platform administrators while maintaining security for other roles

-- =============================================================================
-- RENTAL COMPANIES: Global Admin full access, Store Admin own data only
-- =============================================================================

-- Global Admin: Full CRUD access to all rental companies
CREATE POLICY "global_admin_all_access_rental_companies" ON rental_companies
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE id = auth.uid()
        )
    );

-- Store Admin: Read-only access to their own data
CREATE POLICY "store_admin_own_data_rental_companies" ON rental_companies
    FOR SELECT
    USING (id = auth.uid());

-- =============================================================================
-- MOTORCYCLES: Global Admin read access, Store Admin full access to own
-- =============================================================================

-- Global Admin: Read-only access to all motorcycles
CREATE POLICY "global_admin_read_all_motorcycles" ON motorcycles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE id = auth.uid()
        )
    );

-- =============================================================================
-- CONTRACTS: Global Admin read access
-- =============================================================================

-- Global Admin: Read-only access to all contracts
CREATE POLICY "global_admin_read_all_contracts" ON contracts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE id = auth.uid()
        )
    );

-- =============================================================================
-- PROPOSALS: Global Admin read access
-- =============================================================================

-- Global Admin: Read-only access to all proposals
CREATE POLICY "global_admin_read_all_proposals" ON proposals
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE id = auth.uid()
        )
    );

-- =============================================================================
-- TICKETS: Global Admin read access
-- =============================================================================

-- Global Admin: Read-only access to all tickets
CREATE POLICY "global_admin_read_all_tickets" ON tickets
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE id = auth.uid()
        )
    );

-- =============================================================================
-- TRANSACTIONS: Global Admin read access
-- =============================================================================

-- Global Admin: Read-only access to all transactions
CREATE POLICY "global_admin_read_all_transactions" ON transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE id = auth.uid()
        )
    );

-- =============================================================================
-- CUSTOMERS: Global Admin read access
-- =============================================================================

-- Global Admin: Read-only access to all customers
CREATE POLICY "global_admin_read_all_customers" ON customers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE id = auth.uid()
        )
    );

-- =============================================================================
-- SAFE2PAY PLANS: Global Admin full access, others read-only
-- =============================================================================

-- Global Admin: Full CRUD access to Safe2Pay plans
CREATE POLICY "global_admin_all_access_safe2pay_plans" ON safe2pay_plans
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE id = auth.uid()
        )
    );

-- All authenticated users: Read-only access to active plans
CREATE POLICY "authenticated_read_active_plans" ON safe2pay_plans
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND is_active = true
    );

-- Comments for documentation
COMMENT ON POLICY "global_admin_all_access_rental_companies" ON rental_companies IS 
    'Platform admins have full CRUD access to all rental companies';
COMMENT ON POLICY "global_admin_read_all_motorcycles" ON motorcycles IS 
    'Platform admins can view all motorcycles across all rental companies';
COMMENT ON POLICY "global_admin_all_access_safe2pay_plans" ON safe2pay_plans IS 
    'Platform admins can manage Safe2Pay plans synchronization';


