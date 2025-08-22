-- =====================================================
-- VERIFICAÇÃO DO STATUS ATUAL DAS POLÍTICAS RLS
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DA TABELA PROFILES ===';
    
    -- Verificar se a tabela existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE NOTICE '✅ Tabela profiles existe';
        
        -- Verificar se RLS está habilitado
        IF EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'profiles' 
            AND rowsecurity = true
        ) THEN
            RAISE NOTICE '✅ RLS está habilitado';
        ELSE
            RAISE NOTICE '❌ RLS não está habilitado';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ Tabela profiles não existe';
        RETURN;
    END IF;
END $$;

-- 2. VERIFICAR POLÍTICAS EXISTENTES
DO $$
DECLARE
    pol RECORD;
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DAS POLÍTICAS ===';
    
    -- Contar políticas
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'profiles';
    RAISE NOTICE '🔒 Total de políticas: %', policy_count;
    
    -- Listar políticas existentes
    IF policy_count > 0 THEN
        RAISE NOTICE '📋 Políticas encontradas:';
        FOR pol IN 
            SELECT policyname, cmd, permissive, roles
            FROM pg_policies 
            WHERE tablename = 'profiles'
            ORDER BY policyname
        LOOP
            RAISE NOTICE '  - %: % (%s) - Roles: %', 
                pol.policyname, 
                pol.cmd, 
                CASE WHEN pol.permissive = 't' THEN 'permissive' ELSE 'restrictive' END,
                pol.roles;
        END LOOP;
    ELSE
        RAISE NOTICE '⚠️ Nenhuma política encontrada!';
    END IF;
END $$;

-- 3. TESTAR CONSULTA SIMPLES
DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    RAISE NOTICE '=== TESTANDO CONSULTA SIMPLES ===';
    
    BEGIN
        SELECT COUNT(*) INTO profile_count FROM public.profiles LIMIT 1;
        RAISE NOTICE '✅ Consulta simples funcionando: % registros', profile_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Consulta simples falhou: %', SQLERRM;
    END;
END $$;

-- 4. VERIFICAR USUÁRIOS AUTENTICADOS
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DE USUÁRIOS ===';
    
    -- Contar usuários em auth.users
    SELECT COUNT(*) INTO user_count FROM auth.users;
    RAISE NOTICE '👥 Total de usuários em auth.users: %', user_count;
    
    -- Contar perfis em public.profiles
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    RAISE NOTICE '👤 Total de perfis em public.profiles: %', user_count;
END $$;

-- 5. VERIFICAR PERMISSÕES
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DE PERMISSÕES ===';
    
    -- Verificar se o usuário atual tem acesso
    RAISE NOTICE '🔐 Usuário atual: %', current_user;
    RAISE NOTICE '🔐 Schema atual: %', current_schema;
    
    -- Verificar se pode ver a tabela
    IF EXISTS (
        SELECT 1 FROM information_schema.table_privileges 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND grantee = current_user
    ) THEN
        RAISE NOTICE '✅ Usuário tem privilégios na tabela';
    ELSE
        RAISE NOTICE '❌ Usuário NÃO tem privilégios na tabela';
    END IF;
END $$;






