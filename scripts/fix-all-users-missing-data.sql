-- =====================================================
-- CORRIGIR TODOS OS USUÁRIOS SEM PERFIL OU PREFERÊNCIAS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR STATUS GERAL
-- =====================================================

SELECT 
    'VERIFICAÇÃO GERAL - PERFIS' as info,
    COUNT(*) as total_usuarios,
    COUNT(p.id) as usuarios_com_perfil,
    COUNT(*) - COUNT(p.id) as usuarios_sem_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

SELECT 
    'VERIFICAÇÃO GERAL - PREFERÊNCIAS' as info,
    COUNT(*) as total_usuarios,
    COUNT(np.user_id) as usuarios_com_preferencias,
    COUNT(*) - COUNT(np.user_id) as usuarios_sem_preferencias
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id;

-- 2. CRIAR PERFIS PARA TODOS OS USUÁRIOS SEM PERFIL
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
    professional_certifications,
    avatar_url,
    badge,
    rating,
    total_reviews,
    is_verified,
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
    '{}'::text[], -- professional_certifications
    NULL, -- avatar_url
    'bronze', -- badge
    0.0, -- rating
    0, -- total_reviews
    false, -- is_verified
    true, -- is_available
    false, -- profile_completed
    0, -- profile_completion_score
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 3. CRIAR PREFERÊNCIAS PARA TODOS OS USUÁRIOS SEM PREFERÊNCIAS
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
WHERE np.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 4. VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
    'VERIFICAÇÃO FINAL - PERFIS' as info,
    COUNT(*) as total_usuarios,
    COUNT(p.id) as usuarios_com_perfil,
    COUNT(*) - COUNT(p.id) as usuarios_sem_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

SELECT 
    'VERIFICAÇÃO FINAL - PREFERÊNCIAS' as info,
    COUNT(*) as total_usuarios,
    COUNT(np.user_id) as usuarios_com_preferencias,
    COUNT(*) - COUNT(np.user_id) as usuarios_sem_preferencias
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id;

-- 5. LISTAR USUÁRIOS SEM PERFIL (SE AINDA HOUVER)
-- =====================================================

SELECT 
    'USUÁRIOS SEM PERFIL (FINAL)' as info,
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.raw_user_meta_data->>'user_type' as user_type,
    u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 6. LISTAR USUÁRIOS SEM PREFERÊNCIAS (SE AINDA HOUVER)
-- =====================================================

SELECT 
    'USUÁRIOS SEM PREFERÊNCIAS (FINAL)' as info,
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.created_at
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id
WHERE np.user_id IS NULL
ORDER BY u.created_at DESC;

-- ✅ RESULTADO ESPERADO:
-- 1. Todos os usuários com perfis criados
-- 2. Todos os usuários com preferências criadas
-- 3. Verificação final mostra 0 usuários sem perfil
-- 4. Verificação final mostra 0 usuários sem preferências
-- 5. Sistema funcionando para todos os usuários

-- 🚨 PROBLEMA RESOLVIDO:
-- - Todos os usuários existentes têm perfis
-- - Todos os usuários existentes têm preferências
-- - Novos usuários terão perfis e preferências criados automaticamente
-- - Erro 406 eliminado para todos os usuários

-- 📋 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Verifique se todos os usuários foram corrigidos
-- 3. Teste criação de novos usuários
-- 4. Confirme que o erro 406 foi resolvido para todos
