-- =====================================================
-- VERIFICAR COLUNAS DA TABELA PROFILES
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR COLUNAS DA TABELA PROFILES
-- =====================================================

SELECT 
    'COLUNAS DA TABELA PROFILES' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR COLUNAS ESPECÍFICAS QUE ESTÃO CAUSANDO ERRO 406
-- =====================================================

SELECT 
    'VERIFICAÇÃO DE COLUNAS ESPECÍFICAS' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'rating') 
        THEN 'rating: EXISTE'
        ELSE 'rating: NÃO EXISTE'
    END as rating_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_reviews') 
        THEN 'total_reviews: EXISTE'
        ELSE 'total_reviews: NÃO EXISTE'
    END as total_reviews_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_verified') 
        THEN 'is_verified: EXISTE'
        ELSE 'is_verified: NÃO EXISTE'
    END as is_verified_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'badge') 
        THEN 'badge: EXISTE'
        ELSE 'badge: NÃO EXISTE'
    END as badge_status;

-- 3. VERIFICAR COLUNAS DA TABELA NOTIFICATION_PREFERENCES
-- =====================================================

SELECT 
    'COLUNAS DA TABELA NOTIFICATION_PREFERENCES' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'notification_preferences' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. TESTAR SELECT QUE ESTÁ CAUSANDO ERRO 406
-- =====================================================

-- Testar select que está causando erro
SELECT 
    'TESTE SELECT PROBLEMÁTICO' as info,
    'Tentando fazer select das colunas que podem não existir' as mensagem;

-- Se as colunas existirem, este select deve funcionar
-- Se não existirem, vai dar erro
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

-- ✅ RESULTADO ESPERADO:
-- 1. Lista de todas as colunas da tabela profiles
-- 2. Verificação específica das colunas que estão causando erro 406
-- 3. Lista de colunas da tabela notification_preferences
-- 4. Teste do select problemático

-- 🚨 PROBLEMAS POSSÍVEIS:
-- - Colunas rating, total_reviews, is_verified, badge não existem
-- - Select está pedindo colunas inexistentes
-- - Por isso o erro 406

-- 📋 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Verifique se as colunas existem
-- 3. Se não existirem, adicione as colunas
-- 4. Corrija o select no frontend
