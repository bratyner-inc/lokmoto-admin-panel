-- Migration: Create Rental Company Bank Accounts
-- Description: Sistema de contas bancárias das locadoras (múltiplas contas)
-- Author: Lokmoto Team
-- Date: 2025-01-12

-- ============================================================================
-- ENUM
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE bank_account_type AS ENUM ('corrente', 'poupanca');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABELA
-- ============================================================================

CREATE TABLE IF NOT EXISTS rental_company_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_company_id UUID NOT NULL REFERENCES rental_companies(id) ON DELETE CASCADE,
    bank_code VARCHAR(3) NOT NULL REFERENCES banks(code),
    account_type bank_account_type NOT NULL DEFAULT 'corrente',
    agency VARCHAR(10) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    account_digit VARCHAR(2),
    pix_key VARCHAR(255),
    pix_key_type VARCHAR(20), -- cpf, cnpj, email, phone, random
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_bank_accounts_rental_company 
ON rental_company_bank_accounts(rental_company_id);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_bank_code 
ON rental_company_bank_accounts(bank_code);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_primary 
ON rental_company_bank_accounts(rental_company_id, is_primary) 
WHERE is_primary = true;

-- ============================================================================
-- TRIGGER
-- ============================================================================

CREATE TRIGGER update_bank_accounts_updated_at
    BEFORE UPDATE ON rental_company_bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE rental_company_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Store Admin pode ver suas próprias contas bancárias
CREATE POLICY "Store admin can view own bank accounts"
ON rental_company_bank_accounts FOR SELECT
USING (rental_company_id = auth.uid());

-- Store Admin pode inserir suas próprias contas bancárias
CREATE POLICY "Store admin can insert own bank accounts"
ON rental_company_bank_accounts FOR INSERT
WITH CHECK (rental_company_id = auth.uid());

-- Store Admin pode atualizar suas próprias contas bancárias
CREATE POLICY "Store admin can update own bank accounts"
ON rental_company_bank_accounts FOR UPDATE
USING (rental_company_id = auth.uid());

-- Store Admin pode deletar suas próprias contas bancárias
CREATE POLICY "Store admin can delete own bank accounts"
ON rental_company_bank_accounts FOR DELETE
USING (rental_company_id = auth.uid());

-- Global Admin pode ver todas as contas bancárias
CREATE POLICY "Global admin can view all bank accounts"
ON rental_company_bank_accounts FOR SELECT
USING (EXISTS (
    SELECT 1 FROM platform_admins WHERE id = auth.uid()
));

-- Global Admin pode gerenciar todas as contas
CREATE POLICY "Global admin can manage all bank accounts"
ON rental_company_bank_accounts FOR ALL
USING (EXISTS (
    SELECT 1 FROM platform_admins WHERE id = auth.uid()
));

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE rental_company_bank_accounts IS 'Contas bancárias das locadoras (permite múltiplas contas)';
COMMENT ON COLUMN rental_company_bank_accounts.bank_code IS 'Código do banco (referência à tabela banks)';
COMMENT ON COLUMN rental_company_bank_accounts.account_type IS 'Tipo da conta: corrente ou poupança';
COMMENT ON COLUMN rental_company_bank_accounts.agency IS 'Número da agência (sem dígito)';
COMMENT ON COLUMN rental_company_bank_accounts.account_number IS 'Número da conta (sem dígito)';
COMMENT ON COLUMN rental_company_bank_accounts.account_digit IS 'Dígito verificador da conta';
COMMENT ON COLUMN rental_company_bank_accounts.pix_key IS 'Chave PIX';
COMMENT ON COLUMN rental_company_bank_accounts.pix_key_type IS 'Tipo da chave PIX: cpf, cnpj, email, phone, random';
COMMENT ON COLUMN rental_company_bank_accounts.is_primary IS 'Indica se é a conta bancária principal da locadora';

