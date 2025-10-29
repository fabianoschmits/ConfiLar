-- =============================================
-- SCRIPT PARA VERIFICAR ESTRUTURA DA TABELA POST_COMMENTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'post_comments'
AND table_schema = 'public'
ORDER BY ordinal_position;
