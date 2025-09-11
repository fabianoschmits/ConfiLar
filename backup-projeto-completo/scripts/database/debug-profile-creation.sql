-- =====================================================
-- SCRIPT PARA VERIFICAR PROBLEMAS DE CRIAÇÃO DE PERFIS
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA PROFILES
-- =====================================================
SELECT 
    'ESTRUTURA DA TABELA PROFILES' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR PERFIS EXISTENTES
-- =====================================================
SELECT 
    'PERFIS EXISTENTES' as info,
    id,
    email,
    full_name,
    user_type,
    phone,
    cpf_cnpj,
    birth_date,
    location_state,
    location_city,
    neighborhood,
    bio,
    avatar_url,
    created_at,
    updated_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;

-- 3. VERIFICAR SE HÁ PERFIS COM DADOS INCOMPLETOS
-- =====================================================
SELECT 
    'PERFIS COM DADOS INCOMPLETOS' as info,
    id,
    email,
    full_name,
    user_type,
    phone,
    cpf_cnpj,
    birth_date,
    location_state,
    location_city,
    neighborhood,
    bio,
    avatar_url,
    CASE 
        WHEN full_name = 'Usuário' THEN '❌ Nome padrão'
        WHEN phone = '' THEN '❌ Telefone vazio'
        WHEN cpf_cnpj = '' THEN '❌ CPF/CNPJ vazio'
        WHEN birth_date IS NULL THEN '❌ Data nascimento vazia'
        WHEN location_state = '' THEN '❌ Estado vazio'
        WHEN location_city = '' THEN '❌ Cidade vazia'
        ELSE '✅ Dados completos'
    END as status_dados
FROM profiles 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- 4. VERIFICAR SE HÁ PROBLEMAS DE RLS NA TABELA PROFILES
-- =====================================================
SELECT 
    'STATUS RLS PROFILES' as info,
    tablename,
    CASE 
        WHEN rowsecurity THEN '❌ RLS ATIVO'
        ELSE '✅ RLS DESABILITADO'
    END as status_rls
FROM pg_tables 
WHERE tablename = 'profiles'
AND schemaname = 'public';

-- 5. VERIFICAR POLÍTICAS RLS NA TABELA PROFILES
-- =====================================================
SELECT 
    'POLÍTICAS RLS PROFILES' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
AND schemaname = 'public';

-- 6. TESTE DE INSERÇÃO DE PERFIL (SIMULAÇÃO)
-- =====================================================
-- Este teste verifica se conseguimos inserir um perfil de teste
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    insert_result RECORD;
BEGIN
    -- Tentar inserir um perfil de teste
    INSERT INTO profiles (
        id,
        email,
        full_name,
        user_type,
        phone,
        cpf_cnpj,
        birth_date,
        location_state,
        location_city,
        neighborhood,
        bio,
        avatar_url,
        created_at,
        updated_at
    ) VALUES (
        test_user_id,
        'teste@exemplo.com',
        'Usuário Teste',
        'client',
        '11999999999',
        '12345678901',
        '1990-01-01',
        'SP',
        'São Paulo',
        'Centro',
        'Perfil de teste',
        'https://api.dicebear.com/7.x/pixel-art/svg?seed=teste',
        NOW(),
        NOW()
    ) RETURNING * INTO insert_result;
    
    RAISE NOTICE '✅ Teste de inserção bem-sucedido: %', insert_result.full_name;
    
    -- Limpar o teste
    DELETE FROM profiles WHERE id = test_user_id;
    RAISE NOTICE '🧹 Perfil de teste removido';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro no teste de inserção: %', SQLERRM;
END $$;

-- 7. VERIFICAR LOGS DE ERRO RECENTES
-- =====================================================
SELECT 
    'VERIFICAÇÃO FINAL' as info,
    'Se houver erros acima, eles indicam problemas específicos' as observacao,
    'Verifique se RLS está desabilitado e se não há políticas conflitantes' as solucao;
