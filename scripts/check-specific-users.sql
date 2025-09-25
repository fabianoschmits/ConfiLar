-- =====================================================
-- VERIFICAR USUÁRIOS ESPECÍFICOS COM PROBLEMA
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- IDs dos usuários com problema
-- 62b67cbc-d630-4076-9a42-df230a7d61ee
-- a93b8b75-10b1-45fe-8e8e-e3046ef64489
-- e03962cf-b1cc-47b5-a2e0-df0023a39964
-- a04d20a7-2ab8-47f7-8c54-3f8171f44bf2
-- 04debf7c-0413-4e4a-896c-48ea3f777009

-- 1. VERIFICAR USUÁRIO ESPECÍFICO COM ERRO 406
-- =====================================================

SELECT 
    'USUÁRIO COM ERRO 406' as info,
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    u.raw_user_meta_data
FROM auth.users u
WHERE u.id = 'a93b8b75-10b1-45fe-8e8e-e3046ef64489';

-- 2. VERIFICAR SE O PERFIL EXISTE
-- =====================================================

SELECT 
    'PERFIL DO USUÁRIO COM ERRO 406' as info,
    p.id,
    p.email,
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
    p.created_at,
    p.updated_at
FROM public.profiles p
WHERE p.id = 'a93b8b75-10b1-45fe-8e8e-e3046ef64489';

-- 3. VERIFICAR PREFERÊNCIAS DE NOTIFICAÇÃO
-- =====================================================

SELECT 
    'PREFERÊNCIAS DO USUÁRIO COM ERRO 406' as info,
    np.id,
    np.user_id,
    np.push_enabled,
    np.message_notifications,
    np.review_notifications,
    np.booking_notifications,
    np.achievement_notifications,
    np.created_at
FROM public.notification_preferences np
WHERE np.user_id = 'a93b8b75-10b1-45fe-8e8e-e3046ef64489';

-- 4. VERIFICAR TODOS OS USUÁRIOS RECENTES
-- =====================================================

SELECT 
    'TODOS OS USUÁRIOS RECENTES' as info,
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
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
WHERE u.id IN (
    '62b67cbc-d630-4076-9a42-df230a7d61ee',
    'a93b8b75-10b1-45fe-8e8e-e3046ef64489',
    'e03962cf-b1cc-47b5-a2e0-df0023a39964',
    'a04d20a7-2ab8-47f7-8c54-3f8171f44bf2',
    '04debf7c-0413-4e4a-896c-48ea3f777009'
)
ORDER BY u.created_at DESC;

-- 5. VERIFICAR PERFIS CORRESPONDENTES
-- =====================================================

SELECT 
    'PERFIS CORRESPONDENTES' as info,
    p.id,
    p.email,
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
    p.created_at,
    p.updated_at
FROM public.profiles p
WHERE p.id IN (
    '62b67cbc-d630-4076-9a42-df230a7d61ee',
    'a93b8b75-10b1-45fe-8e8e-e3046ef64489',
    'e03962cf-b1cc-47b5-a2e0-df0023a39964',
    'a04d20a7-2ab8-47f7-8c54-3f8171f44bf2',
    '04debf7c-0413-4e4a-896c-48ea3f777009'
)
ORDER BY p.created_at DESC;

-- 6. VERIFICAR PREFERÊNCIAS CORRESPONDENTES
-- =====================================================

SELECT 
    'PREFERÊNCIAS CORRESPONDENTES' as info,
    np.id,
    np.user_id,
    np.push_enabled,
    np.message_notifications,
    np.review_notifications,
    np.booking_notifications,
    np.achievement_notifications,
    np.created_at
FROM public.notification_preferences np
WHERE np.user_id IN (
    '62b67cbc-d630-4076-9a42-df230a7d61ee',
    'a93b8b75-10b1-45fe-8e8e-e3046ef64489',
    'e03962cf-b1cc-47b5-a2e0-df0023a39964',
    'a04d20a7-2ab8-47f7-8c54-3f8171f44bf2',
    '04debf7c-0413-4e4a-896c-48ea3f777009'
)
ORDER BY np.created_at DESC;

-- 7. VERIFICAR SE HÁ USUÁRIOS SEM PERFIL
-- =====================================================

SELECT 
    'USUÁRIOS SEM PERFIL' as problema,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'full_name' as full_name_metadata
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.id IN (
    '62b67cbc-d630-4076-9a42-df230a7d61ee',
    'a93b8b75-10b1-45fe-8e8e-e3046ef64489',
    'e03962cf-b1cc-47b5-a2e0-df0023a39964',
    'a04d20a7-2ab8-47f7-8c54-3f8171f44bf2',
    '04debf7c-0413-4e4a-896c-48ea3f777009'
)
AND p.id IS NULL;

-- 8. VERIFICAR SE HÁ USUÁRIOS SEM PREFERÊNCIAS
-- =====================================================

SELECT 
    'USUÁRIOS SEM PREFERÊNCIAS' as problema,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'full_name' as full_name_metadata
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id
WHERE u.id IN (
    '62b67cbc-d630-4076-9a42-df230a7d61ee',
    'a93b8b75-10b1-45fe-8e8e-e3046ef64489',
    'e03962cf-b1cc-47b5-a2e0-df0023a39964',
    'a04d20a7-2ab8-47f7-8c54-3f8171f44bf2',
    '04debf7c-0413-4e4a-896c-48ea3f777009'
)
AND np.user_id IS NULL;

-- 9. CRIAR PERFIS FALTANTES
-- =====================================================

-- Criar perfil para usuário que não tem
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
    COALESCE(u.raw_user_meta_data->>'user_type', 'client')::user_type,
    COALESCE(u.raw_user_meta_data->>'phone', ''),
    COALESCE(u.raw_user_meta_data->>'cpf_cnpj', ''),
    CASE 
        WHEN u.raw_user_meta_data->>'birth_date' IS NOT NULL 
        THEN (u.raw_user_meta_data->>'birth_date')::date 
        ELSE NULL 
    END,
    COALESCE(u.raw_user_meta_data->>'location_state', ''),
    COALESCE(u.raw_user_meta_data->>'location_city', ''),
    COALESCE(u.raw_user_meta_data->>'neighborhood', ''),
    COALESCE(u.raw_user_meta_data->>'bio', ''),
    CASE 
        WHEN u.raw_user_meta_data->>'services_offered' IS NOT NULL 
        THEN (u.raw_user_meta_data->>'services_offered')::text[]
        ELSE '{}'::text[]
    END,
    CASE 
        WHEN u.raw_user_meta_data->>'experience_years' IS NOT NULL 
        THEN (u.raw_user_meta_data->>'experience_years')::integer 
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
WHERE u.id IN (
    '62b67cbc-d630-4076-9a42-df230a7d61ee',
    'a93b8b75-10b1-45fe-8e8e-e3046ef64489',
    'e03962cf-b1cc-47b5-a2e0-df0023a39964',
    'a04d20a7-2ab8-47f7-8c54-3f8171f44bf2',
    '04debf7c-0413-4e4a-896c-48ea3f777009'
)
AND p.id IS NULL;

-- 10. CRIAR PREFERÊNCIAS FALTANTES
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
WHERE u.id IN (
    '62b67cbc-d630-4076-9a42-df230a7d61ee',
    'a93b8b75-10b1-45fe-8e8e-e3046ef64489',
    'e03962cf-b1cc-47b5-a2e0-df0023a39964',
    'a04d20a7-2ab8-47f7-8c54-3f8171f44bf2',
    '04debf7c-0413-4e4a-896c-48ea3f777009'
)
AND np.user_id IS NULL;

-- 11. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todos os usuários agora têm perfil
SELECT 
    'VERIFICAÇÃO FINAL - PERFIS' as info,
    COUNT(*) as total_usuarios,
    COUNT(p.id) as usuarios_com_perfil,
    COUNT(*) - COUNT(p.id) as usuarios_sem_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.id IN (
    '62b67cbc-d630-4076-9a42-df230a7d61ee',
    'a93b8b75-10b1-45fe-8e8e-e3046ef64489',
    'e03962cf-b1cc-47b5-a2e0-df0023a39964',
    'a04d20a7-2ab8-47f7-8c54-3f8171f44bf2',
    '04debf7c-0413-4e4a-896c-48ea3f777009'
);

-- Verificar se todos os usuários agora têm preferências
SELECT 
    'VERIFICAÇÃO FINAL - PREFERÊNCIAS' as info,
    COUNT(*) as total_usuarios,
    COUNT(np.user_id) as usuarios_com_preferencias,
    COUNT(*) - COUNT(np.user_id) as usuarios_sem_preferencias
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id
WHERE u.id IN (
    '62b67cbc-d630-4076-9a42-df230a7d61ee',
    'a93b8b75-10b1-45fe-8e8e-e3046ef64489',
    'e03962cf-b1cc-47b5-a2e0-df0023a39964',
    'a04d20a7-2ab8-47f7-8c54-3f8171f44bf2',
    '04debf7c-0413-4e4a-896c-48ea3f777009'
);

-- ✅ RESULTADO ESPERADO:
-- 1. Identificação de usuários sem perfil
-- 2. Identificação de usuários sem preferências
-- 3. Criação automática de perfis faltantes
-- 4. Criação automática de preferências faltantes
-- 5. Verificação final de que todos têm dados

-- 🚨 PROBLEMAS IDENTIFICADOS:
-- - Se usuários sem perfil: função handle_new_user não funcionou
-- - Se usuários sem preferências: trigger não funcionou
-- - Se dados não salvos: problema no mapeamento

-- 📋 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Verifique se os perfis foram criados
-- 3. Teste o acesso aos dados
-- 4. Confirme se o erro 406 foi resolvido
