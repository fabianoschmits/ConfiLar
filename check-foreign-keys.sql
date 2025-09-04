-- =====================================================
-- VERIFICAR FOREIGN KEYS E TESTAR CONSULTAS DO FRONTEND
-- =====================================================

-- 1. Verificar foreign keys corretas
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('professional_services', 'classified_ads')
ORDER BY tc.table_name, kcu.column_name;

-- 2. Testar consulta de anúncios (exatamente como o frontend faz)
SELECT 'FRONTEND ANÚNCIOS:' as tipo, COUNT(*) as total 
FROM public.classified_ads 
WHERE is_active = true;

-- 3. Testar consulta de serviços (exatamente como o frontend faz)
-- Primeiro, vamos ver se a foreign key está correta
SELECT 'TESTE JOIN SIMPLES:' as tipo, COUNT(*) as total 
FROM public.professional_services ps
JOIN public.profiles p ON ps.professional_id = p.id
JOIN public.service_categories sc ON ps.category_id = sc.id
WHERE ps.is_active = true;

-- 4. Testar a consulta exata do frontend (com os nomes de foreign key que ele usa)
SELECT 'TESTE FRONTEND EXATO:' as tipo, COUNT(*) as total 
FROM public.professional_services
WHERE is_active = true;

-- 5. Verificar se há dados retornados pela consulta do frontend
SELECT 'DADOS FRONTEND ANÚNCIOS:' as tipo, id, title, user_name, category 
FROM public.classified_ads 
WHERE is_active = true 
LIMIT 3;

-- 6. Testar JOIN manual para serviços
SELECT 'DADOS FRONTEND SERVIÇOS:' as tipo, 
       ps.id, 
       ps.title, 
       p.full_name as professional_name,
       sc.name as category_name
FROM public.professional_services ps
LEFT JOIN public.profiles p ON ps.professional_id = p.id
LEFT JOIN public.service_categories sc ON ps.category_id = sc.id
WHERE ps.is_active = true 
LIMIT 3;
