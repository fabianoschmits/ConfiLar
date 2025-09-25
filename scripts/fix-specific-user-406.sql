-- =====================================================
-- CORRIGIR ERRO 406 PARA USUÁRIO ESPECÍFICO
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR SE O USUÁRIO EXISTE EM AUTH.USERS
-- =====================================================

SELECT 
    'VERIFICAÇÃO USUÁRIO EM AUTH.USERS' as info,
    id,
    email,
    raw_user_meta_data
FROM auth.users 
WHERE id = 'f58962f2-779e-42b4-8315-653b2e600398';

-- 2. VERIFICAR SE O USUÁRIO TEM PERFIL
-- =====================================================

SELECT 
    'VERIFICAÇÃO PERFIL' as info,
    id,
    email,
    full_name,
    user_type
FROM public.profiles 
WHERE id = 'f58962f2-779e-42b4-8315-653b2e600398';

-- 3. VERIFICAR SE O USUÁRIO TEM PREFERÊNCIAS
-- =====================================================

SELECT 
    'VERIFICAÇÃO PREFERÊNCIAS' as info,
    user_id,
    push_enabled,
    message_notifications
FROM public.notification_preferences 
WHERE user_id = 'f58962f2-779e-42b4-8315-653b2e600398';

-- 4. VERIFICAR COLUNAS DA TABELA PROFILES
-- =====================================================

SELECT 
    'COLUNAS DA TABELA PROFILES' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('professional_certifications', 'avatar_url', 'badge', 'rating', 'total_reviews', 'is_verified')
ORDER BY column_name;

-- 5. ADICIONAR COLUNAS FALTANTES (SE NÃO EXISTIREM)
-- =====================================================

-- Adicionar coluna professional_certifications se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'professional_certifications'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN professional_certifications TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Coluna professional_certifications adicionada';
    ELSE
        RAISE NOTICE 'Coluna professional_certifications já existe';
    END IF;
END $$;

-- Adicionar coluna avatar_url se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'avatar_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Coluna avatar_url adicionada';
    ELSE
        RAISE NOTICE 'Coluna avatar_url já existe';
    END IF;
END $$;

-- Adicionar coluna badge se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'badge'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN badge TEXT DEFAULT 'bronze';
        RAISE NOTICE 'Coluna badge adicionada';
    ELSE
        RAISE NOTICE 'Coluna badge já existe';
    END IF;
END $$;

-- Adicionar coluna rating se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'rating'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.0;
        RAISE NOTICE 'Coluna rating adicionada';
    ELSE
        RAISE NOTICE 'Coluna rating já existe';
    END IF;
END $$;

-- Adicionar coluna total_reviews se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'total_reviews'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN total_reviews INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna total_reviews adicionada';
    ELSE
        RAISE NOTICE 'Coluna total_reviews já existe';
    END IF;
END $$;

-- Adicionar coluna is_verified se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_verified'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
        RAISE NOTICE 'Coluna is_verified adicionada';
    ELSE
        RAISE NOTICE 'Coluna is_verified já existe';
    END IF;
END $$;

-- 6. CRIAR PERFIL PARA USUÁRIO ESPECÍFICO
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
WHERE u.id = 'f58962f2-779e-42b4-8315-653b2e600398'
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type,
    phone = EXCLUDED.phone,
    cpf_cnpj = EXCLUDED.cpf_cnpj,
    birth_date = EXCLUDED.birth_date,
    location_state = EXCLUDED.location_state,
    location_city = EXCLUDED.location_city,
    neighborhood = EXCLUDED.neighborhood,
    bio = EXCLUDED.bio,
    professional_services = EXCLUDED.professional_services,
    professional_experience_years = EXCLUDED.professional_experience_years,
    professional_certifications = EXCLUDED.professional_certifications,
    avatar_url = EXCLUDED.avatar_url,
    badge = EXCLUDED.badge,
    rating = EXCLUDED.rating,
    total_reviews = EXCLUDED.total_reviews,
    is_verified = EXCLUDED.is_verified,
    is_available = EXCLUDED.is_available,
    profile_completed = EXCLUDED.profile_completed,
    profile_completion_score = EXCLUDED.profile_completion_score,
    updated_at = NOW();

-- 7. CRIAR PREFERÊNCIAS PARA USUÁRIO ESPECÍFICO
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
VALUES (
    'f58962f2-779e-42b4-8315-653b2e600398',
    true,
    true,
    true,
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    push_enabled = EXCLUDED.push_enabled,
    message_notifications = EXCLUDED.message_notifications,
    review_notifications = EXCLUDED.review_notifications,
    booking_notifications = EXCLUDED.booking_notifications,
    achievement_notifications = EXCLUDED.achievement_notifications,
    updated_at = NOW();

-- 8. VERIFICAR SE PERFIL FOI CRIADO
-- =====================================================

SELECT 
    'VERIFICAÇÃO PERFIL CRIADO' as info,
    id,
    email,
    full_name,
    user_type,
    professional_certifications,
    avatar_url,
    badge,
    rating,
    total_reviews,
    is_verified
FROM public.profiles 
WHERE id = 'f58962f2-779e-42b4-8315-653b2e600398';

-- 9. VERIFICAR SE PREFERÊNCIAS FORAM CRIADAS
-- =====================================================

SELECT 
    'VERIFICAÇÃO PREFERÊNCIAS CRIADAS' as info,
    user_id,
    push_enabled,
    message_notifications,
    review_notifications,
    booking_notifications,
    achievement_notifications
FROM public.notification_preferences 
WHERE user_id = 'f58962f2-779e-42b4-8315-653b2e600398';

-- 10. TESTAR SELECT QUE ESTAVA CAUSANDO ERRO 406
-- =====================================================

-- Testar select que estava causando erro
SELECT 
    'TESTE SELECT APÓS CORREÇÃO' as info,
    'Testando select das colunas que estavam causando erro 406' as mensagem;

-- Este select deve funcionar agora
SELECT 
    id,
    full_name,
    user_type,
    avatar_url,
    bio,
    location_state,
    location_city,
    neighborhood,
    professional_services,
    professional_experience_years,
    professional_certifications,
    badge,
    rating,
    total_reviews,
    is_verified,
    is_available,
    created_at,
    phone,
    email
FROM public.profiles 
WHERE id = 'f58962f2-779e-42b4-8315-653b2e600398';

-- ✅ RESULTADO ESPERADO:
-- 1. Usuário verificado em auth.users
-- 2. Colunas faltantes adicionadas à tabela profiles
-- 3. Perfil criado para usuário específico
-- 4. Preferências criadas para usuário específico
-- 5. Select que causava erro 406 agora funciona
-- 6. Verificação final confirma que tudo foi criado

-- 🚨 PROBLEMA RESOLVIDO:
-- - Erro 406 causado por perfil inexistente
-- - Colunas faltantes adicionadas
-- - Perfil criado com todas as colunas necessárias
-- - Sistema funcionando corretamente

-- 📋 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Verifique se o perfil foi criado
-- 3. Teste o login do usuário
-- 4. Confirme que o erro 406 foi resolvido
