-- =============================================
-- TESTE DO SISTEMA DE BANIMENTOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar se a tabela user_bans existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_bans'
ORDER BY ordinal_position;

-- 2. Verificar se as funções existem
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN ('is_user_banned', 'get_user_ban_info', 'ban_user', 'unban_user');

-- 3. Verificar se a view existe
SELECT 
    table_name,
    view_definition
FROM information_schema.views 
WHERE table_name = 'active_bans_view';

-- 4. Testar inserção de banimento (substitua o UUID por um usuário real)
-- INSERT INTO user_bans (
--     user_id,
--     banned_by,
--     reason,
--     ban_type,
--     duration_days,
--     expires_at,
--     admin_notes
-- ) VALUES (
--     (SELECT id FROM auth.users LIMIT 1), -- ID do usuário a ser banido
--     (SELECT id FROM auth.users LIMIT 1), -- ID do admin que baniu
--     'Teste de banimento temporário',
--     'temporary',
--     7,
--     NOW() + INTERVAL '7 days',
--     'Banimento de teste para verificar o sistema'
-- );

-- 5. Verificar banimentos ativos
SELECT 
    ub.id,
    ub.user_id,
    ub.reason,
    ub.ban_type,
    ub.expires_at,
    ub.is_active,
    ub.created_at,
    p_banned.full_name as banned_user_name,
    p_banned.email as banned_user_email,
    p_admin.full_name as banned_by_name
FROM user_bans ub
LEFT JOIN profiles p_banned ON ub.user_id = p_banned.id
LEFT JOIN profiles p_admin ON ub.banned_by = p_admin.id
WHERE ub.is_active = true
ORDER BY ub.created_at DESC;

-- 6. Testar função de verificação de banimento
-- SELECT is_user_banned((SELECT id FROM auth.users LIMIT 1));

-- 7. Testar função de informações de banimento
-- SELECT * FROM get_user_ban_info((SELECT id FROM auth.users LIMIT 1));

-- 8. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_bans';

-- 9. Contar total de banimentos
SELECT 
    COUNT(*) as total_bans,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_bans,
    COUNT(CASE WHEN ban_type = 'permanent' THEN 1 END) as permanent_bans,
    COUNT(CASE WHEN ban_type = 'temporary' THEN 1 END) as temporary_bans
FROM user_bans;

-- 10. Verificar banimentos expirados
SELECT 
    COUNT(*) as expired_bans
FROM user_bans 
WHERE is_active = true 
AND expires_at IS NOT NULL 
AND expires_at < NOW();

RAISE NOTICE 'Sistema de banimentos verificado com sucesso!';
RAISE NOTICE 'Execute os comandos comentados para testar funcionalidades específicas.';
