-- =====================================================
-- VERIFICAR USUÁRIO ESPECÍFICO COM PROBLEMA
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- ID do usuário com problema
-- a93b8b75-10b1-45fe-8e8e-e3046ef64489

-- 1. VERIFICAR SE O USUÁRIO EXISTE NO AUTH.USERS
-- =====================================================

SELECT 
    'auth.users' as tabela,
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users 
WHERE id = 'a93b8b75-10b1-45fe-8e8e-e3046ef64489';

-- 2. VERIFICAR SE O PERFIL EXISTE
-- =====================================================

SELECT 
    'profiles' as tabela,
    id,
    email,
    full_name,
    user_type,
    created_at,
    updated_at
FROM public.profiles 
WHERE id = 'a93b8b75-10b1-45fe-8e8e-e3046ef64489';

-- 3. VERIFICAR PREFERÊNCIAS DE NOTIFICAÇÃO
-- =====================================================

SELECT 
    'notification_preferences' as tabela,
    id,
    user_id,
    push_enabled,
    email_enabled,
    created_at
FROM public.notification_preferences 
WHERE user_id = 'a93b8b75-10b1-45fe-8e8e-e3046ef64489';

-- 4. VERIFICAR NOTIFICAÇÕES
-- =====================================================

SELECT 
    'notifications' as tabela,
    id,
    user_id,
    title,
    message,
    is_read,
    created_at
FROM public.notifications 
WHERE user_id = 'a93b8b75-10b1-45fe-8e8e-e3046ef64489'
ORDER BY created_at DESC
LIMIT 5;

-- 5. VERIFICAR POLÍTICAS RLS ATIVAS
-- =====================================================

SELECT 
    'profiles' as tabela,
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
UNION ALL
SELECT 
    'notification_preferences' as tabela,
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notification_preferences';

-- 6. VERIFICAR SE RLS ESTÁ HABILITADO
-- =====================================================

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'notification_preferences', 'notifications')
ORDER BY tablename;

-- 7. TESTE DE ACESSO DIRETO (SIMULAR O QUE O CÓDIGO FAZ)
-- =====================================================

-- Simular a query que está falhando
SELECT 
    'Teste SELECT profiles' as teste,
    COUNT(*) as registros_encontrados
FROM public.profiles 
WHERE id = 'a93b8b75-10b1-45fe-8e8e-e3046ef64489';

-- Simular a query de notification_preferences
SELECT 
    'Teste SELECT notification_preferences' as teste,
    COUNT(*) as registros_encontrados
FROM public.notification_preferences 
WHERE user_id = 'a93b8b75-10b1-45fe-8e8e-e3046ef64489';

-- 8. VERIFICAR PERMISSÕES DA TABELA
-- =====================================================

SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles'
AND grantee IN ('authenticated', 'anon', 'public');

-- 9. VERIFICAR SE HÁ DADOS CORROMPIDOS
-- =====================================================

-- Verificar se há registros órfãos
SELECT 
    'Usuários sem perfil' as problema,
    COUNT(*) as quantidade
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Verificar se há perfis sem usuário
SELECT 
    'Perfis sem usuário' as problema,
    COUNT(*) as quantidade
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- 10. CRIAR DADOS FALTANTES SE NECESSÁRIO
-- =====================================================

-- Criar perfil se não existir
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    user_type,
    phone,
    cpf_cnpj,
    birth_date,
    location_state,
    location_city,
    neighborhood,
    bio,
    professional_services,
    professional_experience_years,
    is_verified,
    badge,
    rating,
    total_reviews,
    is_available,
    profile_completed,
    profile_completion_score,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(u.raw_user_meta_data->>'user_type', 'client')::text,
    COALESCE(u.raw_user_meta_data->>'phone', ''),
    '',
    NULL,
    'SP',
    'São Paulo',
    '',
    '',
    '{}',
    0,
    false,
    'bronze',
    0,
    0,
    true,
    false,
    0,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.id = 'a93b8b75-10b1-45fe-8e8e-e3046ef64489'
AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- Criar preferências se não existirem
INSERT INTO public.notification_preferences (
    user_id,
    push_enabled,
    email_enabled,
    message_notifications,
    review_notifications,
    booking_notifications,
    achievement_notifications,
    marketing_notifications,
    created_at,
    updated_at
)
SELECT 
    'a93b8b75-10b1-45fe-8e8e-e3046ef64489',
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.notification_preferences np 
    WHERE np.user_id = 'a93b8b75-10b1-45fe-8e8e-e3046ef64489'
);

-- ✅ RESULTADO ESPERADO:
-- 1. Identificação do problema específico do usuário
-- 2. Verificação de dados faltantes
-- 3. Criação automática de dados se necessário
-- 4. Diagnóstico completo do estado atual

-- 🚨 AÇÕES BASEADAS NOS RESULTADOS:
-- - Se o usuário não existe em auth.users: problema de autenticação
-- - Se o perfil não existe: executar criação de perfil
-- - Se RLS está habilitado: desabilitar temporariamente
-- - Se há políticas restritivas: ajustar ou remover
