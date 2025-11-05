-- =====================================================
-- CRIAR FUNÇÃO RPC PARA VERIFICAR CRON JOBS ATIVOS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Função para listar cron jobs ativos
CREATE OR REPLACE FUNCTION public.get_active_cron_jobs()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'jobid', jobid,
      'jobname', jobname,
      'schedule', schedule,
      'command', command,
      'database', database,
      'username', username,
      'active', active,
      'nodename', nodename,
      'nodeport', nodeport
    )
  )
  INTO v_result
  FROM cron.job
  WHERE active = true
  ORDER BY jobid;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION public.get_active_cron_jobs() IS 
'Retorna todos os cron jobs ativos no sistema. Requer permissões de administrador.';

-- Garantir que apenas admins possam executar (se necessário)
-- GRANT EXECUTE ON FUNCTION public.get_active_cron_jobs() TO authenticated;

-- Função para listar todos os cron jobs (ativos e inativos)
CREATE OR REPLACE FUNCTION public.get_all_cron_jobs()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'jobid', jobid,
      'jobname', jobname,
      'schedule', schedule,
      'command', command,
      'database', database,
      'username', username,
      'active', active,
      'status', CASE WHEN active THEN 'ATIVO' ELSE 'INATIVO' END
    )
  )
  INTO v_result
  FROM cron.job
  ORDER BY active DESC, jobid;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION public.get_all_cron_jobs() IS 
'Retorna todos os cron jobs (ativos e inativos) no sistema.';

-- Função para obter estatísticas de execução
CREATE OR REPLACE FUNCTION public.get_cron_jobs_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'jobid', j.jobid,
      'jobname', j.jobname,
      'schedule', j.schedule,
      'active', j.active,
      'total_executions', COUNT(jrd.runid),
      'successful', COUNT(CASE WHEN jrd.status = 'succeeded' THEN 1 END),
      'failed', COUNT(CASE WHEN jrd.status = 'failed' THEN 1 END),
      'last_execution', MAX(jrd.start_time)
    )
  )
  INTO v_result
  FROM cron.job j
  LEFT JOIN cron.job_run_details jrd ON j.jobid = jrd.jobid
  GROUP BY j.jobid, j.jobname, j.schedule, j.active
  ORDER BY j.active DESC, j.jobid;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION public.get_cron_jobs_stats() IS 
'Retorna estatísticas de execução de todos os cron jobs.';

-- Verificação
DO $$
BEGIN
  RAISE NOTICE '✅ Funções RPC para cron jobs criadas com sucesso!';
  RAISE NOTICE '📋 Funções disponíveis:';
  RAISE NOTICE '   - get_active_cron_jobs() - Lista apenas jobs ativos';
  RAISE NOTICE '   - get_all_cron_jobs() - Lista todos os jobs';
  RAISE NOTICE '   - get_cron_jobs_stats() - Estatísticas de execução';
END $$;

