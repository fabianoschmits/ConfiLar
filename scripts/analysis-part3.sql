-- =============================================
-- SCRIPT 3: BUSCA ESPECÍFICA PELA FONTE DO ERRO (CORRIGIDO)
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. BUSCAR FUNÇÕES COM MENSAGEM "SALDO INSUFICIENTE"
SELECT 'FUNÇÕES COM MENSAGEM SALDO INSUFICIENTE' as info;

SELECT 
    n.nspname as schema_name,
    p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%saldo insuficiente%'
   OR pg_get_functiondef(p.oid) ILIKE '%insufficient%'
ORDER BY p.proname;

-- 2. BUSCAR TRIGGERS COM MENSAGEM "SALDO INSUFICIENTE"
SELECT 'TRIGGERS COM MENSAGEM SALDO INSUFICIENTE' as info;

SELECT 
    trigger_name,
    LEFT(action_statement, 200) as action_statement_preview
FROM information_schema.triggers 
WHERE action_statement ILIKE '%saldo insuficiente%'
   OR action_statement ILIKE '%insufficient%'
ORDER BY trigger_name;

-- 3. BUSCAR FUNÇÕES QUE MENCIONAM "50 PONTOS"
SELECT 'FUNÇÕES QUE MENCIONAM 50 PONTOS' as info;

SELECT 
    n.nspname as schema_name,
    p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%50 pontos%'
   OR pg_get_functiondef(p.oid) ILIKE '%50 points%'
ORDER BY p.proname;

-- 4. BUSCAR TRIGGERS QUE MENCIONAM "50 PONTOS"
SELECT 'TRIGGERS QUE MENCIONAM 50 PONTOS' as info;

SELECT 
    trigger_name,
    LEFT(action_statement, 200) as action_statement_preview
FROM information_schema.triggers 
WHERE action_statement ILIKE '%50 pontos%'
   OR action_statement ILIKE '%50 points%'
ORDER BY trigger_name;

-- 5. BUSCAR FUNÇÕES QUE VALIDAM PONTOS
SELECT 'FUNÇÕES QUE VALIDAM PONTOS' as info;

SELECT 
    n.nspname as schema_name,
    p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%validate%'
   AND (
       pg_get_functiondef(p.oid) ILIKE '%points%'
       OR pg_get_functiondef(p.oid) ILIKE '%pontos%'
   )
ORDER BY p.proname;

-- 6. BUSCAR FUNÇÕES QUE VERIFICAM SALDO
SELECT 'FUNÇÕES QUE VERIFICAM SALDO' as info;

SELECT 
    n.nspname as schema_name,
    p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%check%'
   AND (
       pg_get_functiondef(p.oid) ILIKE '%balance%'
       OR pg_get_functiondef(p.oid) ILIKE '%saldo%'
   )
ORDER BY p.proname;

-- 7. LISTAR TODAS AS FUNÇÕES QUE PODEM ESTAR SENDO CHAMADAS AUTOMATICAMENTE
SELECT 'FUNÇÕES QUE PODEM SER CHAMADAS AUTOMATICAMENTE' as info;

SELECT 
    n.nspname as schema_name,
    p.proname as function_name
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

SELECT 'SCRIPT 3 CONCLUÍDO' as status;
