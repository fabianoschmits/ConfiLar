-- =====================================================
-- CRIAR ÍNDICES PARA VERIFICAÇÃO DE DUPLICATAS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- ⚠️ IMPORTANTE: Este script NÃO adiciona constraints UNIQUE
-- Ele apenas cria índices para tornar as consultas de validação mais rápidas

-- =====================================================
-- 1. ÍNDICE PARA EMAIL
-- =====================================================

-- Criar índice case-insensitive para email
-- Isso torna a busca por emails duplicados muito mais rápida
CREATE INDEX IF NOT EXISTS idx_profiles_email_lower 
ON profiles(LOWER(email));

-- Comentário
COMMENT ON INDEX idx_profiles_email_lower IS 
'Índice para verificação rápida de emails duplicados (case-insensitive)';

-- =====================================================
-- 2. ÍNDICE PARA CPF/CNPJ
-- =====================================================

-- Criar índice para cpf_cnpj (apenas valores não nulos)
CREATE INDEX IF NOT EXISTS idx_profiles_cpf_cnpj 
ON profiles(cpf_cnpj) 
WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj != '';

-- Comentário
COMMENT ON INDEX idx_profiles_cpf_cnpj IS 
'Índice para verificação rápida de CPF/CNPJ duplicados';

-- =====================================================
-- 3. VERIFICAR SE OS ÍNDICES FORAM CRIADOS
-- =====================================================

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'profiles'
  AND (indexname LIKE '%email%' OR indexname LIKE '%cpf%')
ORDER BY indexname;

-- Resultado esperado:
-- idx_profiles_email_lower | CREATE INDEX idx_profiles_email_lower ON profiles USING btree (lower(email))
-- idx_profiles_cpf_cnpj    | CREATE INDEX idx_profiles_cpf_cnpj ON profiles USING btree (cpf_cnpj) WHERE ...

-- =====================================================
-- 4. TESTAR PERFORMANCE
-- =====================================================

-- Teste de busca por email (deve ser muito rápido)
EXPLAIN ANALYZE
SELECT id FROM profiles 
WHERE LOWER(email) = 'teste@example.com' 
LIMIT 1;

-- Teste de busca por CPF (deve ser muito rápido)
EXPLAIN ANALYZE
SELECT id FROM profiles 
WHERE cpf_cnpj = '12345678900' 
LIMIT 1;

-- =====================================================
-- ✅ CONCLUÍDO!
-- =====================================================

-- ✅ Índices criados para performance
-- ✅ Consultas de validação serão muito mais rápidas
-- ✅ Duplicatas existentes NÃO são afetadas
-- ✅ Validação de novos cadastros no código (src/lib/checkDuplicates.ts)

-- 📝 NOTA: 
-- Este script NÃO impede duplicatas no nível do banco.
-- A validação é feita no código TypeScript antes de inserir.

