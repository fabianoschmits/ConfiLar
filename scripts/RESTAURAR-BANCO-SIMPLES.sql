-- =============================================
-- SCRIPT SIMPLES PARA RESTAURAR BANCO
-- =============================================
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Remover colunas premium da tabela feed_posts
ALTER TABLE feed_posts DROP COLUMN IF EXISTS is_premium;
ALTER TABLE feed_posts DROP COLUMN IF EXISTS premium_points_spent;
ALTER TABLE feed_posts DROP COLUMN IF EXISTS premium_expires_at;
ALTER TABLE feed_posts DROP COLUMN IF EXISTS premium_highlight_color;

-- 2. Remover colunas premium da tabela feed_posts_likes
ALTER TABLE feed_posts_likes DROP COLUMN IF EXISTS is_premium;
ALTER TABLE feed_posts_likes DROP COLUMN IF EXISTS premium_points_spent;

-- 3. Remover funções RPC premium
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

-- 4. Restaurar constraint única em feed_posts_likes
ALTER TABLE feed_posts_likes 
ADD CONSTRAINT IF NOT EXISTS feed_posts_likes_post_id_user_id_key 
UNIQUE (post_id, user_id);

-- 5. Verificar estrutura final
SELECT 'Banco restaurado ao estado anterior!' as status;
