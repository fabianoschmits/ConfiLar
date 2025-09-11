-- =====================================================
-- DIAGNÓSTICO COMPLETO DE PERFIS - CONFILAR V5
-- Baseado na estrutura real do banco de dados
-- =====================================================

-- =====================================================
-- PARTE 1: VERIFICAÇÃO GERAL DO SISTEMA
-- =====================================================

-- 1.1 Verificar se RLS está ativo na tabela profiles
SELECT 
    'STATUS RLS PROFILES' as verificacao,
    schemaname,
    tablename,
    rowsecurity as tem_rls
FROM pg_tables 
WHERE tablename = 'profiles';

-- 1.2 Verificar estrutura da tabela profiles
SELECT 
    'ESTRUTURA PROFILES' as verificacao,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- =====================================================
-- PARTE 2: ANÁLISE DE USUÁRIOS E PERFIS
-- =====================================================

-- 2.1 Contar usuários autenticados vs perfis criados
SELECT 
    'CONTAGEM USUÁRIOS' as verificacao,
    (SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '30 days') as usuarios_30_dias,
    (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days') as perfis_30_dias,
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM profiles) as total_perfis;

-- 2.2 Usuários sem perfil (últimos 30 dias)
SELECT 
    'USUÁRIOS SEM PERFIL' as verificacao,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'full_name' as nome_meta,
    u.raw_user_meta_data->>'user_type' as tipo_meta,
    u.raw_user_meta_data->>'phone' as telefone_meta,
    u.raw_user_meta_data->>'avatar_url' as avatar_meta
FROM auth.users u 
LEFT JOIN profiles p ON u.id = p.id 
WHERE p.id IS NULL 
  AND u.created_at >= NOW() - INTERVAL '30 days'
ORDER BY u.created_at DESC;

-- 2.3 Perfis incompletos (últimos 30 dias)
SELECT 
    'PERFIS INCOMPLETOS' as verificacao,
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.location_state,
    p.location_city,
    p.avatar_url,
    p.profile_completed,
    p.created_at
FROM profiles p
WHERE p.created_at >= NOW() - INTERVAL '30 days'
  AND (
    p.full_name IS NULL OR p.full_name = '' OR p.full_name = 'Usuário'
    OR p.phone IS NULL OR p.phone = ''
    OR p.location_state IS NULL OR p.location_state = ''
    OR p.location_city IS NULL OR p.location_city = ''
  )
ORDER BY p.created_at DESC;

-- =====================================================
-- PARTE 3: CORREÇÃO AUTOMÁTICA DE PROBLEMAS
-- =====================================================

-- 3.1 Criar perfis para usuários sem perfil (últimos 30 dias)
INSERT INTO profiles (
    id, email, full_name, user_type, phone, location_state, location_city, 
    professional_experience_years, is_verified, badge, rating, total_reviews, 
    is_available, profile_completed, avatar_url, professional_services, 
    professional_certifications, created_at, updated_at
) 
SELECT 
    u.id, 
    u.email, 
    COALESCE(u.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(u.raw_user_meta_data->>'user_type', 'client')::user_type,
    COALESCE(u.raw_user_meta_data->>'phone', ''),
    COALESCE(u.raw_user_meta_data->>'location_state', 'SP'),
    COALESCE(u.raw_user_meta_data->>'location_city', 'São Paulo'),
    COALESCE((u.raw_user_meta_data->>'experience_years')::INTEGER, 0),
    false, 
    'bronze', 
    0.00, 
    0, 
    true, 
    true, -- Marcar como completo
    COALESCE(u.raw_user_meta_data->>'avatar_url', NULL),
    '{}', 
    '{}', 
    u.created_at, 
    NOW()
FROM auth.users u 
LEFT JOIN profiles p ON u.id = p.id 
WHERE p.id IS NULL 
  AND u.created_at >= NOW() - INTERVAL '30 days'
ON CONFLICT (id) DO NOTHING;

-- 3.2 Atualizar perfis incompletos com dados do auth.users
UPDATE profiles 
SET 
    full_name = COALESCE(NULLIF(profiles.full_name, ''), NULLIF(profiles.full_name, 'Usuário'), u.raw_user_meta_data->>'full_name', 'Usuário'),
    phone = COALESCE(NULLIF(profiles.phone, ''), u.raw_user_meta_data->>'phone', ''),
    location_state = COALESCE(NULLIF(profiles.location_state, ''), u.raw_user_meta_data->>'location_state', 'SP'),
    location_city = COALESCE(NULLIF(profiles.location_city, ''), u.raw_user_meta_data->>'location_city', 'São Paulo'),
    avatar_url = COALESCE(profiles.avatar_url, u.raw_user_meta_data->>'avatar_url', NULL),
    profile_completed = true, -- Marcar como completo após atualização
    updated_at = NOW()
FROM auth.users u
WHERE profiles.id = u.id
  AND (
    profiles.full_name IS NULL OR profiles.full_name = '' OR profiles.full_name = 'Usuário'
    OR profiles.phone IS NULL OR profiles.phone = ''
    OR profiles.location_state IS NULL OR profiles.location_state = ''
    OR profiles.location_city IS NULL OR profiles.location_city = ''
  );

-- =====================================================
-- PARTE 4: VERIFICAÇÃO DE POLÍTICAS RLS
-- =====================================================

-- 4.1 Verificar políticas RLS da tabela profiles
SELECT 
    'POLÍTICAS RLS PROFILES' as verificacao,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY policyname;

-- 4.2 Verificar se há políticas problemáticas
SELECT 
    'ANÁLISE POLÍTICAS' as verificacao,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PROBLEMA: Nenhuma política RLS encontrada'
        WHEN COUNT(*) < 4 THEN 'ATENÇÃO: Poucas políticas RLS'
        ELSE 'OK: Políticas RLS adequadas'
    END as status_politicas,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- =====================================================
-- PARTE 5: TESTE DE FUNCIONAMENTO
-- =====================================================

-- 5.1 Testar inserção de perfil (simulação)
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    test_email text := 'teste-' || extract(epoch from now())::text || '@confilar.com';
BEGIN
    -- Inserir usuário de teste no auth.users (simulação)
    INSERT INTO auth.users (id, email, created_at, raw_user_meta_data)
    VALUES (
        test_user_id,
        test_email,
        NOW(),
        '{"full_name": "Usuário Teste", "user_type": "client", "phone": "11999999999", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=teste"}'::jsonb
    );
    
    -- Tentar inserir perfil
    INSERT INTO profiles (
        id, email, full_name, user_type, phone, location_state, location_city,
        avatar_url, profile_completed, created_at, updated_at
    ) VALUES (
        test_user_id,
        test_email,
        'Usuário Teste',
        'client'::user_type,
        '11999999999',
        'SP',
        'São Paulo',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=teste',
        true,
        NOW(),
        NOW()
    );
    
    -- Verificar se foi inserido
    IF EXISTS (SELECT 1 FROM profiles WHERE id = test_user_id) THEN
        RAISE NOTICE 'SUCESSO: Perfil de teste criado com sucesso';
    ELSE
        RAISE NOTICE 'ERRO: Falha ao criar perfil de teste';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM profiles WHERE id = test_user_id;
    DELETE FROM auth.users WHERE id = test_user_id;
    
END $$;

-- =====================================================
-- PARTE 6: VERIFICAÇÃO FINAL
-- =====================================================

-- 6.1 Verificar se ainda há usuários sem perfil
SELECT 
    'VERIFICAÇÃO FINAL' as verificacao,
    COUNT(*) as usuarios_sem_perfil_restantes
FROM auth.users u 
LEFT JOIN profiles p ON u.id = p.id 
WHERE p.id IS NULL 
  AND u.created_at >= NOW() - INTERVAL '30 days';

-- 6.2 Verificar perfis criados/atualizados hoje
SELECT 
    'PERFIS HOJE' as verificacao,
    COUNT(*) as perfis_criados_hoje,
    COUNT(CASE WHEN profile_completed = true THEN 1 END) as perfis_completos_hoje,
    COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as perfis_com_avatar_hoje
FROM profiles 
WHERE DATE(created_at) = CURRENT_DATE 
   OR DATE(updated_at) = CURRENT_DATE;

-- 6.3 Resumo final
SELECT 
    'RESUMO FINAL' as verificacao,
    (SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '30 days') as usuarios_30_dias,
    (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days') as perfis_30_dias,
    (SELECT COUNT(*) FROM profiles WHERE profile_completed = true AND created_at >= NOW() - INTERVAL '30 days') as perfis_completos_30_dias,
    (SELECT COUNT(*) FROM profiles WHERE avatar_url IS NOT NULL AND created_at >= NOW() - INTERVAL '30 days') as perfis_com_avatar_30_dias;

-- =====================================================
-- PARTE 7: RECOMENDAÇÕES
-- =====================================================

-- 7.1 Verificar se há problemas de performance
SELECT 
    'VERIFICAÇÃO PERFORMANCE' as verificacao,
    schemaname,
    relname as tablename,
    n_tup_ins as insercoes,
    n_tup_upd as atualizacoes,
    n_tup_del as exclusoes,
    n_live_tup as registros_vivos,
    n_dead_tup as registros_mortos
FROM pg_stat_user_tables 
WHERE relname = 'profiles';

-- 7.2 Verificar índices da tabela profiles
SELECT 
    'ÍNDICES PROFILES' as verificacao,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'profiles' 
  AND schemaname = 'public';

-- =====================================================
-- FIM DO DIAGNÓSTICO
-- =====================================================

-- Instruções para o usuário:
-- 1. Execute este script completo no Supabase SQL Editor
-- 2. Verifique os resultados de cada seção
-- 3. Se houver erros, me envie a mensagem de erro específica
-- 4. Se tudo funcionar, teste criando uma nova conta no sistema
