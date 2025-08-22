-- 🔧 Script SIMPLES para corrigir RLS da tabela profiles
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar status atual
SELECT 'Status atual:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Verificar políticas existentes
SELECT 'Políticas existentes:' as info;
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. DESABILITAR RLS COMPLETAMENTE (temporariamente)
SELECT 'Desabilitando RLS...' as info;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se RLS foi desabilitado
SELECT 'Verificando RLS desabilitado:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 5. Verificar usuários existentes primeiro
SELECT 'Verificando usuários existentes:' as info;
SELECT id, email FROM auth.users LIMIT 3;

-- 6. Testar inserção SEM RLS (usando ID de usuário existente)
SELECT 'Testando inserção sem RLS...' as info;
-- Pegar o primeiro usuário existente para teste
WITH existing_user AS (
    SELECT id FROM auth.users LIMIT 1
)
INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    user_type, 
    phone, 
    cpf_cnpj,
    is_verified, 
    badge, 
    rating, 
    total_reviews, 
    is_available, 
    address, 
    profile_completed, 
    profile_completion_score,
    created_at, 
    updated_at
) 
SELECT 
    u.id,
    'teste@rls.com',
    'Usuário Teste RLS',
    'client',
    '11999999999',
    '12345678900',
    false,
    'bronze',
    0,
    0,
    true,
    '',
    false,
    0,
    NOW(),
    NOW()
FROM existing_user u
ON CONFLICT (id) DO NOTHING;

-- 7. Verificar se inserção funcionou
SELECT 'Verificando inserção:' as info;
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT id, email, full_name FROM profiles ORDER BY created_at DESC LIMIT 3;

-- 8. HABILITAR RLS novamente
SELECT 'Habilitando RLS...' as info;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 9. Criar política SIMPLES para inserção
SELECT 'Criando política de inserção...' as info;
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT 
    WITH CHECK (true);

-- 10. Criar política SIMPLES para visualização
SELECT 'Criando política de visualização...' as info;
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT 
    USING (true);

-- 11. Criar política SIMPLES para atualização
SELECT 'Criando política de atualização...' as info;
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE 
    USING (true);

-- 12. Verificar políticas criadas
SELECT 'Políticas finais:' as info;
SELECT policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 13. Verificar status final
SELECT 'Status final:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- ✅ RESULTADO ESPERADO:
-- - RLS habilitado
-- - 3 políticas criadas (INSERT, SELECT, UPDATE)
-- - Inserção de teste funcionando (usando ID de usuário existente)
-- - Criação de conta deve funcionar

-- 🚨 IMPORTANTE: Este script cria políticas PERMISSIVAS para teste
-- Em produção, você deve ajustar as políticas para serem mais restritivas
