-- =====================================================
-- TESTE DE CRIAÇÃO DE USUÁRIO COMPLETO
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. CRIAR USUÁRIO DE TESTE MANUALMENTE
-- =====================================================

-- Inserir usuário na tabela auth.users (simulando cadastro)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
) VALUES (
    gen_random_uuid(),
    'teste@confilar.com',
    crypt('Teste123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Usuário Teste", "user_type": "professional"}',
    false,
    'authenticated',
    'authenticated'
) RETURNING id, email, created_at;

-- 2. VERIFICAR SE O TRIGGER FUNCIONOU
-- =====================================================

-- Verificar se o perfil foi criado automaticamente
SELECT 
    'PERFIL CRIADO PELO TRIGGER' as info,
    id,
    email,
    full_name,
    user_type,
    created_at
FROM public.profiles 
WHERE email = 'teste@confilar.com';

-- Verificar se as preferências foram criadas
SELECT 
    'PREFERÊNCIAS CRIADAS PELO TRIGGER' as info,
    id,
    user_id,
    push_enabled,
    email_enabled,
    created_at
FROM public.notification_preferences 
WHERE user_id = (
    SELECT id FROM public.profiles WHERE email = 'teste@confilar.com'
);

-- 3. TESTE DE ATUALIZAÇÃO DE PERFIL
-- =====================================================

-- Atualizar perfil com dados adicionais (simulando o que o código faz)
UPDATE public.profiles 
SET 
    phone = '11999999999',
    cpf_cnpj = '12345678901',
    birth_date = '1990-01-01',
    location_state = 'SP',
    location_city = 'São Paulo',
    neighborhood = 'Centro',
    bio = 'Profissional de teste',
    professional_services = '["Desenvolvimento Web", "Design"]',
    professional_experience_years = 5,
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=teste',
    updated_at = NOW()
WHERE email = 'teste@teste.com';

-- Verificar se a atualização funcionou
SELECT 
    'PERFIL ATUALIZADO' as info,
    id,
    email,
    full_name,
    phone,
    cpf_cnpj,
    birth_date,
    location_state,
    location_city,
    neighborhood,
    bio,
    professional_services,
    professional_experience_years,
    avatar_url,
    updated_at
FROM public.profiles 
WHERE email = 'teste@confilar.com';

-- 4. TESTE DE ACESSO COM RLS
-- =====================================================

-- Simular acesso como usuário autenticado
-- (Este teste deve ser feito com o usuário logado no sistema)

-- Verificar se consegue acessar o próprio perfil
SELECT 
    'TESTE DE ACESSO AO PRÓPRIO PERFIL' as info,
    id,
    email,
    full_name,
    user_type
FROM public.profiles 
WHERE id = (
    SELECT id FROM public.profiles WHERE email = 'teste@confilar.com'
);

-- Verificar se consegue acessar as próprias preferências
SELECT 
    'TESTE DE ACESSO ÀS PRÓPRIAS PREFERÊNCIAS' as info,
    id,
    user_id,
    push_enabled,
    email_enabled
FROM public.notification_preferences 
WHERE user_id = (
    SELECT id FROM public.profiles WHERE email = 'teste@confilar.com'
);

-- 5. VERIFICAR SE HÁ ERROS DE RLS
-- =====================================================

-- Tentar inserir perfil manualmente (deve falhar se RLS estiver ativo)
DO $$
BEGIN
    BEGIN
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            user_type,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'teste-rls@confilar.com',
            'Teste RLS',
            'client',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '❌ RLS NÃO ESTÁ FUNCIONANDO - Inserção manual permitida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ RLS ESTÁ FUNCIONANDO - Inserção manual bloqueada: %', SQLERRM;
    END;
END $$;

-- 6. LIMPEZA DOS DADOS DE TESTE
-- =====================================================

-- Remover dados de teste
DELETE FROM public.notification_preferences 
WHERE user_id = (
    SELECT id FROM public.profiles WHERE email = 'teste@confilar.com'
);

DELETE FROM public.profiles 
WHERE email = 'teste@confilar.com';

DELETE FROM auth.users 
WHERE email = 'teste@confilar.com';

-- 7. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se os dados foram removidos
SELECT 
    'VERIFICAÇÃO DE LIMPEZA' as info,
    'auth.users' as tabela,
    COUNT(*) as total
FROM auth.users 
WHERE email = 'teste@confilar.com'
UNION ALL
SELECT 
    'VERIFICAÇÃO DE LIMPEZA' as info,
    'public.profiles' as tabela,
    COUNT(*) as total
FROM public.profiles 
WHERE email = 'teste@confilar.com'
UNION ALL
SELECT 
    'VERIFICAÇÃO DE LIMPEZA' as info,
    'public.notification_preferences' as tabela,
    COUNT(*) as total
FROM public.notification_preferences 
WHERE user_id = (
    SELECT id FROM public.profiles WHERE email = 'teste@confilar.com'
);

-- ✅ RESULTADO ESPERADO:
-- 1. Usuário criado com sucesso
-- 2. Perfil criado automaticamente pelo trigger
-- 3. Preferências criadas automaticamente
-- 4. Atualização de perfil funcionando
-- 5. Acesso aos dados funcionando
-- 6. RLS funcionando corretamente
-- 7. Limpeza dos dados de teste

-- 🚨 PROBLEMAS IDENTIFICADOS:
-- - Se trigger não funcionar: função handle_new_user ausente
-- - Se RLS não funcionar: políticas mal configuradas
-- - Se atualização falhar: problema de permissões
-- - Se acesso falhar: problema de autenticação

-- 📋 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Analise os resultados
-- 3. Identifique problemas específicos
-- 4. Execute correções baseadas nos problemas encontrados
