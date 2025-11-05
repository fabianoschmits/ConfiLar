-- =====================================================
-- VERIFICAR CRON JOBS ATIVOS NO SUPABASE
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Verificar se a extensão pg_cron está habilitada
SELECT 
  extname as extension_name,
  extversion as version
FROM pg_extension
WHERE extname = 'pg_cron';

-- Listar todos os cron jobs ativos
SELECT 
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
WHERE active = true
ORDER BY jobid;

-- Listar todos os cron jobs (ativos e inativos)
SELECT 
  jobid,
  schedule,
  command,
  jobname,
  active,
  CASE 
    WHEN active THEN '✅ ATIVO'
    ELSE '❌ INATIVO'
  END as status
FROM cron.job
ORDER BY active DESC, jobid;

-- Verificar histórico de execuções recentes (últimas 10)
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;

-- Estatísticas de execução por job
SELECT 
  j.jobid,
  j.jobname,
  j.schedule,
  COUNT(jrd.runid) as total_executions,
  COUNT(CASE WHEN jrd.status = 'succeeded' THEN 1 END) as successful,
  COUNT(CASE WHEN jrd.status = 'failed' THEN 1 END) as failed,
  MAX(jrd.start_time) as last_execution
FROM cron.job j
LEFT JOIN cron.job_run_details jrd ON j.jobid = jrd.jobid
WHERE j.active = true
GROUP BY j.jobid, j.jobname, j.schedule
ORDER BY j.jobid;

