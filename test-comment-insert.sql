-- =============================================
-- SCRIPT PARA TESTAR INSERÇÃO DIRETA DE COMENTÁRIO
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. BUSCAR USUÁRIO E POST VÁLIDOS
SELECT 'USUÁRIO PARA TESTE:' as info;
SELECT id, email FROM auth.users LIMIT 1;

SELECT 'POST PARA TESTE:' as info;
SELECT id, title FROM feed_posts LIMIT 1;

-- 2. TESTAR INSERÇÃO SIMPLES
SELECT 'TESTANDO INSERÇÃO SIMPLES...' as info;

INSERT INTO post_comments (
    post_id,
    user_id,
    content
) 
SELECT 
    fp.id,
    au.id,
    'Teste de comentário - ' || NOW()::text
FROM feed_posts fp
CROSS JOIN auth.users au
LIMIT 1
RETURNING id, post_id, user_id, content, created_at;
