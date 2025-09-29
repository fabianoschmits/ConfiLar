-- =============================================
-- VERIFICAR FORMATO DOS DADOS DE LOCALIZAÇÃO
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar dados existentes com detalhes
SELECT 
    id,
    title,
    location_city,
    location_state,
    LENGTH(location_city) as city_length,
    LENGTH(location_state) as state_length,
    created_at
FROM feed_posts 
WHERE location_city IS NOT NULL 
   OR location_state IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 2. Verificar se há espaços em branco ou caracteres especiais
SELECT 
    id,
    title,
    location_city,
    location_state,
    CASE 
        WHEN location_city ~ '^\s' THEN 'Cidade com espaço no início'
        WHEN location_city ~ '\s$' THEN 'Cidade com espaço no final'
        WHEN location_city ~ '\s\s' THEN 'Cidade com espaços duplos'
        ELSE 'Cidade OK'
    END as city_status,
    CASE 
        WHEN location_state ~ '^\s' THEN 'Estado com espaço no início'
        WHEN location_state ~ '\s$' THEN 'Estado com espaço no final'
        WHEN location_state ~ '\s\s' THEN 'Estado com espaços duplos'
        ELSE 'Estado OK'
    END as state_status
FROM feed_posts 
WHERE location_city IS NOT NULL 
   OR location_state IS NOT NULL
LIMIT 5;

-- 3. Verificar valores únicos de cidade e estado
SELECT DISTINCT location_city 
FROM feed_posts 
WHERE location_city IS NOT NULL 
ORDER BY location_city;

SELECT DISTINCT location_state 
FROM feed_posts 
WHERE location_state IS NOT NULL 
ORDER BY location_state;

-- 4. Testar filtro específico (exemplo: São Paulo, SP)
SELECT 
    id,
    title,
    location_city,
    location_state,
    created_at
FROM feed_posts 
WHERE location_city ILIKE 'São Paulo' 
   AND location_state ILIKE 'SP'
ORDER BY created_at DESC;

-- 5. Testar filtro apenas por estado
SELECT 
    id,
    title,
    location_city,
    location_state,
    created_at
FROM feed_posts 
WHERE location_state ILIKE 'SP'
ORDER BY created_at DESC;
