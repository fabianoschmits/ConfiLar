-- =====================================================
-- VERIFICAR ESTRUTURA DA TABELA REVIEWS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Verificar se a tabela reviews existe
SELECT 
  'TABELA_EXISTE' as status,
  table_name,
  table_type,
  is_insertable_into
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'reviews';

-- 2. Verificar todas as colunas da tabela reviews
SELECT 
  'COLUNAS_REVIEWS' as status,
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'reviews'
ORDER BY ordinal_position;

-- 3. Verificar constraints da tabela
SELECT 
  'CONSTRAINTS_REVIEWS' as status,
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints
WHERE table_schema = 'public' 
  AND table_name = 'reviews'
ORDER BY constraint_name;

-- 4. Verificar chaves estrangeiras
SELECT 
  'FOREIGN_KEYS' as status,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'reviews'
ORDER BY kcu.column_name;

-- 5. Verificar dados de exemplo (primeiras 3 linhas)
SELECT 
  'DADOS_EXEMPLO' as status,
  *
FROM reviews
LIMIT 3;

-- 6. Verificar se há reviews com dados válidos
SELECT 
  'REVIEWS_VALIDAS' as status,
  COUNT(*) as total_reviews,
  COUNT(*) FILTER (WHERE reviewer_id IS NOT NULL) as com_reviewer_id,
  COUNT(*) FILTER (WHERE reviewed_id IS NOT NULL) as com_reviewed_id,
  COUNT(*) FILTER (WHERE rating IS NOT NULL) as com_rating
FROM reviews;

-- 7. Verificar políticas RLS
SELECT 
  'POLITICAS_RLS' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'reviews'
ORDER BY policyname;

-- 8. Verificar se RLS está habilitado
SELECT 
  'RLS_STATUS' as status,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'reviews';

-- 9. Verificar triggers existentes
SELECT 
  'TRIGGERS_REVIEWS' as status,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
  AND event_object_table = 'reviews'
ORDER BY trigger_name;

-- 10. Testar inserção de review (simular envio)
DO $$
DECLARE
  test_reviewer_id UUID;
  test_reviewee_id UUID;
  review_id UUID;
  error_message TEXT;
BEGIN
  -- Obter usuários de teste
  SELECT id INTO test_reviewer_id FROM profiles LIMIT 1;
  SELECT id INTO test_reviewee_id FROM profiles WHERE id != test_reviewer_id LIMIT 1;
  
  IF test_reviewer_id IS NOT NULL AND test_reviewee_id IS NOT NULL THEN
    RAISE NOTICE 'TESTE_REVIEW: Usuários encontrados - Reviewer: %, Reviewee: %', 
      test_reviewer_id, test_reviewee_id;
    
    -- Tentar inserir review de teste
    BEGIN
      INSERT INTO reviews (
        reviewer_id,
        reviewed_id,
        rating,
        comment,
        created_at
      ) VALUES (
        test_reviewer_id,
        test_reviewee_id,
        5,
        'Avaliação de teste - ' || NOW()::text,
        NOW()
      ) RETURNING id INTO review_id;
      
      RAISE NOTICE 'TESTE_INSERT: SUCESSO - Review inserida com ID: %', review_id;
      
      -- Deletar review de teste
      DELETE FROM reviews WHERE id = review_id;
      RAISE NOTICE 'TESTE_CLEANUP: SUCESSO - Review de teste removida';
      
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
      RAISE NOTICE 'TESTE_INSERT: ERRO - %', error_message;
    END;
    
  ELSE
    RAISE NOTICE 'TESTE_REVIEW: ERRO - Usuários de teste não encontrados';
  END IF;
END $$;

SELECT 
  'RESUMO_VERIFICACAO' as status,
  'Estrutura da tabela reviews verificada!' as resultado,
  NOW() as timestamp;
