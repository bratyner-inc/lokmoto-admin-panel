# Setup: Safe2Pay Plans Sync Edge Function

## 1. Configurar Secrets no Supabase

### Via Supabase Dashboard:
1. Acessar: Settings > Edge Functions > Secrets
2. Adicionar secret:
   - **Name**: `SAFE2PAY_API_KEY`
   - **Value**: (copiar valor de `VITE_SAFE2PAY_TOKEN` do .env)

### Via Supabase CLI (alternativa):
```bash
# Navegar para o diretório do projeto
cd supabase

# Configurar secret
supabase secrets set SAFE2PAY_API_KEY=<sua-chave-aqui>
```

## 2. Deploy da Edge Function

### Via Supabase CLI:
```bash
# Navegar para o diretório do projeto
cd supabase

# Deploy da função
supabase functions deploy sync-safe2pay-plans

# Verificar deploy
supabase functions list
```

### Via Supabase Dashboard (alternativa):
1. Acessar: Edge Functions
2. Clicar em "Deploy new function"
3. Upload da pasta `functions/sync-safe2pay-plans`

## 3. Testar a Edge Function

### Teste Manual via CLI:
```bash
# Invocar a função
supabase functions invoke sync-safe2pay-plans \
  --method POST \
  --header "Authorization: Bearer <YOUR_ANON_KEY>"
```

### Teste via Frontend:
1. Acessar `/planos-safe2pay` como Platform Admin
2. Clicar no botão "Sincronizar Planos"
3. Verificar toast de sucesso com estatísticas
4. Verificar que planos foram atualizados na tabela

## 4. Verificar Logs

### Via Supabase Dashboard:
1. Acessar: Edge Functions > sync-safe2pay-plans
2. Clicar na aba "Logs"
3. Verificar execução e eventuais erros

### Via CLI:
```bash
supabase functions logs sync-safe2pay-plans
```

## 5. Configurar Cron Job (Sincronização Automática)

Veja arquivo `SETUP_CRON_JOB.sql` para instruções de configuração do cron job diário.

## 6. Troubleshooting

### Erro: "SAFE2PAY_API_KEY environment variable is not set"
- Verificar se o secret foi configurado corretamente
- Fazer re-deploy da função após configurar secret

### Erro: "Unauthorized: Invalid token"
- Verificar se está logado como Platform Admin
- Verificar se o token JWT está válido

### Erro: "Safe2Pay API error: 401"
- Verificar se a chave API está correta
- Verificar se a chave não expirou no Safe2Pay

### Erro: "Failed to insert plans"
- Verificar RLS policies na tabela `safe2pay_plans`
- Verificar se a tabela existe (migration aplicada)

## 7. Monitoramento

### Métricas Importantes:
- Tempo de execução da função
- Taxa de sucesso/falha
- Quantidade de planos sincronizados por execução

### Alertas Recomendados:
- Erro na sincronização automática (cron)
- Tempo de execução > 30 segundos
- Falha em mais de 3 tentativas consecutivas


