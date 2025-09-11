-- =====================================================
-- SCRIPT SIMPLES DE DIAGNÓSTICO DE PERFIL
-- ConfiLar - Verificar problemas de criação de perfil
-- =====================================================

-- EXECUTAR ESTAS QUERIES EM ORDEM:

-- =====================================================
-- PARTE 1: VERIFICAÇÃO BÁSICA
-- =====================================================

-- 1.1 Verificar estrutura da tabela profiles
SELECT 
    'ESTRUTURA PROFILES' as verificacao,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 1.2 Verificar se RLS está habilitado
SELECT 
    'STATUS RLS' as verificacao,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'profiles';

-- 1.3 Verificar políticas RLS
SELECT 
    'POLÍTICAS RLS' as verificacao,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 1.4 Verificar permissões
SELECT 
    'PERMISSÕES' as verificacao,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'profiles' 
  AND grantee IN ('anon', 'authenticated', 'public');

-- =====================================================
-- PARTE 2: VERIFICAÇÃO DE DADOS
-- =====================================================

-- 2.1 Usuários recentes vs perfis
SELECT 
    'USUÁRIOS VS PERFIS' as verificacao,
    COUNT(u.id) as total_usuarios,
    COUNT(p.id) as usuarios_com_perfil,
    COUNT(u.id) - COUNT(p.id) as usuarios_sem_perfil
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.created_at >= NOW() - INTERVAL '7 days';

-- 2.2 Usuários sem perfil (últimos 7 dias)
SELECT 
    'USUÁRIOS SEM PERFIL' as verificacao,
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
WHERE u.created_at >= NOW() - INTERVAL '7 days'
  AND p.id IS NULL
ORDER BY u.created_at DESC;

-- 2.3 Perfis incompletos
SELECT 
    'PERFIS INCOMPLETOS' as verificacao,
    p.id,
    p.email,
    p.full_name,
    p.user_type,
    p.phone,
    p.location_state,
    p.location_city,
    p.created_at
FROM profiles p
WHERE p.created_at >= NOW() - INTERVAL '7 days'
  AND (
    p.full_name IS NULL 
    OR p.full_name = ''
    OR p.full_name = 'Usuário'
  )
ORDER BY p.created_at DESC;

-- =====================================================
-- PARTE 3: CORREÇÃO AUTOMÁTICA
-- =====================================================

-- 3.1 Criar perfis para usuários sem perfil
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
    created_at, 
    updated_at
)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(u.raw_user_meta_data->>'user_type', 'client'),
    COALESCE(u.raw_user_meta_data->>'phone', ''),
    COALESCE(u.raw_user_meta_data->>'location_state', 'SP'),
    COALESCE(u.raw_user_meta_data->>'location_city', 'São Paulo'),
    COALESCE((u.raw_user_meta_data->>'experience_years')::INTEGER, 0),
    false,
    'bronze',
    0,
    0,
    true,
    u.created_at,
    NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
  AND u.created_at >= NOW() - INTERVAL '30 days' -- Apenas usuários dos últimos 30 dias
ON CONFLICT (id) DO NOTHING;

-- 3.2 Atualizar perfis incompletos
UPDATE profiles 
SET 
    full_name = COALESCE(
        NULLIF(full_name, ''), 
        NULLIF(full_name, 'Usuário'),
        u.raw_user_meta_data->>'full_name',
        'Usuário'
    ),
    phone = COALESCE(NULLIF(phone, ''), u.raw_user_meta_data->>'phone', ''),
    location_state = COALESCE(NULLIF(location_state, ''), u.raw_user_meta_data->>'location_state', 'SP'),
    location_city = COALESCE(NULLIF(location_city, ''), u.raw_user_meta_data->>'location_city', 'São Paulo'),
    updated_at = NOW()
FROM auth.users u
WHERE profiles.id = u.id
  AND (
    profiles.full_name IS NULL 
    OR profiles.full_name = ''
    OR profiles.full_name = 'Usuário'
    OR profiles.phone IS NULL
    OR profiles.phone = ''
  );

-- =====================================================
-- PARTE 4: VERIFICAÇÃO FINAL
-- =====================================================

-- 4.1 Resultado das correções
SELECT 
    'RESULTADO FINAL' as verificacao,
    COUNT(*) as total_usuarios,
    COUNT(p.id) as usuarios_com_perfil,
    COUNT(*) - COUNT(p.id) as usuarios_sem_perfil
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.created_at >= NOW() - INTERVAL '7 days';

-- 4.2 Usuários recentes após correção
SELECT 
    'USUÁRIOS RECENTES APÓS CORREÇÃO' as verificacao,
    u.id,
    u.email,
    u.created_at,
    p.full_name,
    p.user_type,
    CASE 
        WHEN p.id IS NULL THEN '❌ SEM PERFIL'
        WHEN p.full_name IS NULL OR p.full_name = '' THEN '⚠️ PERFIL INCOMPLETO'
        ELSE '✅ PERFIL OK'
    END as status_perfil
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.created_at >= NOW() - INTERVAL '7 days'
ORDER BY u.created_at DESC;

-- =====================================================
-- PARTE 5: TESTE DE INSERÇÃO MANUAL (OPCIONAL)
-- =====================================================

-- DESCOMENTE PARA TESTAR INSERÇÃO MANUAL
/*
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'teste-manual@exemplo.com';
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
        created_at, 
        updated_at
    ) VALUES (
        test_user_id,
        test_email,
        'Teste Manual',
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

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Execute todas as queries em ordem
-- 2. Verifique os resultados de cada parte
-- 3. Se houver erros, identifique a causa
-- 4. Execute o teste manual se necessário
-- 5. Verifique os logs do Supabase Dashboard
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
-- 
-- 6. ❌ Problema no código JavaScript
--    ✅ Solução: Verificar logs do navegador e Supabase Dashboard
-- =====================================================
