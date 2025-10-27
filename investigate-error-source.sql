-- =============================================
-- SCRIPT PARA INVESTIGAR A FONTE DO ERRO "SALDO INSUFICIENTE"
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. BUSCAR POR QUALQUER FUNÇÃO QUE MENCIONE "SALDO INSUFICIENTE"
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%saldo insuficiente%'
   OR pg_get_functiondef(p.oid) ILIKE '%insufficient%'
   OR pg_get_functiondef(p.oid) ILIKE '%premium%'
ORDER BY p.proname;

-- 2. BUSCAR POR TRIGGERS QUE MENCIONEM POINTS OU PREMIUM
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts'
   OR action_statement ILIKE '%points%'
   OR action_statement ILIKE '%premium%'
   OR action_statement ILIKE '%saldo%'
ORDER BY trigger_name;

-- 3. BUSCAR POR CONSTRAINTS QUE PODEM ESTAR CAUSANDO O PROBLEMA
SELECT 
    tc.constraint_name,
    tc.table_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'feed_posts'
   OR cc.check_clause ILIKE '%points%'
   OR cc.check_clause ILIKE '%premium%'
ORDER BY tc.constraint_name;

-- 4. BUSCAR POR RULES QUE PODEM ESTAR INTERCEPTANDO INSERTS
SELECT 
    schemaname,
    tablename,
    rulename,
    definition
FROM pg_rules 
WHERE tablename = 'feed_posts'
   OR definition ILIKE '%points%'
   OR definition ILIKE '%premium%'
ORDER BY rulename;

-- 5. VERIFICAR SE HÁ VIEWS QUE PODEM ESTAR CAUSANDO PROBLEMAS
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE definition ILIKE '%feed_posts%'
   AND (definition ILIKE '%points%' OR definition ILIKE '%premium%')
ORDER BY viewname;

-- 6. BUSCAR POR QUALQUER OBJETO QUE MENCIONE "50 pontos"
SELECT 
    'FUNCTION' as object_type,
    n.nspname as schema_name,
    p.proname as object_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%50 pontos%'
   OR pg_get_functiondef(p.oid) ILIKE '%50 points%'

UNION ALL

SELECT 
    'TRIGGER' as object_type,
    'public' as schema_name,
    trigger_name as object_name,
    action_statement as definition
FROM information_schema.triggers 
WHERE action_statement ILIKE '%50 pontos%'
   OR action_statement ILIKE '%50 points%'

UNION ALL

SELECT 
    'RULE' as object_type,
    schemaname as schema_name,
    rulename as object_name,
    definition
FROM pg_rules 
WHERE definition ILIKE '%50 pontos%'
   OR definition ILIKE '%50 points%'

ORDER BY object_type, object_name;

SELECT 'Investigação concluída! Verifique os resultados acima para encontrar a fonte do problema.' as status;
