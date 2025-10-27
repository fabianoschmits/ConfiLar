-- =============================================
-- SCRIPT PARA TESTAR CRIAÇÃO DE POST
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. BUSCAR USUÁRIO VÁLIDO
SELECT 'USUÁRIO PARA TESTE:' as info;

SELECT id, email FROM auth.users LIMIT 1;

-- 2. TESTAR INSERÇÃO DE POST
SELECT 'TESTANDO INSERÇÃO DE POST...' as info;

-- Inserir post de teste
INSERT INTO feed_posts (
    professional_id, 
    user_id, 
    title, 
    description, 
    content,
    images, 
    service_category_id, 
    location_state, 
    location_city,
    likes_count, 
    comments_count, 
    is_active, 
    is_public, 
    is_featured
) 
SELECT 
    id, 
    id, 
    'Teste Final - ' || NOW()::text,
    'Teste de inserção direta',
    'Teste de inserção direta',
    '{}',
    NULL,
    'SP',
    'São Paulo',
    0,
    0,
    true,
    true,
    false
FROM auth.users 
LIMIT 1
RETURNING id, title, created_at;
