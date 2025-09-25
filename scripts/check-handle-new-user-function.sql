-- =====================================================
-- VERIFICAR E CORRIGIR FUNÇÃO HANDLE_NEW_USER
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR SE A FUNÇÃO EXISTE
-- =====================================================

SELECT 
    'VERIFICAÇÃO DA FUNÇÃO HANDLE_NEW_USER' as info,
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 2. VERIFICAR SE O TRIGGER EXISTE
-- =====================================================

SELECT 
    'VERIFICAÇÃO DO TRIGGER' as info,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. VERIFICAR ESTRUTURA DA TABELA PROFILES
-- =====================================================

SELECT 
    'ESTRUTURA DA TABELA PROFILES' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. VERIFICAR ESTRUTURA DA TABELA NOTIFICATION_PREFERENCES
-- =====================================================

SELECT 
    'ESTRUTURA DA TABELA NOTIFICATION_PREFERENCES' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notification_preferences' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. TESTAR A FUNÇÃO MANUALMENTE (SE EXISTIR)
-- =====================================================

-- Criar um usuário de teste para verificar se a função funciona
DO $$
DECLARE
    test_user_id UUID;
    test_email TEXT;
BEGIN
    -- Gerar email único baseado no timestamp
    test_email := 'teste-funcao-' || EXTRACT(EPOCH FROM NOW())::TEXT || '@confilar.com';
    
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
        '{"full_name": "Usuário Teste", "user_type": "client", "phone": "11999999999"}'::jsonb
    ) RETURNING id INTO test_user_id;
    
    RAISE NOTICE 'Usuário de teste criado: %', test_email;
    RAISE NOTICE 'ID do usuário: %', test_user_id;
    
    -- Verificar se o perfil foi criado automaticamente
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = test_user_id) THEN
        RAISE NOTICE 'SUCESSO: Perfil criado automaticamente!';
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

-- 6. VERIFICAR LOGS DE ERRO (SE HOUVER)
-- =====================================================

-- Verificar se há logs de erro na função
SELECT 
    'LOGS DE ERRO' as info,
    'Verifique os logs do Supabase para mensagens de erro da função handle_new_user' as mensagem;
