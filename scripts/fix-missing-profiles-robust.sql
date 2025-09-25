-- =====================================================
-- CORRIGIR PERFIS FALTANTES - VERSÃO ROBUSTA
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR USUÁRIOS SEM PERFIL
-- =====================================================

SELECT 
    'USUÁRIOS SEM PERFIL' as problema,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'full_name' as full_name_metadata
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 2. CRIAR PERFIS FALTANTES COM TRATAMENTO ROBUSTO DE DADOS
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
        THEN 
            CASE 
                WHEN u.raw_user_meta_data->>'birth_date' ~ '^\d{4}-\d{2}-\d{2}$' 
                THEN (u.raw_user_meta_data->>'birth_date')::date 
                ELSE NULL 
            END
        ELSE NULL 
    END,
    COALESCE(u.raw_user_meta_data->>'location_state', ''),
    COALESCE(u.raw_user_meta_data->>'location_city', ''),
    COALESCE(u.raw_user_meta_data->>'neighborhood', ''),
    COALESCE(u.raw_user_meta_data->>'bio', ''),
    CASE 
        WHEN u.raw_user_meta_data->>'services_offered' IS NOT NULL 
        THEN 
            CASE 
                WHEN u.raw_user_meta_data->>'services_offered' = '[]' 
                THEN '{}'::text[]
                WHEN u.raw_user_meta_data->>'services_offered' ~ '^\[.*\]$' 
                THEN 
                    CASE 
                        WHEN u.raw_user_meta_data->>'services_offered' = '[]' 
                        THEN '{}'::text[]
                        ELSE 
                            ARRAY(
                                SELECT jsonb_array_elements_text(
                                    (u.raw_user_meta_data->>'services_offered')::jsonb
                                )
                            )
                    END
                ELSE '{}'::text[]
            END
        ELSE '{}'::text[]
    END,
    CASE 
        WHEN u.raw_user_meta_data->>'experience_years' IS NOT NULL 
        THEN 
            CASE 
                WHEN u.raw_user_meta_data->>'experience_years' ~ '^\d+$' 
                THEN (u.raw_user_meta_data->>'experience_years')::integer
                WHEN u.raw_user_meta_data->>'experience_years' ~ '^\d+-\d+$' 
                THEN SPLIT_PART(u.raw_user_meta_data->>'experience_years', '-', 1)::integer
                WHEN u.raw_user_meta_data->>'experience_years' ~ '^\d+\+$' 
                THEN REGEXP_REPLACE(u.raw_user_meta_data->>'experience_years', '\+', '')::integer
                ELSE 0
            END
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

-- 3. VERIFICAR USUÁRIOS SEM PREFERÊNCIAS
-- =====================================================

SELECT 
    'USUÁRIOS SEM PREFERÊNCIAS' as problema,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'full_name' as full_name_metadata
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id
WHERE np.user_id IS NULL
ORDER BY u.created_at DESC;

-- 4. CRIAR PREFERÊNCIAS FALTANTES
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

-- 5. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todos os usuários agora têm perfil
SELECT 
    'VERIFICAÇÃO FINAL - PERFIS' as info,
    COUNT(*) as total_usuarios,
    COUNT(p.id) as usuarios_com_perfil,
    COUNT(*) - COUNT(p.id) as usuarios_sem_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- Verificar se todos os usuários agora têm preferências
SELECT 
    'VERIFICAÇÃO FINAL - PREFERÊNCIAS' as info,
    COUNT(*) as total_usuarios,
    COUNT(np.user_id) as usuarios_com_preferencias,
    COUNT(*) - COUNT(np.user_id) as usuarios_sem_preferencias
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id;

-- 6. MOSTRAR DADOS DOS USUÁRIOS RECENTES
-- =====================================================

SELECT 
    'DADOS DOS USUÁRIOS RECENTES' as info,
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
ORDER BY u.created_at DESC
LIMIT 10;

-- 7. MOSTRAR PERFIS CRIADOS
-- =====================================================

SELECT 
    'PERFIS CRIADOS' as info,
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
    p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 10;

-- 8. VERIFICAR DADOS PROBLEMÁTICOS
-- =====================================================

SELECT 
    'DADOS PROBLEMÁTICOS ENCONTRADOS' as info,
    u.id,
    u.email,
    u.raw_user_meta_data->>'experience_years' as experience_years_original,
    u.raw_user_meta_data->>'birth_date' as birth_date_original,
    u.raw_user_meta_data->>'services_offered' as services_offered_original
FROM auth.users u
WHERE 
    (u.raw_user_meta_data->>'experience_years' IS NOT NULL 
     AND u.raw_user_meta_data->>'experience_years' !~ '^\d+$'
     AND u.raw_user_meta_data->>'experience_years' != '')
    OR 
    (u.raw_user_meta_data->>'birth_date' IS NOT NULL 
     AND u.raw_user_meta_data->>'birth_date' !~ '^\d{4}-\d{2}-\d{2}$'
     AND u.raw_user_meta_data->>'birth_date' != '')
    OR
    (u.raw_user_meta_data->>'services_offered' IS NOT NULL 
     AND u.raw_user_meta_data->>'services_offered' !~ '^\[.*\]$'
     AND u.raw_user_meta_data->>'services_offered' != '[]'
     AND u.raw_user_meta_data->>'services_offered' != '');

-- ✅ RESULTADO ESPERADO:
-- 1. Identificação de usuários sem perfil
-- 2. Criação automática de perfis faltantes com tratamento robusto de dados
-- 3. Identificação de usuários sem preferências
-- 4. Criação automática de preferências faltantes
-- 5. Verificação final de que todos têm dados
-- 6. Mostra dados dos usuários recentes
-- 7. Mostra perfis criados
-- 8. Identifica dados problemáticos para análise

-- 🚨 PROBLEMAS IDENTIFICADOS:
-- - Se usuários sem perfil: função handle_new_user não funcionou
-- - Se usuários sem preferências: trigger não funcionou
-- - Se dados não salvos: problema no mapeamento
-- - Se dados problemáticos: formato incorreto nos metadados

-- 📋 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Verifique se os perfis foram criados
-- 3. Teste o acesso aos dados
-- 4. Confirme se o erro 406 foi resolvido
-- 5. Analise dados problemáticos se houver
