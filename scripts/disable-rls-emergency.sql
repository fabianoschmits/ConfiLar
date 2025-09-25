-- =====================================================
-- DESABILITAR RLS TEMPORARIAMENTE - SOLUÇÃO DE EMERGÊNCIA
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. DESABILITAR RLS NAS TABELAS PRINCIPAIS
-- =====================================================

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAR STATUS DO RLS
-- =====================================================

SELECT 
    'STATUS DO RLS' as info,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename IN ('profiles', 'notification_preferences', 'notifications')
AND schemaname = 'public';

-- 3. CRIAR PERFIL PARA USUÁRIO ESPECÍFICO (SE NÃO EXISTIR)
-- =====================================================

-- Verificar se o usuário específico tem perfil
SELECT 
    'VERIFICAÇÃO DO USUÁRIO ESPECÍFICO' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.profiles WHERE id = 'e76226f6-e49c-44c8-9191-042a1cec339d') 
        THEN 'PERFIL EXISTE'
        ELSE 'PERFIL NÃO EXISTE'
    END as status_perfil
FROM auth.users 
WHERE id = 'e76226f6-e49c-44c8-9191-042a1cec339d';

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
    CASE 
        WHEN u.raw_user_meta_data->>'user_type' = 'professional' THEN 'professional'::user_type
        ELSE 'client'::user_type
    END,
    COALESCE(u.raw_user_meta_data->>'phone', ''),
    COALESCE(u.raw_user_meta_data->>'cpf_cnpj', ''),
    CASE 
        WHEN u.raw_user_meta_data->>'birth_date' IS NOT NULL 
        AND u.raw_user_meta_data->>'birth_date' ~ '^\d{4}-\d{2}-\d{2}$' 
        THEN (u.raw_user_meta_data->>'birth_date')::date 
        ELSE NULL 
    END,
    COALESCE(u.raw_user_meta_data->>'location_state', ''),
    COALESCE(u.raw_user_meta_data->>'location_city', ''),
    COALESCE(u.raw_user_meta_data->>'neighborhood', ''),
    COALESCE(u.raw_user_meta_data->>'bio', ''),
    CASE 
        WHEN u.raw_user_meta_data->>'services_offered' IS NOT NULL 
        AND u.raw_user_meta_data->>'services_offered' != '[]'
        AND u.raw_user_meta_data->>'services_offered' ~ '^\[.*\]$' 
        THEN 
            ARRAY(
                SELECT jsonb_array_elements_text(
                    (u.raw_user_meta_data->>'services_offered')::jsonb
                )
            )
        ELSE '{}'::text[]
    END,
    CASE 
        WHEN u.raw_user_meta_data->>'experience_years' IS NOT NULL 
        AND u.raw_user_meta_data->>'experience_years' ~ '^\d+$' 
        THEN (u.raw_user_meta_data->>'experience_years')::integer
        WHEN u.raw_user_meta_data->>'experience_years' IS NOT NULL 
        AND u.raw_user_meta_data->>'experience_years' ~ '^\d+-\d+$' 
        THEN SPLIT_PART(u.raw_user_meta_data->>'experience_years', '-', 1)::integer
        WHEN u.raw_user_meta_data->>'experience_years' IS NOT NULL 
        AND u.raw_user_meta_data->>'experience_years' ~ '^\d+\+$' 
        THEN REGEXP_REPLACE(u.raw_user_meta_data->>'experience_years', '\+', '')::integer
        ELSE 0
    END,
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
WHERE u.id = 'e76226f6-e49c-44c8-9191-042a1cec339d'
AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = u.id);

-- 4. CRIAR PREFERÊNCIAS PARA USUÁRIO ESPECÍFICO (SE NÃO EXISTIR)
-- =====================================================

-- Verificar se o usuário específico tem preferências
SELECT 
    'VERIFICAÇÃO DAS PREFERÊNCIAS' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.notification_preferences WHERE user_id = 'e76226f6-e49c-44c8-9191-042a1cec339d') 
        THEN 'PREFERÊNCIAS EXISTEM'
        ELSE 'PREFERÊNCIAS NÃO EXISTEM'
    END as status_preferencias
FROM auth.users 
WHERE id = 'e76226f6-e49c-44c8-9191-042a1cec339d';

-- Criar preferências se não existirem
INSERT INTO public.notification_preferences (
    user_id,
    push_enabled,
    message_notifications,
    review_notifications,
    booking_notifications,
    achievement_notifications,
    created_at,
    updated_at
)
SELECT 
    u.id,
    true,
    true,
    true,
    true,
    true,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.id = 'e76226f6-e49c-44c8-9191-042a1cec339d'
AND NOT EXISTS (SELECT 1 FROM public.notification_preferences WHERE user_id = u.id);

-- 5. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se o usuário agora tem perfil
SELECT 
    'VERIFICAÇÃO FINAL - PERFIL' as info,
    p.id,
    p.email,
    p.full_name,
    p.user_type,
    p.created_at
FROM public.profiles p
WHERE p.id = 'e76226f6-e49c-44c8-9191-042a1cec339d';

-- Verificar se o usuário agora tem preferências
SELECT 
    'VERIFICAÇÃO FINAL - PREFERÊNCIAS' as info,
    np.user_id,
    np.push_enabled,
    np.message_notifications,
    np.created_at
FROM public.notification_preferences np
WHERE np.user_id = 'e76226f6-e49c-44c8-9191-042a1cec339d';

-- 6. CRIAR PERFIS PARA TODOS OS USUÁRIOS SEM PERFIL
-- =====================================================

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
    CASE 
        WHEN u.raw_user_meta_data->>'user_type' = 'professional' THEN 'professional'::user_type
        ELSE 'client'::user_type
    END,
    COALESCE(u.raw_user_meta_data->>'phone', ''),
    COALESCE(u.raw_user_meta_data->>'cpf_cnpj', ''),
    CASE 
        WHEN u.raw_user_meta_data->>'birth_date' IS NOT NULL 
        AND u.raw_user_meta_data->>'birth_date' ~ '^\d{4}-\d{2}-\d{2}$' 
        THEN (u.raw_user_meta_data->>'birth_date')::date 
        ELSE NULL 
    END,
    COALESCE(u.raw_user_meta_data->>'location_state', ''),
    COALESCE(u.raw_user_meta_data->>'location_city', ''),
    COALESCE(u.raw_user_meta_data->>'neighborhood', ''),
    COALESCE(u.raw_user_meta_data->>'bio', ''),
    CASE 
        WHEN u.raw_user_meta_data->>'services_offered' IS NOT NULL 
        AND u.raw_user_meta_data->>'services_offered' != '[]'
        AND u.raw_user_meta_data->>'services_offered' ~ '^\[.*\]$' 
        THEN 
            ARRAY(
                SELECT jsonb_array_elements_text(
                    (u.raw_user_meta_data->>'services_offered')::jsonb
                )
            )
        ELSE '{}'::text[]
    END,
    CASE 
        WHEN u.raw_user_meta_data->>'experience_years' IS NOT NULL 
        AND u.raw_user_meta_data->>'experience_years' ~ '^\d+$' 
        THEN (u.raw_user_meta_data->>'experience_years')::integer
        WHEN u.raw_user_meta_data->>'experience_years' IS NOT NULL 
        AND u.raw_user_meta_data->>'experience_years' ~ '^\d+-\d+$' 
        THEN SPLIT_PART(u.raw_user_meta_data->>'experience_years', '-', 1)::integer
        WHEN u.raw_user_meta_data->>'experience_years' IS NOT NULL 
        AND u.raw_user_meta_data->>'experience_years' ~ '^\d+\+$' 
        THEN REGEXP_REPLACE(u.raw_user_meta_data->>'experience_years', '\+', '')::integer
        ELSE 0
    END,
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
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 7. CRIAR PREFERÊNCIAS PARA TODOS OS USUÁRIOS SEM PREFERÊNCIAS
-- =====================================================

INSERT INTO public.notification_preferences (
    user_id,
    push_enabled,
    message_notifications,
    review_notifications,
    booking_notifications,
    achievement_notifications,
    created_at,
    updated_at
)
SELECT 
    u.id,
    true,
    true,
    true,
    true,
    true,
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id
WHERE np.user_id IS NULL;

-- 8. VERIFICAÇÃO FINAL GERAL
-- =====================================================

SELECT 
    'VERIFICAÇÃO FINAL GERAL' as info,
    COUNT(*) as total_usuarios,
    COUNT(p.id) as usuarios_com_perfil,
    COUNT(*) - COUNT(p.id) as usuarios_sem_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

SELECT 
    'VERIFICAÇÃO FINAL PREFERÊNCIAS' as info,
    COUNT(*) as total_usuarios,
    COUNT(np.user_id) as usuarios_com_preferencias,
    COUNT(*) - COUNT(np.user_id) as usuarios_sem_preferencias
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id;

-- ✅ RESULTADO ESPERADO:
-- 1. RLS desabilitado nas tabelas principais
-- 2. Perfil criado para usuário específico
-- 3. Preferências criadas para usuário específico
-- 4. Perfis criados para todos os usuários sem perfil
-- 5. Preferências criadas para todos os usuários sem preferências
-- 6. Verificação final de que todos têm dados

-- 🚨 ATENÇÃO:
-- Este script desabilita RLS temporariamente
-- Execute apenas para resolver o problema imediatamente
-- Depois reabilite RLS e corrija as políticas

-- 📋 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Teste o login do usuário específico
-- 3. Confirme que o erro 406 foi resolvido
-- 4. Reabilite RLS e corrija as políticas
