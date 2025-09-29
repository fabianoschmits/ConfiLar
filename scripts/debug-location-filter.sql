-- =============================================
-- DEBUG: VERIFICAR DADOS DE LOCALIZAÇÃO
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar estrutura da tabela feed_posts
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'feed_posts' 
AND column_name IN ('location_city', 'location_state')
ORDER BY ordinal_position;

-- 2. Verificar dados de localização existentes
SELECT 
    id,
    title,
    location_city,
    location_state,
    created_at
FROM feed_posts 
WHERE location_city IS NOT NULL 
   OR location_state IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 3. Contar posts por localização
SELECT 
    location_state,
    location_city,
    COUNT(*) as total_posts
FROM feed_posts 
WHERE location_city IS NOT NULL 
   OR location_state IS NOT NULL
GROUP BY location_state, location_city
ORDER BY total_posts DESC
LIMIT 20;

-- 4. Verificar se há posts sem localização
SELECT 
    COUNT(*) as posts_sem_localizacao
FROM feed_posts 
WHERE location_city IS NULL 
   AND location_state IS NULL;

-- 5. Verificar posts com localização completa
SELECT 
    COUNT(*) as posts_com_localizacao_completa
FROM feed_posts 
WHERE location_city IS NOT NULL 
   AND location_state IS NOT NULL;

-- 6. Testar filtro específico (exemplo: São Paulo, SP)
SELECT 
    id,
    title,
    location_city,
    location_state,
    created_at
FROM feed_posts 
WHERE location_city = 'São Paulo' 
   AND location_state = 'SP'
ORDER BY created_at DESC
LIMIT 5;
