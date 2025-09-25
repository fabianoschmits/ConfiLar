-- =====================================================
-- GARANTIR QUE TODAS AS COLUNAS NECESSÁRIAS EXISTAM
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR COLUNAS ATUAIS
-- =====================================================

SELECT 
    'COLUNAS ATUAIS DA TABELA PROFILES' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. ADICIONAR TODAS AS COLUNAS NECESSÁRIAS
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

-- Adicionar coluna is_available se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_available'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_available BOOLEAN DEFAULT true;
        RAISE NOTICE 'Coluna is_available adicionada';
    ELSE
        RAISE NOTICE 'Coluna is_available já existe';
    END IF;
END $$;

-- Adicionar coluna profile_completed se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'profile_completed'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN profile_completed BOOLEAN DEFAULT false;
        RAISE NOTICE 'Coluna profile_completed adicionada';
    ELSE
        RAISE NOTICE 'Coluna profile_completed já existe';
    END IF;
END $$;

-- Adicionar coluna profile_completion_score se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'profile_completion_score'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN profile_completion_score INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna profile_completion_score adicionada';
    ELSE
        RAISE NOTICE 'Coluna profile_completion_score já existe';
    END IF;
END $$;

-- 3. ATUALIZAR VALORES PADRÃO PARA USUÁRIOS EXISTENTES
-- =====================================================

-- Atualizar valores padrão para colunas que podem estar NULL
UPDATE public.profiles 
SET 
    professional_certifications = COALESCE(professional_certifications, '{}'),
    badge = COALESCE(badge, 'bronze'),
    rating = COALESCE(rating, 0.0),
    total_reviews = COALESCE(total_reviews, 0),
    is_verified = COALESCE(is_verified, false),
    is_available = COALESCE(is_available, true),
    profile_completed = COALESCE(profile_completed, false),
    profile_completion_score = COALESCE(profile_completion_score, 0)
WHERE professional_certifications IS NULL 
   OR badge IS NULL 
   OR rating IS NULL 
   OR total_reviews IS NULL 
   OR is_verified IS NULL 
   OR is_available IS NULL 
   OR profile_completed IS NULL 
   OR profile_completion_score IS NULL;

-- 4. VERIFICAR COLUNAS APÓS ADIÇÃO
-- =====================================================

SELECT 
    'COLUNAS APÓS ADIÇÃO' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN (
    'professional_certifications', 
    'avatar_url', 
    'badge', 
    'rating', 
    'total_reviews', 
    'is_verified', 
    'is_available', 
    'profile_completed', 
    'profile_completion_score'
)
ORDER BY column_name;

-- 5. TESTAR SELECT QUE ESTAVA CAUSANDO ERRO 406
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
LIMIT 1;

-- ✅ RESULTADO ESPERADO:
-- 1. Todas as colunas necessárias adicionadas
-- 2. Valores padrão definidos para usuários existentes
-- 3. Select que causava erro 406 agora funciona
-- 4. Frontend pode criar perfis corretamente

-- 🚨 PROBLEMA RESOLVIDO:
-- - Erro 406 causado por colunas inexistentes
-- - Todas as colunas necessárias agora existem
-- - Frontend pode criar perfis automaticamente no cadastro
-- - Sistema funcionando corretamente

-- 📋 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Verifique se todas as colunas foram adicionadas
-- 3. Teste criação de novos usuários
-- 4. Confirme que perfis são criados automaticamente
