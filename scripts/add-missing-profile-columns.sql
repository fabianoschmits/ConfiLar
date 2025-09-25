-- =====================================================
-- ADICIONAR COLUNAS FALTANTES NA TABELA PROFILES
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

-- 3. VERIFICAR COLUNAS APÓS ADIÇÃO
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
AND column_name IN ('rating', 'total_reviews', 'is_verified', 'badge')
ORDER BY column_name;

-- 4. ATUALIZAR VALORES PADRÃO PARA USUÁRIOS EXISTENTES
-- =====================================================

-- Atualizar rating para 0 se for NULL
UPDATE public.profiles 
SET rating = 0.0 
WHERE rating IS NULL;

-- Atualizar total_reviews para 0 se for NULL
UPDATE public.profiles 
SET total_reviews = 0 
WHERE total_reviews IS NULL;

-- Atualizar is_verified para false se for NULL
UPDATE public.profiles 
SET is_verified = false 
WHERE is_verified IS NULL;

-- Atualizar badge para 'bronze' se for NULL
UPDATE public.profiles 
SET badge = 'bronze' 
WHERE badge IS NULL;

-- 5. TESTAR SELECT QUE ESTAVA CAUSANDO ERRO 406
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
LIMIT 5;

-- 6. VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
    'VERIFICAÇÃO FINAL' as info,
    COUNT(*) as total_profiles,
    COUNT(rating) as profiles_with_rating,
    COUNT(total_reviews) as profiles_with_total_reviews,
    COUNT(is_verified) as profiles_with_is_verified,
    COUNT(badge) as profiles_with_badge
FROM public.profiles;

-- ✅ RESULTADO ESPERADO:
-- 1. Colunas rating, total_reviews, is_verified, badge adicionadas
-- 2. Valores padrão definidos para usuários existentes
-- 3. Select que causava erro 406 agora funciona
-- 4. Verificação final confirma que todas as colunas existem

-- 🚨 PROBLEMA RESOLVIDO:
-- - Erro 406 causado por colunas inexistentes
-- - Select agora funciona com maybeSingle()
-- - Perfis criados com todas as colunas necessárias

-- 📋 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Verifique se as colunas foram adicionadas
-- 3. Teste o login de usuários
-- 4. Confirme que o erro 406 foi resolvido
