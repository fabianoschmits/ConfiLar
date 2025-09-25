-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS - ERRO 406
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. CORRIGIR POLÍTICAS DA TABELA PROFILES
-- =====================================================

-- Desabilitar RLS temporariamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Criar políticas corretas para profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT 
    USING (true); -- Permitir visualização de todos os perfis

CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id); -- Permitir inserção apenas do próprio perfil

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = id); -- Permitir atualização apenas do próprio perfil

CREATE POLICY "profiles_delete_policy" ON public.profiles
    FOR DELETE 
    USING (auth.uid() = id); -- Permitir exclusão apenas do próprio perfil

-- Habilitar RLS novamente
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. CORRIGIR POLÍTICAS DA TABELA NOTIFICATION_PREFERENCES
-- =====================================================

-- Verificar se a tabela existe, se não, criar
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    push_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    message_notifications BOOLEAN DEFAULT true,
    review_notifications BOOLEAN DEFAULT true,
    booking_notifications BOOLEAN DEFAULT true,
    achievement_notifications BOOLEAN DEFAULT true,
    marketing_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Desabilitar RLS temporariamente
ALTER TABLE public.notification_preferences DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can create their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can delete their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON public.notification_preferences;

-- Criar políticas corretas para notification_preferences
CREATE POLICY "notification_preferences_select_policy" ON public.notification_preferences
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "notification_preferences_insert_policy" ON public.notification_preferences
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_preferences_update_policy" ON public.notification_preferences
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "notification_preferences_delete_policy" ON public.notification_preferences
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Habilitar RLS novamente
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 3. VERIFICAÇÃO DAS POLÍTICAS CRIADAS
-- =====================================================

-- Verificar políticas da tabela profiles
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

-- Verificar políticas da tabela notification_preferences
SELECT 
    'notification_preferences' as tabela,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notification_preferences'
ORDER BY policyname;

-- 4. VERIFICAR SE RLS ESTÁ HABILITADO
-- =====================================================

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'notification_preferences')
ORDER BY tablename;

-- 5. TESTE DE FUNCIONAMENTO (OPCIONAL)
-- =====================================================

-- Verificar se há usuários na tabela profiles
SELECT 
    'Total de perfis' as info,
    COUNT(*) as quantidade
FROM public.profiles;

-- Verificar se há preferências de notificação
SELECT 
    'Total de preferências' as info,
    COUNT(*) as quantidade
FROM public.notification_preferences;

-- ✅ RESULTADO ESPERADO:
-- 1. Políticas RLS configuradas corretamente
-- 2. Usuários podem acessar seus próprios dados
-- 3. Erro 406 deve ser resolvido
-- 4. Sistema de autenticação funcionando normalmente

-- 🚨 IMPORTANTE: 
-- Execute este script no SQL Editor do Supabase Dashboard
-- Teste a criação de conta após executar o script
