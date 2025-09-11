-- =====================================================
-- SCRIPT DE VERIFICAÇÃO DE PERFIS DE USUÁRIOS
-- ConfiLar - Verificar se dados estão sendo salvos corretamente
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA PROFILES
SELECT 
    'ESTRUTURA DA TABELA PROFILES' as verificacao,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. VERIFICAR USUÁRIOS RECENTES (últimos 7 dias)
SELECT 
    'USUÁRIOS RECENTES' as verificacao,
    u.id,
    u.email,
    u.created_at as usuario_criado_em,
    p.id as perfil_id,
    p.full_name,
    p.user_type,
    p.phone,
    p.location_state,
    p.location_city,
    p.profile_completed,
    p.created_at as perfil_criado_em,
    CASE 
        WHEN p.id IS NULL THEN '❌ SEM PERFIL'
        WHEN p.full_name IS NULL OR p.full_name = '' THEN '⚠️ PERFIL INCOMPLETO'
        WHEN p.profile_completed = false THEN '⚠️ PERFIL NÃO FINALIZADO'
        ELSE '✅ PERFIL OK'
    END as status_perfil
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.created_at >= NOW() - INTERVAL '7 days'
ORDER BY u.created_at DESC;

-- 3. VERIFICAR USUÁRIOS SEM PERFIL
SELECT 
    'USUÁRIOS SEM PERFIL' as verificacao,
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    u.last_sign_in_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 4. VERIFICAR PERFIS INCOMPLETOS
SELECT 
    'PERFIS INCOMPLETOS' as verificacao,
    p.id,
    p.email,
    p.full_name,
    p.user_type,
    p.phone,
    p.location_state,
    p.location_city,
    p.profile_completed,
    p.created_at,
    p.updated_at
FROM profiles p
WHERE p.full_name IS NULL 
   OR p.full_name = ''
   OR p.full_name = 'Usuário'
   OR p.profile_completed = false
ORDER BY p.created_at DESC;

-- 5. VERIFICAR DADOS DE AVATAR
SELECT 
    'DADOS DE AVATAR' as verificacao,
    p.id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.gender,
    CASE 
        WHEN p.avatar_url IS NULL THEN '❌ SEM AVATAR'
        WHEN p.avatar_url LIKE '%dicebear%' THEN '🎨 AVATAR DICEBEAR'
        WHEN p.avatar_url LIKE '%storage%' THEN '📷 AVATAR UPLOAD'
        ELSE '❓ AVATAR DESCONHECIDO'
    END as tipo_avatar
FROM profiles p
WHERE p.created_at >= NOW() - INTERVAL '7 days'
ORDER BY p.created_at DESC;

-- 6. VERIFICAR POLÍTICAS RLS DA TABELA PROFILES
SELECT 
    'POLÍTICAS RLS PROFILES' as verificacao,
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

-- 7. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT 
    'STATUS RLS PROFILES' as verificacao,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'profiles';

-- 8. CONTAR USUÁRIOS POR STATUS
SELECT 
    'ESTATÍSTICAS GERAIS' as verificacao,
    COUNT(*) as total_usuarios,
    COUNT(p.id) as usuarios_com_perfil,
    COUNT(*) - COUNT(p.id) as usuarios_sem_perfil,
    COUNT(CASE WHEN p.profile_completed = true THEN 1 END) as perfis_completos,
    COUNT(CASE WHEN p.profile_completed = false THEN 1 END) as perfis_incompletos
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;

-- 9. VERIFICAR ÚLTIMOS LOGINS
SELECT 
    'ÚLTIMOS LOGINS' as verificacao,
    u.id,
    u.email,
    u.last_sign_in_at,
    u.created_at,
    p.full_name,
    p.profile_completed
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.last_sign_in_at IS NOT NULL
ORDER BY u.last_sign_in_at DESC
LIMIT 10;

-- 10. VERIFICAR ERROS DE INSERÇÃO (se houver logs)
SELECT 
    'VERIFICAÇÃO DE INTEGRIDADE' as verificacao,
    'Verificar se há constraints violadas' as observacao;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Verifique cada seção para identificar problemas
-- 3. Foque nas seções que mostram "❌" ou "⚠️"
-- 4. Se houver usuários sem perfil, há problema no código
-- 5. Se houver perfis incompletos, verificar campos obrigatórios
-- =====================================================
