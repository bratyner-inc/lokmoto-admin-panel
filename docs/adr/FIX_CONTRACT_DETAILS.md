# ✅ Correção: Visualização de Detalhes do Contrato

## 🐛 Problema Identificado

Erro ao visualizar detalhes de um contrato:
```
Could not embed because more than one relationship was found for 'contracts' and 'proposals'
```

**Causa**: Existem **duas relações** entre `contracts` e `proposals`:
1. `contracts.proposal_id` → `proposals.id` (contrato referencia a proposta que o originou)
2. `proposals.contract_id` → `contracts.id` (proposta referencia o contrato criado a partir dela)

O Supabase não sabia qual relação usar na query.

---

## ✅ Correções Aplicadas

### 1. **ContractRepository.ts**
Especificado qual foreign key usar na query:

**Antes:**
```typescript
proposals(id, proposal_number, status)
```

**Depois:**
```typescript
proposals!contracts_proposal_id_fkey(id, proposal_number, status)
```

Isso diz ao Supabase para usar a relação `contracts.proposal_id → proposals.id`, que é o que queremos (buscar a proposta que originou o contrato).

### 2. **Nome da coluna de clientes**
Corrigido de `name` para `full_name` (nome correto na tabela `customers`):

**Antes:**
```typescript
customers(id, name, email, phone)
```

**Depois:**
```typescript
customers(id, full_name, email, phone)
```

### 3. **ContractMapper.ts**
Atualizado para mapear `full_name` do banco para `name` no domínio:

```typescript
customer: raw.customers ? {
  id: raw.customers.id,
  name: raw.customers.full_name,  // Mapeamento correto
  email: raw.customers.email,
  phone: raw.customers.phone,
} : undefined,
```

---

## 🎯 Resultado

Agora a visualização de detalhes do contrato funciona corretamente e exibe:
- ✅ Informações do cliente (nome, email, telefone)
- ✅ Informações da motocicleta (marca, modelo, versão, ano, placa)
- ✅ Informações da proposta (número, status)
- ✅ Detalhes do contrato (datas, valor mensal, status, etc.)

---

## 🧪 Testar

1. Crie um contrato a partir de uma proposta aceita
2. Vá para a lista de contratos
3. Clique no contrato criado
4. Você deve ver todos os detalhes carregando corretamente!

---

## 📝 Lição Aprendida

Quando há múltiplas relações entre duas tabelas no Supabase, é necessário especificar qual foreign key usar na query usando a sintaxe:

```
table!foreign_key_name(columns)
```

Você pode encontrar o nome da foreign key olhando o erro do Supabase ou verificando as migrations.

