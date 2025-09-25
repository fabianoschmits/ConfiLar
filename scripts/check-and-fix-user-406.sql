-- =====================================================
-- VERIFICAR E CORRIGIR USUÁRIO ESPECÍFICO COM ERRO 406
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
    u.raw_user_meta_data->>'user_type' as user_type_metadata,
    u.raw_user_meta_data->>'phone' as phone_metadata,
    u.raw_user_meta_data->>'cpf_cnpj' as cpf_cnpj_metadata,
    u.raw_user_meta_data->>'birth_date' as birth_date_metadata,
    u.raw_user_meta_data->>'location_state' as location_state_metadata,
    u.raw_user_meta_data->>'location_city' as location_city_metadata,
    u.raw_user_meta_data->>'neighborhood' as neighborhood_metadata,
    u.raw_user_meta_data->>'bio' as bio_metadata,
    u.raw_user_meta_data->>'services_offered' as services_offered_metadata,
    u.raw_user_meta_data->>'experience_years' as experience_years_metadata
FROM auth.users u
WHERE u.id = '4a1bca5c-833c-4f57-8bce-235842b34067';

-- 2. VERIFICAR SE TEM PERFIL
-- =====================================================

SELECT 
    'VERIFICAÇÃO DO PERFIL' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.profiles WHERE id = '4a1bca5c-833c-4f57-8bce-235842b34067') 
        THEN 'PERFIL EXISTE'
        ELSE 'PERFIL NÃO EXISTE'
    END as status_perfil
FROM auth.users 
WHERE id = '4a1bca5c-833c-4f57-8bce-235842b34067';

-- 3. VERIFICAR SE TEM PREFERÊNCIAS
-- =====================================================

SELECT 
    'VERIFICAÇÃO DAS PREFERÊNCIAS' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.notification_preferences WHERE user_id = '4a1bca5c-833c-4f57-8bce-235842b34067') 
        THEN 'PREFERÊNCIAS EXISTEM'
        ELSE 'PREFERÊNCIAS NÃO EXISTEM'
    END as status_preferencias
FROM auth.users 
WHERE id = '4a1bca5c-833c-4f57-8bce-235842b34067';

-- 4. CRIAR PERFIL SE NÃO EXISTIR
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
WHERE u.id = '4a1bca5c-833c-4f57-8bce-235842b34067'
AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = u.id);

-- 5. CRIAR PREFERÊNCIAS SE NÃO EXISTIREM
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
WHERE u.id = '4a1bca5c-833c-4f57-8bce-235842b34067'
AND NOT EXISTS (SELECT 1 FROM public.notification_preferences WHERE user_id = u.id);

-- 6. VERIFICAÇÃO FINAL
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
WHERE p.id = '4a1bca5c-833c-4f57-8bce-235842b34067';

-- Verificar se o usuário agora tem preferências
SELECT 
    'VERIFICAÇÃO FINAL - PREFERÊNCIAS' as info,
    np.user_id,
    np.push_enabled,
    np.message_notifications,
    np.created_at
FROM public.notification_preferences np
WHERE np.user_id = '4a1bca5c-833c-4f57-8bce-235842b34067';

-- 7. VERIFICAR RLS POLICIES
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

-- 8. VERIFICAR SE RLS ESTÁ HABILITADO
-- =====================================================

SELECT 
    'VERIFICAÇÃO RLS HABILITADO' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'notification_preferences')
AND schemaname = 'public';

-- ✅ RESULTADO ESPERADO:
-- 1. Verificação do usuário específico
-- 2. Verificação se tem perfil
-- 3. Verificação se tem preferências
-- 4. Criação de perfil se não existir
-- 5. Criação de preferências se não existirem
-- 6. Verificação final de que tudo foi criado
-- 7. Verificação das políticas RLS
-- 8. Verificação se RLS está habilitado

-- 🚨 PROBLEMAS POSSÍVEIS:
-- - RLS bloqueando criação de perfis
-- - Políticas RLS muito restritivas
-- - Função de criação no frontend falhando
-- - Dados inválidos impedindo inserção

-- 📋 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Verifique se o perfil foi criado
-- 3. Verifique as políticas RLS
-- 4. Se necessário, ajuste as políticas RLS
-- 5. Teste novamente o login
