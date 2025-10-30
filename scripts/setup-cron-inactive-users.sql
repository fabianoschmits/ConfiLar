-- =============================================
-- CONFIGURAR CRON JOB PARA DESATIVAR USUÁRIOS INATIVOS
-- =============================================
-- Este script configura um cron job que executa TODOS OS DIAS às 03:00 (Horário de Brasília)
-- para verificar e desativar usuários que não acessam o sistema há 7+ dias
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
  PERFORM cron.unschedule('deactivate-inactive-users');
  RAISE NOTICE 'Job anterior removido com sucesso';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Nenhum job anterior encontrado (isso é normal na primeira execução)';
END $$;

-- =============================================
-- 3. CRIAR CRON JOB PARA EXECUTAR ÀS 03:00 DIARIAMENTE (HORÁRIO DE BRASÍLIA)
-- =============================================
-- Formato do cron: 'minuto hora dia mês dia_da_semana'
-- 0 6 * * * = Às 06:00 UTC = 03:00 Brasília (UTC-3)
-- Escolhido 03:00 por ser horário de menor uso do sistema

SELECT cron.schedule(
  'deactivate-inactive-users',           -- Nome do job
  '0 6 * * *',                           -- Executa às 06:00 UTC = 03:00 Brasília (UTC-3)
  $$SELECT maintain_user_availability()$$  -- Função que será executada
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
WHERE jobname = 'deactivate-inactive-users';

-- =============================================
-- 5. INFORMAÇÕES SOBRE O CRON JOB
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Cron job configurado com sucesso!';
  RAISE NOTICE '📅 Nome: deactivate-inactive-users';
  RAISE NOTICE '⏰ Horário: Todos os dias às 03:00 (Horário de Brasília - UTC-3)';
  RAISE NOTICE '   UTC: 06:00 | Brasília: 03:00';
  RAISE NOTICE '🔄 Ação: Desativa usuários que não acessam há 7+ dias';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Para monitorar a execução:';
  RAISE NOTICE '   SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = ''deactivate-inactive-users'') ORDER BY start_time DESC LIMIT 10;';
  RAISE NOTICE '';
  RAISE NOTICE '🛑 Para desabilitar o cron:';
  RAISE NOTICE '   SELECT cron.unschedule(''deactivate-inactive-users'');';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Para testar manualmente:';
  RAISE NOTICE '   SELECT * FROM maintain_user_availability();';
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
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'deactivate-inactive-users')
-- ORDER BY start_time DESC 
-- LIMIT 10;

-- Ver usuários que serão afetados na próxima execução
-- Descomente para executar:
-- SELECT 
--   id,
--   name,
--   email,
--   last_login_at,
--   EXTRACT(EPOCH FROM (NOW() - last_login_at)) / 86400 AS days_inactive
-- FROM profiles 
-- WHERE is_available = TRUE 
--   AND last_login_at IS NOT NULL 
--   AND last_login_at < NOW() - INTERVAL '7 days'
-- ORDER BY last_login_at ASC;

-- Ver usuários inativos (todos)
-- Descomente para executar:
-- SELECT * FROM v_inactive_users LIMIT 20;

-- Ver usuários que vão ser desativados em breve (5-7 dias)
-- Descomente para executar:
-- SELECT * FROM v_users_expiring_availability;

-- Ver estatísticas gerais
-- Descomente para executar:
-- SELECT 
--   COUNT(*) FILTER (WHERE is_available = TRUE) as usuarios_disponiveis,
--   COUNT(*) FILTER (WHERE is_available = FALSE) as usuarios_indisponiveis,
--   COUNT(*) FILTER (WHERE last_login_at < NOW() - INTERVAL '7 days') as inativos_7_dias,
--   COUNT(*) FILTER (WHERE last_login_at >= NOW() - INTERVAL '7 days') as ativos_ultimos_7_dias
-- FROM profiles;

-- =============================================
-- 7. TESTAR O CRON MANUALMENTE
-- =============================================
-- Execute esta linha para testar o cron manualmente (antes das 03:00)
-- Descomente para executar:
-- SELECT * FROM maintain_user_availability();

-- =============================================
-- 8. OPÇÕES DE HORÁRIO ALTERNATIVO
-- =============================================
-- Se quiser executar em outro horário, use um destes exemplos (Horário de Brasília):

-- Todos os dias à meia-noite Brasília (03:00 UTC):
-- SELECT cron.schedule('deactivate-inactive-users', '0 3 * * *', $$SELECT maintain_user_availability()$$);

-- Todos os dias às 06:00 Brasília (09:00 UTC):
-- SELECT cron.schedule('deactivate-inactive-users', '0 9 * * *', $$SELECT maintain_user_availability()$$);

-- Todos os dias às 12:00 Brasília (15:00 UTC):
-- SELECT cron.schedule('deactivate-inactive-users', '0 15 * * *', $$SELECT maintain_user_availability()$$);

-- A cada 12 horas (00:00 e 12:00 Brasília = 03:00 e 15:00 UTC):
-- SELECT cron.schedule('deactivate-inactive-users', '0 3,15 * * *', $$SELECT maintain_user_availability()$$);

-- Apenas às segundas-feiras às 03:00 Brasília (06:00 UTC):
-- SELECT cron.schedule('deactivate-inactive-users', '0 6 * * 1', $$SELECT maintain_user_availability()$$);

-- =============================================
-- 9. TROUBLESHOOTING
-- =============================================
-- Se o cron não estiver executando:

-- 1. Verificar se pg_cron está habilitado:
-- SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- 2. Verificar se o job está ativo:
-- SELECT * FROM cron.job WHERE jobname = 'deactivate-inactive-users';

-- 3. Ver erros na execução:
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'deactivate-inactive-users')
-- AND status = 'failed'
-- ORDER BY start_time DESC;

-- 4. Recriar o job:
-- SELECT cron.unschedule('deactivate-inactive-users');
-- (depois execute novamente o comando do item 3)

-- 5. Verificar permissões:
-- SELECT has_function_privilege('maintain_user_availability()', 'execute');

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
  RAISE NOTICE '   Job: deactivate-inactive-users';
  RAISE NOTICE '   Horário: 03:00 (Horário de Brasília - UTC-3)';
  RAISE NOTICE '   Horário UTC: 06:00';
  RAISE NOTICE '   Função: maintain_user_availability()';
  RAISE NOTICE '   Critério: Desativa usuários sem acesso há 7+ dias';
  RAISE NOTICE '';
  RAISE NOTICE '✅ CONFIGURADO PARA HORÁRIO DE BRASÍLIA!';
  RAISE NOTICE '   Cron Expression: ''0 6 * * *'' (06:00 UTC)';
  RAISE NOTICE '   Horário Local (Brasília): 03:00 (UTC-3)';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Monitoramento:';
  RAISE NOTICE '   - v_inactive_users: Ver todos os usuários com status';
  RAISE NOTICE '   - v_users_expiring_availability: Ver usuários próximos da desativação';
  RAISE NOTICE '';
  RAISE NOTICE '✅ O cron já está ativo e começará a executar automaticamente!';
  RAISE NOTICE '   Próxima execução: Amanhã às 03:00 (Horário de Brasília)';
END $$;

