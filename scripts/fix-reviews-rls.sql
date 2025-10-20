-- =====================================================
-- CORRIGIR POLÍTICAS RLS DA TABELA REVIEWS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Verificar se a tabela reviews existe
SELECT 
  'TABELA_REVIEWS' as status,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'reviews';

-- 2. Verificar colunas existentes
SELECT 
  'COLUNAS_REVIEWS' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'reviews'
ORDER BY ordinal_position;

-- 3. Habilitar RLS se não estiver
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas existentes
DROP POLICY IF EXISTS "Users can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete reviews" ON reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;

-- 5. Criar políticas RLS para reviews
CREATE POLICY "Users can view reviews" ON reviews
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert reviews" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid() AND
    reviewed_id IS NOT NULL AND
    reviewed_id != auth.uid()
  );

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE TO authenticated
  USING (reviewer_id = auth.uid());

-- 6. Verificar políticas criadas
SELECT 
  'POLITICAS_CRIADAS' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'reviews'
ORDER BY policyname;

-- 7. Testar inserção de review
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

-- 8. Verificar permissões de usuário autenticado
SELECT 
  'PERMISSOES_USUARIO' as status,
  has_table_privilege('authenticated', 'reviews', 'SELECT') as can_select,
  has_table_privilege('authenticated', 'reviews', 'INSERT') as can_insert,
  has_table_privilege('authenticated', 'reviews', 'UPDATE') as can_update,
  has_table_privilege('authenticated', 'reviews', 'DELETE') as can_delete;

SELECT 
  'RESUMO_CORRECOES' as status,
  'Políticas RLS da tabela reviews corrigidas com sucesso!' as resultado,
  NOW() as timestamp;
