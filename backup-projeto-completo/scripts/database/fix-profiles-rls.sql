-- 🔧 Script para corrigir políticas RLS da tabela profiles
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Desabilitar RLS temporariamente para correção
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON profiles;

-- 4. Criar políticas RLS corretas
-- Política para permitir inserção de perfis durante cadastro
CREATE POLICY "Enable insert for authenticated users during signup" ON profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Política para permitir visualização de perfis próprios
CREATE POLICY "Enable read access for users based on user_id" ON profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- Política para permitir atualização de perfis próprios
CREATE POLICY "Enable update for users based on user_id" ON profiles
    FOR UPDATE 
    USING (auth.uid() = id);

-- Política para permitir exclusão de perfis próprios
CREATE POLICY "Enable delete for users based on user_id" ON profiles
    FOR DELETE 
    USING (auth.uid() = id);

-- 5. Habilitar RLS novamente
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Verificar políticas criadas
SELECT 
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

-- 7. Testar inserção (opcional - remover após teste)
-- INSERT INTO profiles (id, email, full_name, user_type, phone, cpf_cnpj, 
--                      birth_date, location_state, location_city, neighborhood, 
--                      bio, professional_services, professional_experience_years,
--                      is_verified, badge, rating, total_reviews, is_available, 
--                      address, profile_completed, profile_completion_score,
--                      created_at, updated_at)
-- VALUES (
--     'test-user-id',
--     'test@example.com',
--     'Usuário Teste',
--     'client',
--     '11999999999',
--     '12345678900',
--     null,
--     'São Paulo',
--     'São Paulo',
--     'Centro',
--     null,
--     '{}',
--     null,
--     false,
--     'bronze',
--     0,
--     0,
--     true,
--     '',
--     false,
--     0,
--     NOW(),
--     NOW()
-- );

-- 8. Verificar se a tabela tem os campos corretos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 9. Verificar se há dados na tabela
SELECT COUNT(*) as total_profiles FROM profiles;

-- 10. Verificar estrutura da tabela
-- \d profiles; -- Comando psql não funciona no SQL Editor do Supabase

-- ✅ Após executar este script:
-- 1. As políticas RLS estarão configuradas corretamente
-- 2. Usuários poderão inserir seus próprios perfis durante o cadastro
-- 3. Usuários poderão visualizar, atualizar e excluir apenas seus próprios perfis
-- 4. A criação de conta deve funcionar sem erros de RLS

-- 🚨 IMPORTANTE: Execute este script no SQL Editor do Supabase Dashboard
-- Não execute em produção sem testar primeiro!
