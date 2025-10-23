# 🧪 Testar Fluxo de Contratação

## Passo 1: Aplicar Migrações

### 1.1. Atualizar Proposals (se ainda não fez)
```sql
-- Cole no SQL Editor do Supabase:
-- Conteúdo de: supabase/migrations/20250111000017_update_proposals_for_contracts.sql
```

## Passo 2: Aplicar Seed de Propostas

### Via Supabase Dashboard

1. **Abra o SQL Editor**:
   https://supabase.com/dashboard/project/rvufhbkmqfrjdcqoeyal/sql/new

2. **Cole o conteúdo do arquivo**:
   `supabase/seed/002_test_proposals.sql`

3. **Execute (Run)**

### O que o seed faz:

- ✅ Busca automaticamente IDs existentes na sua base
  - Tenta usar os IDs especificados (locadora, cliente, moto)
  - Se não encontrar, usa qualquer registro disponível
  
- ✅ Cria 2 propostas de teste:
  1. **Proposta ACEITA** (status: 'accepted')
     - Valor mensal: R$ 899,90
     - Prazo: 6 meses
     - **Pronta para criar contrato**
  
  2. **Proposta PENDENTE** (status: 'pending')
     - Valor mensal: R$ 749,90
     - Sem prazo definido
     - Aguardando resposta do cliente

- ✅ Mostra mensagens com os IDs utilizados

---

## Passo 3: Testar o Fluxo Completo

### 3.1. Ver Propostas
1. Faça login no sistema
2. Vá para **Propostas** (`/propostas`)
3. Você deve ver as 2 propostas criadas

### 3.2. Criar Contrato
1. Vá para **Contratos → Novo Contrato** (`/contratos/novo`)
2. No dropdown de propostas, você deve ver:
   - **PROP-2025-0001** - R$ 899,90/mês ✅ (proposta aceita)
3. Selecione a proposta
4. Configure:
   - **Data de Início**: Qualquer data futura
   - **Data de Término**: Opcional (deixe vazio para indeterminado)
   - **Dia de Pagamento**: 5 (padrão, ou escolha 1-28)
5. Clique em **Criar Contrato**

### 3.3. Verificar Contrato Criado
1. Você será redirecionado para `/contratos`
2. Deve ver o novo contrato na lista
3. Clique para ver detalhes
4. Verifique:
   - ✅ Número do contrato (CTR-2025-XXXX)
   - ✅ Valor mensal (R$ 899,90)
   - ✅ Cliente, Motocicleta, e Proposta linkados
   - ✅ Status: Ativo

### 3.4. Verificar Proposta Atualizada
1. Volte para **Propostas** (`/propostas`)
2. A proposta usada agora deve ter referência ao contrato
3. Tente criar outro contrato - a proposta não deve aparecer mais (já tem contrato)

---

## 🎯 Fluxo Completo de Teste

```
1. [SEED] → Cria propostas de teste
   ↓
2. [PROPOSTAS] → Ver lista de propostas
   ↓
3. [CONTRATOS/NOVO] → Criar contrato da proposta aceita
   ↓
4. [CONTRATOS] → Ver contrato criado
   ↓
5. [CONTRATOS/ID] → Ver detalhes do contrato
   ↓
6. [PROPOSTAS] → Verificar proposta linkada ao contrato
```

---

## 🐛 Troubleshooting

### "Nenhuma proposta aceita disponível"

**Solução 1**: Execute o seed novamente
```sql
-- Rode o seed: supabase/seed/002_test_proposals.sql
```

**Solução 2**: Aceite uma proposta manualmente
1. Vá para Propostas
2. Edite uma proposta existente
3. Mude status para 'accepted'
4. Defina um `monthly_value`

### "Proposta não encontrada ou usuário não autenticado"

**Causa**: Você não está logado como a locadora correta

**Solução**:
- Faça logout e login novamente
- Certifique-se de que está logado como uma rental company

### "A proposta não possui valor mensal"

**Causa**: A proposta não tem `monthly_value` definido

**Solução**:
- Execute o seed que define o valor automaticamente
- Ou edite a proposta manualmente e adicione o valor mensal

---

## ✅ Resultado Esperado

Após seguir todos os passos:
- ✅ 2 propostas criadas no sistema
- ✅ 1 contrato criado a partir de proposta aceita
- ✅ Proposta linkada ao contrato (contract_id preenchido)
- ✅ Motocicleta marcada como indisponível (is_available = false)
- ✅ Número do contrato auto-gerado (CTR-2025-0001)

---

## 📝 Dados do Seed

**Proposta 1** (Aceita - pronta para contrato):
- Status: `accepted`
- Valor Mensal: R$ 899,90
- Início: Daqui a 3 dias
- Fim: 6 meses
- Nota: "Proposta aceita pelo cliente. Pronto para gerar contrato."

**Proposta 2** (Pendente):
- Status: `pending`
- Valor Mensal: R$ 749,90
- Início: Daqui a 7 dias
- Fim: Indeterminado
- Nota: "Proposta promocional. Aguardando resposta."

---

Pronto para testar! 🚀

