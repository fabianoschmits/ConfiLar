-- =============================================
-- SCRIPT PARA RESTAURAR DADOS DE DENÚNCIAS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar se existem dados na tabela reports
DO $$
DECLARE
    report_count integer;
BEGIN
    SELECT COUNT(*) INTO report_count FROM reports;
    RAISE NOTICE 'Total de denúncias na tabela: %', report_count;
    
    IF report_count = 0 THEN
        RAISE NOTICE 'Tabela reports está vazia - dados foram perdidos ao recriar a tabela';
    ELSE
        RAISE NOTICE 'Tabela reports contém % denúncias', report_count;
    END IF;
END $$;

-- 2. Verificar se existem denúncias em outras tabelas ou backups
-- (Este script não pode restaurar dados perdidos, apenas verificar)

-- 3. Se necessário, criar algumas denúncias de teste
INSERT INTO reports (
    report_type,
    reason,
    description,
    priority,
    reporter_id,
    reported_user_id,
    status,
    created_at
) VALUES 
(
    'post',
    'Conteúdo inapropriado',
    'Teste de denúncia do feed social',
    'medium',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'pending',
    NOW() - INTERVAL '1 day'
),
(
    'classified',
    'Anúncio falso ou enganoso',
    'Teste de denúncia de classificados',
    'high',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'pending',
    NOW()
);

-- 4. Verificar se as denúncias foram criadas
DO $$
DECLARE
    report_count integer;
BEGIN
    SELECT COUNT(*) INTO report_count FROM reports;
    RAISE NOTICE 'Total de denúncias após inserção: %', report_count;
END $$;
