-- =====================================================
-- VERIFICAR DADOS DE CADASTRO NO BANCO (CORRIGIDO)
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA PROFILES
-- =====================================================

SELECT 
    'ESTRUTURA DA TABELA PROFILES' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR ESTRUTURA DA TABELA NOTIFICATION_PREFERENCES
-- =====================================================

SELECT 
    'ESTRUTURA DA TABELA NOTIFICATION_PREFERENCES' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notification_preferences' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR USUÁRIOS RECENTES CRIADOS
-- =====================================================

SELECT 
    'USUÁRIOS RECENTES (ÚLTIMOS 10)' as info,
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. VERIFICAR PERFIS RECENTES CRIADOS
-- =====================================================

SELECT 
    'PERFIS RECENTES (ÚLTIMOS 10)' as info,
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
    avatar_url,
    created_at,
    updated_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. VERIFICAR PREFERÊNCIAS DE NOTIFICAÇÃO RECENTES
-- =====================================================

SELECT 
    'PREFERÊNCIAS DE NOTIFICAÇÃO RECENTES' as info,
    id,
    user_id,
    push_enabled,
    message_notifications,
    review_notifications,
    booking_notifications,
    achievement_notifications,
    marketing_notifications,
    created_at
FROM public.notification_preferences 
ORDER BY created_at DESC 
LIMIT 10;

-- 6. VERIFICAR SE HÁ USUÁRIOS SEM PERFIL
-- =====================================================

SELECT 
    'USUÁRIOS SEM PERFIL' as problema,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 7. VERIFICAR SE HÁ PERFIS SEM USUÁRIO
-- =====================================================

SELECT 
    'PERFIS SEM USUÁRIO' as problema,
    p.id,
    p.email,
    p.full_name,
    p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL
ORDER BY p.created_at DESC;

-- 8. VERIFICAR SE HÁ USUÁRIOS SEM PREFERÊNCIAS
-- =====================================================

SELECT 
    'USUÁRIOS SEM PREFERÊNCIAS DE NOTIFICAÇÃO' as problema,
    u.id,
    u.email,
    u.created_at
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id
WHERE np.user_id IS NULL
ORDER BY u.created_at DESC;

-- 9. VERIFICAR DADOS ESPECÍFICOS DE UM USUÁRIO RECENTE
-- =====================================================

-- Pegar o usuário mais recente
WITH recent_user AS (
    SELECT id, email, created_at, raw_user_meta_data
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1
)
SELECT 
    'DADOS COMPLETOS DO USUÁRIO MAIS RECENTE' as info,
    ru.id as user_id,
    ru.email as user_email,
    ru.created_at as user_created_at,
    ru.raw_user_meta_data as user_metadata,
    p.full_name,
    p.user_type,
    p.phone,
    p.cpf_cnpj,
    p.birth_date,
    p.location_state,
    p.location_city,
    p.neighborhood,
    p.bio,
    p.professional_services,
    p.professional_experience_years,
    p.avatar_url,
    p.created_at as profile_created_at,
    p.updated_at as profile_updated_at,
    np.push_enabled,
    np.message_notifications,
    np.review_notifications,
    np.booking_notifications,
    np.achievement_notifications,
    np.marketing_notifications,
    np.created_at as preferences_created_at
FROM recent_user ru
LEFT JOIN public.profiles p ON ru.id = p.id
LEFT JOIN public.notification_preferences np ON ru.id = np.user_id;

-- 10. VERIFICAR SE A FUNÇÃO HANDLE_NEW_USER EXISTE
-- =====================================================

SELECT 
    'FUNÇÃO HANDLE_NEW_USER' as info,
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 11. VERIFICAR SE O TRIGGER EXISTE
-- =====================================================

SELECT 
    'TRIGGER ON_AUTH_USER_CREATED' as info,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 12. VERIFICAR POLÍTICAS RLS ATIVAS
-- =====================================================

SELECT 
    'POLÍTICAS RLS ATIVAS' as info,
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'notification_preferences')
ORDER BY tablename, policyname;

-- 13. VERIFICAR SE RLS ESTÁ HABILITADO
-- =====================================================

SELECT 
    'STATUS RLS' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'notification_preferences', 'notifications')
ORDER BY tablename;

-- 14. CONTAR REGISTROS EM CADA TABELA
-- =====================================================

SELECT 
    'CONTAGEM DE REGISTROS' as info,
    'auth.users' as tabela,
    COUNT(*) as total
FROM auth.users
UNION ALL
SELECT 
    'CONTAGEM DE REGISTROS' as info,
    'public.profiles' as tabela,
    COUNT(*) as total
FROM public.profiles
UNION ALL
SELECT 
    'CONTAGEM DE REGISTROS' as info,
    'public.notification_preferences' as tabela,
    COUNT(*) as total
FROM public.notification_preferences
UNION ALL
SELECT 
    'CONTAGEM DE REGISTROS' as info,
    'public.notifications' as tabela,
    COUNT(*) as total
FROM public.notifications;

-- 15. VERIFICAR DADOS DE CADASTRO ESPECÍFICOS
-- =====================================================

-- Verificar se os campos específicos do cadastro estão sendo salvos
SELECT 
    'VERIFICAÇÃO DE CAMPOS ESPECÍFICOS' as info,
    COUNT(*) as total_profiles,
    COUNT(phone) as profiles_with_phone,
    COUNT(cpf_cnpj) as profiles_with_cpf_cnpj,
    COUNT(birth_date) as profiles_with_birth_date,
    COUNT(location_state) as profiles_with_location_state,
    COUNT(location_city) as profiles_with_location_city,
    COUNT(neighborhood) as profiles_with_neighborhood,
    COUNT(bio) as profiles_with_bio,
    COUNT(professional_services) as profiles_with_services,
    COUNT(professional_experience_years) as profiles_with_experience,
    COUNT(avatar_url) as profiles_with_avatar
FROM public.profiles;

-- 16. VERIFICAR DADOS DE METADATA DOS USUÁRIOS
-- =====================================================

SELECT 
    'METADATA DOS USUÁRIOS' as info,
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name_metadata,
    raw_user_meta_data->>'user_type' as user_type_metadata,
    raw_user_meta_data
FROM auth.users 
WHERE raw_user_meta_data IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- ✅ RESULTADO ESPERADO:
-- 1. Estrutura das tabelas profiles e notification_preferences
-- 2. Usuários recentes criados
-- 3. Perfis recentes criados
-- 4. Preferências de notificação criadas
-- 5. Identificação de dados faltantes
-- 6. Verificação de função e trigger
-- 7. Status das políticas RLS
-- 8. Contagem de registros
-- 9. Verificação de campos específicos
-- 10. Metadata dos usuários

-- 🚨 AÇÕES BASEADAS NOS RESULTADOS:
-- - Se usuários sem perfil: problema na função handle_new_user
-- - Se perfis sem dados: problema na atualização do perfil
-- - Se RLS habilitado: pode estar causando erro 406
-- - Se função/trigger ausente: criar manualmente
-- - Se campos vazios: problema no mapeamento de dados
