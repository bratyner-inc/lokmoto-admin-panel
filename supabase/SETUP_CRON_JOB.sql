-- =====================================================
-- Setup: Cron Job para Sincronização Automática
-- Safe2Pay Plans Sync - Diariamente às 3h AM
-- =====================================================

-- IMPORTANTE: Este script deve ser executado APÓS o deploy da Edge Function

-- 1. Habilitar extensão pg_cron (se ainda não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Habilitar extensão pg_net para fazer HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Criar função helper para invocar a Edge Function
CREATE OR REPLACE FUNCTION invoke_sync_safe2pay_plans()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_url TEXT;
  anon_key TEXT;
  response_data jsonb;
BEGIN
  -- SUBSTITUIR ESTES VALORES:
  project_url := 'https://YOUR_PROJECT_REF.supabase.co';  -- Ex: https://abcdefgh.supabase.co
  anon_key := 'YOUR_ANON_KEY';  -- Encontrar em: Settings > API > Project API keys > anon/public
  
  -- Invocar a Edge Function
  SELECT INTO response_data
    net.http_post(
      url := project_url || '/functions/v1/sync-safe2pay-plans',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || anon_key,
        'Content-Type', 'application/json'
      )::jsonb,
      body := '{}'::jsonb
    );
  
  -- Log do resultado
  RAISE NOTICE 'Sync Safe2Pay Plans invoked. Response: %', response_data;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error invoking sync function: %', SQLERRM;
END;
$$;

-- 4. Criar cron job para executar diariamente às 3h AM
SELECT cron.schedule(
  'sync-safe2pay-plans-daily',      -- Nome do job
  '0 3 * * *',                       -- Cron expression: 3h AM todos os dias
  $$SELECT invoke_sync_safe2pay_plans()$$
);

-- 5. Verificar cron jobs criados
SELECT * FROM cron.job WHERE jobname = 'sync-safe2pay-plans-daily';

-- =====================================================
-- Comandos úteis para gerenciar o cron job
-- =====================================================

-- Ver todos os cron jobs
-- SELECT * FROM cron.job;

-- Ver histórico de execuções
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-safe2pay-plans-daily')
-- ORDER BY start_time DESC 
-- LIMIT 10;

-- Desabilitar o cron job (se necessário)
-- SELECT cron.unschedule('sync-safe2pay-plans-daily');

-- Recriar com horário diferente (ex: 2h AM)
-- SELECT cron.unschedule('sync-safe2pay-plans-daily');
-- SELECT cron.schedule(
--   'sync-safe2pay-plans-daily',
--   '0 2 * * *',
--   $$SELECT invoke_sync_safe2pay_plans()$$
-- );

-- Executar manualmente para testar
-- SELECT invoke_sync_safe2pay_plans();

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. Substituir 'YOUR_PROJECT_REF' e 'YOUR_ANON_KEY' com os valores reais
-- 2. Encontrar PROJECT_REF em: Settings > General > Reference ID
-- 3. Encontrar ANON_KEY em: Settings > API > Project API keys
-- 4. A extensão pg_cron pode não estar disponível em todos os planos do Supabase
-- 5. Verificar logs em: Logs > Postgres Logs (filtrar por "invoke_sync_safe2pay_plans")


