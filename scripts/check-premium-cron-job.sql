-- =====================================================
-- VERIFICAR CRON JOB PARA DESATIVAÇÃO DE ANÚNCIOS PREMIUM
-- =====================================================
-- Execute este script no Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Verificar se a função existe
SELECT 
  'VERIFICAÇÃO DA FUNÇÃO:' as info,
  proname as function_name,
  prosrc as function_source
FROM pg_proc
WHERE proname = 'deactivate_expired_premium_classifieds';

-- 2. Verificar se pg_cron está habilitado
SELECT 
  'EXTENSÕES HABILITADAS:' as info,
  extname as extension_name,
  extversion as version
FROM pg_extension
WHERE extname = 'pg_cron';

-- 3. Verificar cron jobs existentes (se pg_cron estiver disponível)
SELECT 
  'CRON JOBS CONFIGURADOS:' as info,
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
FROM cron.job
WHERE jobname LIKE '%premium%' OR jobname LIKE '%classified%'
ORDER BY jobid;

-- 4. Verificar histórico de execução do cron (últimas 10 execuções)
SELECT 
  'HISTÓRICO DE EXECUÇÃO:' as info,
  runid,
  jobid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname LIKE '%premium%' OR jobname LIKE '%classified%')
ORDER BY start_time DESC
LIMIT 10;

-- 5. Testar a função manualmente
SELECT 
  'TESTE MANUAL DA FUNÇÃO:' as info,
  deactivate_expired_premium_classifieds() as anuncios_desativados;

-- 6. Verificar anúncios premium expirados que ainda estão ativos
SELECT 
  'ANÚNCIOS PREMIUM EXPIRADOS AINDA ATIVOS:' as info,
  id,
  title,
  user_name,
  is_active,
  is_premium,
  premium_expires_at,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - premium_expires_at)) / 3600 as horas_expirado
FROM classified_ads
WHERE is_premium = true
  AND premium_expires_at IS NOT NULL
  AND premium_expires_at < NOW()
  AND is_active = true
ORDER BY premium_expires_at DESC;

-- 7. Contar anúncios premium por status
SELECT 
  'RESUMO DE ANÚNCIOS PREMIUM:' as info,
  COUNT(*) FILTER (WHERE is_premium = true AND is_active = true AND (premium_expires_at IS NULL OR premium_expires_at > NOW())) as ativos_nao_expirados,
  COUNT(*) FILTER (WHERE is_premium = true AND is_active = true AND premium_expires_at IS NOT NULL AND premium_expires_at < NOW()) as ativos_expirados,
  COUNT(*) FILTER (WHERE is_premium = true AND is_active = false) as inativos,
  COUNT(*) FILTER (WHERE is_premium = true) as total_premium
FROM classified_ads;

