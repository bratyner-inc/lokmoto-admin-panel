# ✅ Endereço Normalizado - Implementação Completa

## 🎯 Problema Resolvido

**Erro original**:
```
Could not find the 'address' column of 'rental_companies' in the schema cache
```

**Solução**: Normalização do endereço em tabela separada `addresses`

---

## 📊 Mudanças Implementadas

### 1. Database Layer (2 novas migrations)

#### Migration 1: Criar tabela addresses
**Arquivo**: `supabase/migrations/20250112000012_create_addresses.sql`
- ✅ Tabela `addresses` com campos:
  - street, number, complement, neighborhood
  - city, state (UF), zip_code, country
- ✅ Indexes em city, state, zip_code
- ✅ RLS policies
- ✅ Trigger de updated_at

#### Migration 2: Adicionar referência em rental_companies
**Arquivo**: `supabase/migrations/20250112000013_add_address_to_rental_companies.sql`
- ✅ Coluna `address_id UUID` (FK para addresses)
- ✅ Index em address_id

### 2. Domain Layer (2 novos arquivos)

**Criados**:
- ✅ `src/domain/entities/Address.ts` - Entidade Address
- ✅ `src/domain/repositories/IAddressRepository.ts` - Interface do repositório

**Atualizados**:
- ✅ `src/domain/entities/RentalCompany.ts`:
  - Adicionado `addressId?: string`
  - Adicionado `address?: any` (quando joined)
  - `UpdateRentalCompanyProfileDTO` agora usa objeto `address`

### 3. Data Layer (2 novos arquivos)

**Criados**:
- ✅ `src/data/mappers/AddressMapper.ts` - Mapper para Address
- ✅ `src/data/repositories/AddressRepository.ts` - Repository para Address

**Atualizados**:
- ✅ `src/data/mappers/RentalCompanyMapper.ts`:
  - Mapeia `address_id` → `addressId`
  - Mapeia `addresses` (joined) → `address` object
- ✅ `src/data/repositories/RentalCompanyRepository.ts`:
  - Usa `select('*, addresses(*)')` nos queries
  - `updateProfile()` agora cria/atualiza endereço via `AddressRepository`

### 4. Infrastructure Layer

**Atualizado**:
- ✅ `src/infrastructure/auth/supabaseAuthService.ts`:
  - Query com `select('*, addresses(*)')`
  - Mapeia objeto address completo no userData

### 5. Presentation Layer

**Atualizados**:
- ✅ `src/presentation/pages/store-admin/Configuracoes.tsx`:
  - State agora usa `address` como objeto
  - Campos separados: street, number, complement, neighborhood, city, state, zipCode
  - Formulário mais detalhado
  
- ✅ `src/presentation/pages/store-admin/Onboarding.tsx`:
  - State agora usa `address` como objeto
  - Mesma estrutura de campos do Configurações

---

## 🗄️ Estrutura da Tabela Addresses

```sql
CREATE TABLE addresses (
    id UUID PRIMARY KEY,
    street TEXT,
    number VARCHAR(20),
    complement VARCHAR(100),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2), -- UF
    zip_code VARCHAR(10), -- CEP
    country VARCHAR(50) DEFAULT 'Brasil',
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

---

## 🔄 Mudança de Interface

### ANTES (campos diretos em rental_companies)
```typescript
{
  address: 'Rua das Flores, 123',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01234-567'
}
```

### DEPOIS (objeto address normalizado)
```typescript
{
  addressId: 'uuid-here',
  address: {
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    country: 'Brasil'
  }
}
```

---

## 🚀 Como Aplicar

### 1. Aplicar as migrations
```bash
npx supabase db push
```

Ou via SQL Editor no Supabase Dashboard (executar nessa ordem):
1. `20250112000012_create_addresses.sql`
2. `20250112000013_add_address_to_rental_companies.sql`

### 2. Atualizar dados existentes (se houver)

Se você já tem dados com campos `address`, `city`, `state`, `zip_code` diretos em `rental_companies`, você pode migrá-los:

```sql
-- Script de migração de dados (se necessário)
INSERT INTO addresses (street, city, state, zip_code, country)
SELECT 
  address as street,
  city,
  state,
  zip_code,
  'Brasil' as country
FROM rental_companies
WHERE address IS NOT NULL;

-- Atualizar rental_companies com address_id
UPDATE rental_companies rc
SET address_id = a.id
FROM addresses a
WHERE rc.address IS NOT NULL
  AND a.street = rc.address
  AND a.city = rc.city;

-- (OPCIONAL) Remover campos antigos depois de validar
-- ALTER TABLE rental_companies DROP COLUMN address;
-- ALTER TABLE rental_companies DROP COLUMN city;
-- ALTER TABLE rental_companies DROP COLUMN state;
-- ALTER TABLE rental_companies DROP COLUMN zip_code;
```

---

## ✅ Benefícios da Normalização

1. **Reusabilidade**: Tabela `addresses` pode ser usada por:
   - `rental_companies` (já implementado)
   - `customers` (futuro)
   - `platform_admins` (futuro)

2. **Consistência**: Estrutura padronizada de endereço

3. **Validação**: Mais fácil validar campos individuais

4. **Queries**: Mais eficiente buscar por cidade/estado

5. **Histórico**: Possibilidade futura de manter histórico de endereços

---

## 📋 Checklist de Validação

- [x] Migrations criadas
- [x] Domain entities atualizadas
- [x] Data mappers atualizados
- [x] Repositories atualizados (create/update endereço)
- [x] Auth service atualizado (join addresses)
- [x] Página Configurações atualizada
- [x] Página Onboarding atualizada
- [x] Índices criados (index.ts)

---

## 🧪 Como Testar

### 1. Teste Configurações
1. Login como Store Admin
2. Ir em Configurações
3. Preencher todos os campos de endereço:
   - Rua/Avenida
   - Número
   - Complemento (opcional)
   - Bairro
   - Cidade
   - Estado (UF)
   - CEP
4. Salvar
5. Recarregar página
6. Verificar se dados foram salvos

### 2. Teste Onboarding
1. Criar nova locadora
2. Login
3. Onboarding Step 1 (Dados Básicos)
4. Preencher endereço completo
5. Avançar para próxima etapa
6. Verificar que dados foram salvos

### 3. Teste API
```bash
# Verificar que endereço está sendo retornado
curl https://YOUR-PROJECT.supabase.co/rest/v1/rental_companies?id=eq.UUID&select=*,addresses(*) \
  -H "apikey: YOUR-KEY" \
  -H "Authorization: Bearer YOUR-TOKEN"
```

---

## 📁 Arquivos Modificados

### Criados (4)
- `supabase/migrations/20250112000012_create_addresses.sql`
- `supabase/migrations/20250112000013_add_address_to_rental_companies.sql`
- `src/domain/entities/Address.ts`
- `src/domain/repositories/IAddressRepository.ts`
- `src/data/mappers/AddressMapper.ts`
- `src/data/repositories/AddressRepository.ts`

### Modificados (8)
- `src/domain/entities/RentalCompany.ts`
- `src/domain/entities/index.ts`
- `src/domain/repositories/index.ts`
- `src/data/mappers/RentalCompanyMapper.ts`
- `src/data/repositories/RentalCompanyRepository.ts`
- `src/data/mappers/index.ts`
- `src/data/repositories/index.ts`
- `src/infrastructure/auth/supabaseAuthService.ts`
- `src/presentation/pages/store-admin/Configuracoes.tsx`
- `src/presentation/pages/store-admin/Onboarding.tsx`

**Total**: 14 arquivos (6 criados + 8 modificados)

---

## ⚠️ Importante

1. **Aplicar migrations na ordem**: 
   - Primeiro `20250112000012` (create addresses)
   - Depois `20250112000013` (add address_id)

2. **Migrar dados existentes**: Se houver dados antigos com `address`, `city`, `state`, `zip_code` diretamente em `rental_companies`, execute o script de migração acima.

3. **Frontend atualizado**: As páginas Configurações e Onboarding já estão atualizadas para o novo formato.

4. **RLS configurado**: As policies de RLS permitem que usuários autenticados criem/editem endereços via relacionamento com rental_companies.

---

## 🎯 Status Final

✅ **IMPLEMENTAÇÃO COMPLETA**

Todas as mudanças foram feitas para normalizar o endereço. O sistema agora:
- Armazena endereços em tabela separada
- Relaciona endereços via `address_id` (FK)
- Faz JOIN automático nas queries
- UI atualizada com campos detalhados

**Próximo passo**: Aplicar as migrations!

```bash
npx supabase db push
```

