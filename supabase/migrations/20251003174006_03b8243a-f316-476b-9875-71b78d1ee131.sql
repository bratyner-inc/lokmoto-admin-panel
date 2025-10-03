-- Security Definer Functions for RBAC (avoids RLS recursion)

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Function to check if user is platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'platform_admin'
  );
$$;

-- Function to check if user is rental company
CREATE OR REPLACE FUNCTION public.is_rental_company(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'rental_company'
  );
$$;

-- Function to check if user is customer
CREATE OR REPLACE FUNCTION public.is_customer(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'customer'
  );
$$;

-- Function to get rental company id for motorcycles/proposals/contracts
CREATE OR REPLACE FUNCTION public.get_rental_company_id_for_motorcycle(_motorcycle_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rental_company_id
  FROM public.motorcycles
  WHERE id = _motorcycle_id;
$$;

-- RLS Policies

-- USER_ROLES Policies
CREATE POLICY "Platform admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Platform admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.is_platform_admin(auth.uid()));

-- CUSTOMERS Policies
CREATE POLICY "Customers can view their own profile"
  ON public.customers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Platform admins can view all customers"
  ON public.customers FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Rental companies can view their customers"
  ON public.customers FOR SELECT
  USING (
    public.is_rental_company(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.customer_id = customers.id
        AND contracts.rental_company_id = auth.uid()
    )
  );

CREATE POLICY "Customers can insert their own profile"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Customers can update their own profile"
  ON public.customers FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Platform admins can update customer profiles"
  ON public.customers FOR UPDATE
  USING (public.is_platform_admin(auth.uid()));

-- CUSTOMER_DRIVER_LICENSES Policies
CREATE POLICY "Customers can view their own licenses"
  ON public.customer_driver_licenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = customer_driver_licenses.customer_id
        AND customers.id = auth.uid()
    )
  );

CREATE POLICY "Platform admins can view all licenses"
  ON public.customer_driver_licenses FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Rental companies can view licenses of their customers"
  ON public.customer_driver_licenses FOR SELECT
  USING (
    public.is_rental_company(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.customer_id = customer_driver_licenses.customer_id
        AND contracts.rental_company_id = auth.uid()
    )
  );

CREATE POLICY "Customers can insert their own licenses"
  ON public.customer_driver_licenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = customer_driver_licenses.customer_id
        AND customers.id = auth.uid()
    )
  );

CREATE POLICY "Customers can update their own licenses"
  ON public.customer_driver_licenses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = customer_driver_licenses.customer_id
        AND customers.id = auth.uid()
    )
  );

CREATE POLICY "Customers can delete their own licenses"
  ON public.customer_driver_licenses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = customer_driver_licenses.customer_id
        AND customers.id = auth.uid()
    )
  );

-- RENTAL_COMPANIES Policies
CREATE POLICY "Rental companies can view their own profile"
  ON public.rental_companies FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Platform admins can view all rental companies"
  ON public.rental_companies FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Customers can view rental companies"
  ON public.rental_companies FOR SELECT
  USING (public.is_customer(auth.uid()));

CREATE POLICY "Rental companies can insert their own profile"
  ON public.rental_companies FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Rental companies can update their own profile"
  ON public.rental_companies FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Platform admins can update rental companies"
  ON public.rental_companies FOR UPDATE
  USING (public.is_platform_admin(auth.uid()));

-- PLATFORM_ADMINS Policies
CREATE POLICY "Platform admins can view all admins"
  ON public.platform_admins FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can insert admins"
  ON public.platform_admins FOR INSERT
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can update admins"
  ON public.platform_admins FOR UPDATE
  USING (public.is_platform_admin(auth.uid()));

-- ADDRESSES Policies
CREATE POLICY "Users can view their own addresses"
  ON public.addresses FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Platform admins can view all addresses"
  ON public.addresses FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Users can insert their own addresses"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own addresses"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own addresses"
  ON public.addresses FOR DELETE
  USING (auth.uid() = owner_id);

-- VEHICLE_CATEGORIES Policies (public read, admin write)
CREATE POLICY "Anyone authenticated can view categories"
  ON public.vehicle_categories FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Platform admins can insert categories"
  ON public.vehicle_categories FOR INSERT
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can update categories"
  ON public.vehicle_categories FOR UPDATE
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can delete categories"
  ON public.vehicle_categories FOR DELETE
  USING (public.is_platform_admin(auth.uid()));

-- MOTORCYCLES Policies
CREATE POLICY "Rental companies can view their own motorcycles"
  ON public.motorcycles FOR SELECT
  USING (auth.uid() = rental_company_id);

CREATE POLICY "Platform admins can view all motorcycles"
  ON public.motorcycles FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Customers can view available motorcycles"
  ON public.motorcycles FOR SELECT
  USING (public.is_customer(auth.uid()) AND is_available = true);

CREATE POLICY "Rental companies can insert their own motorcycles"
  ON public.motorcycles FOR INSERT
  WITH CHECK (auth.uid() = rental_company_id);

CREATE POLICY "Rental companies can update their own motorcycles"
  ON public.motorcycles FOR UPDATE
  USING (auth.uid() = rental_company_id);

CREATE POLICY "Platform admins can update motorcycles"
  ON public.motorcycles FOR UPDATE
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Rental companies can delete their own motorcycles"
  ON public.motorcycles FOR DELETE
  USING (auth.uid() = rental_company_id);

-- PROPOSALS Policies
CREATE POLICY "Customers can view their own proposals"
  ON public.proposals FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Rental companies can view proposals for their motorcycles"
  ON public.proposals FOR SELECT
  USING (auth.uid() = rental_company_id);

CREATE POLICY "Platform admins can view all proposals"
  ON public.proposals FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Customers can create proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own proposals"
  ON public.proposals FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Rental companies can update proposals for their motorcycles"
  ON public.proposals FOR UPDATE
  USING (auth.uid() = rental_company_id);

-- CONTRACTS Policies
CREATE POLICY "Customers can view their own contracts"
  ON public.contracts FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Rental companies can view contracts for their motorcycles"
  ON public.contracts FOR SELECT
  USING (auth.uid() = rental_company_id);

CREATE POLICY "Platform admins can view all contracts"
  ON public.contracts FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Rental companies can create contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (auth.uid() = rental_company_id);

CREATE POLICY "Customers can update their own contracts"
  ON public.contracts FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Rental companies can update contracts for their motorcycles"
  ON public.contracts FOR UPDATE
  USING (auth.uid() = rental_company_id);

CREATE POLICY "Platform admins can update contracts"
  ON public.contracts FOR UPDATE
  USING (public.is_platform_admin(auth.uid()));

-- TRANSACTIONS Policies
CREATE POLICY "Users can view their own transactions as payer"
  ON public.transactions FOR SELECT
  USING (auth.uid() = payer_id);

CREATE POLICY "Platform admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can update transactions"
  ON public.transactions FOR UPDATE
  USING (public.is_platform_admin(auth.uid()));

-- TICKETS Policies
CREATE POLICY "Customers can view their own tickets"
  ON public.tickets FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Rental companies can view tickets for their contracts"
  ON public.tickets FOR SELECT
  USING (auth.uid() = rental_company_id);

CREATE POLICY "Platform admins can view all tickets"
  ON public.tickets FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Customers can create tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Rental companies can create tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = rental_company_id);

CREATE POLICY "Customers can update their own tickets"
  ON public.tickets FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Rental companies can update tickets for their contracts"
  ON public.tickets FOR UPDATE
  USING (auth.uid() = rental_company_id);

CREATE POLICY "Platform admins can update tickets"
  ON public.tickets FOR UPDATE
  USING (public.is_platform_admin(auth.uid()));

-- BANNERS Policies (public read, admin write)
CREATE POLICY "Anyone can view active banners"
  ON public.banners FOR SELECT
  USING (is_active = true AND start_date <= NOW() AND (end_date IS NULL OR end_date >= NOW()));

CREATE POLICY "Platform admins can view all banners"
  ON public.banners FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can insert banners"
  ON public.banners FOR INSERT
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can update banners"
  ON public.banners FOR UPDATE
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can delete banners"
  ON public.banners FOR DELETE
  USING (public.is_platform_admin(auth.uid()));