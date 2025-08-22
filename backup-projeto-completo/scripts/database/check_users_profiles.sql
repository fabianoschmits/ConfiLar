-- =====================================================
-- VERIFICAÇÃO DE USUÁRIOS E PERFIS
-- =====================================================

-- Verificar usuários na tabela auth.users
SELECT 
    'USUÁRIOS AUTH' as info,
    COUNT(*) as total
FROM auth.users;

-- Verificar perfis na tabela profiles
SELECT 
    'PERFIS' as info,
    COUNT(*) as total
FROM public.profiles;

-- Verificar se há usuários sem perfil
SELECT 
    'USUÁRIOS SEM PERFIL' as info,
    COUNT(*) as total
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Mostrar alguns perfis existentes
SELECT 
    'PERFIS EXISTENTES' as info,
    id,
    full_name,
    user_type,
    created_at
FROM public.profiles
LIMIT 5;






