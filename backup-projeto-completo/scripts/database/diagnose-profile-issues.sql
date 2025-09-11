-- =====================================================
-- SCRIPT DE DIAGNÓSTICO DE PROBLEMAS DE PERFIL
-- ConfiLar - Identificar por que perfis não são criados
-- =====================================================

-- 1. VERIFICAR SE A TABELA PROFILES EXISTE E TEM AS COLUNAS CORRETAS
SELECT 
    'VERIFICAÇÃO DE ESTRUTURA' as diagnostico,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
        THEN '✅ TABELA PROFILES EXISTE'
        ELSE '❌ TABELA PROFILES NÃO EXISTE'
    END as status_tabela,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender')
        THEN '✅ COLUNA GENDER EXISTE'
        ELSE '❌ COLUNA GENDER NÃO EXISTE'
    END as status_gender,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url')
        THEN '✅ COLUNA AVATAR_URL EXISTE'
        ELSE '❌ COLUNA AVATAR_URL NÃO EXISTE'
    END as status_avatar;

-- 2. VERIFICAR USUÁRIOS CRIADOS HOJE QUE NÃO TÊM PERFIL
SELECT 
    'USUÁRIOS DE HOJE SEM PERFIL' as diagnostico,
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    CASE 
        WHEN u.email_confirmed_at IS NULL THEN '❌ EMAIL NÃO CONFIRMADO'
        ELSE '✅ EMAIL CONFIRMADO'
    END as status_email
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE DATE(u.created_at) = CURRENT_DATE
  AND p.id IS NULL
ORDER BY u.created_at DESC;

-- 3. VERIFICAR SE HÁ PROBLEMAS DE PERMISSÃO
SELECT 
    'VERIFICAÇÃO DE PERMISSÕES' as diagnostico,
    'Testando inserção de perfil...' as teste;

-- 4. SIMULAR INSERÇÃO DE PERFIL (apenas para teste)
-- DESCOMENTE AS LINHAS ABAIXO PARA TESTAR INSERÇÃO MANUAL
/*
INSERT INTO profiles (
    id, email, full_name, user_type, phone, 
    location_state, location_city, professional_experience_years,
    is_verified, badge, rating, total_reviews, is_available,
    profile_completed, gender, created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- ID de teste
    'teste@exemplo.com',
    'Usuário Teste',
    'client',
    '',
    'SP',
    'São Paulo',
    0,
    false,
    'bronze',
    0,
    0,
    true,
    true,
    'male',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;
*/

-- 5. VERIFICAR TRIGGERS NA TABELA PROFILES
SELECT 
    'VERIFICAÇÃO DE TRIGGERS' as diagnostico,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 6. VERIFICAR FUNÇÕES RELACIONADAS A PROFILES
SELECT 
    'VERIFICAÇÃO DE FUNÇÕES' as diagnostico,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name LIKE '%profile%' 
   OR routine_name LIKE '%user%';

-- 7. VERIFICAR LOGS DE ERRO (se disponível)
SELECT 
    'VERIFICAÇÃO DE LOGS' as diagnostico,
    'Verificar logs do Supabase para erros de inserção' as observacao;

-- 8. VERIFICAR SE HÁ CONSTRAINTS PROBLEMÁTICOS
SELECT 
    'VERIFICAÇÃO DE CONSTRAINTS' as diagnostico,
    constraint_name,
    constraint_type,
    table_name,
    column_name
FROM information_schema.constraint_column_usage 
WHERE table_name = 'profiles';

-- 9. VERIFICAR ÍNDICES DA TABELA PROFILES
SELECT 
    'VERIFICAÇÃO DE ÍNDICES' as diagnostico,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'profiles';

-- 10. VERIFICAR SE HÁ DADOS CORROMPIDOS
SELECT 
    'VERIFICAÇÃO DE INTEGRIDADE' as diagnostico,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN id IS NULL THEN 1 END) as profiles_sem_id,
    COUNT(CASE WHEN email IS NULL OR email = '' THEN 1 END) as profiles_sem_email,
    COUNT(CASE WHEN full_name IS NULL OR full_name = '' THEN 1 END) as profiles_sem_nome
FROM profiles;

-- =====================================================
-- DIAGNÓSTICO RÁPIDO - EXECUTE ESTAS QUERIES PRIMEIRO:
-- =====================================================

-- A. Verificar se usuários estão sendo criados:
-- SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '1 day';

-- B. Verificar se perfis estão sendo criados:
-- SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '1 day';

-- C. Verificar diferença entre usuários e perfis:
-- SELECT 
--     (SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '1 day') as usuarios_hoje,
--     (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '1 day') as perfis_hoje;

-- =====================================================
-- POSSÍVEIS CAUSAS DO PROBLEMA:
-- =====================================================
-- 1. ❌ RLS bloqueando inserção
-- 2. ❌ Constraints violados
-- 3. ❌ Triggers falhando
-- 4. ❌ Permissões insuficientes
-- 5. ❌ Campos obrigatórios faltando
-- 6. ❌ Tipos de dados incorretos
-- 7. ❌ Função de criação de perfil com erro
-- =====================================================
