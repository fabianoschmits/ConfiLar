-- =====================================================
-- CORREÇÃO COMPLETA DAS POLÍTICAS RLS DA TABELA PROFILES
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DA ESTRUTURA ===';
    
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
        
        -- Contar políticas existentes
        RAISE NOTICE '🔒 Políticas existentes: %', (
            SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles'
        );
        
    ELSE
        RAISE NOTICE '❌ Tabela profiles não existe';
        RETURN;
    END IF;
END $$;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
DO $$
DECLARE
    pol RECORD;
BEGIN
    RAISE NOTICE '=== REMOVENDO POLÍTICAS ANTIGAS ===';
    
    -- Listar políticas existentes
    RAISE NOTICE '📋 Políticas encontradas:';
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        RAISE NOTICE '  - %', pol.policyname;
    END LOOP;
    
    -- Remover todas as políticas
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
    DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
    DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.profiles;
    
    RAISE NOTICE '✅ Todas as políticas antigas foram removidas';
END $$;

-- 3. DESABILITAR RLS TEMPORARIAMENTE
DO $$
BEGIN
    RAISE NOTICE '=== DESABILITANDO RLS TEMPORARIAMENTE ===';
    
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS desabilitado temporariamente';
    
    -- Testar acesso sem RLS
    RAISE NOTICE '🧪 Testando acesso sem RLS...';
    BEGIN
        PERFORM COUNT(*) FROM public.profiles LIMIT 1;
        RAISE NOTICE '✅ Acesso sem RLS funcionando';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao acessar sem RLS: %', SQLERRM;
    END;
END $$;

-- 4. HABILITAR RLS NOVAMENTE
DO $$
BEGIN
    RAISE NOTICE '=== HABILITANDO RLS NOVAMENTE ===';
    
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS habilitado novamente';
END $$;

-- 5. CRIAR POLÍTICAS CORRETAS
DO $$
BEGIN
    RAISE NOTICE '=== CRIANDO NOVAS POLÍTICAS ===';
    
    -- Política para visualizar perfil (próprio usuário)
    CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
    RAISE NOTICE '✅ Política SELECT criada';
    
    -- Política para atualizar perfil (próprio usuário)
    CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    RAISE NOTICE '✅ Política UPDATE criada';
    
    -- Política para inserir perfil (próprio usuário)
    CREATE POLICY "Users can insert own profile" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    RAISE NOTICE '✅ Política INSERT criada';
    
    -- Política para deletar perfil (próprio usuário)
    CREATE POLICY "Users can delete own profile" ON public.profiles
        FOR DELETE USING (auth.uid() = id);
    RAISE NOTICE '✅ Política DELETE criada';
    
    RAISE NOTICE '✅ Todas as políticas foram criadas com sucesso';
END $$;

-- 6. VERIFICAR POLÍTICAS CRIADAS
DO $$
DECLARE
    pol RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DAS POLÍTICAS ===';
    
    -- Contar políticas
    RAISE NOTICE '🔒 Total de políticas: %', (
        SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles'
    );
    
    -- Listar políticas criadas
    RAISE NOTICE '📋 Políticas criadas:';
    FOR pol IN 
        SELECT policyname, cmd, permissive 
        FROM pg_policies 
        WHERE tablename = 'profiles'
        ORDER BY policyname
    LOOP
        RAISE NOTICE '  - %: % (%s)', pol.policyname, pol.cmd, 
            CASE WHEN pol.permissive = 't' THEN 'permissive' ELSE 'restrictive' END;
    END LOOP;
END $$;

-- 7. TESTAR CONSULTAS
DO $$
DECLARE
    test_user_id UUID;
    test_result INTEGER;
BEGIN
    RAISE NOTICE '=== TESTANDO CONSULTAS ===';
    
    -- Pegar um usuário para teste
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE '👤 Usuário de teste: %', test_user_id;
        
        -- Testar SELECT
        BEGIN
            SELECT COUNT(*) INTO test_result FROM public.profiles WHERE id = test_user_id;
            RAISE NOTICE '✅ SELECT funcionando: % registros encontrados', test_result;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ SELECT falhou: %', SQLERRM;
        END;
        
        -- Testar UPDATE (simulado)
        BEGIN
            UPDATE public.profiles 
            SET updated_at = NOW() 
            WHERE id = test_user_id;
            RAISE NOTICE '✅ UPDATE funcionando';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ UPDATE falhou: %', SQLERRM;
        END;
        
    ELSE
        RAISE NOTICE '⚠️ Nenhum usuário encontrado para teste';
    END IF;
END $$;

-- 8. VERIFICAÇÃO FINAL
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    
    -- Verificar estrutura
    RAISE NOTICE '📊 Tabela profiles: %', (
        CASE 
            WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') 
            THEN 'EXISTE' 
            ELSE 'NÃO EXISTE' 
        END
    );
    
    -- Verificar RLS
    RAISE NOTICE '🔒 RLS: %', (
        CASE 
            WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true) 
            THEN 'HABILITADO' 
            ELSE 'DESABILITADO' 
        END
    );
    
    -- Verificar políticas
    RAISE NOTICE '🔐 Políticas: %', (
        SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles'
    );
    
    RAISE NOTICE '✅ Correção das políticas RLS concluída!';
END $$;
