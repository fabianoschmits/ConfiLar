-- =====================================================
-- TESTE SEM RLS - DESABILITAR TEMPORARIAMENTE
-- =====================================================

-- 1. VERIFICAR STATUS ATUAL
DO $$
BEGIN
    RAISE NOTICE '=== STATUS ATUAL ===';
    
    -- Verificar se a tabela existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE NOTICE '✅ Tabela profiles existe';
    ELSE
        RAISE NOTICE '❌ Tabela profiles não existe';
        RETURN;
    END IF;
    
    -- Verificar RLS
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true) THEN
        RAISE NOTICE '✅ RLS está habilitado';
    ELSE
        RAISE NOTICE '❌ RLS não está habilitado';
    END IF;
    
    -- Contar políticas
    RAISE NOTICE '🔒 Políticas existentes: %', (
        SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles'
    );
END $$;

-- 2. DESABILITAR RLS TEMPORARIAMENTE
DO $$
BEGIN
    RAISE NOTICE '=== DESABILITANDO RLS TEMPORARIAMENTE ===';
    
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS desabilitado temporariamente';
    
    -- Verificar se RLS foi desabilitado
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = false) THEN
        RAISE NOTICE '✅ RLS confirmado como desabilitado';
    ELSE
        RAISE NOTICE '❌ RLS não foi desabilitado';
    END IF;
END $$;

-- 3. TESTAR ACESSO SEM RLS
DO $$
DECLARE
    profile_count INTEGER;
    user_count INTEGER;
BEGIN
    RAISE NOTICE '=== TESTANDO ACESSO SEM RLS ===';
    
    -- Contar perfis
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    RAISE NOTICE '👤 Total de perfis: %', profile_count;
    
    -- Contar usuários
    SELECT COUNT(*) INTO user_count FROM auth.users;
    RAISE NOTICE '👥 Total de usuários: %', user_count;
    
    -- Testar consulta simples
    BEGIN
        SELECT COUNT(*) INTO profile_count FROM public.profiles LIMIT 1;
        RAISE NOTICE '✅ Consulta simples funcionando: % registros', profile_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro na consulta: %', SQLERRM;
    END;
END $$;

-- 4. VERIFICAÇÃO FINAL
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    
    -- Verificar RLS
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = false) THEN
        RAISE NOTICE '✅ RLS está DESABILITADO - Teste agora!';
        RAISE NOTICE '📋 Tente editar o perfil e salvar';
        RAISE NOTICE '📋 Tente cadastrar um profissional';
        RAISE NOTICE '📋 Tente selecionar serviços';
    ELSE
        RAISE NOTICE '❌ RLS ainda está habilitado';
    END IF;
    
    RAISE NOTICE '🚀 Sistema pronto para teste sem RLS!';
    RAISE NOTICE '⚠️ IMPORTANTE: RLS está desabilitado temporariamente';
    RAISE NOTICE '⚠️ Execute o script de reabilitação depois do teste';
END $$;






