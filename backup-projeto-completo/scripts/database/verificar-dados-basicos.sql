-- Script simples para verificar tabelas de classificados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar tabelas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('classified_ads', 'professional_services', 'service_categories', 'profiles')
ORDER BY table_name;

-- 2. Se classified_ads existir, mostrar alguns dados
SELECT 
    id,
    title,
    user_type,
    category,
    is_active,
    created_at
FROM classified_ads 
LIMIT 5;

-- 3. Se professional_services existir, mostrar alguns dados
SELECT 
    id,
    title,
    professional_id,
    category_id,
    is_active,
    created_at
FROM professional_services 
LIMIT 5;

-- 4. Verificar se profiles tem dados
SELECT 
    id,
    full_name,
    user_type,
    location_state,
    location_city
FROM profiles 
WHERE user_type = 'professional'
LIMIT 5;
