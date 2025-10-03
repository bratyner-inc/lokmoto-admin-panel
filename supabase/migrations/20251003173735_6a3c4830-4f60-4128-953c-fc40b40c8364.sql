-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enums
CREATE TYPE app_role AS ENUM ('customer', 'rental_company', 'platform_admin');
CREATE TYPE admin_role AS ENUM ('super_admin', 'manager', 'support');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'pending', 'canceled');
CREATE TYPE proposal_status AS ENUM ('open', 'pending', 'answered_company', 'answered_customer', 'closed', 'accepted', 'rejected');
CREATE TYPE contract_status AS ENUM ('active', 'pending_signature', 'pending_payment', 'canceled', 'expired', 'finished');
CREATE TYPE payment_method AS ENUM ('credit_card', 'boleto', 'pix');
CREATE TYPE transaction_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE transaction_type AS ENUM ('rental_payment', 'platform_subscription');
CREATE TYPE ticket_type AS ENUM ('defect', 'accident', 'other');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'closed');
CREATE TYPE banner_type AS ENUM ('hero', 'sidebar_horizontal', 'sidebar_vertical');
CREATE TYPE address_owner_type AS ENUM ('customer', 'rental_company');
CREATE TYPE license_category AS ENUM ('A', 'B', 'AB', 'C', 'D', 'E');

-- User Roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Customers (profiles for renters)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  document_id TEXT NOT NULL, -- CPF
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer Driver Licenses
CREATE TABLE public.customer_driver_licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  license_number TEXT NOT NULL,
  category license_category NOT NULL,
  expiration_date DATE NOT NULL,
  issuing_state TEXT NOT NULL,
  issuing_date DATE NOT NULL,
  license_file TEXT, -- Storage reference
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rental Companies
CREATE TABLE public.rental_companies (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  trading_name TEXT NOT NULL, -- razão social
  company_name TEXT NOT NULL, -- nome fantasia
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  subscription_status subscription_status NOT NULL DEFAULT 'pending',
  subscription_plan TEXT, -- Safe2Pay plan ID
  subscription_expiration TIMESTAMPTZ,
  safe2pay_subscription_id TEXT, -- Safe2Pay subscription ID
  bank_account JSONB, -- {agency, account, bankCode}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform Admins
CREATE TABLE public.platform_admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role admin_role NOT NULL DEFAULT 'support',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Addresses (generic for customers and rental companies)
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_type address_owner_type NOT NULL,
  owner_id UUID NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Brazil',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vehicle Categories
CREATE TABLE public.vehicle_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Motorcycles
CREATE TABLE public.motorcycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_company_id UUID REFERENCES public.rental_companies(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.vehicle_categories(id),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  version TEXT NOT NULL,
  year INTEGER NOT NULL,
  plate TEXT UNIQUE NOT NULL,
  renavam TEXT UNIQUE NOT NULL,
  chassis TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  engine_capacity INTEGER NOT NULL, -- cilindrada
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  availability_periods JSONB, -- [{"start": "date", "end": "date"}]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Proposals
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  motorcycle_id UUID REFERENCES public.motorcycles(id) ON DELETE CASCADE NOT NULL,
  rental_company_id UUID REFERENCES public.rental_companies(id) ON DELETE CASCADE NOT NULL,
  status proposal_status NOT NULL DEFAULT 'open',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contracts
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  motorcycle_id UUID REFERENCES public.motorcycles(id) ON DELETE CASCADE NOT NULL,
  rental_company_id UUID REFERENCES public.rental_companies(id) ON DELETE CASCADE NOT NULL,
  contract_file TEXT, -- Storage reference
  status contract_status NOT NULL DEFAULT 'pending_signature',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions (all payments go through platform)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payer_id UUID NOT NULL, -- customer or rental_company
  receiver_id UUID NOT NULL, -- platform (fixed)
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  payment_method payment_method NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  external_reference TEXT, -- Safe2Pay transaction ID
  safe2pay_subscription_id TEXT, -- Safe2Pay subscription ID
  contract_id UUID REFERENCES public.contracts(id),
  transaction_type transaction_type NOT NULL,
  customer_data JSONB, -- {cpf_cnpj, id, name, rental_company_cnpj, rental_company_name}
  rental_company_data JSONB, -- {cnpj, id, trading_name, subscription_plan}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tickets
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  rental_company_id UUID REFERENCES public.rental_companies(id) ON DELETE CASCADE NOT NULL,
  type ticket_type NOT NULL,
  description TEXT NOT NULL,
  occurrence_date TIMESTAMPTZ NOT NULL,
  location TEXT, -- Can be upgraded to PostGIS geometry
  status ticket_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Banners
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image TEXT, -- Storage reference
  url TEXT,
  type banner_type NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_driver_licenses_updated_at BEFORE UPDATE ON public.customer_driver_licenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_companies_updated_at BEFORE UPDATE ON public.rental_companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_admins_updated_at BEFORE UPDATE ON public.platform_admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_categories_updated_at BEFORE UPDATE ON public.vehicle_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_motorcycles_updated_at BEFORE UPDATE ON public.motorcycles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_document_id ON public.customers(document_id);

CREATE INDEX idx_customer_driver_licenses_customer_id ON public.customer_driver_licenses(customer_id);

CREATE INDEX idx_rental_companies_email ON public.rental_companies(email);
CREATE INDEX idx_rental_companies_cnpj ON public.rental_companies(cnpj);
CREATE INDEX idx_rental_companies_subscription_status ON public.rental_companies(subscription_status);

CREATE INDEX idx_platform_admins_email ON public.platform_admins(email);
CREATE INDEX idx_platform_admins_role ON public.platform_admins(role);

CREATE INDEX idx_addresses_owner ON public.addresses(owner_type, owner_id);

CREATE INDEX idx_motorcycles_rental_company_id ON public.motorcycles(rental_company_id);
CREATE INDEX idx_motorcycles_category_id ON public.motorcycles(category_id);
CREATE INDEX idx_motorcycles_is_available ON public.motorcycles(is_available);
CREATE INDEX idx_motorcycles_brand_model ON public.motorcycles USING gin(brand gin_trgm_ops, model gin_trgm_ops);

CREATE INDEX idx_proposals_customer_id ON public.proposals(customer_id);
CREATE INDEX idx_proposals_motorcycle_id ON public.proposals(motorcycle_id);
CREATE INDEX idx_proposals_rental_company_id ON public.proposals(rental_company_id);
CREATE INDEX idx_proposals_status ON public.proposals(status);

CREATE INDEX idx_contracts_proposal_id ON public.contracts(proposal_id);
CREATE INDEX idx_contracts_customer_id ON public.contracts(customer_id);
CREATE INDEX idx_contracts_motorcycle_id ON public.contracts(motorcycle_id);
CREATE INDEX idx_contracts_rental_company_id ON public.contracts(rental_company_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);

CREATE INDEX idx_transactions_payer_id ON public.transactions(payer_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_transaction_type ON public.transactions(transaction_type);
CREATE INDEX idx_transactions_external_reference ON public.transactions(external_reference);
CREATE INDEX idx_transactions_safe2pay_subscription_id ON public.transactions(safe2pay_subscription_id);

CREATE INDEX idx_tickets_contract_id ON public.tickets(contract_id);
CREATE INDEX idx_tickets_customer_id ON public.tickets(customer_id);
CREATE INDEX idx_tickets_rental_company_id ON public.tickets(rental_company_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);

CREATE INDEX idx_banners_type ON public.banners(type);
CREATE INDEX idx_banners_is_active ON public.banners(is_active);
CREATE INDEX idx_banners_dates ON public.banners(start_date, end_date);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_driver_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motorcycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;