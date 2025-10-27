-- =============================================
-- SCRIPT ESPECÍFICO PARA ENCONTRAR A FONTE DO ERRO "SALDO INSUFICIENTE"
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. BUSCAR POR QUALQUER OBJETO QUE CONTENHA A MENSAGEM EXATA DO ERRO
SELECT '=== OBJETOS COM MENSAGEM "SALDO INSUFICIENTE" ===' as secao;

SELECT 
    'FUNCTION' as object_type,
    n.nspname as schema_name,
    p.proname as object_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%saldo insuficiente%'
   OR pg_get_functiondef(p.oid) ILIKE '%insufficient%'
   OR pg_get_functiondef(p.oid) ILIKE '%50 pontos%'
   OR pg_get_functiondef(p.oid) ILIKE '%50 points%'

UNION ALL

SELECT 
    'TRIGGER' as object_type,
    'public' as schema_name,
    trigger_name as object_name,
    action_statement as definition
FROM information_schema.triggers 
WHERE action_statement ILIKE '%saldo insuficiente%'
   OR action_statement ILIKE '%insufficient%'
   OR action_statement ILIKE '%50 pontos%'
   OR action_statement ILIKE '%50 points%'

UNION ALL

SELECT 
    'RULE' as object_type,
    schemaname as schema_name,
    rulename as object_name,
    definition
FROM pg_rules 
WHERE definition ILIKE '%saldo insuficiente%'
   OR definition ILIKE '%insufficient%'
   OR definition ILIKE '%50 pontos%'
   OR definition ILIKE '%50 points%'

UNION ALL

SELECT 
    'CONSTRAINT' as object_type,
    'public' as schema_name,
    constraint_name as object_name,
    check_clause as definition
FROM information_schema.check_constraints 
WHERE check_clause ILIKE '%saldo insuficiente%'
   OR check_clause ILIKE '%insufficient%'
   OR check_clause ILIKE '%50 pontos%'
   OR check_clause ILIKE '%50 points%'

ORDER BY object_type, object_name;

-- 2. BUSCAR POR FUNÇÕES QUE MENCIONAM "PREMIUM" E "PONTOS"
SELECT '=== FUNÇÕES COM "PREMIUM" E "PONTOS" ===' as secao;

SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE (
    pg_get_functiondef(p.oid) ILIKE '%premium%'
    AND pg_get_functiondef(p.oid) ILIKE '%pontos%'
)
OR (
    pg_get_functiondef(p.oid) ILIKE '%premium%'
    AND pg_get_functiondef(p.oid) ILIKE '%points%'
)
ORDER BY p.proname;

-- 3. BUSCAR POR TRIGGERS QUE MENCIONAM "PREMIUM" OU "PONTOS"
SELECT '=== TRIGGERS COM "PREMIUM" OU "PONTOS" ===' as secao;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE action_statement ILIKE '%premium%'
   OR action_statement ILIKE '%pontos%'
   OR action_statement ILIKE '%points%'
   OR action_statement ILIKE '%saldo%'
ORDER BY trigger_name;

-- 4. BUSCAR POR QUALQUER FUNÇÃO QUE VALIDE PONTOS
SELECT '=== FUNÇÕES QUE VALIDAM PONTOS ===' as secao;

SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%validate%'
   AND (
       pg_get_functiondef(p.oid) ILIKE '%points%'
       OR pg_get_functiondef(p.oid) ILIKE '%pontos%'
       OR pg_get_functiondef(p.oid) ILIKE '%premium%'
       OR pg_get_functiondef(p.oid) ILIKE '%saldo%'
   )
ORDER BY p.proname;

-- 5. BUSCAR POR FUNÇÕES QUE VERIFICAM SALDO
SELECT '=== FUNÇÕES QUE VERIFICAM SALDO ===' as secao;

SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%check%'
   AND (
       pg_get_functiondef(p.oid) ILIKE '%balance%'
       OR pg_get_functiondef(p.oid) ILIKE '%saldo%'
       OR pg_get_functiondef(p.oid) ILIKE '%points%'
       OR pg_get_functiondef(p.oid) ILIKE '%pontos%'
   )
ORDER BY p.proname;

-- 6. BUSCAR POR QUALQUER OBJETO QUE MENCIONE "50"
SELECT '=== OBJETOS QUE MENCIONAM "50" ===' as secao;

SELECT 
    'FUNCTION' as object_type,
    n.nspname as schema_name,
    p.proname as object_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%50%'
AND n.nspname = 'public'

UNION ALL

SELECT 
    'TRIGGER' as object_type,
    'public' as schema_name,
    trigger_name as object_name,
    action_statement as definition
FROM information_schema.triggers 
WHERE action_statement ILIKE '%50%'

UNION ALL

SELECT 
    'RULE' as object_type,
    schemaname as schema_name,
    rulename as object_name,
    definition
FROM pg_rules 
WHERE definition ILIKE '%50%'

ORDER BY object_type, object_name;

-- 7. VERIFICAR SE HÁ FUNÇÕES DE INSERT INTERCEPTADAS
SELECT '=== FUNÇÕES DE INSERT INTERCEPTADAS ===' as secao;

SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%insert%'
   AND pg_get_functiondef(p.oid) ILIKE '%feed_posts%'
ORDER BY p.proname;

-- 8. VERIFICAR SE HÁ FUNÇÕES QUE RETORNAM ERRO P0001
SELECT '=== FUNÇÕES QUE RETORNAM ERRO P0001 ===' as secao;

SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%P0001%'
   OR pg_get_functiondef(p.oid) ILIKE '%raise%'
ORDER BY p.proname;

-- 9. LISTAR TODAS AS FUNÇÕES QUE PODEM ESTAR SENDO CHAMADAS AUTOMATICAMENTE
SELECT '=== FUNÇÕES QUE PODEM SER CHAMADAS AUTOMATICAMENTE ===' as secao;

SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE (
    p.proname ILIKE '%before%'
    OR p.proname ILIKE '%after%'
    OR p.proname ILIKE '%insert%'
    OR p.proname ILIKE '%create%'
    OR p.proname ILIKE '%validate%'
    OR p.proname ILIKE '%check%'
)
AND n.nspname = 'public'
ORDER BY p.proname;

SELECT '=== BUSCA PELA FONTE DO ERRO CONCLUÍDA ===' as secao;
