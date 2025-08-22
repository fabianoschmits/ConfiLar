-- =====================================================
-- VERIFICAÇÃO SIMPLES DA TABELA PROFILES
-- =====================================================

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT 
    'Tabela profiles' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as status;

-- 2. VERIFICAR ESTRUTURA DAS COLUNAS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. VERIFICAR STATUS DO RLS
SELECT 
    'RLS Status' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true) 
        THEN 'HABILITADO' 
        ELSE 'DESABILITADO' 
    END as status;

-- 4. CONTAR POLÍTICAS
SELECT 
    'Políticas RLS' as item,
    COUNT(*) as total
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. CONTAR PERFIS E USUÁRIOS
SELECT 
    'Perfis' as tipo,
    COUNT(*) as total
FROM public.profiles
UNION ALL
SELECT 
    'Usuários Auth' as tipo,
    COUNT(*) as total
FROM auth.users;

-- 6. TESTAR OPERAÇÕES BÁSICAS
SELECT 
    'Teste SELECT' as operacao,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.profiles LIMIT 1) 
        THEN 'FUNCIONANDO' 
        ELSE 'FALHOU' 
    END as resultado;

-- 7. VERIFICAR DADOS DE EXEMPLO
SELECT 
    id,
    email,
    full_name,
    user_type,
    created_at
FROM public.profiles 
LIMIT 5;






