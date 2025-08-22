-- =====================================================
-- CORREÇÃO FINAL DAS POLÍTICAS RLS - MÉTODO ROBUSTO
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

-- 2. LIMPEZA COMPLETA
DO $$
BEGIN
    RAISE NOTICE '=== LIMPEZA COMPLETA ===';
    
    -- Desabilitar RLS
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS desabilitado';
    
    -- Remover TODAS as políticas (incluindo as que podem ter nomes diferentes)
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
    DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
    DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.profiles;
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    
    RAISE NOTICE '✅ Todas as políticas removidas';
    
    -- Verificar se não há mais políticas
    RAISE NOTICE '🔒 Políticas restantes: %', (
        SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles'
    );
END $$;

-- 3. TESTAR ACESSO SEM RLS
DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    RAISE NOTICE '=== TESTANDO ACESSO SEM RLS ===';
    
    BEGIN
        SELECT COUNT(*) INTO profile_count FROM public.profiles LIMIT 1;
        RAISE NOTICE '✅ Acesso sem RLS funcionando: % registros', profile_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao acessar sem RLS: %', SQLERRM;
        RETURN;
    END;
END $$;

-- 4. HABILITAR RLS NOVAMENTE
DO $$
BEGIN
    RAISE NOTICE '=== HABILITANDO RLS ===';
    
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS habilitado novamente';
    
    -- Verificar se RLS está ativo
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true) THEN
        RAISE NOTICE '✅ RLS confirmado como habilitado';
    ELSE
        RAISE NOTICE '❌ RLS não foi habilitado corretamente';
    END IF;
END $$;

-- 5. CRIAR POLÍTICAS CORRETAS
DO $$
BEGIN
    RAISE NOTICE '=== CRIANDO POLÍTICAS ===';
    
    -- Política para SELECT (usuário pode ver seu próprio perfil)
    CREATE POLICY "profiles_select_policy" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
    RAISE NOTICE '✅ Política SELECT criada';
    
    -- Política para INSERT (usuário pode inserir seu próprio perfil)
    CREATE POLICY "profiles_insert_policy" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    RAISE NOTICE '✅ Política INSERT criada';
    
    -- Política para UPDATE (usuário pode atualizar seu próprio perfil)
    CREATE POLICY "profiles_update_policy" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    RAISE NOTICE '✅ Política UPDATE criada';
    
    -- Política para DELETE (usuário pode deletar seu próprio perfil)
    CREATE POLICY "profiles_delete_policy" ON public.profiles
        FOR DELETE USING (auth.uid() = id);
    RAISE NOTICE '✅ Política DELETE criada';
    
    RAISE NOTICE '✅ Todas as políticas foram criadas';
END $$;

-- 6. VERIFICAÇÃO FINAL
DO $$
DECLARE
    policy_count INTEGER;
    pol RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    
    -- Contar políticas
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'profiles';
    RAISE NOTICE '🔒 Total de políticas: %', policy_count;
    
    -- Listar políticas criadas
    RAISE NOTICE '📋 Políticas criadas:';
    FOR pol IN 
        SELECT policyname, cmd, permissive
        FROM pg_policies 
        WHERE tablename = 'profiles'
        ORDER BY policyname
    LOOP
        RAISE NOTICE '  - %: % (%s)', 
            pol.policyname, 
            pol.cmd, 
            CASE WHEN pol.permissive = 't' THEN 'permissive' ELSE 'restrictive' END;
    END LOOP;
    
    -- Verificar RLS
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true) THEN
        RAISE NOTICE '✅ RLS confirmado como habilitado';
    ELSE
        RAISE NOTICE '❌ RLS não está habilitado';
    END IF;
    
    RAISE NOTICE '🎉 Correção das políticas RLS concluída com sucesso!';
END $$;






