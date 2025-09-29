-- =============================================
-- DEBUGAR SISTEMA DE BANIMENTOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar se a tabela user_bans existe e tem dados
SELECT 'Tabela user_bans:' as info;
SELECT COUNT(*) as total_bans FROM user_bans;
SELECT * FROM user_bans LIMIT 5;

-- 2. Verificar se a view active_bans_view existe
SELECT 'View active_bans_view:' as info;
SELECT COUNT(*) as total_from_view FROM active_bans_view;
SELECT * FROM active_bans_view LIMIT 5;

-- 3. Verificar se há usuários na tabela profiles
SELECT 'Tabela profiles:' as info;
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT id, full_name, email FROM profiles LIMIT 3;

-- 4. Verificar se há denúncias
SELECT 'Tabela reports:' as info;
SELECT COUNT(*) as total_reports FROM reports;
SELECT id, report_type, reported_user_id, status FROM reports LIMIT 3;

-- 5. Criar dados de teste se necessário
DO $$
BEGIN
    -- Se não há banimentos, criar um de teste
    IF NOT EXISTS (SELECT 1 FROM user_bans) THEN
        INSERT INTO user_bans (
            user_id,
            banned_by,
            reason,
            ban_type,
            admin_notes,
            is_active
        ) VALUES (
            (SELECT id FROM auth.users LIMIT 1),
            (SELECT id FROM auth.users LIMIT 1),
            'Banimento de teste',
            'pending',
            'Criado para teste do sistema',
            false
        );
        
        RAISE NOTICE 'Banimento de teste criado!';
    ELSE
        RAISE NOTICE 'Já existem banimentos na tabela.';
    END IF;
END $$;

-- 6. Verificar novamente após criar dados de teste
SELECT 'Após criar dados de teste:' as info;
SELECT COUNT(*) as total_bans FROM user_bans;
SELECT COUNT(*) as total_from_view FROM active_bans_view;
