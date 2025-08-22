-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS DA TABELA PROFILES
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT 
    'ESTRUTURA ATUAL' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. VERIFICAR POLÍTICAS EXISTENTES
SELECT 
    'POLÍTICAS EXISTENTES' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. REMOVER POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 4. CRIAR POLÍTICAS CORRETAS
-- Política para visualizar perfil (próprio usuário)
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para atualizar perfil (próprio usuário)
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para inserir perfil (próprio usuário)
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
SELECT 
    'POLÍTICAS CRIADAS' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. TESTAR CONSULTA SIMPLES
-- Esta consulta deve funcionar para usuários autenticados
SELECT 
    'TESTE DE CONSULTA' as info,
    COUNT(*) as total_profiles
FROM public.profiles;






