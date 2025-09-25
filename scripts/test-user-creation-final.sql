-- =====================================================
-- TESTE DE CRIAÇÃO DE USUÁRIO COMPLETO (VERSÃO FINAL)
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. LIMPAR DADOS DE TESTE ANTERIORES (SE EXISTIREM)
-- =====================================================

-- Remover dados de teste anteriores
DELETE FROM public.notification_preferences 
WHERE user_id IN (
    SELECT id FROM public.profiles WHERE email LIKE '%teste%'
);

DELETE FROM public.profiles 
WHERE email LIKE '%teste%';

DELETE FROM auth.users 
WHERE email LIKE '%teste%';

-- 2. CRIAR USUÁRIO DE TESTE MANUALMENTE
-- =====================================================

-- Gerar email único para teste
DO $$
DECLARE
    test_email TEXT;
    test_user_id UUID;
    rec RECORD;
BEGIN
    -- Gerar email único baseado no timestamp
    test_email := 'teste-' || extract(epoch from now())::text || '@confilar.com';
    
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
        test_email,
        crypt('Teste123!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"full_name": "Usuário Teste", "user_type": "professional"}',
        false,
        'authenticated',
        'authenticated'
    ) RETURNING id INTO test_user_id;
    
    RAISE NOTICE '✅ Usuário de teste criado: % (ID: %)', test_email, test_user_id;
    
    -- 3. VERIFICAR SE O TRIGGER FUNCIONOU
    -- =====================================================
    
    -- Verificar se o perfil foi criado automaticamente
    IF EXISTS (SELECT 1 FROM public.profiles WHERE email = test_email) THEN
        RAISE NOTICE '✅ Perfil criado automaticamente pelo trigger';
        
        -- Mostrar dados do perfil criado
        RAISE NOTICE 'Dados do perfil:';
        FOR rec IN 
            SELECT id, email, full_name, user_type, created_at
            FROM public.profiles 
            WHERE email = test_email
        LOOP
            RAISE NOTICE '  - ID: %, Email: %, Nome: %, Tipo: %, Criado: %', 
                rec.id, rec.email, rec.full_name, rec.user_type, rec.created_at;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ Perfil NÃO foi criado automaticamente pelo trigger';
    END IF;
    
    -- Verificar se as preferências foram criadas
    IF EXISTS (SELECT 1 FROM public.notification_preferences WHERE user_id = test_user_id) THEN
        RAISE NOTICE '✅ Preferências criadas automaticamente pelo trigger';
        
        -- Mostrar dados das preferências criadas
        RAISE NOTICE 'Dados das preferências:';
        FOR rec IN 
            SELECT id, user_id, push_enabled, message_notifications, created_at
            FROM public.notification_preferences 
            WHERE user_id = test_user_id
        LOOP
            RAISE NOTICE '  - ID: %, User ID: %, Push: %, Mensagens: %, Criado: %', 
                rec.id, rec.user_id, rec.push_enabled, rec.message_notifications, rec.created_at;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ Preferências NÃO foram criadas automaticamente pelo trigger';
    END IF;
    
    -- 4. TESTE DE ATUALIZAÇÃO DE PERFIL
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
        professional_services = ARRAY['Desenvolvimento Web', 'Design'],
        professional_experience_years = 5,
        avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=teste',
        updated_at = NOW()
    WHERE email = test_email;
    
    -- Verificar se a atualização funcionou
    IF EXISTS (SELECT 1 FROM public.profiles WHERE email = test_email AND phone = '11999999999') THEN
        RAISE NOTICE '✅ Perfil atualizado com sucesso';
        
        -- Mostrar dados atualizados
        RAISE NOTICE 'Dados atualizados do perfil:';
        FOR rec IN 
            SELECT phone, cpf_cnpj, birth_date, location_state, location_city, 
                   neighborhood, bio, professional_services, professional_experience_years, avatar_url
            FROM public.profiles 
            WHERE email = test_email
        LOOP
            RAISE NOTICE '  - Telefone: %, CPF: %, Nascimento: %, Estado: %, Cidade: %', 
                rec.phone, rec.cpf_cnpj, rec.birth_date, rec.location_state, rec.location_city;
            RAISE NOTICE '  - Bairro: %, Bio: %, Serviços: %, Experiência: %, Avatar: %', 
                rec.neighborhood, rec.bio, rec.professional_services, rec.professional_experience_years, rec.avatar_url;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ Falha ao atualizar perfil';
    END IF;
    
    -- 5. TESTE DE ACESSO COM RLS
    -- =====================================================
    
    -- Verificar se consegue acessar o próprio perfil
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = test_user_id) THEN
        RAISE NOTICE '✅ Acesso ao próprio perfil funcionando';
    ELSE
        RAISE NOTICE '❌ Problema de acesso ao próprio perfil (possível problema de RLS)';
    END IF;
    
    -- Verificar se consegue acessar as próprias preferências
    IF EXISTS (SELECT 1 FROM public.notification_preferences WHERE user_id = test_user_id) THEN
        RAISE NOTICE '✅ Acesso às próprias preferências funcionando';
    ELSE
        RAISE NOTICE '❌ Problema de acesso às próprias preferências (possível problema de RLS)';
    END IF;
    
    -- 6. VERIFICAR SE HÁ ERROS DE RLS
    -- =====================================================
    
    -- Tentar inserir perfil manualmente (deve falhar se RLS estiver ativo)
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
            'teste-rls-' || extract(epoch from now())::text || '@confilar.com',
            'Teste RLS',
            'client',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '❌ RLS NÃO ESTÁ FUNCIONANDO - Inserção manual permitida';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✅ RLS ESTÁ FUNCIONANDO - Inserção manual bloqueada: %', SQLERRM;
    END;
    
    -- 7. LIMPEZA DOS DADOS DE TESTE
    -- =====================================================
    
    -- Remover dados de teste
    DELETE FROM public.notification_preferences 
    WHERE user_id = test_user_id;
    
    DELETE FROM public.profiles 
    WHERE email = test_email;
    
    DELETE FROM auth.users 
    WHERE email = test_email;
    
    RAISE NOTICE '✅ Dados de teste removidos com sucesso';
    
    -- 8. VERIFICAÇÃO FINAL
    -- =====================================================
    
    -- Verificar se os dados foram removidos
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = test_email) THEN
        RAISE NOTICE '✅ Usuário removido com sucesso';
    ELSE
        RAISE NOTICE '❌ Falha ao remover usuário';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = test_email) THEN
        RAISE NOTICE '✅ Perfil removido com sucesso';
    ELSE
        RAISE NOTICE '❌ Falha ao remover perfil';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.notification_preferences WHERE user_id = test_user_id) THEN
        RAISE NOTICE '✅ Preferências removidas com sucesso';
    ELSE
        RAISE NOTICE '❌ Falha ao remover preferências';
    END IF;
    
END $$;

-- 9. VERIFICAÇÃO FINAL GERAL
-- =====================================================

-- Verificar se não há dados de teste restantes
SELECT 
    'VERIFICAÇÃO DE LIMPEZA' as info,
    'auth.users' as tabela,
    COUNT(*) as total
FROM auth.users 
WHERE email LIKE '%teste%'
UNION ALL
SELECT 
    'VERIFICAÇÃO DE LIMPEZA' as info,
    'public.profiles' as tabela,
    COUNT(*) as total
FROM public.profiles 
WHERE email LIKE '%teste%'
UNION ALL
SELECT 
    'VERIFICAÇÃO DE LIMPEZA' as info,
    'public.notification_preferences' as tabela,
    COUNT(*) as total
FROM public.notification_preferences 
WHERE user_id IN (
    SELECT id FROM public.profiles WHERE email LIKE '%teste%'
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
