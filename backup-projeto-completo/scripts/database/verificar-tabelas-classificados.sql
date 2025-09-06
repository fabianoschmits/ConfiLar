-- Script para verificar tabelas existentes relacionadas a classificados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela classified_ads existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'classified_ads'
        ) THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as classified_ads_status;

-- 2. Verificar se a tabela professional_services existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'professional_services'
        ) THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as professional_services_status;

-- 3. Verificar se a tabela service_categories existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'service_categories'
        ) THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as service_categories_status;

-- 4. Listar todas as tabelas que contêm 'service' ou 'classified' no nome
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
    table_name ILIKE '%service%' 
    OR table_name ILIKE '%classified%'
    OR table_name ILIKE '%ad%'
)
ORDER BY table_name;

-- 5. Se classified_ads existir, verificar sua estrutura
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'classified_ads'
    ) THEN
        RAISE NOTICE 'Estrutura da tabela classified_ads:';
    END IF;
END $$;

-- 6. Se classified_ads existir, mostrar colunas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'classified_ads'
ORDER BY ordinal_position;

-- 7. Se classified_ads existir, verificar quantos registros tem
DO $$
DECLARE
    record_count INTEGER;
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'classified_ads'
    ) THEN
        EXECUTE 'SELECT COUNT(*) FROM classified_ads' INTO record_count;
        RAISE NOTICE 'Total de anúncios na tabela classified_ads: %', record_count;
    END IF;
END $$;

-- 8. Se professional_services existir, mostrar colunas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'professional_services'
ORDER BY ordinal_position;

-- 9. Verificar se Realtime está habilitado para essas tabelas
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND (
    tablename = 'classified_ads' 
    OR tablename = 'professional_services'
);

-- 10. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('classified_ads', 'professional_services')
ORDER BY tablename, policyname;
