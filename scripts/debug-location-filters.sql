-- Script para debugar filtros de localização
-- Execute este script no Supabase SQL Editor

-- 1. Ver todos os posts com suas localizações (últimos 20)
SELECT 
  id,
  title,
  location_city,
  location_state,
  created_at,
  -- Ver o tamanho das strings
  LENGTH(location_city) as city_len,
  LENGTH(location_state) as state_len,
  -- Ver os bytes (para detectar caracteres especiais)
  location_city::bytea as city_bytes,
  location_state::bytea as state_bytes
FROM feed_posts
ORDER BY created_at DESC
LIMIT 20;

-- 2. Ver valores únicos de location_state
SELECT DISTINCT 
  location_state,
  COUNT(*) as total_posts,
  LENGTH(location_state) as string_length
FROM feed_posts
WHERE location_state IS NOT NULL
GROUP BY location_state
ORDER BY total_posts DESC;

-- 3. Ver valores únicos de location_city por estado
SELECT 
  location_state,
  location_city,
  COUNT(*) as total_posts
FROM feed_posts
WHERE location_city IS NOT NULL AND location_state IS NOT NULL
GROUP BY location_state, location_city
ORDER BY location_state, total_posts DESC;

-- 4. Testar diferentes tipos de match
-- Substitua 'SUA_CIDADE' e 'SEU_ESTADO' pelos valores reais do seu perfil
SELECT 
  'Teste de Filtros' as tipo_teste,
  COUNT(*) FILTER (WHERE location_city = 'SUA_CIDADE' AND location_state = 'SEU_ESTADO') as match_eq_exato,
  COUNT(*) FILTER (WHERE location_city ILIKE 'SUA_CIDADE' AND location_state ILIKE 'SEU_ESTADO') as match_ilike,
  COUNT(*) FILTER (WHERE LOWER(TRIM(location_city)) = LOWER('SUA_CIDADE') AND LOWER(TRIM(location_state)) = LOWER('SEU_ESTADO')) as match_lower_trim,
  COUNT(*) as total_posts
FROM feed_posts;

-- 5. Ver perfis de usuários e suas localizações
SELECT 
  id,
  full_name,
  location_city,
  location_state,
  LENGTH(location_city) as city_len,
  LENGTH(location_state) as state_len
FROM profiles
WHERE location_city IS NOT NULL
LIMIT 10;

