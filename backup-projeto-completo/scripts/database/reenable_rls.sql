-- =====================================================
-- REABILITAR RLS APÓS TESTE
-- =====================================================

-- 1. VERIFICAR STATUS ATUAL
DO $$
BEGIN
    RAISE NOTICE '=== STATUS ATUAL ===';
    
    -- Verificar se RLS está desabilitado
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = false) THEN
        RAISE NOTICE '✅ RLS está desabilitado (como esperado)';
    ELSE
        RAISE NOTICE '❌ RLS não está desabilitado';
    END IF;
END $$;

-- 2. HABILITAR RLS NOVAMENTE
DO $$
BEGIN
    RAISE NOTICE '=== HABILITANDO RLS ===';
    
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS habilitado novamente';
    
    -- Verificar se RLS foi habilitado
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true) THEN
        RAISE NOTICE '✅ RLS confirmado como habilitado';
    ELSE
        RAISE NOTICE '❌ RLS não foi habilitado';
    END IF;
END $$;

-- 3. CRIAR POLÍTICAS SIMPLES
DO $$
BEGIN
    RAISE NOTICE '=== CRIANDO POLÍTICAS SIMPLES ===';
    
    -- Política para SELECT (usuário pode ver seu próprio perfil)
    CREATE POLICY "profiles_select_simple" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
    RAISE NOTICE '✅ Política SELECT criada';
    
    -- Política para INSERT (usuário pode inserir seu próprio perfil)
    CREATE POLICY "profiles_insert_simple" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    RAISE NOTICE '✅ Política INSERT criada';
    
    -- Política para UPDATE (usuário pode atualizar seu próprio perfil)
    CREATE POLICY "profiles_update_simple" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    RAISE NOTICE '✅ Política UPDATE criada';
    
    -- Política para DELETE (usuário pode deletar seu próprio perfil)
    CREATE POLICY "profiles_delete_simple" ON public.profiles
        FOR DELETE USING (auth.uid() = id);
    RAISE NOTICE '✅ Política DELETE criada';
    
    RAISE NOTICE '✅ Todas as políticas foram criadas';
END $$;

-- 4. VERIFICAÇÃO FINAL
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    
    -- Contar políticas
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'profiles';
    RAISE NOTICE '🔒 Total de políticas: %', policy_count;
    
    -- Verificar RLS
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true) THEN
        RAISE NOTICE '✅ RLS está habilitado';
    ELSE
        RAISE NOTICE '❌ RLS não está habilitado';
    END IF;
    
    RAISE NOTICE '🎉 RLS reabilitado com sucesso!';
    RAISE NOTICE '🚀 Sistema pronto para uso com segurança!';
END $$;






