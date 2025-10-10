-- =====================================================
-- CORRIGIR FOREIGN KEY DA TABELA CLASSIFIED_ADS
-- =====================================================
-- Execute este script no Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Remover a foreign key atual (se existir)
ALTER TABLE classified_ads 
DROP CONSTRAINT IF EXISTS classified_ads_user_id_fkey;

-- 2. Adicionar nova foreign key apontando para profiles
ALTER TABLE classified_ads 
ADD CONSTRAINT classified_ads_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. Verificar se a constraint foi criada corretamente
SELECT 
  tc.constraint_name,
  tc.table_name,
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
  AND tc.table_name = 'classified_ads'
  AND kcu.column_name = 'user_id';

-- 4. Testar inserção com um usuário válido
-- (Este teste será executado apenas se houver usuários na tabela profiles)
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Buscar um user_id válido da tabela profiles
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Tentar inserir um registro de teste
    INSERT INTO classified_ads (
      user_id,
      user_name,
      user_type,
      title,
      description,
      category,
      location_state,
      location_city,
      ad_type,
      is_active
    ) VALUES (
      test_user_id,
      'Teste de Usuário',
      'client',
      'Teste de Anúncio',
      'Descrição de teste para verificar se a foreign key está funcionando',
      'Teste',
      'RS',
      'Porto Alegre',
      'oferecer',
      true
    );
    
    -- Se chegou aqui, a inserção funcionou
    RAISE NOTICE '✅ Teste de inserção bem-sucedido!';
    
    -- Remover o registro de teste
    DELETE FROM classified_ads WHERE title = 'Teste de Anúncio';
    RAISE NOTICE '🧹 Registro de teste removido.';
    
  ELSE
    RAISE NOTICE '⚠️ Nenhum usuário encontrado na tabela profiles para teste.';
  END IF;
END $$;

-- 5. Verificar se há registros órfãos (user_id que não existem em profiles)
SELECT 
  'Registros órfãos encontrados:' as status,
  COUNT(*) as total
FROM classified_ads ca
LEFT JOIN profiles p ON ca.user_id = p.id
WHERE p.id IS NULL;

-- 6. Mostrar estrutura final
SELECT 
  'Estrutura da tabela classified_ads:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'classified_ads'
ORDER BY ordinal_position;
