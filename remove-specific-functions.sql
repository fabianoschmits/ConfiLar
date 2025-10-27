-- =============================================
-- SCRIPT PARA REMOVER FUNÇÕES PROBLEMÁTICAS ESPECÍFICAS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. REMOVER FUNÇÕES DE CRIAÇÃO DE POSTS
DO $$
BEGIN
    BEGIN
        DROP FUNCTION IF EXISTS create_post_normal CASCADE;
        RAISE NOTICE 'Função create_post_normal removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover create_post_normal: %', SQLERRM;
    END;
END $$;

-- 2. REMOVER FUNÇÕES DE PROCESSAMENTO DE POSTS PREMIUM
DO $$
BEGIN
    BEGIN
        DROP FUNCTION IF EXISTS process_premium_post CASCADE;
        RAISE NOTICE 'Função process_premium_post removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover process_premium_post: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS process_premium_like CASCADE;
        RAISE NOTICE 'Função process_premium_like removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover process_premium_like: %', SQLERRM;
    END;
END $$;

-- 3. REMOVER FUNÇÕES DE TRANSACTION DE LIKES PREMIUM
DO $$
BEGIN
    BEGIN
        DROP FUNCTION IF EXISTS handle_premium_like_transaction CASCADE;
        RAISE NOTICE 'Função handle_premium_like_transaction removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover handle_premium_like_transaction: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS handle_premium_like_transaction_final CASCADE;
        RAISE NOTICE 'Função handle_premium_like_transaction_final removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover handle_premium_like_transaction_final: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS handle_premium_like_transaction_multiple CASCADE;
        RAISE NOTICE 'Função handle_premium_like_transaction_multiple removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover handle_premium_like_transaction_multiple: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS handle_premium_like_transaction_simple CASCADE;
        RAISE NOTICE 'Função handle_premium_like_transaction_simple removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover handle_premium_like_transaction_simple: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS handle_premium_like_transaction_ultimate_fix CASCADE;
        RAISE NOTICE 'Função handle_premium_like_transaction_ultimate_fix removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover handle_premium_like_transaction_ultimate_fix: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS handle_premium_like_transaction_v2 CASCADE;
        RAISE NOTICE 'Função handle_premium_like_transaction_v2 removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover handle_premium_like_transaction_v2: %', SQLERRM;
    END;
END $$;

-- 4. REMOVER FUNÇÕES DE LIKES PREMIUM
DO $$
BEGIN
    BEGIN
        DROP FUNCTION IF EXISTS get_premium_likes_count CASCADE;
        RAISE NOTICE 'Função get_premium_likes_count removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover get_premium_likes_count: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS get_user_premium_likes_stats CASCADE;
        RAISE NOTICE 'Função get_user_premium_likes_stats removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover get_user_premium_likes_stats: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS user_premium_liked_post CASCADE;
        RAISE NOTICE 'Função user_premium_liked_post removida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover user_premium_liked_post: %', SQLERRM;
    END;
END $$;

-- 5. REMOVER TRIGGERS DE PONTOS QUE PODEM ESTAR CAUSANDO PROBLEMA
DO $$
BEGIN
    BEGIN
        DROP TRIGGER IF EXISTS award_comment_points_trigger ON feed_posts CASCADE;
        RAISE NOTICE 'Trigger award_comment_points_trigger removido';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover award_comment_points_trigger: %', SQLERRM;
    END;

    BEGIN
        DROP TRIGGER IF EXISTS award_like_points_trigger ON feed_posts CASCADE;
        RAISE NOTICE 'Trigger award_like_points_trigger removido';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover award_like_points_trigger: %', SQLERRM;
    END;

    BEGIN
        DROP TRIGGER IF EXISTS award_referral_points_trigger ON feed_posts CASCADE;
        RAISE NOTICE 'Trigger award_referral_points_trigger removido';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover award_referral_points_trigger: %', SQLERRM;
    END;
END $$;

SELECT 'FUNÇÕES PROBLEMÁTICAS REMOVIDAS!' as status;
