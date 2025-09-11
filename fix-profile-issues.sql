-- =====================================================
-- SCRIPT DE CORREÇÃO DE PROBLEMAS DE PERFIL
-- ConfiLar - Corrigir problemas de criação de perfil
-- =====================================================

-- 1. VERIFICAR E CORRIGIR ESTRUTURA DA TABELA PROFILES
-- Adicionar colunas que podem estar faltando
DO $$
BEGIN
    -- Adicionar coluna gender se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'gender') THEN
        ALTER TABLE profiles ADD COLUMN gender VARCHAR(10);
        RAISE NOTICE 'Coluna gender adicionada';
    END IF;
    
    -- Adicionar coluna avatar_url se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Coluna avatar_url adicionada';
    END IF;
    
    -- Adicionar coluna profile_completed se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'profile_completed') THEN
        ALTER TABLE profiles ADD COLUMN profile_completed BOOLEAN DEFAULT false;
        RAISE NOTICE 'Coluna profile_completed adicionada';
    END IF;
END $$;

-- 2. DESABILITAR RLS TEMPORARIAMENTE PARA TESTE
-- ATENÇÃO: Execute apenas se necessário e reative depois
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. CRIAR PERFIS PARA USUÁRIOS QUE NÃO TÊM
INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    user_type, 
    phone, 
    location_state, 
    location_city, 
    professional_experience_years,
    is_verified, 
    badge, 
    rating, 
    total_reviews, 
    is_available,
    profile_completed,
    gender,
    created_at, 
    updated_at
)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Usuário'),
    COALESCE(u.raw_user_meta_data->>'user_type', 'client'),
    COALESCE(u.raw_user_meta_data->>'phone', ''),
    COALESCE(u.raw_user_meta_data->>'location_state', 'SP'),
    COALESCE(u.raw_user_meta_data->>'location_city', 'São Paulo'),
    COALESCE((u.raw_user_meta_data->>'experience_years')::INTEGER, 0),
    false,
    'bronze',
    0,
    0,
    true,
    false, -- Perfil não completado inicialmente
    COALESCE(u.raw_user_meta_data->>'gender', 'male'),
    u.created_at,
    NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
  AND u.created_at >= NOW() - INTERVAL '30 days' -- Apenas usuários dos últimos 30 dias
ON CONFLICT (id) DO NOTHING;

-- 4. ATUALIZAR PERFIS INCOMPLETOS COM DADOS DO METADATA
UPDATE profiles 
SET 
    full_name = COALESCE(
        NULLIF(full_name, ''), 
        NULLIF(full_name, 'Usuário'),
        u.raw_user_meta_data->>'full_name',
        'Usuário'
    ),
    phone = COALESCE(NULLIF(phone, ''), u.raw_user_meta_data->>'phone', ''),
    location_state = COALESCE(NULLIF(location_state, ''), u.raw_user_meta_data->>'location_state', 'SP'),
    location_city = COALESCE(NULLIF(location_city, ''), u.raw_user_meta_data->>'location_city', 'São Paulo'),
    gender = COALESCE(gender, u.raw_user_meta_data->>'gender', 'male'),
    updated_at = NOW()
FROM auth.users u
WHERE profiles.id = u.id
  AND (
    profiles.full_name IS NULL 
    OR profiles.full_name = ''
    OR profiles.full_name = 'Usuário'
    OR profiles.phone IS NULL
    OR profiles.phone = ''
  );

-- 5. VERIFICAR RESULTADO DAS CORREÇÕES
SELECT 
    'RESULTADO DAS CORREÇÕES' as status,
    COUNT(*) as total_usuarios,
    COUNT(p.id) as usuarios_com_perfil,
    COUNT(*) - COUNT(p.id) as usuarios_sem_perfil,
    COUNT(CASE WHEN p.profile_completed = true THEN 1 END) as perfis_completos,
    COUNT(CASE WHEN p.profile_completed = false THEN 1 END) as perfis_incompletos
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.created_at >= NOW() - INTERVAL '7 days';

-- 6. CRIAR POLÍTICA RLS SIMPLES PARA PROFILES (se necessário)
-- DESCOMENTE SE PRECISAR CRIAR POLÍTICAS RLS
/*
-- Política para permitir que usuários vejam seus próprios perfis
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para permitir que usuários atualizem seus próprios perfis
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para permitir inserção de novos perfis
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
*/

-- 7. VERIFICAR SE HÁ ERROS APÓS AS CORREÇÕES
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    'Verificar se não há erros de constraint' as observacao;

-- 8. MOSTRAR USUÁRIOS RECENTES APÓS CORREÇÃO
SELECT 
    'USUÁRIOS RECENTES APÓS CORREÇÃO' as status,
    u.id,
    u.email,
    u.created_at,
    p.full_name,
    p.user_type,
    p.profile_completed,
    p.gender,
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

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Execute primeiro o script de verificação
-- 2. Execute este script de correção
-- 3. Execute novamente o script de verificação
-- 4. Se ainda houver problemas, verificar logs do Supabase
-- 5. Considerar desabilitar RLS temporariamente se necessário
-- =====================================================

-- =====================================================
-- PRÓXIMOS PASSOS SE O PROBLEMA PERSISTIR:
-- =====================================================
-- 1. Verificar logs de erro no Supabase Dashboard
-- 2. Testar criação manual de perfil
-- 3. Verificar se o código está chamando a função correta
-- 4. Verificar se há problemas de permissão
-- 5. Considerar usar triggers para criação automática
-- =====================================================
