-- =====================================================
-- CORRIGIR FUNÇÃO HANDLE_NEW_USER SEM ALTERAR RLS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR FUNÇÃO ATUAL
-- =====================================================

SELECT 
    'VERIFICAÇÃO DA FUNÇÃO ATUAL' as info,
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 2. REMOVER E RECRIAR FUNÇÃO COM TRATAMENTO ROBUSTO
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Criar função corrigida que funciona com RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir perfil básico para o novo usuário
    -- Usar SECURITY DEFINER para contornar RLS temporariamente
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        user_type,
        phone,
        cpf_cnpj,
        birth_date,
        location_state,
        location_city,
        neighborhood,
        bio,
        professional_services,
        professional_experience_years,
        is_verified,
        badge,
        rating,
        total_reviews,
        is_available,
        profile_completed,
        profile_completion_score,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
        CASE 
            WHEN NEW.raw_user_meta_data->>'user_type' = 'professional' THEN 'professional'::user_type
            ELSE 'client'::user_type
        END,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'cpf_cnpj', ''),
        CASE 
            WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
            AND NEW.raw_user_meta_data->>'birth_date' ~ '^\d{4}-\d{2}-\d{2}$' 
            THEN (NEW.raw_user_meta_data->>'birth_date')::date 
            ELSE NULL 
        END,
        COALESCE(NEW.raw_user_meta_data->>'location_state', ''),
        COALESCE(NEW.raw_user_meta_data->>'location_city', ''),
        COALESCE(NEW.raw_user_meta_data->>'neighborhood', ''),
        COALESCE(NEW.raw_user_meta_data->>'bio', ''),
        CASE 
            WHEN NEW.raw_user_meta_data->>'services_offered' IS NOT NULL 
            AND NEW.raw_user_meta_data->>'services_offered' != '[]'
            AND NEW.raw_user_meta_data->>'services_offered' ~ '^\[.*\]$' 
            THEN 
                ARRAY(
                    SELECT jsonb_array_elements_text(
                        (NEW.raw_user_meta_data->>'services_offered')::jsonb
                    )
                )
            ELSE '{}'::text[]
        END,
        CASE 
            WHEN NEW.raw_user_meta_data->>'experience_years' IS NOT NULL 
            AND NEW.raw_user_meta_data->>'experience_years' ~ '^\d+$' 
            THEN (NEW.raw_user_meta_data->>'experience_years')::integer
            WHEN NEW.raw_user_meta_data->>'experience_years' IS NOT NULL 
            AND NEW.raw_user_meta_data->>'experience_years' ~ '^\d+-\d+$' 
            THEN SPLIT_PART(NEW.raw_user_meta_data->>'experience_years', '-', 1)::integer
            WHEN NEW.raw_user_meta_data->>'experience_years' IS NOT NULL 
            AND NEW.raw_user_meta_data->>'experience_years' ~ '^\d+\+$' 
            THEN REGEXP_REPLACE(NEW.raw_user_meta_data->>'experience_years', '\+', '')::integer
            ELSE 0
        END,
        false,
        'bronze',
        0,
        0,
        true,
        false,
        0,
        NOW(),
        NOW()
    );

    -- Criar preferências de notificação padrão
    INSERT INTO public.notification_preferences (
        user_id,
        push_enabled,
        message_notifications,
        review_notifications,
        booking_notifications,
        achievement_notifications,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        true,
        true,
        true,
        true,
        true,
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Perfil e preferências criados com sucesso para usuário: %', NEW.email;
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- Log do erro
    RAISE NOTICE 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    -- Retornar NEW mesmo com erro para não interromper o registro
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CRIAR TRIGGER PARA A FUNÇÃO
-- =====================================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
-- =====================================================

SELECT 
    'VERIFICAÇÃO DA FUNÇÃO CRIADA' as info,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

SELECT 
    'VERIFICAÇÃO DO TRIGGER CRIADO' as info,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 5. TESTAR A FUNÇÃO COM UM USUÁRIO DE TESTE
-- =====================================================

DO $$
DECLARE
    test_user_id UUID;
    test_email TEXT;
BEGIN
    -- Gerar email único baseado no timestamp
    test_email := 'teste-funcao-corrigida-' || EXTRACT(EPOCH FROM NOW())::TEXT || '@confilar.com';
    
    -- Inserir usuário de teste
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data
    ) VALUES (
        gen_random_uuid(),
        test_email,
        '$2a$10$dummy.hash.for.testing',
        NOW(),
        NOW(),
        NOW(),
        '{"full_name": "Usuário Teste Função", "user_type": "professional", "phone": "11999999999", "cpf_cnpj": "12345678901", "birth_date": "1990-01-01", "location_state": "SP", "location_city": "São Paulo", "neighborhood": "Centro", "bio": "Profissional de teste", "services_offered": ["Web Design", "SEO"], "experience_years": "5"}'::jsonb
    ) RETURNING id INTO test_user_id;
    
    RAISE NOTICE 'Usuário de teste criado: %', test_email;
    RAISE NOTICE 'ID do usuário: %', test_user_id;
    
    -- Verificar se o perfil foi criado automaticamente
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = test_user_id) THEN
        RAISE NOTICE 'SUCESSO: Perfil criado automaticamente!';
        
        -- Mostrar dados do perfil criado
        SELECT 
            'DADOS DO PERFIL CRIADO' as info,
            p.full_name,
            p.user_type,
            p.phone,
            p.cpf_cnpj,
            p.birth_date,
            p.location_state,
            p.location_city,
            p.neighborhood,
            p.bio,
            p.professional_services,
            p.professional_experience_years
        FROM public.profiles p
        WHERE p.id = test_user_id;
    ELSE
        RAISE NOTICE 'ERRO: Perfil NÃO foi criado automaticamente!';
    END IF;
    
    -- Verificar se as preferências foram criadas automaticamente
    IF EXISTS (SELECT 1 FROM public.notification_preferences WHERE user_id = test_user_id) THEN
        RAISE NOTICE 'SUCESSO: Preferências criadas automaticamente!';
    ELSE
        RAISE NOTICE 'ERRO: Preferências NÃO foram criadas automaticamente!';
    END IF;
    
    -- Limpar usuário de teste
    DELETE FROM public.profiles WHERE id = test_user_id;
    DELETE FROM public.notification_preferences WHERE user_id = test_user_id;
    DELETE FROM auth.users WHERE id = test_user_id;
    
    RAISE NOTICE 'Usuário de teste removido.';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO no teste: %', SQLERRM;
END $$;

-- 6. CRIAR PERFIS PARA USUÁRIOS EXISTENTES SEM PERFIL
-- =====================================================

-- Criar perfis para usuários existentes que não têm perfil
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    user_type,
    phone,
    cpf_cnpj,
    birth_date,
    location_state,
    location_city,
    neighborhood,
    bio,
    professional_services,
    professional_experience_years,
    is_verified,
    badge,
    rating,
    total_reviews,
    is_available,
    profile_completed,
    profile_completion_score,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Usuário'),
    CASE 
        WHEN u.raw_user_meta_data->>'user_type' = 'professional' THEN 'professional'::user_type
        ELSE 'client'::user_type
    END,
    COALESCE(u.raw_user_meta_data->>'phone', ''),
    COALESCE(u.raw_user_meta_data->>'cpf_cnpj', ''),
    CASE 
        WHEN u.raw_user_meta_data->>'birth_date' IS NOT NULL 
        AND u.raw_user_meta_data->>'birth_date' ~ '^\d{4}-\d{2}-\d{2}$' 
        THEN (u.raw_user_meta_data->>'birth_date')::date 
        ELSE NULL 
    END,
    COALESCE(u.raw_user_meta_data->>'location_state', ''),
    COALESCE(u.raw_user_meta_data->>'location_city', ''),
    COALESCE(u.raw_user_meta_data->>'neighborhood', ''),
    COALESCE(u.raw_user_meta_data->>'bio', ''),
    CASE 
        WHEN u.raw_user_meta_data->>'services_offered' IS NOT NULL 
        AND u.raw_user_meta_data->>'services_offered' != '[]'
        AND u.raw_user_meta_data->>'services_offered' ~ '^\[.*\]$' 
        THEN 
            ARRAY(
                SELECT jsonb_array_elements_text(
                    (u.raw_user_meta_data->>'services_offered')::jsonb
                )
            )
        ELSE '{}'::text[]
    END,
    CASE 
        WHEN u.raw_user_meta_data->>'experience_years' IS NOT NULL 
        AND u.raw_user_meta_data->>'experience_years' ~ '^\d+$' 
        THEN (u.raw_user_meta_data->>'experience_years')::integer
        WHEN u.raw_user_meta_data->>'experience_years' IS NOT NULL 
        AND u.raw_user_meta_data->>'experience_years' ~ '^\d+-\d+$' 
        THEN SPLIT_PART(u.raw_user_meta_data->>'experience_years', '-', 1)::integer
        WHEN u.raw_user_meta_data->>'experience_years' IS NOT NULL 
        AND u.raw_user_meta_data->>'experience_years' ~ '^\d+\+$' 
        THEN REGEXP_REPLACE(u.raw_user_meta_data->>'experience_years', '\+', '')::integer
        ELSE 0
    END,
    false,
    'bronze',
    0,
    0,
    true,
    false,
    0,
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 7. CRIAR PREFERÊNCIAS PARA USUÁRIOS EXISTENTES SEM PREFERÊNCIAS
-- =====================================================

INSERT INTO public.notification_preferences (
    user_id,
    push_enabled,
    message_notifications,
    review_notifications,
    booking_notifications,
    achievement_notifications,
    created_at,
    updated_at
)
SELECT 
    u.id,
    true,
    true,
    true,
    true,
    true,
    NOW(),
    NOW()
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id
WHERE np.user_id IS NULL;

-- 8. VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
    'VERIFICAÇÃO FINAL - PERFIS' as info,
    COUNT(*) as total_usuarios,
    COUNT(p.id) as usuarios_com_perfil,
    COUNT(*) - COUNT(p.id) as usuarios_sem_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

SELECT 
    'VERIFICAÇÃO FINAL - PREFERÊNCIAS' as info,
    COUNT(*) as total_usuarios,
    COUNT(np.user_id) as usuarios_com_preferencias,
    COUNT(*) - COUNT(np.user_id) as usuarios_sem_preferencias
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id;

-- ✅ RESULTADO ESPERADO:
-- 1. Função handle_new_user corrigida e funcionando
-- 2. Trigger on_auth_user_created ativo
-- 3. Teste com usuário de teste bem-sucedido
-- 4. Perfis criados para usuários existentes sem perfil
-- 5. Preferências criadas para usuários existentes sem preferências
-- 6. Verificação final de que todos têm dados

-- 🚨 VANTAGENS DESTA SOLUÇÃO:
-- - Não altera RLS (mantém segurança)
-- - Função SECURITY DEFINER contorna RLS temporariamente
-- - Tratamento robusto de dados
-- - Cria perfis para usuários existentes
-- - Testa automaticamente

-- 📋 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Verifique se a função foi criada corretamente
-- 3. Teste criando um novo usuário
-- 4. Confirme que o perfil é criado automaticamente
-- 5. Confirme que o erro 406 foi resolvido
