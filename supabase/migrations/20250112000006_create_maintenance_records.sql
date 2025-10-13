-- Migration: Create Maintenance Records System
-- Description: Sistema completo de gestão de manutenções de veículos
-- Author: Lokmoto Team
-- Date: 2025-01-12

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Tipo de manutenção
DO $$ BEGIN
    CREATE TYPE maintenance_type AS ENUM ('preventiva', 'corretiva', 'sinistro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status da manutenção
DO $$ BEGIN
    CREATE TYPE maintenance_status AS ENUM ('agendada', 'em_andamento', 'concluida', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Prioridade
DO $$ BEGIN
    CREATE TYPE maintenance_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABELA PRINCIPAL
-- ============================================================================

CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_company_id UUID NOT NULL REFERENCES rental_companies(id) ON DELETE CASCADE,
    motorcycle_id UUID NOT NULL REFERENCES motorcycles(id) ON DELETE CASCADE,
    
    -- Informações básicas
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    maintenance_type maintenance_type NOT NULL,
    status maintenance_status NOT NULL DEFAULT 'agendada',
    priority maintenance_priority NOT NULL DEFAULT 'media',
    
    -- Custos e responsável
    estimated_cost NUMERIC(10, 2),
    actual_cost NUMERIC(10, 2),
    mechanic_name TEXT,
    workshop_name TEXT,
    
    -- Datas
    scheduled_date DATE,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Feedback e notas
    customer_return TEXT, -- O que retornar para o cliente
    internal_notes TEXT,  -- Notas internas da oficina
    
    -- Documentos (caminhos no Storage)
    documents JSONB DEFAULT '[]'::jsonb, -- Array de URLs de documentos
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_dates CHECK (completed_at >= started_at OR completed_at IS NULL),
    CONSTRAINT valid_costs CHECK (estimated_cost >= 0 OR estimated_cost IS NULL),
    CONSTRAINT valid_actual_cost CHECK (actual_cost >= 0 OR actual_cost IS NULL)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_maintenance_rental_company 
ON maintenance_records(rental_company_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_motorcycle 
ON maintenance_records(motorcycle_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_status 
ON maintenance_records(status);

CREATE INDEX IF NOT EXISTS idx_maintenance_type 
ON maintenance_records(maintenance_type);

CREATE INDEX IF NOT EXISTS idx_maintenance_scheduled_date 
ON maintenance_records(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_maintenance_created_at 
ON maintenance_records(created_at DESC);

-- ============================================================================
-- TRIGGER
-- ============================================================================

CREATE TRIGGER update_maintenance_records_updated_at
    BEFORE UPDATE ON maintenance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Store Admin: Ver suas próprias manutenções
CREATE POLICY "Store admin can view own maintenance records" 
ON maintenance_records FOR SELECT
USING (rental_company_id = auth.uid());

-- Store Admin: Inserir suas próprias manutenções
CREATE POLICY "Store admin can insert own maintenance records" 
ON maintenance_records FOR INSERT
WITH CHECK (rental_company_id = auth.uid());

-- Store Admin: Atualizar suas próprias manutenções
CREATE POLICY "Store admin can update own maintenance records" 
ON maintenance_records FOR UPDATE
USING (rental_company_id = auth.uid());

-- Store Admin: Deletar suas próprias manutenções
CREATE POLICY "Store admin can delete own maintenance records" 
ON maintenance_records FOR DELETE
USING (rental_company_id = auth.uid());

-- Global Admin: Acesso total a todas as manutenções
CREATE POLICY "Global admin can view all maintenance records" 
ON maintenance_records FOR SELECT
USING (EXISTS (
    SELECT 1 FROM platform_admins WHERE id = auth.uid()
));

CREATE POLICY "Global admin can manage all maintenance records" 
ON maintenance_records FOR ALL
USING (EXISTS (
    SELECT 1 FROM platform_admins WHERE id = auth.uid()
));

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE maintenance_records IS 'Registros de manutenção de motocicletas';
COMMENT ON COLUMN maintenance_records.maintenance_type IS 'Tipo: preventiva, corretiva ou sinistro';
COMMENT ON COLUMN maintenance_records.status IS 'Status: agendada, em_andamento, concluida, cancelada';
COMMENT ON COLUMN maintenance_records.priority IS 'Prioridade: baixa, media, alta, urgente';
COMMENT ON COLUMN maintenance_records.customer_return IS 'Mensagem/laudo para retornar ao cliente';
COMMENT ON COLUMN maintenance_records.internal_notes IS 'Notas internas da oficina (não visível para cliente)';
COMMENT ON COLUMN maintenance_records.documents IS 'Array de URLs de documentos no Storage';

