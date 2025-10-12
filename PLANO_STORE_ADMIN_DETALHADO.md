# Plano Detalhado: Completar Store Admin

## 📊 Estado Atual (Análise Completa)

### ✅ Funcionalidades JÁ MIGRADAS (Dados Reais + Supabase)
- ✅ **Veículos** - CRUD completo com Storage
- ✅ **Propostas** - CRUD completo
- ✅ **Contratos** - CRUD completo
- ✅ **Clientes** - CRUD completo  
- ✅ **Pagamentos/Transações** - CRUD completo
- ✅ **Tickets** - CRUD completo com anexos

### ⏳ Funcionalidades COM MOCK DATA (Precisa Migrar)
- ⏳ **Manutenção** - Páginas existem, usa mock data
- ⏳ **Assinatura** - Página existe, usa mock data

### ❌ Funcionalidades NÃO IMPLEMENTADAS
- ❌ **Relatórios** - Não existe
- ❌ **Configurações da Loja** - Não existe
- ❌ **Dashboard Store Admin** - Existe mas pode melhorar

---

## 🎯 Plano de Implementação

## Módulo 1: Sistema de Manutenção de Veículos

### Contexto
As páginas já existem (`Manutencao.tsx`, `ManutencaoForm.tsx`, `ManutencaoDetalhes.tsx`) mas usam dados mockados. Precisamos criar a tabela no banco e migrar para dados reais.

### 1.1 Database Layer

**Migration: `20250112000006_create_maintenance_records.sql`**

```sql
-- Enum para tipo de manutenção
CREATE TYPE maintenance_type AS ENUM ('preventiva', 'corretiva', 'sinistro');

-- Enum para status
CREATE TYPE maintenance_status AS ENUM ('agendada', 'em_andamento', 'concluida', 'cancelada');

-- Enum para prioridade
CREATE TYPE maintenance_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- Tabela de registros de manutenção
CREATE TABLE maintenance_records (
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
    documents JSONB, -- Array de URLs de documentos
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_dates CHECK (completed_at >= started_at OR completed_at IS NULL)
);

-- Indexes
CREATE INDEX idx_maintenance_rental_company ON maintenance_records(rental_company_id);
CREATE INDEX idx_maintenance_motorcycle ON maintenance_records(motorcycle_id);
CREATE INDEX idx_maintenance_status ON maintenance_records(status);
CREATE INDEX idx_maintenance_type ON maintenance_records(maintenance_type);
CREATE INDEX idx_maintenance_scheduled_date ON maintenance_records(scheduled_date);

-- Trigger
CREATE TRIGGER update_maintenance_records_updated_at
    BEFORE UPDATE ON maintenance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Store Admin pode gerenciar suas próprias manutenções
CREATE POLICY "Store admin can view own maintenance records" 
ON maintenance_records FOR SELECT
USING (rental_company_id = auth.uid());

CREATE POLICY "Store admin can insert own maintenance records" 
ON maintenance_records FOR INSERT
WITH CHECK (rental_company_id = auth.uid());

CREATE POLICY "Store admin can update own maintenance records" 
ON maintenance_records FOR UPDATE
USING (rental_company_id = auth.uid());

CREATE POLICY "Store admin can delete own maintenance records" 
ON maintenance_records FOR DELETE
USING (rental_company_id = auth.uid());

-- Global Admin tem acesso total
CREATE POLICY "Global admin can view all maintenance records" 
ON maintenance_records FOR SELECT
USING (EXISTS (SELECT 1 FROM platform_admins WHERE id = auth.uid()));

COMMENT ON TABLE maintenance_records IS 'Registros de manutenção de motocicletas';
```

**Estimativa**: 30 minutos

### 1.2 Domain Layer

**`src/domain/entities/MaintenanceRecord.ts`**

```typescript
export type MaintenanceType = 'preventiva' | 'corretiva' | 'sinistro';
export type MaintenanceStatus = 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
export type MaintenancePriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface MaintenanceRecord {
  id: string;
  rentalCompanyId: string;
  motorcycleId: string;
  title: string;
  description: string;
  maintenanceType: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  estimatedCost?: number;
  actualCost?: number;
  mechanicName?: string;
  workshopName?: string;
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  customerReturn?: string;
  internalNotes?: string;
  documents?: string[]; // URLs
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRecordWithVehicle extends MaintenanceRecord {
  motorcycle?: {
    id: string;
    model: string;
    brand: string;
    plate: string;
  };
}

export interface CreateMaintenanceRecordDTO {
  motorcycleId: string;
  title: string;
  description: string;
  maintenanceType: MaintenanceType;
  priority?: MaintenancePriority;
  estimatedCost?: number;
  mechanicName?: string;
  workshopName?: string;
  scheduledDate?: Date;
  internalNotes?: string;
}

export interface UpdateMaintenanceRecordDTO {
  title?: string;
  description?: string;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  actualCost?: number;
  mechanicName?: string;
  workshopName?: string;
  startedAt?: Date;
  completedAt?: Date;
  customerReturn?: string;
  internalNotes?: string;
}
```

**`src/domain/repositories/IMaintenanceRepository.ts`**

```typescript
import { MaintenanceRecord, MaintenanceRecordWithVehicle, CreateMaintenanceRecordDTO, UpdateMaintenanceRecordDTO, MaintenanceStatus } from '../entities/MaintenanceRecord';

export interface IMaintenanceRepository {
  getAll(): Promise<MaintenanceRecordWithVehicle[]>;
  getById(id: string): Promise<MaintenanceRecordWithVehicle | null>;
  getByMotorcycle(motorcycleId: string): Promise<MaintenanceRecord[]>;
  getByStatus(status: MaintenanceStatus): Promise<MaintenanceRecordWithVehicle[]>;
  create(data: CreateMaintenanceRecordDTO, rentalCompanyId: string): Promise<MaintenanceRecord>;
  update(id: string, data: UpdateMaintenanceRecordDTO): Promise<MaintenanceRecord>;
  delete(id: string): Promise<void>;
  getStats(): Promise<MaintenanceStats>;
}

export interface MaintenanceStats {
  total: number;
  agendada: number;
  em_andamento: number;
  concluida: number;
  totalCost: number;
  avgCost: number;
}
```

**Estimativa**: 20 minutos

### 1.3 Data Layer

**`src/data/mappers/MaintenanceMapper.ts`**
- Conversão DB ↔ Domain

**`src/data/repositories/MaintenanceRepository.ts`**
- Implementação completa do CRUD
- Queries com join de motorcycles
- Cálculos de estatísticas

**Estimativa**: 45 minutos

### 1.4 Presentation Layer

**`src/presentation/hooks/useMaintenance.ts`**
- Hook principal: `useMaintenance()` - lista e stats
- Hook individual: `useMaintenanceRecord(id)` - um registro
- Hook stats: `useMaintenanceStats()` - estatísticas

**Migrar páginas:**
- `src/pages/store-admin/Manutencao.tsx` → usar hooks reais
- `src/pages/store-admin/ManutencaoForm.tsx` → integrar com repository
- `src/pages/store-admin/ManutencaoDetalhes.tsx` → dados reais

**Estimativa**: 1 hora

**Total Módulo 1**: ~2h30min

---

## Módulo 2: Assinatura da Locadora (Dados Reais)

### Contexto
A página existe mas usa mock data. Precisamos integrar com:
- Dados reais da `rental_company` logada
- Planos sincronizados do `safe2pay_plans`
- Status da assinatura
- Histórico de pagamentos

### 2.1 Buscar Dados Reais

**Não precisa de migration** - tabelas já existem

**Integração com:**
- `rental_companies.subscription_status`
- `rental_companies.subscription_plan`
- `rental_companies.subscription_expiration`
- `safe2pay_plans` (planos disponíveis)

### 2.2 Presentation Layer

**Atualizar `src/pages/store-admin/Assinatura.tsx`:**

```typescript
// Substituir mock por:
import { useAuth } from '@/hooks/useAuth';
import { useSafe2PayPlans } from '@/presentation/hooks/useSafe2PayPlans';

const Assinatura = () => {
  const { user } = useAuth(); // rental company logada
  const { plans } = useSafe2PayPlans(); // planos disponíveis
  
  // Buscar dados reais da rental_company
  const currentPlan = {
    name: user.subscriptionPlan || 'Sem plano',
    status: user.subscriptionStatus,
    expiration: user.subscriptionExpiration,
    // ...
  };
  
  // Permitir upgrade/downgrade
  const handleChangePlan = async (planId: string) => {
    // Integrar com Safe2Pay API para processar mudança
    // Atualizar rental_companies.subscription_plan
  };
};
```

**Features:**
- ✅ Mostra plano atual (dados reais)
- ✅ Lista planos disponíveis (de `safe2pay_plans`)
- ✅ Permite upgrade/downgrade
- ⏳ Histórico de pagamentos (futuro - precisa tabela)

**Estimativa**: 1 hora

**Total Módulo 2**: ~1h

---

## Módulo 3: Relatórios (Opcional - Futuro)

### Contexto
Não existe ainda. Seria útil mas não é crítico.

### Features Sugeridas:
- Relatório Financeiro (receitas, despesas, lucro)
- Relatório de Veículos (ocupação, manutenções)
- Relatório de Contratos (ativos, vencidos, renovações)
- Exportação em PDF/Excel

### Complexidade: Alta
### Estimativa: 4-6 horas

**Decisão**: Deixar para Phase 3 (não implementar agora)

---

## Módulo 4: Dashboard Store Admin (Melhorias - Opcional)

### Contexto
Já existe mas pode ser melhorado com dados reais de manutenção.

### Melhorias Sugeridas:
- Card: "Manutenções Pendentes"
- Card: "Custo Total de Manutenções (mês)"
- Gráfico: Manutenções por tipo
- Alertas: Veículos com manutenção atrasada

**Estimativa**: 30 minutos

**Total Módulo 4**: ~30min

---

## 📊 Resumo do Plano

| Módulo | Descrição | Complexidade | Tempo | Prioridade |
|--------|-----------|--------------|-------|------------|
| 1. Manutenção | Migration + CRUD completo + Migrar 3 páginas | Média | 2h30min | Alta |
| 2. Assinatura | Integrar com dados reais | Baixa | 1h | Média |
| 3. Relatórios | Criar do zero | Alta | 4-6h | Baixa |
| 4. Dashboard | Melhorias | Baixa | 30min | Média |

**Total (Prioridades Alta + Média)**: ~4h

---

## 🎯 Ordem de Implementação Recomendada

### Opção A: Completo e Sequencial
1. ✅ Manutenção (2h30) - Mais complexo, maior impacto
2. ✅ Assinatura (1h) - Complementa funcionalidade crítica
3. ✅ Dashboard Melhorias (30min) - Aproveita dados de manutenção
4. ⏳ Relatórios (futuro) - Deixar para Phase 3

**Total**: 4 horas

### Opção B: Mínimo Viável
1. ✅ Manutenção (2h30) - Essencial
2. ⏳ Assinatura (futuro) - Deixar como está (mock)
3. ⏳ Demais módulos (futuro)

**Total**: 2h30min

### Opção C: Assinatura Primeiro
1. ✅ Assinatura (1h) - Mais rápido, menor risco
2. ✅ Manutenção (2h30) - Depois
3. ✅ Dashboard (30min)

**Total**: 4 horas

---

## 🔍 Detalhamento Técnico Adicional

### Manutenção - Arquivos a Criar/Modificar

**Criar:**
1. `supabase/migrations/20250112000006_create_maintenance_records.sql`
2. `src/domain/entities/MaintenanceRecord.ts`
3. `src/domain/repositories/IMaintenanceRepository.ts`
4. `src/data/mappers/MaintenanceMapper.ts`
5. `src/data/repositories/MaintenanceRepository.ts`
6. `src/presentation/hooks/useMaintenance.ts`

**Migrar (substituir mock por dados reais):**
7. `src/pages/store-admin/Manutencao.tsx`
8. `src/pages/store-admin/ManutencaoForm.tsx`
9. `src/pages/store-admin/ManutencaoDetalhes.tsx`

**Atualizar:**
10. `src/domain/entities/index.ts` - export MaintenanceRecord
11. `src/domain/repositories/index.ts` - export IMaintenanceRepository
12. `src/data/repositories/index.ts` - export MaintenanceRepository
13. `src/presentation/hooks/index.ts` - export useMaintenance

**Total**: 13 arquivos

### Assinatura - Arquivos a Modificar

**Modificar:**
1. `src/pages/store-admin/Assinatura.tsx` - integrar com dados reais
2. (Opcional) Criar hook `useSubscription.ts` para encapsular lógica

**Total**: 1-2 arquivos

---

## 🤔 Decisão Necessária

Qual opção você prefere?

**A)** Implementar **Manutenção + Assinatura + Dashboard** (4h - completo)
**B)** Implementar apenas **Manutenção** (2h30 - MVP)
**C)** Implementar apenas **Assinatura** (1h - rápido e fácil)
**D)** Começar por **Assinatura → Manutenção** (4h - ordem inversa)

Ou outra combinação? Estou pronto para implementar! 🚀


