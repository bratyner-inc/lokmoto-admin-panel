# Comandos para Deploy - Safe2Pay Sync

## Pré-requisitos
- Supabase CLI instalado (`npm install -g supabase`)
- Projeto Supabase linkado (`supabase link`)

---

## 1. Configurar Secrets

### Obter a chave Safe2Pay
Copiar o valor de `VITE_SAFE2PAY_TOKEN` do arquivo `.env` ou `.env.local`

### Configurar via CLI
```bash
# Navegar para o diretório supabase
cd supabase

# Configurar secret
supabase secrets set SAFE2PAY_API_KEY=<colar-chave-aqui>

# Verificar secrets configurados
supabase secrets list
```

---

## 2. Deploy da Edge Function

```bash
# Navegar para o diretório supabase (se não estiver)
cd supabase

# Deploy da função
supabase functions deploy sync-safe2pay-plans

# Verificar deploy
supabase functions list
```

### Saída esperada:
```
Deploying function sync-safe2pay-plans...
Function sync-safe2pay-plans deployed successfully!
URL: https://<project-ref>.supabase.co/functions/v1/sync-safe2pay-plans
```

---

## 3. Testar a Função

### Teste via CLI
```bash
# Obter o ANON_KEY em: Supabase Dashboard > Settings > API
supabase functions invoke sync-safe2pay-plans \
  --method POST \
  --header "Authorization: Bearer <ANON_KEY>"
```

### Teste via Frontend
1. Login como Platform Admin (ID: ce29fb9a-0511-41f1-92cf-56e707f679d4)
2. Acessar `/planos-safe2pay`
3. Clicar em "Sincronizar Planos"
4. Verificar toast de sucesso

---

## 4. Verificar Logs

### Via CLI
```bash
# Ver logs em tempo real
supabase functions logs sync-safe2pay-plans --tail

# Ver últimos logs
supabase functions logs sync-safe2pay-plans
```

### Via Dashboard
1. Acessar: Edge Functions > sync-safe2pay-plans
2. Clicar na aba "Logs"

---

## 5. Configurar Cron Job (Opcional)

### Editar script SQL
1. Abrir `supabase/SETUP_CRON_JOB.sql`
2. Substituir:
   - `YOUR_PROJECT_REF` → Encontrar em: Settings > General > Reference ID
   - `YOUR_ANON_KEY` → Encontrar em: Settings > API > Project API keys

### Executar via Dashboard
1. Acessar: SQL Editor
2. Colar conteúdo do arquivo editado
3. Executar (Run)

### Verificar cron job
```sql
SELECT * FROM cron.job WHERE jobname = 'sync-safe2pay-plans-daily';
```

---

## 6. Comandos Úteis

### Re-deploy após mudanças
```bash
supabase functions deploy sync-safe2pay-plans
```

### Deletar função (se necessário)
```bash
supabase functions delete sync-safe2pay-plans
```

### Ver todas as funções
```bash
supabase functions list
```

### Atualizar secret
```bash
supabase secrets set SAFE2PAY_API_KEY=<nova-chave>
```

### Remover secret
```bash
supabase secrets unset SAFE2PAY_API_KEY
```

---

## Troubleshooting

### "Error: Project not linked"
```bash
# Linkar projeto
supabase link --project-ref <project-ref>
```

### "Error: Not logged in"
```bash
# Login no Supabase CLI
supabase login
```

### "Error: Function deployment failed"
- Verificar sintaxe do TypeScript no arquivo `index.ts`
- Verificar se todos os imports estão corretos
- Verificar logs: `supabase functions logs sync-safe2pay-plans`

### Função invocada mas retorna erro 500
- Verificar se secret `SAFE2PAY_API_KEY` está configurado
- Verificar logs da função para ver erro específico
- Verificar se a API Safe2Pay está acessível

---

## Ordem de Execução

1. ✅ Configurar secrets
2. ✅ Deploy edge function
3. ✅ Testar via frontend
4. ✅ Verificar logs
5. ⏳ (Opcional) Configurar cron job
6. ✅ Monitorar execuções


