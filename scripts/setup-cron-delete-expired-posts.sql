-- =============================================
-- CONFIGURAR CRON JOB PARA DELETAR POSTS PREMIUM EXPIRADOS
-- =============================================
-- Este script configura um cron job que executa TODOS OS DIAS às 23:59
-- para verificar e deletar/desativar posts premium expirados
--
-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- =============================================

-- =============================================
-- 1. HABILITAR EXTENSÃO PG_CRON (se não estiver habilitada)
-- =============================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =============================================
-- 2. REMOVER CRON JOB ANTIGO (se existir)
-- =============================================
-- Remove qualquer job anterior com o mesmo nome (ignora erro se não existir)
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-expired-premium-posts');
  RAISE NOTICE 'Job anterior removido com sucesso';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Nenhum job anterior encontrado (isso é normal na primeira execução)';
END $$;

-- =============================================
-- 3. CRIAR CRON JOB PARA EXECUTAR ÀS 23:59 DIARIAMENTE (HORÁRIO DE BRASÍLIA)
-- =============================================
-- Formato do cron: 'minuto hora dia mês dia_da_semana'
-- 59 2 * * * = Aos 59 minutos da hora 2 (02:59 UTC) = 23:59 Brasília (UTC-3)
-- IMPORTANTE: Supabase usa horário UTC, então 02:59 UTC = 23:59 Brasília

SELECT cron.schedule(
  'cleanup-expired-premium-posts',  -- Nome do job
  '59 2 * * *',                      -- Executa às 02:59 UTC = 23:59 Brasília (UTC-3)
  $$SELECT maintain_premium_posts()$$  -- Função que será executada
);

-- =============================================
-- 4. VERIFICAR SE O CRON FOI CRIADO COM SUCESSO
-- =============================================
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
WHERE jobname = 'cleanup-expired-premium-posts';

-- =============================================
-- 5. INFORMAÇÕES SOBRE O CRON JOB
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Cron job configurado com sucesso!';
  RAISE NOTICE '📅 Nome: cleanup-expired-premium-posts';
  RAISE NOTICE '⏰ Horário: Todos os dias às 23:59 (Horário de Brasília - UTC-3)';
  RAISE NOTICE '   UTC: 02:59 | Brasília: 23:59';
  RAISE NOTICE '🔄 Ação: Desativa (soft delete) posts premium expirados';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Para monitorar a execução:';
  RAISE NOTICE '   SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = ''cleanup-expired-premium-posts'') ORDER BY start_time DESC LIMIT 10;';
  RAISE NOTICE '';
  RAISE NOTICE '🛑 Para desabilitar o cron:';
  RAISE NOTICE '   SELECT cron.unschedule(''cleanup-expired-premium-posts'');';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Para testar manualmente:';
  RAISE NOTICE '   SELECT * FROM maintain_premium_posts();';
END $$;

-- =============================================
-- 6. QUERIES ÚTEIS PARA MONITORAMENTO
-- =============================================

-- Ver histórico de execuções do cron (últimas 10)
-- Descomente para executar:
-- SELECT 
--   runid,
--   jobid,
--   database,
--   username,
--   command,
--   status,
--   return_message,
--   start_time,
--   end_time,
--   end_time - start_time as duration
-- FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-expired-premium-posts')
-- ORDER BY start_time DESC 
-- LIMIT 10;

-- Ver posts que serão afetados na próxima execução
-- Descomente para executar:
-- SELECT COUNT(*) as posts_to_deactivate
-- FROM feed_posts 
-- WHERE is_premium = TRUE 
--   AND premium_expires_at IS NOT NULL 
--   AND premium_expires_at < NOW() 
--   AND is_active = TRUE;

-- Ver posts expirados (já processados)
-- Descomente para executar:
-- SELECT * FROM v_expired_premium_posts LIMIT 10;

-- Ver posts que vão expirar nas próximas 24 horas
-- Descomente para executar:
-- SELECT * FROM v_expiring_soon_premium_posts;

-- =============================================
-- 7. TESTAR O CRON MANUALMENTE
-- =============================================
-- Execute esta linha para testar o cron manualmente (antes das 23:59)
-- Descomente para executar:
-- SELECT * FROM maintain_premium_posts();

-- =============================================
-- 8. OPÇÕES DE HORÁRIO ALTERNATIVO
-- =============================================
-- Se quiser executar em outro horário, use um destes exemplos:

-- A cada hora (minuto 0):
-- SELECT cron.schedule('cleanup-expired-premium-posts', '0 * * * *', $$SELECT maintain_premium_posts()$$);

-- Todos os dias à meia-noite (00:00):
-- SELECT cron.schedule('cleanup-expired-premium-posts', '0 0 * * *', $$SELECT maintain_premium_posts()$$);

-- Todos os dias às 03:00 (horário de menor uso):
-- SELECT cron.schedule('cleanup-expired-premium-posts', '0 3 * * *', $$SELECT maintain_premium_posts()$$);

-- A cada 6 horas:
-- SELECT cron.schedule('cleanup-expired-premium-posts', '0 */6 * * *', $$SELECT maintain_premium_posts()$$);

-- A cada 30 minutos:
-- SELECT cron.schedule('cleanup-expired-premium-posts', '*/30 * * * *', $$SELECT maintain_premium_posts()$$);

-- =============================================
-- 9. TROUBLESHOOTING
-- =============================================
-- Se o cron não estiver executando:

-- 1. Verificar se pg_cron está habilitado:
-- SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- 2. Verificar se o job está ativo:
-- SELECT * FROM cron.job WHERE jobname = 'cleanup-expired-premium-posts';

-- 3. Ver erros na execução:
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-expired-premium-posts')
-- AND status = 'failed'
-- ORDER BY start_time DESC;

-- 4. Recriar o job:
-- SELECT cron.unschedule('cleanup-expired-premium-posts');
-- (depois execute novamente o comando do item 3)

-- =============================================
-- FIM DO SCRIPT
-- =============================================

-- Mensagem final
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 CRON JOB CONFIGURADO COM SUCESSO! 🎉';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Configuração:';
  RAISE NOTICE '   Job: cleanup-expired-premium-posts';
  RAISE NOTICE '   Horário: 23:59 (Horário de Brasília - UTC-3)';
  RAISE NOTICE '   Horário UTC: 02:59';
  RAISE NOTICE '   Função: maintain_premium_posts()';
  RAISE NOTICE '';
  RAISE NOTICE '✅ CONFIGURADO PARA HORÁRIO DE BRASÍLIA!';
  RAISE NOTICE '   Cron Expression: ''59 2 * * *'' (02:59 UTC)';
  RAISE NOTICE '   Horário Local (Brasília): 23:59 (UTC-3)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ O cron já está ativo e começará a executar automaticamente!';
END $$;

