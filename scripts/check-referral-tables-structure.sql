-- ============================================
-- VERIFICAR ESTRUTURA DAS TABELAS DE REFERRAL
-- ============================================

-- 1. Verificar estrutura da tabela user_referral_stats
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_referral_stats' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar estrutura da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar chaves estrangeiras existentes
SELECT
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
    AND (tc.table_name = 'user_referral_stats' OR tc.table_name = 'profiles')
ORDER BY tc.table_name, kcu.column_name;

-- 4. Verificar se há dados na tabela user_referral_stats
SELECT COUNT(*) as total_records FROM user_referral_stats;

-- 5. Verificar se há dados na tabela profiles
SELECT COUNT(*) as total_profiles FROM profiles;

-- 6. Verificar se há usuários sem dados de referral
SELECT 
    COUNT(p.id) as profiles_without_referral_data
FROM profiles p
LEFT JOIN user_referral_stats urs ON p.id = urs.user_id
WHERE urs.user_id IS NULL;
