-- =============================================
-- SCRIPT PARA CORRIGIR ESTRUTURA DA TABELA FEED_POSTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar estrutura atual da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'feed_posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Remover colunas premium que não deveriam existir (com tratamento de erro)
DO $$
BEGIN
    BEGIN
        ALTER TABLE feed_posts DROP COLUMN IF EXISTS is_premium CASCADE;
        RAISE NOTICE 'Coluna is_premium removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover coluna is_premium: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE feed_posts DROP COLUMN IF EXISTS premium_points_spent CASCADE;
        RAISE NOTICE 'Coluna premium_points_spent removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover coluna premium_points_spent: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE feed_posts DROP COLUMN IF EXISTS premium_expires_at CASCADE;
        RAISE NOTICE 'Coluna premium_expires_at removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover coluna premium_expires_at: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE feed_posts DROP COLUMN IF EXISTS premium_highlight_color CASCADE;
        RAISE NOTICE 'Coluna premium_highlight_color removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover coluna premium_highlight_color: %', SQLERRM;
    END;
END $$;

-- 3. Verificar se a coluna professional_id existe e tem constraint correta
DO $$
BEGIN
    -- Verificar se professional_id existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'feed_posts' 
        AND column_name = 'professional_id'
    ) THEN
        -- Adicionar coluna professional_id se não existir
        ALTER TABLE feed_posts ADD COLUMN professional_id UUID;
        RAISE NOTICE 'Coluna professional_id adicionada';
    END IF;
    
    -- Verificar se há constraint de foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'feed_posts_professional_id_fkey'
        AND table_name = 'feed_posts'
    ) THEN
        -- Adicionar constraint de foreign key
        ALTER TABLE feed_posts 
        ADD CONSTRAINT feed_posts_professional_id_fkey 
        FOREIGN KEY (professional_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Constraint foreign key adicionada para professional_id';
    END IF;
END $$;

-- 4. Verificar e corrigir constraint de user_id
DO $$
BEGIN
    -- Verificar se há constraint de foreign key para user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'feed_posts_user_id_fkey'
        AND table_name = 'feed_posts'
    ) THEN
        -- Adicionar constraint de foreign key
        ALTER TABLE feed_posts 
        ADD CONSTRAINT feed_posts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Constraint foreign key adicionada para user_id';
    END IF;
END $$;

-- 5. Remover triggers e funções problemáticas
DO $$
BEGIN
    -- Remover triggers problemáticos
    BEGIN
        DROP TRIGGER IF EXISTS check_points_before_insert ON feed_posts;
        RAISE NOTICE 'Trigger check_points_before_insert removido (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover trigger check_points_before_insert: %', SQLERRM;
    END;

    BEGIN
        DROP TRIGGER IF EXISTS validate_premium_post ON feed_posts;
        RAISE NOTICE 'Trigger validate_premium_post removido (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover trigger validate_premium_post: %', SQLERRM;
    END;

    BEGIN
        DROP TRIGGER IF EXISTS check_user_points ON feed_posts;
        RAISE NOTICE 'Trigger check_user_points removido (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover trigger check_user_points: %', SQLERRM;
    END;

    -- Remover funções problemáticas
    BEGIN
        DROP FUNCTION IF EXISTS check_points_before_insert() CASCADE;
        RAISE NOTICE 'Função check_points_before_insert removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover função check_points_before_insert: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS create_post_normal CASCADE;
        RAISE NOTICE 'Função create_post_normal removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover função create_post_normal: %', SQLERRM;
    END;

    BEGIN
        DROP FUNCTION IF EXISTS create_post_premium CASCADE;
        RAISE NOTICE 'Função create_post_premium removida (se existia)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover função create_post_premium: %', SQLERRM;
    END;
END $$;

-- 6. Garantir que as colunas obrigatórias tenham valores padrão corretos
DO $$
BEGIN
    BEGIN
        ALTER TABLE feed_posts ALTER COLUMN likes_count SET DEFAULT 0;
        RAISE NOTICE 'Valor padrão para likes_count definido';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao definir padrão para likes_count: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE feed_posts ALTER COLUMN comments_count SET DEFAULT 0;
        RAISE NOTICE 'Valor padrão para comments_count definido';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao definir padrão para comments_count: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE feed_posts ALTER COLUMN is_active SET DEFAULT true;
        RAISE NOTICE 'Valor padrão para is_active definido';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao definir padrão para is_active: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE feed_posts ALTER COLUMN is_public SET DEFAULT true;
        RAISE NOTICE 'Valor padrão para is_public definido';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao definir padrão para is_public: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE feed_posts ALTER COLUMN is_featured SET DEFAULT false;
        RAISE NOTICE 'Valor padrão para is_featured definido';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao definir padrão para is_featured: %', SQLERRM;
    END;
END $$;

-- 7. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'feed_posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Verificar políticas RLS
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'feed_posts'
ORDER BY policyname;

-- 9. Verificar triggers restantes
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts'
ORDER BY trigger_name;

SELECT 'Estrutura da tabela feed_posts corrigida com sucesso!' as status;
