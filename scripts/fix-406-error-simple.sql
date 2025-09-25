-- =====================================================
-- CORRIGIR ERRO 406 - SOLUÇÃO SIMPLES E DIRETA
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR COLUNAS DA TABELA PROFILES
-- =====================================================

SELECT 
    'COLUNAS DA TABELA PROFILES' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. ADICIONAR COLUNAS FALTANTES (SE NÃO EXISTIREM)
-- =====================================================

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

-- 3. ATUALIZAR VALORES PADRÃO PARA USUÁRIOS EXISTENTES
-- =====================================================

-- Atualizar valores padrão
UPDATE public.profiles 
SET 
    rating = COALESCE(rating, 0.0),
    total_reviews = COALESCE(total_reviews, 0),
    is_verified = COALESCE(is_verified, false),
    badge = COALESCE(badge, 'bronze')
WHERE rating IS NULL 
   OR total_reviews IS NULL 
   OR is_verified IS NULL 
   OR badge IS NULL;

-- 4. CRIAR PERFIL PARA USUÁRIO ESPECÍFICO (SEM AMBIGUIDADE)
-- =====================================================

-- Inserir perfil para usuário específico
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
ON CONFLICT (id) DO NOTHING;

-- 5. CRIAR PREFERÊNCIAS PARA USUÁRIO ESPECÍFICO
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
    '4a1bca5c-833c-4f57-8bce-235842b34067',
    true,
    true,
    true,
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO NOTHING;

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
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

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
WHERE np.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 8. TESTAR SELECT QUE ESTAVA CAUSANDO ERRO 406
-- =====================================================

-- Testar select que estava causando erro
SELECT 
    'TESTE SELECT APÓS CORREÇÃO' as info,
    'Testando select das colunas que estavam causando erro 406' as mensagem;

-- Este select deve funcionar agora
SELECT 
    id,
    email,
    rating,
    total_reviews,
    is_verified,
    badge
FROM public.profiles 
WHERE id = '4a1bca5c-833c-4f57-8bce-235842b34067'
LIMIT 1;

-- 9. VERIFICAÇÃO FINAL
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

-- ✅ RESULTADO ESPERADO:
-- 1. Colunas rating, total_reviews, is_verified, badge adicionadas
-- 2. Perfil criado para usuário específico
-- 3. Preferências criadas para usuário específico
-- 4. Perfis criados para todos os usuários sem perfil
-- 5. Preferências criadas para todos os usuários sem preferências
-- 6. Select que causava erro 406 agora funciona
-- 7. Verificação final confirma que tudo foi criado

-- 🚨 PROBLEMA RESOLVIDO:
-- - Erro 406 causado por colunas inexistentes
-- - Ambiguidade de user_id resolvida
-- - Perfis criados com todas as colunas necessárias
-- - Sistema funcionando corretamente

-- 📋 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Verifique se as colunas foram adicionadas
-- 3. Teste o login de usuários
-- 4. Confirme que o erro 406 foi resolvido
