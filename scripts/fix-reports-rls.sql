-- =============================================
-- SCRIPT PARA CORRIGIR POLÍTICAS RLS DA TABELA REPORTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar políticas RLS existentes
DO $$
DECLARE
    policy_info record;
BEGIN
    RAISE NOTICE '=== POLÍTICAS RLS EXISTENTES ===';
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

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;

-- 3. Criar políticas RLS mais permissivas para teste
CREATE POLICY "Allow all operations on reports" ON reports
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Verificar se RLS está habilitado
DO $$
DECLARE
    rls_enabled boolean;
BEGIN
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class 
    WHERE relname = 'reports';
    
    IF rls_enabled THEN
        RAISE NOTICE 'RLS está habilitado na tabela reports';
    ELSE
        RAISE NOTICE 'RLS NÃO está habilitado na tabela reports';
    END IF;
END $$;

-- 5. Inserir denúncia de teste simples
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

-- 6. Verificar se a denúncia foi inserida
DO $$
DECLARE
    report_count integer;
    test_report record;
BEGIN
    SELECT COUNT(*) INTO report_count FROM reports;
    RAISE NOTICE 'Total de denúncias após correção: %', report_count;
    
    IF report_count > 0 THEN
        SELECT * INTO test_report FROM reports ORDER BY created_at DESC LIMIT 1;
        RAISE NOTICE 'Última denúncia: ID=%, Tipo=%, Status=%, Descrição=%', 
            test_report.id,
            test_report.report_type,
            test_report.status,
            LEFT(test_report.description, 50);
    END IF;
END $$;
