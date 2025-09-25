-- =====================================================
-- DIAGNÓSTICO E CORREÇÃO DE PROBLEMAS DE AUTENTICAÇÃO
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR FUNÇÃO HANDLE_NEW_USER
-- =====================================================

-- Verificar se a função existe
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- Verificar se o trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. CRIAR/RECRIAR FUNÇÃO HANDLE_NEW_USER SE NECESSÁRIO
-- =====================================================

-- Remover função existente se houver
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Criar função corrigida
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir perfil básico para o novo usuário
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
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'client')::text,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        '',
        NULL,
        'SP',
        'São Paulo',
        '',
        '',
        '{}',
        0,
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
        email_enabled,
        message_notifications,
        review_notifications,
        booking_notifications,
        achievement_notifications,
        marketing_notifications,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        NOW(),
        NOW()
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log do erro (em produção, você pode usar uma tabela de logs)
    RAISE NOTICE 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CRIAR TRIGGER PARA A FUNÇÃO
-- =====================================================

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. VERIFICAR E CORRIGIR ESTRUTURA DA TABELA PROFILES
-- =====================================================

-- Verificar se todas as colunas necessárias existem
DO $$
DECLARE
    col_exists boolean;
BEGIN
    -- Verificar coluna address
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'address'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE public.profiles ADD COLUMN address TEXT DEFAULT '';
        RAISE NOTICE '✅ Coluna address adicionada';
    END IF;

    -- Verificar coluna whatsapp
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'whatsapp'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE public.profiles ADD COLUMN whatsapp TEXT DEFAULT '';
        RAISE NOTICE '✅ Coluna whatsapp adicionada';
    END IF;

    -- Verificar coluna professional_certifications
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'professional_certifications'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE public.profiles ADD COLUMN professional_certifications TEXT[] DEFAULT '{}';
        RAISE NOTICE '✅ Coluna professional_certifications adicionada';
    END IF;

    -- Verificar coluna professional_portfolio_url
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'professional_portfolio_url'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        ALTER TABLE public.profiles ADD COLUMN professional_portfolio_url TEXT;
        RAISE NOTICE '✅ Coluna professional_portfolio_url adicionada';
    END IF;

    RAISE NOTICE '✅ Verificação da estrutura da tabela profiles concluída';
END $$;

-- 5. VERIFICAR POLÍTICAS RLS ATUAIS
-- =====================================================

-- Listar todas as políticas da tabela profiles
SELECT 
    'profiles' as tabela,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 6. TESTE DE CRIAÇÃO DE PERFIL
-- =====================================================

-- Verificar se conseguimos inserir um perfil de teste
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'teste@confiar.com';
BEGIN
    -- Tentar inserir perfil de teste
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        user_type,
        created_at,
        updated_at
    ) VALUES (
        test_user_id,
        test_email,
        'Usuário Teste',
        'client',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Perfil de teste criado com sucesso: %', test_user_id;
    
    -- Limpar teste
    DELETE FROM public.profiles WHERE id = test_user_id;
    RAISE NOTICE '✅ Perfil de teste removido';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro ao criar perfil de teste: %', SQLERRM;
END $$;

-- 7. VERIFICAR PERMISSÕES DA TABELA
-- =====================================================

-- Verificar permissões da tabela profiles
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles';

-- 8. CRIAR POLÍTICAS MAIS PERMISSIVAS TEMPORARIAMENTE
-- =====================================================

-- Remover políticas restritivas e criar mais permissivas
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Criar políticas mais permissivas para debug
CREATE POLICY "profiles_select_all" ON public.profiles
    FOR SELECT 
    USING (true);

CREATE POLICY "profiles_insert_authenticated" ON public.profiles
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = id OR auth.uid() IS NOT NULL);

CREATE POLICY "profiles_delete_own" ON public.profiles
    FOR DELETE 
    USING (auth.uid() = id);

-- 9. VERIFICAÇÃO FINAL
-- =====================================================

-- Contar registros nas tabelas principais
SELECT 'profiles' as tabela, COUNT(*) as total FROM public.profiles
UNION ALL
SELECT 'notification_preferences' as tabela, COUNT(*) as total FROM public.notification_preferences
UNION ALL
SELECT 'auth.users' as tabela, COUNT(*) as total FROM auth.users;

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'notification_preferences')
ORDER BY tablename;

-- Verificar últimos usuários criados
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- ✅ RESULTADO ESPERADO:
-- 1. Função handle_new_user criada/atualizada
-- 2. Trigger configurado corretamente
-- 3. Estrutura da tabela profiles corrigida
-- 4. Políticas RLS mais permissivas aplicadas
-- 5. Teste de criação de perfil bem-sucedido

-- 🚨 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Teste criando uma nova conta
-- 3. Verifique se os dados estão sendo salvos
-- 4. Se funcionar, podemos ajustar as políticas para serem mais restritivas
