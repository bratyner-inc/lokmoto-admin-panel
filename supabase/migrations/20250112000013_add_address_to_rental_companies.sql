-- Migration: Usar tabela addresses polimórfica existente
-- Description: A tabela addresses já existe com owner_type/owner_id
-- Rental companies usam addresses com owner_type='rental_company' e owner_id=rental_company.id
-- Author: Lokmoto Team
-- Date: 2025-01-12

-- ============================================================================
-- NOTA
-- ============================================================================
-- A tabela addresses já existe desde 20250111000008_create_addresses.sql
-- Ela usa relacionamento polimórfico: owner_type + owner_id
-- Não precisamos adicionar address_id em rental_companies
-- Basta usar a relação existente

-- ============================================================================
-- RLS POLICIES PARA RENTAL COMPANIES
-- ============================================================================

-- Remover policies duplicadas se existirem
DROP POLICY IF EXISTS "Rental companies can view their own addresses" ON addresses;
DROP POLICY IF EXISTS "Rental companies can create addresses" ON addresses;
DROP POLICY IF EXISTS "Rental companies can update their own addresses" ON addresses;
DROP POLICY IF EXISTS "Rental companies can delete their own addresses" ON addresses;

-- Rental companies podem ver seus próprios endereços
CREATE POLICY "Rental companies can view their addresses"
ON addresses FOR SELECT
USING (
  owner_type = 'rental_company' AND
  owner_id = auth.uid()
);

-- Rental companies podem criar seus próprios endereços
CREATE POLICY "Rental companies can insert their addresses"
ON addresses FOR INSERT
WITH CHECK (
  owner_type = 'rental_company' AND
  owner_id = auth.uid()
);

-- Rental companies podem atualizar seus próprios endereços
CREATE POLICY "Rental companies can update their addresses"
ON addresses FOR UPDATE
USING (
  owner_type = 'rental_company' AND
  owner_id = auth.uid()
);

-- Rental companies podem deletar seus próprios endereços
CREATE POLICY "Rental companies can delete their addresses"
ON addresses FOR DELETE
USING (
  owner_type = 'rental_company' AND
  owner_id = auth.uid()
);

