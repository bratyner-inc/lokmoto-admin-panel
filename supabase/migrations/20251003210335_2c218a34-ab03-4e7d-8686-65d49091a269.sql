-- Add customer role to app_role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'customer') THEN
    ALTER TYPE app_role ADD VALUE 'customer';
  END IF;
END $$;

-- Create customer_rental_company_links table for linking customers with rental companies
CREATE TABLE IF NOT EXISTS public.customer_rental_company_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  rental_company_id uuid REFERENCES public.rental_companies(id) ON DELETE CASCADE NOT NULL,
  proposal_id uuid REFERENCES public.proposals(id) ON DELETE SET NULL,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(customer_id, rental_company_id)
);

-- Enable RLS on customer_rental_company_links
ALTER TABLE public.customer_rental_company_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_rental_company_links
CREATE POLICY "Customers can view their own links"
  ON public.customer_rental_company_links
  FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Rental companies can view links with their customers"
  ON public.customer_rental_company_links
  FOR SELECT
  TO authenticated
  USING (auth.uid() = rental_company_id);

CREATE POLICY "Platform admins can view all links"
  ON public.customer_rental_company_links
  FOR SELECT
  TO authenticated
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "System can create links"
  ON public.customer_rental_company_links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id OR auth.uid() = rental_company_id);

-- Create or replace function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_customer_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into user_roles with customer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');

  -- Insert into customers table
  INSERT INTO public.customers (
    id,
    full_name,
    email,
    phone,
    document_id
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'document_id', '')
  );

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate it
DROP TRIGGER IF EXISTS on_auth_customer_created ON auth.users;

CREATE TRIGGER on_auth_customer_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'role' = 'customer' OR NEW.raw_user_meta_data->>'role' IS NULL)
  EXECUTE FUNCTION public.handle_new_customer_signup();

-- Create function to create link when proposal is created
CREATE OR REPLACE FUNCTION public.create_customer_rental_link_on_proposal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert link if it doesn't exist
  INSERT INTO public.customer_rental_company_links (
    customer_id,
    rental_company_id,
    proposal_id
  )
  VALUES (
    NEW.customer_id,
    NEW.rental_company_id,
    NEW.id
  )
  ON CONFLICT (customer_id, rental_company_id) 
  DO UPDATE SET 
    proposal_id = NEW.id,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate it
DROP TRIGGER IF EXISTS on_proposal_created ON public.proposals;

CREATE TRIGGER on_proposal_created
  AFTER INSERT ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.create_customer_rental_link_on_proposal();

-- Create function to update link when contract is created
CREATE OR REPLACE FUNCTION public.update_customer_rental_link_on_contract()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update link with contract_id
  UPDATE public.customer_rental_company_links
  SET 
    contract_id = NEW.id,
    updated_at = now()
  WHERE customer_id = NEW.customer_id
    AND rental_company_id = NEW.rental_company_id;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate it
DROP TRIGGER IF EXISTS on_contract_created ON public.contracts;

CREATE TRIGGER on_contract_created
  AFTER INSERT ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_rental_link_on_contract();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_customer_rental_links_customer ON public.customer_rental_company_links(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_rental_links_rental_company ON public.customer_rental_company_links(rental_company_id);