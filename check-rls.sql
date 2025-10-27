-- =============================================
-- SCRIPT 4: POLÍTICAS RLS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'post_comments';
