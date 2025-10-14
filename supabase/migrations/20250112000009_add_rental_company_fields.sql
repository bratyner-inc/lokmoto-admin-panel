-- Migration: Add Rental Company Fields
-- Description: Adiciona campos de suspensão, onboarding e logo
-- Author: Lokmoto Team
-- Date: 2025-01-12

-- ============================================================================
-- ADD COLUMNS
-- ============================================================================

-- Campos de suspensão
ALTER TABLE rental_companies
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- Campos de onboarding
ALTER TABLE rental_companies
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- Campo de logo
ALTER TABLE rental_companies
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_rental_companies_suspended 
ON rental_companies(is_suspended) 
WHERE is_suspended = true;

CREATE INDEX IF NOT EXISTS idx_rental_companies_onboarding 
ON rental_companies(onboarding_completed) 
WHERE onboarding_completed = false;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN rental_companies.is_suspended IS 'Indica se a locadora foi suspensa pelo admin da plataforma';
COMMENT ON COLUMN rental_companies.suspension_reason IS 'Motivo da suspensão (visível para o lojista)';
COMMENT ON COLUMN rental_companies.suspended_at IS 'Data e hora da suspensão';
COMMENT ON COLUMN rental_companies.onboarding_completed IS 'Indica se completou o fluxo de onboarding';
COMMENT ON COLUMN rental_companies.onboarding_step IS 'Etapa atual do onboarding (0-4): 0=não iniciado, 1=dados básicos, 2=logo, 3=banco, 4=plano';
COMMENT ON COLUMN rental_companies.logo_url IS 'URL do logo da empresa (armazenado no bucket company-logos)';

