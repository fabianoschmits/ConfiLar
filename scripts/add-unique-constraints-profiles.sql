-- =====================================================
-- ADICIONAR CONSTRAINTS UNIQUE PARA EMAIL E CPF/CNPJ
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. VERIFICAR DUPLICATAS EXISTENTES
-- Execute primeiro para ver se há problemas

-- Verificar emails duplicados
SELECT email, COUNT(*) as total
FROM profiles
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY total DESC;

-- Verificar CPF/CNPJ duplicados
SELECT cpf_cnpj, COUNT(*) as total
FROM profiles
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''
GROUP BY cpf_cnpj
HAVING COUNT(*) > 1
ORDER BY total DESC;

-- =====================================================
-- 2. REMOVER DUPLICATAS (SE NECESSÁRIO)
-- =====================================================

-- Esta query mantém apenas o registro mais recente de cada email duplicado
-- ATENÇÃO: Descomente e execute APENAS se houver duplicatas confirmadas

/*
-- Backup dos registros que serão removidos
CREATE TABLE IF NOT EXISTS profiles_duplicates_backup AS
SELECT * FROM profiles
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id
  FROM profiles
  WHERE email IS NOT NULL
  ORDER BY email, created_at DESC
);

-- Remover duplicatas de email (mantém o mais recente)
DELETE FROM profiles
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id
  FROM profiles
  WHERE email IS NOT NULL
  ORDER BY email, created_at DESC
);

-- Remover duplicatas de CPF/CNPJ (mantém o mais recente)
DELETE FROM profiles
WHERE cpf_cnpj IS NOT NULL 
  AND cpf_cnpj != ''
  AND id NOT IN (
    SELECT DISTINCT ON (cpf_cnpj) id
    FROM profiles
    WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''
    ORDER BY cpf_cnpj, created_at DESC
  );
*/

-- =====================================================
-- 3. ADICIONAR CONSTRAINTS UNIQUE
-- =====================================================

-- Adicionar constraint UNIQUE para email
-- Isso garante que nenhum email possa ser cadastrado duas vezes
ALTER TABLE profiles 
ADD CONSTRAINT unique_profile_email 
UNIQUE (email);

-- Adicionar constraint UNIQUE para cpf_cnpj
-- Isso garante que nenhum CPF/CNPJ possa ser cadastrado duas vezes
ALTER TABLE profiles 
ADD CONSTRAINT unique_profile_cpf_cnpj 
UNIQUE (cpf_cnpj);

-- =====================================================
-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Criar índice para email (se não existir)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Criar índice para cpf_cnpj (se não existir)
CREATE INDEX IF NOT EXISTS idx_profiles_cpf_cnpj ON profiles(cpf_cnpj) 
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != '';

-- =====================================================
-- 5. VERIFICAR SE OS CONSTRAINTS FORAM CRIADOS
-- =====================================================

-- Listar todos os constraints da tabela profiles
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles'
  AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
ORDER BY tc.constraint_name;

-- =====================================================
-- 6. TESTAR OS CONSTRAINTS
-- =====================================================

-- Tentar inserir um email duplicado (deve falhar)
/*
-- Descomente para testar (substitua pelo email de um usuário existente)
INSERT INTO profiles (id, email, full_name, user_type)
VALUES (
  gen_random_uuid(), 
  'email_existente@example.com',  -- Use um email real do banco
  'Teste Duplicado',
  'client'
);
-- Resultado esperado: ERROR: duplicate key value violates unique constraint "unique_profile_email"
*/

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON CONSTRAINT unique_profile_email ON profiles IS 
'Garante que cada email seja único na plataforma - previne registros duplicados';

COMMENT ON CONSTRAINT unique_profile_cpf_cnpj ON profiles IS 
'Garante que cada CPF/CNPJ seja único na plataforma - previne registros duplicados';

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================

-- ✅ Email e CPF/CNPJ agora são únicos no banco de dados
-- ✅ Tentativas de cadastro duplicado serão rejeitadas automaticamente
-- ✅ Performance de consultas por email/CPF melhorada com índices
-- ✅ Integridade dos dados garantida

