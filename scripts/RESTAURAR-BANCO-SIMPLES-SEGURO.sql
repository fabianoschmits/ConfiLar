-- =============================================
-- SCRIPT SIMPLES E SEGURO PARA RESTAURAR BANCO
-- =============================================
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Remover views premium primeiro
DROP VIEW IF EXISTS premium_likes_stats CASCADE;
DROP VIEW IF EXISTS user_premium_stats CASCADE;
DROP VIEW IF EXISTS premium_posts_stats CASCADE;

-- 2. Remover funções premium
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

-- 3. Remover colunas premium
ALTER TABLE feed_posts DROP COLUMN IF EXISTS is_premium CASCADE;
ALTER TABLE feed_posts DROP COLUMN IF EXISTS premium_points_spent CASCADE;
ALTER TABLE feed_posts DROP COLUMN IF EXISTS premium_expires_at CASCADE;
ALTER TABLE feed_posts DROP COLUMN IF EXISTS premium_highlight_color CASCADE;

ALTER TABLE feed_posts_likes DROP COLUMN IF EXISTS is_premium CASCADE;
ALTER TABLE feed_posts_likes DROP COLUMN IF EXISTS premium_points_spent CASCADE;

-- 4. Verificar se constraint existe antes de criar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'feed_posts_likes_post_id_user_id_key'
        AND table_name = 'feed_posts_likes'
    ) THEN
        ALTER TABLE feed_posts_likes 
        ADD CONSTRAINT feed_posts_likes_post_id_user_id_key 
        UNIQUE (post_id, user_id);
    END IF;
END $$;

-- 5. Mensagem final
SELECT 'Banco restaurado ao estado anterior!' as status;
