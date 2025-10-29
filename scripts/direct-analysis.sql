-- =============================================
-- SCRIPT DIRETO PARA ENCONTRAR O PROBLEMA
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. VERIFICAR SE HÁ TRIGGERS
SELECT 'VERIFICANDO TRIGGERS...' as status;

SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'feed_posts';

-- 2. VERIFICAR FUNÇÕES SUSPEITAS
SELECT 'VERIFICANDO FUNÇÕES...' as status;

SELECT proname FROM pg_proc WHERE proname ILIKE '%post%' OR proname ILIKE '%points%' OR proname ILIKE '%premium%';

-- 3. VERIFICAR COLUNAS PREMIUM
SELECT 'VERIFICANDO COLUNAS PREMIUM...' as status;

SELECT column_name FROM information_schema.columns WHERE table_name = 'feed_posts' AND column_name ILIKE '%premium%';

-- 4. TESTAR INSERÇÃO DIRETA
SELECT 'TESTANDO INSERÇÃO...' as status;

-- Buscar um usuário válido
SELECT id FROM auth.users LIMIT 1;

SELECT 'ANÁLISE CONCLUÍDA' as status;
