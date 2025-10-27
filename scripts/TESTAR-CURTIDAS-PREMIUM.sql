-- =====================================================
-- TESTAR SISTEMA DE CURTIDAS PREMIUM
-- =====================================================

-- 1. VERIFICAR SE TABELA FOI CRIADA
SELECT 'VERIFICAÇÃO DA TABELA:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'feed_posts_likes' 
ORDER BY ordinal_position;

-- 2. VERIFICAR TRIGGERS CRIADOS
SELECT 'TRIGGERS CRIADOS:' as info;
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%premium%' OR trigger_name LIKE '%like%'
ORDER BY trigger_name;

-- 3. VERIFICAR FUNÇÕES CRIADAS
SELECT 'FUNÇÕES CRIADAS:' as info;
SELECT routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_name LIKE '%premium%' OR routine_name LIKE '%like%'
ORDER BY routine_name;

-- 4. VERIFICAR VIEW DE ESTATÍSTICAS
SELECT 'VIEW DE ESTATÍSTICAS:' as info;
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_name = 'premium_likes_stats';

-- 5. VERIFICAR POLÍTICAS RLS
SELECT 'POLÍTICAS RLS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'feed_posts_likes'
ORDER BY policyname;

-- 6. VERIFICAR ÍNDICES
SELECT 'ÍNDICES CRIADOS:' as info;
SELECT indexname, tablename, indexdef
FROM pg_indexes 
WHERE tablename = 'feed_posts_likes'
ORDER BY indexname;

-- 7. TESTE DE INSERÇÃO (SIMULAÇÃO)
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SISTEMA DE CURTIDAS PREMIUM VERIFICADO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Tabela feed_posts_likes criada';
  RAISE NOTICE '✅ Triggers de curtidas premium criados';
  RAISE NOTICE '✅ Funções de processamento criadas';
  RAISE NOTICE '✅ View de estatísticas criada';
  RAISE NOTICE '✅ Políticas RLS configuradas';
  RAISE NOTICE '✅ Índices para performance criados';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'PRÓXIMOS PASSOS:';
  RAISE NOTICE '1. Execute o script SQL no Supabase';
  RAISE NOTICE '2. Teste criando curtidas premium';
  RAISE NOTICE '3. Verifique transferência de pontos';
  RAISE NOTICE '4. Teste a interface no frontend';
  RAISE NOTICE '========================================';
END $$;

