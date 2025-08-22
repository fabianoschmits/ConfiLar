-- =====================================================
-- VERIFICAÇÃO DA ESTRUTURA DA TABELA PROFILES
-- =====================================================

-- 1. VERIFICAR SE A TABELA EXISTE
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DA TABELA ===';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE NOTICE '✅ Tabela profiles existe';
    ELSE
        RAISE NOTICE '❌ Tabela profiles NÃO existe';
        RETURN;
    END IF;
END $$;

-- 2. VERIFICAR ESTRUTURA DAS COLUNAS
DO $$
DECLARE
    col RECORD;
BEGIN
    RAISE NOTICE '=== ESTRUTURA DAS COLUNAS ===';
    
    FOR col IN 
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: % (nullable: %, default: %, max_length: %)', 
            col.column_name, 
            col.data_type, 
            col.is_nullable, 
            col.column_default,
            col.character_maximum_length;
    END LOOP;
END $$;

-- 3. VERIFICAR RLS
DO $$
BEGIN
    RAISE NOTICE '=== STATUS DO RLS ===';
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true) THEN
        RAISE NOTICE '✅ RLS está habilitado';
    ELSE
        RAISE NOTICE '❌ RLS está desabilitado';
    END IF;
    
    -- Contar políticas
    RAISE NOTICE '🔒 Políticas existentes: %', (
        SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles'
    );
END $$;

-- 4. VERIFICAR DADOS EXISTENTES
DO $$
DECLARE
    profile_count INTEGER;
    user_count INTEGER;
BEGIN
    RAISE NOTICE '=== DADOS EXISTENTES ===';
    
    -- Contar perfis
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    RAISE NOTICE '👤 Total de perfis: %', profile_count;
    
    -- Contar usuários
    SELECT COUNT(*) INTO user_count FROM auth.users;
    RAISE NOTICE '👥 Total de usuários: %', user_count;
    
    -- Mostrar alguns perfis de exemplo
    IF profile_count > 0 THEN
        RAISE NOTICE '📋 Exemplos de perfis:';
        RAISE NOTICE '  - IDs: %', (
            SELECT string_agg(id::text, ', ') 
            FROM public.profiles 
            LIMIT 5
        );
    END IF;
END $$;

-- 5. TESTAR OPERAÇÕES BÁSICAS
DO $$
DECLARE
    test_result INTEGER;
BEGIN
    RAISE NOTICE '=== TESTE DE OPERAÇÕES ===';
    
    -- Testar SELECT
    BEGIN
        SELECT COUNT(*) INTO test_result FROM public.profiles LIMIT 1;
        RAISE NOTICE '✅ SELECT funcionando: % registros', test_result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ SELECT falhou: %', SQLERRM;
    END;
    
    -- Testar UPDATE (simulado)
    BEGIN
        UPDATE public.profiles 
        SET updated_at = NOW() 
        WHERE id IN (SELECT id FROM public.profiles LIMIT 1);
        RAISE NOTICE '✅ UPDATE funcionando';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ UPDATE falhou: %', SQLERRM;
    END;
    
    -- Testar INSERT (simulado)
    BEGIN
        -- Tentar inserir um registro de teste (será revertido)
        INSERT INTO public.profiles (id, email, full_name, user_type, created_at, updated_at)
        VALUES (
            gen_random_uuid(), 
            'test@example.com', 
            'Usuário Teste', 
            'client', 
            NOW(), 
            NOW()
        );
        RAISE NOTICE '✅ INSERT funcionando';
        
        -- Reverter a inserção de teste
        DELETE FROM public.profiles WHERE email = 'test@example.com';
        RAISE NOTICE '✅ DELETE funcionando';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ INSERT/DELETE falhou: %', SQLERRM;
    END;
END $$;

-- 6. VERIFICAÇÃO FINAL
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    
    RAISE NOTICE '📊 Tabela profiles: %', (
        CASE 
            WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') 
            THEN 'EXISTE' 
            ELSE 'NÃO EXISTE' 
        END
    );
    
    RAISE NOTICE '🔒 RLS: %', (
        CASE 
            WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true) 
            THEN 'HABILITADO' 
            ELSE 'DESABILITADO' 
        END
    );
    
    RAISE NOTICE '🔐 Políticas: %', (
        SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles'
    );
    
    RAISE NOTICE '👤 Perfis: %', (
        SELECT COUNT(*) FROM public.profiles
    );
    
    RAISE NOTICE '🚀 Verificação concluída!';
END $$;






