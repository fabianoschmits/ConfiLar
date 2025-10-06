-- =====================================================
-- LIMPAR DUPLICATAS EXISTENTES E ADICIONAR CONSTRAINTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- PASSO 1: VERIFICAR DUPLICATAS EXISTENTES
-- =====================================================

-- 1.1 Ver TODOS os usuários com emails duplicados
SELECT 
  email,
  COUNT(*) as total_registros,
  STRING_AGG(id::text, ', ') as user_ids,
  STRING_AGG(full_name, ' | ') as nomes,
  MIN(created_at) as primeiro_cadastro,
  MAX(created_at) as ultimo_cadastro
FROM profiles
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY total_registros DESC, email;

-- 1.2 Ver TODOS os usuários com CPF/CNPJ duplicados
SELECT 
  cpf_cnpj,
  COUNT(*) as total_registros,
  STRING_AGG(id::text, ', ') as user_ids,
  STRING_AGG(full_name, ' | ') as nomes,
  MIN(created_at) as primeiro_cadastro,
  MAX(created_at) as ultimo_cadastro
FROM profiles
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''
GROUP BY cpf_cnpj
HAVING COUNT(*) > 1
ORDER BY total_registros DESC, cpf_cnpj;

-- =====================================================
-- PASSO 2: FAZER BACKUP DAS DUPLICATAS (IMPORTANTE!)
-- =====================================================

-- Criar tabela de backup com TODAS as duplicatas que serão removidas
CREATE TABLE IF NOT EXISTS profiles_duplicates_backup_$(date +%Y%m%d) AS
SELECT 
  p.*,
  NOW() as backup_created_at,
  'Backup antes de remover duplicatas' as backup_reason
FROM profiles p
WHERE 
  -- Registros com email duplicado (não são os mais recentes)
  (
    email IN (
      SELECT email 
      FROM profiles 
      WHERE email IS NOT NULL
      GROUP BY email 
      HAVING COUNT(*) > 1
    )
    AND id NOT IN (
      SELECT DISTINCT ON (email) id
      FROM profiles
      WHERE email IS NOT NULL
      ORDER BY email, created_at DESC, id DESC
    )
  )
  OR
  -- Registros com CPF/CNPJ duplicado (não são os mais recentes)
  (
    cpf_cnpj IS NOT NULL 
    AND cpf_cnpj != ''
    AND cpf_cnpj IN (
      SELECT cpf_cnpj 
      FROM profiles 
      WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''
      GROUP BY cpf_cnpj 
      HAVING COUNT(*) > 1
    )
    AND id NOT IN (
      SELECT DISTINCT ON (cpf_cnpj) id
      FROM profiles
      WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''
      ORDER BY cpf_cnpj, created_at DESC, id DESC
    )
  );

-- Ver quantos registros foram salvos no backup
SELECT COUNT(*) as total_backups FROM profiles_duplicates_backup_$(date +%Y%m%d);

-- =====================================================
-- PASSO 3: REMOVER DUPLICATAS (MANTÉM O MAIS RECENTE)
-- =====================================================

-- ⚠️ ATENÇÃO: Este comando VAI DELETAR registros duplicados!
-- ⚠️ Apenas o registro mais recente de cada email/CPF será mantido
-- ⚠️ Todos os outros serão deletados (mas estão no backup)

-- 3.1 Remover duplicatas de EMAIL (mantém o mais recente)
WITH duplicados_email AS (
  SELECT id
  FROM profiles
  WHERE email IS NOT NULL
    AND email IN (
      SELECT email 
      FROM profiles 
      WHERE email IS NOT NULL
      GROUP BY email 
      HAVING COUNT(*) > 1
    )
    AND id NOT IN (
      SELECT DISTINCT ON (email) id
      FROM profiles
      WHERE email IS NOT NULL
      ORDER BY email, created_at DESC, id DESC
    )
)
DELETE FROM profiles
WHERE id IN (SELECT id FROM duplicados_email);

-- Ver resultado: quantos foram deletados
-- Deve retornar: DELETE X (onde X é o número de duplicatas removidas)

-- 3.2 Remover duplicatas de CPF/CNPJ (mantém o mais recente)
WITH duplicados_cpf AS (
  SELECT id
  FROM profiles
  WHERE cpf_cnpj IS NOT NULL 
    AND cpf_cnpj != ''
    AND cpf_cnpj IN (
      SELECT cpf_cnpj 
      FROM profiles 
      WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''
      GROUP BY cpf_cnpj 
      HAVING COUNT(*) > 1
    )
    AND id NOT IN (
      SELECT DISTINCT ON (cpf_cnpj) id
      FROM profiles
      WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''
      ORDER BY cpf_cnpj, created_at DESC, id DESC
    )
)
DELETE FROM profiles
WHERE id IN (SELECT id FROM duplicados_cpf);

-- =====================================================
-- PASSO 4: VERIFICAR SE DUPLICATAS FORAM REMOVIDAS
-- =====================================================

-- Verificar emails duplicados (deve retornar 0 linhas)
SELECT email, COUNT(*) as total
FROM profiles
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- Verificar CPF/CNPJ duplicados (deve retornar 0 linhas)
SELECT cpf_cnpj, COUNT(*) as total
FROM profiles
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != ''
GROUP BY cpf_cnpj
HAVING COUNT(*) > 1;

-- =====================================================
-- PASSO 5: ADICIONAR CONSTRAINTS UNIQUE
-- =====================================================

-- Agora que não há mais duplicatas, podemos adicionar os constraints

-- 5.1 Adicionar constraint UNIQUE para email
ALTER TABLE profiles 
ADD CONSTRAINT unique_profile_email 
UNIQUE (email);

-- 5.2 Adicionar constraint UNIQUE para cpf_cnpj
ALTER TABLE profiles 
ADD CONSTRAINT unique_profile_cpf_cnpj 
UNIQUE (cpf_cnpj);

-- =====================================================
-- PASSO 6: CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email);

CREATE INDEX IF NOT EXISTS idx_profiles_cpf_cnpj 
ON profiles(cpf_cnpj) 
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != '';

-- =====================================================
-- PASSO 7: VERIFICAR SE OS CONSTRAINTS FORAM CRIADOS
-- =====================================================

SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles'
  AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.constraint_name;

-- Resultado esperado:
-- unique_profile_email     | UNIQUE | email
-- unique_profile_cpf_cnpj  | UNIQUE | cpf_cnpj

-- =====================================================
-- PASSO 8: ADICIONAR COMENTÁRIOS
-- =====================================================

COMMENT ON CONSTRAINT unique_profile_email ON profiles IS 
'Garante que cada email seja único - DUPLICATAS EXISTENTES foram removidas antes de criar este constraint';

COMMENT ON CONSTRAINT unique_profile_cpf_cnpj ON profiles IS 
'Garante que cada CPF/CNPJ seja único - DUPLICATAS EXISTENTES foram removidas antes de criar este constraint';

-- =====================================================
-- ✅ CONCLUÍDO!
-- =====================================================

-- Resumo do que foi feito:
-- ✅ Duplicatas identificadas e salvas em backup
-- ✅ Duplicatas removidas (mantido apenas o registro mais recente)
-- ✅ Constraints UNIQUE adicionados
-- ✅ Índices criados para performance
-- ✅ Agora é IMPOSSÍVEL cadastrar emails ou CPFs duplicados

-- Para ver os backups das duplicatas removidas:
-- SELECT * FROM profiles_duplicates_backup_$(date +%Y%m%d);

