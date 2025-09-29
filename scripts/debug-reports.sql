-- =============================================
-- SCRIPT PARA DEBUGAR TABELA REPORTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar se a tabela reports existe e sua estrutura
DO $$
DECLARE
    table_exists boolean;
    column_info record;
BEGIN
    -- Verificar se a tabela existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'reports'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'Tabela reports existe';
        
        -- Listar colunas
        RAISE NOTICE '=== ESTRUTURA DA TABELA REPORTS ===';
        FOR column_info IN 
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'reports' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE 'Coluna: %, Tipo: %, Nullable: %', 
                column_info.column_name, 
                column_info.data_type, 
                column_info.is_nullable;
        END LOOP;
    ELSE
        RAISE NOTICE 'Tabela reports NÃO existe!';
    END IF;
END $$;

-- 2. Verificar se há dados na tabela
DO $$
DECLARE
    report_count integer;
BEGIN
    SELECT COUNT(*) INTO report_count FROM reports;
    RAISE NOTICE 'Total de denúncias na tabela: %', report_count;
    
    IF report_count > 0 THEN
        RAISE NOTICE '=== PRIMEIRAS 5 DENÚNCIAS ===';
        FOR i IN 1..LEAST(report_count, 5) LOOP
            RAISE NOTICE 'Denúncia %: ID=%, Tipo=%, Status=%, Criado em=%', 
                i,
                (SELECT id FROM reports ORDER BY created_at DESC LIMIT 1 OFFSET i-1),
                (SELECT report_type FROM reports ORDER BY created_at DESC LIMIT 1 OFFSET i-1),
                (SELECT status FROM reports ORDER BY created_at DESC LIMIT 1 OFFSET i-1),
                (SELECT created_at FROM reports ORDER BY created_at DESC LIMIT 1 OFFSET i-1);
        END LOOP;
    ELSE
        RAISE NOTICE 'Nenhuma denúncia encontrada na tabela';
    END IF;
END $$;

-- 3. Verificar políticas RLS
DO $$
DECLARE
    policy_info record;
BEGIN
    RAISE NOTICE '=== POLÍTICAS RLS ===';
    FOR policy_info IN 
        SELECT policyname, permissive, roles, cmd, qual
        FROM pg_policies 
        WHERE tablename = 'reports'
    LOOP
        RAISE NOTICE 'Política: %, Permissiva: %, Roles: %, Comando: %', 
            policy_info.policyname,
            policy_info.permissive,
            policy_info.roles,
            policy_info.cmd;
    END LOOP;
END $$;

-- 4. Testar inserção de uma denúncia de teste
INSERT INTO reports (
    report_type,
    reason,
    description,
    priority,
    reporter_id,
    status,
    created_at
) VALUES (
    'classified',
    'Teste de denúncia',
    'Esta é uma denúncia de teste para verificar se o sistema está funcionando',
    'medium',
    (SELECT id FROM auth.users LIMIT 1),
    'pending',
    NOW()
) ON CONFLICT DO NOTHING;

-- 5. Verificar se a inserção funcionou
DO $$
DECLARE
    report_count integer;
BEGIN
    SELECT COUNT(*) INTO report_count FROM reports;
    RAISE NOTICE 'Total de denúncias após inserção de teste: %', report_count;
END $$;
