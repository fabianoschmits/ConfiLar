-- =====================================================
-- SCRIPT DE TESTE DE CRIAÇÃO DE PERFIL
-- ConfiLar - Testar se a criação de perfil está funcionando
-- =====================================================

-- 1. VERIFICAR SE HÁ PROBLEMAS DE CONSTRAINT
SELECT 
    'VERIFICAÇÃO DE CONSTRAINTS' as teste,
    constraint_name,
    constraint_type,
    table_name,
    column_name,
    is_deferrable,
    initially_deferred
FROM information_schema.constraint_column_usage 
WHERE table_name = 'profiles';

-- 2. VERIFICAR SE HÁ PROBLEMAS DE TIPO DE DADOS
SELECT 
    'VERIFICAÇÃO DE TIPOS' as teste,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. TESTAR INSERÇÃO MANUAL DE PERFIL (SIMULAÇÃO)
-- DESCOMENTE PARA TESTAR INSERÇÃO MANUAL
/*
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'teste@exemplo.com';
    insert_result RECORD;
BEGIN
    -- Tentar inserir um perfil de teste
    INSERT INTO profiles (
        id, 
        email, 
        full_name, 
        user_type, 
        phone, 
        location_state, 
        location_city, 
        professional_experience_years,
        is_verified, 
        badge, 
        rating, 
        total_reviews, 
        is_available,
        profile_completed,
        gender,
        avatar_url,
        created_at, 
        updated_at
    ) VALUES (
        test_user_id,
        test_email,
        'Usuário Teste',
        'client',
        '11999999999',
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
        'https://api.dicebear.com/7.x/avataaars/svg?seed=teste',
        NOW(),
        NOW()
    ) RETURNING * INTO insert_result;
    
    RAISE NOTICE '✅ Perfil de teste criado com sucesso: %', insert_result.full_name;
    
    -- Limpar o teste
    DELETE FROM profiles WHERE id = test_user_id;
    RAISE NOTICE '🧹 Perfil de teste removido';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao criar perfil de teste: %', SQLERRM;
END $$;
*/

-- 4. VERIFICAR SE HÁ PROBLEMAS DE RLS
SELECT 
    'VERIFICAÇÃO DE RLS' as teste,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'profiles';

-- 5. VERIFICAR POLÍTICAS RLS ATIVAS
SELECT 
    'POLÍTICAS RLS ATIVAS' as teste,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. VERIFICAR SE HÁ TRIGGERS PROBLEMÁTICOS
SELECT 
    'VERIFICAÇÃO DE TRIGGERS' as teste,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 7. VERIFICAR PERMISSÕES DE USUÁRIO ANÔNIMO
SELECT 
    'VERIFICAÇÃO DE PERMISSÕES' as teste,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'profiles' 
  AND grantee IN ('anon', 'authenticated', 'public');

-- 8. VERIFICAR SE HÁ PROBLEMAS DE SEQUÊNCIA
SELECT 
    'VERIFICAÇÃO DE SEQUÊNCIAS' as teste,
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM information_schema.sequences 
WHERE sequence_name LIKE '%profile%';

-- 9. VERIFICAR LOGS DE ERRO (se disponível)
-- Esta query pode não funcionar dependendo das permissões
SELECT 
    'VERIFICAÇÃO DE LOGS' as teste,
    'Verificar logs do Supabase Dashboard' as observacao;

-- 10. VERIFICAR SE HÁ PROBLEMAS DE TIMEZONE
SELECT 
    'VERIFICAÇÃO DE TIMEZONE' as teste,
    current_setting('timezone') as timezone_atual,
    NOW() as timestamp_atual;

-- =====================================================
-- TESTE MANUAL DE INSERÇÃO (EXECUTE SEPARADAMENTE)
-- =====================================================

-- TESTE 1: Inserir perfil simples
/*
INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    user_type, 
    profile_completed,
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(),
    'teste-simples@exemplo.com',
    'Teste Simples',
    'client',
    true,
    NOW(),
    NOW()
);
*/

-- TESTE 2: Inserir perfil completo
/*
INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    user_type, 
    phone, 
    location_state, 
    location_city, 
    professional_experience_years,
    is_verified, 
    badge, 
    rating, 
    total_reviews, 
    is_available,
    profile_completed,
    gender,
    avatar_url,
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(),
    'teste-completo@exemplo.com',
    'Teste Completo',
    'professional',
    '11999999999',
    'SP',
    'São Paulo',
    5,
    false,
    'silver',
    4.5,
    10,
    true,
    true,
    'female',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=completo',
    NOW(),
    NOW()
);
*/

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se os testes foram inseridos
SELECT 
    'VERIFICAÇÃO FINAL' as teste,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN email LIKE '%teste%' THEN 1 END) as profiles_teste,
    COUNT(CASE WHEN profile_completed = true THEN 1 END) as profiles_completos,
    COUNT(CASE WHEN profile_completed = false THEN 1 END) as profiles_incompletos
FROM profiles;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Execute todas as queries de verificação primeiro
-- 2. Se houver erros, identifique a causa
-- 3. Execute os testes manuais se necessário
-- 4. Verifique os logs do Supabase Dashboard
-- 5. Se RLS estiver bloqueando, considere desabilitar temporariamente
-- =====================================================

-- =====================================================
-- POSSÍVEIS PROBLEMAS E SOLUÇÕES:
-- =====================================================
-- 1. ❌ RLS bloqueando inserção
--    ✅ Solução: Desabilitar RLS temporariamente ou criar política adequada
-- 
-- 2. ❌ Constraint violado
--    ✅ Solução: Verificar tipos de dados e valores obrigatórios
-- 
-- 3. ❌ Trigger falhando
--    ✅ Solução: Verificar triggers e funções relacionadas
-- 
-- 4. ❌ Permissão insuficiente
--    ✅ Solução: Verificar permissões do usuário anônimo
-- 
-- 5. ❌ Campo obrigatório faltando
--    ✅ Solução: Verificar se todos os campos NOT NULL estão sendo fornecidos
-- =====================================================
