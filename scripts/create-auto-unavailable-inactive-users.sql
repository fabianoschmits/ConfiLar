-- =============================================
-- SISTEMA AUTOMÁTICO DE DESATIVAÇÃO DE USUÁRIOS INATIVOS
-- =============================================
-- Este script cria funções e triggers para desativar automaticamente
-- usuários que ficam 7 dias sem acessar o sistema
-- =============================================

-- =============================================
-- 0. GARANTIR QUE A COLUNA LAST_LOGIN_AT EXISTE
-- =============================================
DO $$ 
BEGIN
  -- Adicionar coluna last_login_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Coluna last_login_at criada';
  ELSE
    RAISE NOTICE 'Coluna last_login_at já existe';
  END IF;

  -- Inicializar last_login_at para usuários que não têm data
  UPDATE profiles
  SET last_login_at = created_at
  WHERE last_login_at IS NULL;
  
  RAISE NOTICE 'Coluna last_login_at inicializada para usuários existentes';
END $$;

-- =============================================
-- 1. FUNÇÃO PARA DESATIVAR USUÁRIOS INATIVOS
-- =============================================
CREATE OR REPLACE FUNCTION deactivate_inactive_users()
RETURNS TABLE (
  deactivated_count INTEGER, 
  deactivated_user_ids UUID[],
  user_details JSONB[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deactivated_count INTEGER := 0;
  v_deactivated_ids UUID[];
  v_user_details JSONB[];
  v_inactive_threshold TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcular data limite (7 dias atrás)
  v_inactive_threshold := NOW() - INTERVAL '7 days';

  -- Coletar informações dos usuários que serão desativados
  SELECT 
    ARRAY_AGG(id),
    ARRAY_AGG(
      jsonb_build_object(
        'id', id,
        'name', name,
        'last_login_at', last_login_at,
        'days_inactive', EXTRACT(DAY FROM (NOW() - last_login_at))
      )
    )
  INTO v_deactivated_ids, v_user_details
  FROM profiles
  WHERE is_available = TRUE
    AND last_login_at IS NOT NULL
    AND last_login_at < v_inactive_threshold;

  -- Desativar usuários inativos
  UPDATE profiles
  SET 
    is_available = FALSE,
    updated_at = NOW()
  WHERE is_available = TRUE
    AND last_login_at IS NOT NULL
    AND last_login_at < v_inactive_threshold;

  GET DIAGNOSTICS v_deactivated_count = ROW_COUNT;

  -- Log da operação
  RAISE NOTICE 'Desativados % usuários inativos por 7+ dias', v_deactivated_count;

  RETURN QUERY SELECT 
    v_deactivated_count, 
    COALESCE(v_deactivated_ids, ARRAY[]::UUID[]),
    COALESCE(v_user_details, ARRAY[]::JSONB[]);
END;
$$;

-- =============================================
-- 2. FUNÇÃO DE MANUTENÇÃO PARA RELATÓRIO COMPLETO
-- =============================================
CREATE OR REPLACE FUNCTION maintain_user_availability()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_deactivated_count INTEGER;
  v_deactivated_ids UUID[];
  v_user_details JSONB[];
  v_total_available INTEGER;
  v_total_inactive INTEGER;
BEGIN
  -- Contar usuários disponíveis antes
  SELECT COUNT(*) INTO v_total_available
  FROM profiles
  WHERE is_available = TRUE;

  -- Desativar usuários inativos
  SELECT * INTO v_deactivated_count, v_deactivated_ids, v_user_details
  FROM deactivate_inactive_users();

  -- Contar usuários inativos há mais de 7 dias (que já estão desativados)
  SELECT COUNT(*) INTO v_total_inactive
  FROM profiles
  WHERE last_login_at < NOW() - INTERVAL '7 days'
    AND is_available = FALSE;

  -- Construir resultado
  v_result := json_build_object(
    'success', TRUE,
    'timestamp', NOW(),
    'statistics', json_build_object(
      'available_users_before', v_total_available,
      'deactivated_now', v_deactivated_count,
      'total_inactive_users', v_total_inactive
    ),
    'deactivated_users', json_build_object(
      'count', v_deactivated_count,
      'user_ids', v_deactivated_ids,
      'details', v_user_details
    )
  );

  RETURN v_result;
END;
$$;

-- =============================================
-- 3. VIEW PARA MONITORAR USUÁRIOS INATIVOS
-- =============================================
CREATE OR REPLACE VIEW v_inactive_users AS
SELECT 
  id,
  name,
  email,
  is_available,
  last_login_at,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - last_login_at)) / 86400 AS days_inactive,
  CASE 
    WHEN last_login_at < NOW() - INTERVAL '7 days' THEN 'INATIVO (7+ dias)'
    WHEN last_login_at < NOW() - INTERVAL '5 days' THEN 'QUASE INATIVO (5-7 dias)'
    WHEN last_login_at < NOW() - INTERVAL '3 days' THEN 'POUCO ATIVO (3-5 dias)'
    ELSE 'ATIVO (0-3 dias)'
  END AS activity_status
FROM profiles
WHERE last_login_at IS NOT NULL
ORDER BY last_login_at ASC;

-- =============================================
-- 4. VIEW PARA USUÁRIOS QUE SERÃO DESATIVADOS EM BREVE
-- =============================================
CREATE OR REPLACE VIEW v_users_expiring_availability AS
SELECT 
  id,
  name,
  email,
  is_available,
  last_login_at,
  NOW() - last_login_at AS time_since_login,
  EXTRACT(EPOCH FROM (NOW() - last_login_at)) / 86400 AS days_inactive,
  7 - EXTRACT(EPOCH FROM (NOW() - last_login_at)) / 86400 AS days_until_deactivation
FROM profiles
WHERE is_available = TRUE
  AND last_login_at IS NOT NULL
  AND last_login_at < NOW() - INTERVAL '5 days'  -- Usuários inativos há 5+ dias (2 dias antes do limite)
  AND last_login_at >= NOW() - INTERVAL '7 days' -- Mas ainda dentro do limite de 7 dias
ORDER BY last_login_at ASC;

-- =============================================
-- 5. FUNÇÃO PARA REATIVAR USUÁRIO MANUALMENTE
-- =============================================
CREATE OR REPLACE FUNCTION reactivate_user(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_user_name TEXT;
BEGIN
  -- Atualizar usuário
  UPDATE profiles
  SET 
    is_available = TRUE,
    last_login_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING name INTO v_user_name;

  IF NOT FOUND THEN
    v_result := json_build_object(
      'success', FALSE,
      'message', 'Usuário não encontrado'
    );
  ELSE
    v_result := json_build_object(
      'success', TRUE,
      'message', 'Usuário reativado com sucesso',
      'user_id', p_user_id,
      'user_name', v_user_name,
      'timestamp', NOW()
    );
  END IF;

  RETURN v_result;
END;
$$;

-- =============================================
-- 6. CRIAR ÍNDICES PARA PERFORMANCE
-- =============================================
-- Índice para busca rápida de usuários inativos
CREATE INDEX IF NOT EXISTS idx_profiles_availability_login 
ON profiles(is_available, last_login_at) 
WHERE is_available = TRUE;

-- Índice para queries de data de último login
CREATE INDEX IF NOT EXISTS idx_profiles_last_login_at 
ON profiles(last_login_at DESC) 
WHERE is_available = TRUE;

-- =============================================
-- 7. GARANTIR PERMISSÕES
-- =============================================
-- Permitir que usuários autenticados visualizem as views
GRANT SELECT ON v_inactive_users TO authenticated;
GRANT SELECT ON v_users_expiring_availability TO authenticated;

-- Permitir que a aplicação execute as funções de manutenção
GRANT EXECUTE ON FUNCTION deactivate_inactive_users() TO service_role;
GRANT EXECUTE ON FUNCTION maintain_user_availability() TO service_role;
GRANT EXECUTE ON FUNCTION reactivate_user(UUID) TO service_role;

-- =============================================
-- 8. COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================
COMMENT ON FUNCTION deactivate_inactive_users() IS 
  'Desativa automaticamente usuários que não acessam o sistema há 7+ dias';

COMMENT ON FUNCTION maintain_user_availability() IS 
  'Função de manutenção completa para gerenciar disponibilidade de usuários inativos';

COMMENT ON FUNCTION reactivate_user(UUID) IS 
  'Reativa manualmente um usuário específico e atualiza seu last_login_at';

COMMENT ON VIEW v_inactive_users IS 
  'Lista todos os usuários com informações sobre inatividade';

COMMENT ON VIEW v_users_expiring_availability IS 
  'Lista usuários disponíveis que serão desativados em breve (5-7 dias de inatividade)';

-- =============================================
-- 9. TESTE DAS FUNÇÕES
-- =============================================
-- Descomente para testar:

-- Ver todos os usuários inativos
-- SELECT * FROM v_inactive_users;

-- Ver usuários que serão desativados em breve
-- SELECT * FROM v_users_expiring_availability;

-- Executar manutenção manual (simular execução do cron)
-- SELECT * FROM maintain_user_availability();

-- Verificar quantos usuários seriam desativados
-- SELECT COUNT(*) FROM profiles 
-- WHERE is_available = TRUE 
--   AND last_login_at IS NOT NULL 
--   AND last_login_at < NOW() - INTERVAL '7 days';

-- Reativar um usuário específico
-- SELECT * FROM reactivate_user('uuid-do-usuario-aqui');

-- =============================================
-- FIM DO SCRIPT
-- =============================================

-- Mensagem de sucesso
DO $$
DECLARE
  v_total_users INTEGER;
  v_available_users INTEGER;
  v_inactive_7d INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_users FROM profiles;
  SELECT COUNT(*) INTO v_available_users FROM profiles WHERE is_available = TRUE;
  SELECT COUNT(*) INTO v_inactive_7d 
  FROM profiles 
  WHERE last_login_at < NOW() - INTERVAL '7 days';

  RAISE NOTICE '';
  RAISE NOTICE '✅ Sistema de desativação automática criado com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Funções disponíveis:';
  RAISE NOTICE '   - deactivate_inactive_users() - Desativa usuários inativos';
  RAISE NOTICE '   - maintain_user_availability() - Manutenção completa com relatório';
  RAISE NOTICE '   - reactivate_user(uuid) - Reativa usuário manualmente';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Views de monitoramento:';
  RAISE NOTICE '   - v_inactive_users - Todos os usuários com status de atividade';
  RAISE NOTICE '   - v_users_expiring_availability - Usuários próximos da desativação';
  RAISE NOTICE '';
  RAISE NOTICE '📈 Estatísticas atuais:';
  RAISE NOTICE '   Total de usuários: %', v_total_users;
  RAISE NOTICE '   Usuários disponíveis: %', v_available_users;
  RAISE NOTICE '   Usuários inativos 7+ dias: %', v_inactive_7d;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ IMPORTANTE: Configure o cron job para executar maintain_user_availability()!';
  RAISE NOTICE '   Recomendado: Diariamente às 03:00 ou usar o script setup-cron-inactive-users.sql';
END $$;

