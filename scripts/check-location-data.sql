-- Verificar dados de localização nos posts
-- Este script ajuda a entender como os dados estão armazenados

-- 1. Verificar todos os valores únicos de location_state
SELECT DISTINCT 
  location_state,
  COUNT(*) as quantidade
FROM feed_posts
WHERE location_state IS NOT NULL
GROUP BY location_state
ORDER BY quantidade DESC;

-- 2. Verificar todos os valores únicos de location_city por estado
SELECT 
  location_state,
  location_city,
  COUNT(*) as quantidade
FROM feed_posts
WHERE location_city IS NOT NULL 
  AND location_state IS NOT NULL
GROUP BY location_state, location_city
ORDER BY location_state, quantidade DESC;

-- 3. Verificar alguns posts de exemplo com suas localizações
SELECT 
  id,
  title,
  location_city,
  location_state,
  created_at
FROM feed_posts
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar se há espaços extras ou caracteres especiais
SELECT 
  id,
  title,
  LENGTH(location_city) as city_length,
  LENGTH(location_state) as state_length,
  location_city,
  location_state
FROM feed_posts
WHERE location_city IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

