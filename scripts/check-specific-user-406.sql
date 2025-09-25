-- =====================================================
-- VERIFICAR USUÁRIO ESPECÍFICO COM ERRO 406
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR USUÁRIO ESPECÍFICO
-- =====================================================

SELECT 
    'VERIFICAÇÃO DO USUÁRIO ESPECÍFICO' as info,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'full_name' as full_name_metadata,
    u.raw_user_meta_data->>'user_type' as user_type_metadata
FROM auth.users u
WHERE u.id = 'e76226f6-e49c-44c8-9191-042a1cec339d';

-- 2. VERIFICAR SE TEM PERFIL
-- =====================================================

SELECT 
    'VERIFICAÇÃO DO PERFIL' as info,
    p.id,
    p.email,
    p.full_name,
    p.user_type,
    p.created_at
FROM public.profiles p
WHERE p.id = 'e76226f6-e49c-44c8-9191-042a1cec339d';

-- 3. VERIFICAR SE TEM PREFERÊNCIAS
-- =====================================================

SELECT 
    'VERIFICAÇÃO DAS PREFERÊNCIAS' as info,
    np.user_id,
    np.push_enabled,
    np.message_notifications,
    np.created_at
FROM public.notification_preferences np
WHERE np.user_id = 'e76226f6-e49c-44c8-9191-042a1cec339d';

-- 4. VERIFICAR RLS POLICIES
-- =====================================================

SELECT 
    'VERIFICAÇÃO DAS POLÍTICAS RLS - PROFILES' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

SELECT 
    'VERIFICAÇÃO DAS POLÍTICAS RLS - NOTIFICATION_PREFERENCES' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'notification_preferences' 
AND schemaname = 'public';

-- 5. VERIFICAR SE RLS ESTÁ HABILITADO
-- =====================================================

SELECT 
    'VERIFICAÇÃO RLS HABILITADO' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'notification_preferences')
AND schemaname = 'public';

-- 6. TESTAR ACESSO DIRETO (SIMULAR O QUE O CLIENTE FAZ)
-- =====================================================

-- Testar se conseguimos acessar o perfil diretamente
SELECT 
    'TESTE DE ACESSO DIRETO - PERFIL' as info,
    COUNT(*) as total_perfis_encontrados
FROM public.profiles 
WHERE id = 'e76226f6-e49c-44c8-9191-042a1cec339d';

-- Testar se conseguimos acessar as preferências diretamente
SELECT 
    'TESTE DE ACESSO DIRETO - PREFERÊNCIAS' as info,
    COUNT(*) as total_preferencias_encontradas
FROM public.notification_preferences 
WHERE user_id = 'e76226f6-e49c-44c8-9191-042a1cec339d';

-- 7. VERIFICAR USUÁRIOS RECENTES SEM PERFIL
-- =====================================================

SELECT 
    'USUÁRIOS RECENTES SEM PERFIL' as info,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'full_name' as full_name_metadata
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- 8. VERIFICAR USUÁRIOS RECENTES SEM PREFERÊNCIAS
-- =====================================================

SELECT 
    'USUÁRIOS RECENTES SEM PREFERÊNCIAS' as info,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'full_name' as full_name_metadata
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id
WHERE np.user_id IS NULL
ORDER BY u.created_at DESC
LIMIT 10;
