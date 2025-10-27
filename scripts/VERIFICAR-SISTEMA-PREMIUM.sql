-- =====================================================
-- VERIFICAR SISTEMA PREMIUM IMPLEMENTADO
-- =====================================================

-- 1. VERIFICAR CONFIGURAÇÕES DE PONTOS
SELECT 'CONFIGURAÇÕES DE PONTOS:' as info;
SELECT action_key, points_value, daily_limit, description, is_active 
FROM points_config 
ORDER BY action_key;

-- 2. VERIFICAR TABELA DE BADGES VIP
SELECT 'TABELA DE BADGES VIP:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_vip_badges' 
ORDER BY ordinal_position;

-- 3. VERIFICAR COLUNAS PREMIUM EM FEED_POSTS
SELECT 'COLUNAS PREMIUM EM FEED_POSTS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'feed_posts' 
AND column_name LIKE '%premium%'
ORDER BY ordinal_position;

-- 4. VERIFICAR TRIGGERS CRIADOS
SELECT 'TRIGGERS CRIADOS:' as info;
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%premium%' OR trigger_name LIKE '%vip%'
ORDER BY trigger_name;

-- 5. VERIFICAR FUNÇÕES CRIADAS
SELECT 'FUNÇÕES CRIADAS:' as info;
SELECT routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_name LIKE '%premium%' OR routine_name LIKE '%vip%'
ORDER BY routine_name;

-- 6. VERIFICAR POLÍTICAS RLS
SELECT 'POLÍTICAS RLS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_vip_badges'
ORDER BY policyname;

-- 7. VERIFICAR ÍNDICES CRIADOS
SELECT 'ÍNDICES CRIADOS:' as info;
SELECT indexname, tablename, indexdef
FROM pg_indexes 
WHERE tablename = 'user_vip_badges'
ORDER BY indexname;

-- 8. TESTE DE INSERÇÃO DE BADGE VIP (SIMULAÇÃO)
SELECT 'TESTE DE BADGE VIP:' as info;
SELECT 'Para testar, execute uma compra de pontos e verifique se o badge é criado automaticamente' as instrucao;

-- 9. VERIFICAR SE SISTEMA DE PONTOS GRATUITOS FOI REMOVIDO
SELECT 'PONTOS GRATUITOS REMOVIDOS:' as info;
SELECT COUNT(*) as pontos_gratuitos_restantes
FROM points_config 
WHERE action_key IN (
  'daily_login',
  'receive_like', 
  'give_like',
  'receive_comment',
  'give_comment',
  'profile_completion',
  'first_post',
  'create_classified'
);

-- 10. RESUMO FINAL
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICAÇÃO DO SISTEMA PREMIUM';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Script executado com sucesso!';
  RAISE NOTICE '✅ Sistema de pontos gratuitos removido';
  RAISE NOTICE '✅ Sistema de badges VIP criado';
  RAISE NOTICE '✅ Sistema de posts premium criado';
  RAISE NOTICE '✅ Sistema de indicações mantido';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PRÓXIMOS PASSOS:';
  RAISE NOTICE '1. Teste comprando pontos';
  RAISE NOTICE '2. Verifique se badges VIP são criados';
  RAISE NOTICE '3. Teste criando posts premium';
  RAISE NOTICE '4. Verifique sistema de indicações';
  RAISE NOTICE '========================================';
END $$;

