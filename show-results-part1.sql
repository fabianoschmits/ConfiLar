-- =============================================
-- SCRIPT PARA MOSTRAR RESULTADOS SEPARADAMENTE
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. VERIFICAR SE HÁ FUNÇÕES PROBLEMÁTICAS
SELECT 'FUNÇÕES PROBLEMÁTICAS ENCONTRADAS:' as info;

SELECT proname as function_name 
FROM pg_proc 
WHERE proname ILIKE '%post%' 
   OR proname ILIKE '%points%'
   OR proname ILIKE '%premium%'
   OR proname ILIKE '%saldo%'
   OR proname ILIKE '%check%'
   OR proname ILIKE '%validate%'
ORDER BY proname;
