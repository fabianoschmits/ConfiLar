-- =============================================
-- SCRIPT PARA IDENTIFICAR E REMOVER DEPENDÊNCIAS
-- =============================================
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Identificar todas as views que dependem de colunas premium
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE definition LIKE '%is_premium%' 
   OR definition LIKE '%premium_points_spent%'
   OR definition LIKE '%premium_expires_at%'
   OR definition LIKE '%premium_highlight_color%';

-- 2. Identificar todas as funções que dependem de colunas premium
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) LIKE '%is_premium%'
   OR pg_get_functiondef(p.oid) LIKE '%premium_points_spent%'
   OR pg_get_functiondef(p.oid) LIKE '%premium_expires_at%'
   OR pg_get_functiondef(p.oid) LIKE '%premium_highlight_color%';

-- 3. Remover todas as views premium
DROP VIEW IF EXISTS premium_likes_stats CASCADE;
DROP VIEW IF EXISTS user_premium_stats CASCADE;
DROP VIEW IF EXISTS premium_posts_stats CASCADE;
DROP VIEW IF EXISTS premium_analytics CASCADE;
DROP VIEW IF EXISTS premium_summary CASCADE;

-- 4. Remover todas as funções premium
DROP FUNCTION IF EXISTS create_post_normal CASCADE;
DROP FUNCTION IF EXISTS create_post_premium CASCADE;
DROP FUNCTION IF EXISTS create_post_safe CASCADE;
DROP FUNCTION IF EXISTS insert_common_post CASCADE;
DROP FUNCTION IF EXISTS premium_like_post CASCADE;
DROP FUNCTION IF EXISTS handle_premium_like_transaction CASCADE;
DROP FUNCTION IF EXISTS handle_premium_like_transaction_v2 CASCADE;
DROP FUNCTION IF EXISTS handle_premium_like_transaction_final CASCADE;
DROP FUNCTION IF EXISTS handle_premium_like_transaction_simple CASCADE;
DROP FUNCTION IF EXISTS handle_premium_like_transaction_multiple CASCADE;
DROP FUNCTION IF EXISTS handle_premium_like_transaction_ultimate CASCADE;
DROP FUNCTION IF EXISTS handle_premium_like_transaction_ultimate_fix CASCADE;
DROP FUNCTION IF EXISTS get_user_premium_likes_stats CASCADE;
DROP FUNCTION IF EXISTS get_premium_stats CASCADE;
DROP FUNCTION IF EXISTS calculate_premium_points CASCADE;

-- 5. Agora remover as colunas
ALTER TABLE feed_posts DROP COLUMN IF EXISTS is_premium CASCADE;
ALTER TABLE feed_posts DROP COLUMN IF EXISTS premium_points_spent CASCADE;
ALTER TABLE feed_posts DROP COLUMN IF EXISTS premium_expires_at CASCADE;
ALTER TABLE feed_posts DROP COLUMN IF EXISTS premium_highlight_color CASCADE;

ALTER TABLE feed_posts_likes DROP COLUMN IF EXISTS is_premium CASCADE;
ALTER TABLE feed_posts_likes DROP COLUMN IF EXISTS premium_points_spent CASCADE;

-- 6. Restaurar constraint única
DO $$
BEGIN
    -- Verificar se a constraint já existe antes de criar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'feed_posts_likes_post_id_user_id_key'
        AND table_name = 'feed_posts_likes'
    ) THEN
        ALTER TABLE feed_posts_likes 
        ADD CONSTRAINT feed_posts_likes_post_id_user_id_key 
        UNIQUE (post_id, user_id);
        RAISE NOTICE 'Constraint única restaurada em feed_posts_likes';
    ELSE
        RAISE NOTICE 'Constraint única já existe em feed_posts_likes';
    END IF;
END $$;

-- 7. Verificar se ainda há dependências
SELECT 'Verificando dependências restantes...' as status;

SELECT 
    schemaname,
    viewname
FROM pg_views 
WHERE definition LIKE '%is_premium%' 
   OR definition LIKE '%premium_points_spent%';

SELECT 'Banco restaurado ao estado anterior!' as final_status;
