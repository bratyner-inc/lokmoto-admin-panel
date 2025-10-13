# Implementação: Sincronização Safe2Pay Plans via Edge Functions

## Resumo

Implementação completa da sincronização de planos Safe2Pay usando Supabase Edge Functions com Deno. A sincronização pode ser executada manualmente (botão no frontend) ou automaticamente (cron job diário).

---

## Arquivos Criados

### 1. Edge Function
- **`supabase/functions/sync-safe2pay-plans/index.ts`**
  - Edge Function principal com toda lógica de sincronização
  - Fetch de planos da API Safe2Pay
  - Merge inteligente (insert novos, update existentes, deprecate inativos)
  - Validação de autenticação (apenas platform_admins)
  - Tratamento de erros completo
  - Logs detalhados

### 2. Frontend - Hook
- **`src/presentation/hooks/useSyncSafe2PayPlans.ts`**
  - Hook React para invocar a Edge Function
  - Estados: `syncing`, `error`
  - Método: `syncPlans()` retorna `{ inserted, updated, deprecated }`
  - Tratamento de erros

### 3. Frontend - Página Atualizada
- **`src/presentation/pages/global-admin/PlanosSafe2Pay.tsx`**
  - Integração com `useSyncSafe2PayPlans`
  - Botão "Sincronizar Planos" com loading state
  - Toast de sucesso com estatísticas detalhadas
  - Refresh automático da lista após sincronização

### 4. Documentação
- **`supabase/SETUP_EDGE_FUNCTION.md`**
  - Instruções de configuração de secrets
  - Comandos de deploy via CLI
  - Guia de testes
  - Troubleshooting

- **`supabase/SETUP_CRON_JOB.sql`**
  - Script SQL para configurar cron job
  - Função helper `invoke_sync_safe2pay_plans()`
  - Cron job diário às 3h AM
  - Comandos úteis para gerenciamento

---

## Funcionalidades Implementadas

### ✅ Sincronização Manual
- Botão na página PlanosSafe2Pay
- Loading state durante sincronização
- Toast com resultado detalhado
- Refresh automático da lista

### ✅ Merge Inteligente
- **INSERT**: Novos planos detectados no Safe2Pay
- **UPDATE**: Planos existentes (atualiza name, amount, metadata)
- **DEPRECATE**: Planos que não existem mais no Safe2Pay (status = 'deprecated')
- Filtro: apenas planos mensais (`frequence === "Mensal"`)

### ✅ Segurança
- Validação JWT (apenas platform_admins podem sincronizar)
- Secrets gerenciados via Supabase
- RLS policies na tabela `safe2pay_plans`

### ✅ Metadata Storage
- Campos extras armazenados em JSONB:
  - `subscriptionLimit`
  - `quantitySubscription`
  - `frequence`

### ✅ Logs e Monitoramento
- Console logs detalhados na Edge Function
- Logs disponíveis no Supabase Dashboard
- Erros capturados e logados

### ✅ Cron Job (Opcional)
- Sincronização automática diária às 3h AM
- Configurável via SQL script
- Usa `pg_cron` + `pg_net`

---

## Fluxo de Sincronização

```
1. User clica em "Sincronizar Planos"
   ↓
2. Frontend invoca Edge Function via supabase.functions.invoke()
   ↓
3. Edge Function valida JWT (platform_admin?)
   ↓
4. Edge Function faz fetch na API Safe2Pay
   ↓
5. Edge Function filtra planos mensais
   ↓
6. Edge Function compara com planos existentes no banco
   ↓
7. Edge Function executa operações de merge:
   - INSERT novos planos
   - UPDATE planos existentes
   - UPDATE status='deprecated' para inativos
   ↓
8. Edge Function retorna estatísticas: { inserted, updated, deprecated }
   ↓
9. Frontend exibe toast com resultado
   ↓
10. Frontend refresh lista de planos
```

---

## Como Usar

### Passo 1: Configurar Secrets
```bash
cd supabase
supabase secrets set SAFE2PAY_API_KEY=<sua-chave-aqui>
```

Ou via Dashboard: Settings > Edge Functions > Secrets

### Passo 2: Deploy Edge Function
```bash
cd supabase
supabase functions deploy sync-safe2pay-plans
```

### Passo 3: Testar Manualmente
1. Acessar `/planos-safe2pay` como Platform Admin
2. Clicar em "Sincronizar Planos"
3. Verificar toast de sucesso
4. Verificar planos atualizados na tabela

### Passo 4: Configurar Cron Job (Opcional)
1. Editar `supabase/SETUP_CRON_JOB.sql`
2. Substituir `YOUR_PROJECT_REF` e `YOUR_ANON_KEY`
3. Executar SQL no Supabase Dashboard (SQL Editor)

---

## Estrutura do Response Safe2Pay

```json
{
  "success": true,
  "data": {
    "objects": [
      {
        "idPlan": 1,
        "name": "Plano mensal A",
        "subscriptionLimit": 0,
        "quantitySubscription": 0,
        "amount": 1,
        "frequence": "Mensal"
      }
    ],
    "totalItems": 100
  }
}
```

---

## Estrutura da Tabela safe2pay_plans

```sql
CREATE TABLE safe2pay_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id TEXT UNIQUE NOT NULL,           -- Safe2Pay's idPlan
    name TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    interval_type plan_interval_type NOT NULL,  -- 'monthly'
    status plan_status NOT NULL DEFAULT 'active',  -- 'active', 'inactive', 'deprecated'
    metadata JSONB,  -- { subscriptionLimit, quantitySubscription, frequence }
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Mapeamento de Dados

| Safe2Pay Field | Database Field | Tipo | Notas |
|----------------|----------------|------|-------|
| `idPlan` | `plan_id` | TEXT | Identificador único do Safe2Pay |
| `name` | `name` | TEXT | Nome do plano |
| `amount` | `amount` | NUMERIC | Valor mensal |
| `frequence` | - | - | Filtrado: apenas "Mensal" |
| `subscriptionLimit` | `metadata.subscriptionLimit` | JSONB | Armazenado em metadata |
| `quantitySubscription` | `metadata.quantitySubscription` | JSONB | Armazenado em metadata |
| - | `interval_type` | ENUM | Hardcoded: 'monthly' |
| - | `status` | ENUM | 'active', 'inactive', ou 'deprecated' |

---

## Logs

### Ver logs da Edge Function
```bash
supabase functions logs sync-safe2pay-plans
```

Ou via Dashboard: Edge Functions > sync-safe2pay-plans > Logs

### Ver logs do Cron Job
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-safe2pay-plans-daily')
ORDER BY start_time DESC 
LIMIT 10;
```

---

## Troubleshooting

### Erro: "SAFE2PAY_API_KEY environment variable is not set"
- Configurar secret: `supabase secrets set SAFE2PAY_API_KEY=<value>`
- Re-deploy função: `supabase functions deploy sync-safe2pay-plans`

### Erro: "Unauthorized: Invalid token"
- Verificar se está logado como Platform Admin
- Verificar se JWT é válido

### Erro: "Safe2Pay API error: 401"
- Verificar chave API no Safe2Pay
- Verificar se chave não expirou

### Erro: "Failed to insert plans"
- Verificar se migration `20250112000001_create_safe2pay_plans.sql` foi aplicada
- Verificar RLS policies na tabela

---

## Próximas Melhorias

1. **Rate Limiting**: Limitar quantidade de sincronizações por usuário/período
2. **Webhook**: Implementar webhook do Safe2Pay para sincronização em tempo real
3. **Histórico**: Tabela de auditoria para rastrear mudanças nos planos
4. **Notificações**: Alertar admins quando novos planos são adicionados
5. **Cache**: Implementar cache para reduzir chamadas à API
6. **Retry Logic**: Implementar retry automático em caso de falha temporária
7. **Diff Visual**: Mostrar mudanças antes de confirmar sincronização

---

## Checklist de Implementação

- [x] Edge Function criada (`sync-safe2pay-plans/index.ts`)
- [x] Fetch Safe2Pay API implementado
- [x] Merge inteligente implementado
- [x] Validação de platform_admins
- [x] Tratamento de erros
- [x] Logs detalhados
- [x] Hook frontend criado (`useSyncSafe2PayPlans`)
- [x] Página atualizada (botão + integração)
- [x] Documentação de setup (secrets + deploy)
- [x] Script SQL para cron job
- [x] Zero erros de linter
- [ ] Deploy da Edge Function (manual)
- [ ] Configurar secrets (manual)
- [ ] Testar sincronização manual (manual)
- [ ] Configurar cron job (manual - opcional)

---

## Status: ✅ Implementação Completa

Pronto para deploy e testes!

**Próximo passo**: Seguir instruções em `supabase/SETUP_EDGE_FUNCTION.md`


