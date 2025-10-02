-- =====================================================
-- DELETAR TABELA USER_ACTIVITY E COMPONENTES RELACIONADOS
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Remover políticas RLS
DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can update their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can insert their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can delete their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Anyone can view user activity" ON public.user_activity;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_activity;
DROP POLICY IF EXISTS "Public read access" ON public.user_activity;
DROP POLICY IF EXISTS "Users insert own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users update own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Anyone can view user activity status" ON public.user_activity;
DROP POLICY IF EXISTS "Users can insert their own activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can update their own activity" ON public.user_activity;

-- 2. Remover trigger
DROP TRIGGER IF EXISTS set_updated_at ON public.user_activity;

-- 3. Remover função do trigger
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- 4. Remover índices
DROP INDEX IF EXISTS public.idx_user_activity_status;
DROP INDEX IF EXISTS public.idx_user_activity_is_online;
DROP INDEX IF EXISTS public.idx_user_activity_last_activity;

-- 5. Deletar tabela
DROP TABLE IF EXISTS public.user_activity CASCADE;

-- 6. Verificar se foi removido com sucesso
SELECT 
  'Tabela user_activity deletada' as status,
  NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_activity'
  ) as sucesso;

-- Se sucesso = true, a tabela foi removida com sucesso! ✅

