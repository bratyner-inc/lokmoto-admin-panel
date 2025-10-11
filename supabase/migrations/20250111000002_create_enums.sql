-- Create ENUM types for the system

-- Subscription status for rental companies
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'pending', 'canceled');

-- Platform admin roles
CREATE TYPE platform_admin_role AS ENUM ('super_admin', 'manager', 'support');

-- Address owner types
CREATE TYPE address_owner_type AS ENUM ('customer', 'rental_company');

-- Proposal status
CREATE TYPE proposal_status AS ENUM ('open', 'pending', 'answered_company', 'answered_customer', 'closed', 'accepted', 'rejected');

-- Contract status
CREATE TYPE contract_status AS ENUM ('active', 'pending_signature', 'pending_payment', 'canceled', 'expired', 'finished');

-- Payment methods
CREATE TYPE payment_method AS ENUM ('credit_card', 'boleto', 'pix');

-- Transaction status
CREATE TYPE transaction_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Transaction types
CREATE TYPE transaction_type AS ENUM ('rental_payment', 'platform_subscription');

-- Ticket types
CREATE TYPE ticket_type AS ENUM ('defect', 'accident', 'other');

-- Ticket status
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'closed');

-- Banner types
CREATE TYPE banner_type AS ENUM ('hero', 'sidebar_horizontal', 'sidebar_vertical');

