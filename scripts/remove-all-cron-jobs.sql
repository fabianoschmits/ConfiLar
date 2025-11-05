-- =====================================================
-- REMOVER TODOS OS CRON JOBS DO PROJETO
-- Execute este script no Supabase SQL Editor
-- 
-- ⚠️ NOTA: As funções de notificação serão mantidas.
-- Apenas a parte de desativação/deleção foi removida.
-- As funções podem ser chamadas manualmente ou via API.
-- =====================================================

-- =====================================================
-- 1. LISTAR TODOS OS CRON JOBS ANTES DE REMOVER
-- =====================================================
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active,
  CASE WHEN active THEN '✅ ATIVO' ELSE '❌ INATIVO' END as status
FROM cron.job
ORDER BY active DESC, jobid;

-- =====================================================
-- 2. REMOVER CRON JOBS ESPECÍFICOS DO PROJETO
-- =====================================================

-- Remover cron job de posts premium expirados
DO $$
BEGIN
  BEGIN
    PERFORM cron.unschedule('cleanup-expired-premium-posts');
    RAISE NOTICE '✅ Cron job "cleanup-expired-premium-posts" removido com sucesso';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '⚠️  Cron job "cleanup-expired-premium-posts" não encontrado (já foi removido ou nunca existiu)';
  END;
END $$;

-- Remover cron job de usuários inativos
DO $$
BEGIN
  BEGIN
    PERFORM cron.unschedule('deactivate-inactive-users');
    RAISE NOTICE '✅ Cron job "deactivate-inactive-users" removido com sucesso';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '⚠️  Cron job "deactivate-inactive-users" não encontrado (já foi removido ou nunca existiu)';
  END;
END $$;

-- Remover qualquer outro cron job relacionado a classifieds premium
DO $$
BEGIN
  BEGIN
    -- Tentar remover por jobname
    PERFORM cron.unschedule(jobname) 
    FROM cron.job 
    WHERE jobname LIKE '%premium%' 
       OR jobname LIKE '%classified%'
       OR command LIKE '%maintain_premium%'
       OR command LIKE '%deactivate_expired%';
    RAISE NOTICE '✅ Cron jobs relacionados a premium/classifieds removidos';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '⚠️  Nenhum cron job relacionado encontrado';
  END;
END $$;

-- =====================================================
-- 3. REMOVER TODOS OS CRON JOBS ATIVOS (SE NECESSÁRIO)
-- =====================================================
-- Descomente as linhas abaixo se quiser remover TODOS os cron jobs ativos:
/*
DO $$
DECLARE
  job_record RECORD;
BEGIN
  FOR job_record IN 
    SELECT jobid, jobname 
    FROM cron.job 
    WHERE active = true
  LOOP
    BEGIN
      PERFORM cron.unschedule(job_record.jobname);
      RAISE NOTICE '✅ Cron job "%" removido', job_record.jobname;
    EXCEPTION
      WHEN OTHERS THEN
        BEGIN
          -- Tentar remover pelo jobid
          PERFORM cron.unschedule(job_record.jobid::text);
          RAISE NOTICE '✅ Cron job ID % removido', job_record.jobid;
        EXCEPTION
          WHEN OTHERS THEN
            RAISE NOTICE '⚠️  Não foi possível remover cron job ID %', job_record.jobid;
        END;
    END;
  END LOOP;
END $$;
*/

-- =====================================================
-- 4. VERIFICAR SE OS CRON JOBS FORAM REMOVIDOS
-- =====================================================
SELECT 
  'Cron jobs restantes após remoção:' as info,
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE active = true) as jobs_ativos,
  COUNT(*) FILTER (WHERE active = false) as jobs_inativos
FROM cron.job;

-- Listar cron jobs restantes
SELECT 
  jobid,
  jobname,
  schedule,
  LEFT(command, 80) as command_preview,
  active
FROM cron.job
ORDER BY active DESC, jobid;

-- =====================================================
-- 5. LIMPAR HISTÓRICO DE EXECUÇÕES (OPCIONAL)
-- =====================================================
-- Descomente se quiser limpar o histórico de execuções:
/*
DELETE FROM cron.job_run_details 
WHERE jobid IN (
  SELECT jobid FROM cron.job 
  WHERE jobname IN (
    'cleanup-expired-premium-posts',
    'deactivate-inactive-users'
  )
);
*/

-- =====================================================
-- 6. MENSAGEM FINAL
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Processo de remoção de cron jobs concluído!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Próximos passos:';
  RAISE NOTICE '   1. Verifique a lista de cron jobs restantes acima';
  RAISE NOTICE '   2. Se necessário, execute manualmente as funções de manutenção';
  RAISE NOTICE '   3. Considere usar API routes externas (Vercel Cron, etc.)';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Funções disponíveis para execução manual:';
  RAISE NOTICE '   - maintain_premium_classifieds() - Apenas cria notificações (não desativa)';
  RAISE NOTICE '   - deactivate_expired_premium_classifieds() - Apenas cria notificações (não desativa)';
  RAISE NOTICE '   - notify_premium_classifieds_expiring() - Cria notificações de expiração';
  RAISE NOTICE '   - notify_premium_classifieds_expired() - Cria notificações de expirados';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ IMPORTANTE: As funções foram modificadas para NÃO desativar posts/anúncios.';
  RAISE NOTICE '   Apenas notificações são criadas.';
  RAISE NOTICE '';
END $$;

