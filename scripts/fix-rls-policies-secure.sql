-- =====================================================
-- CORRIGIR POLÍTICAS RLS DE FORMA SEGURA
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR POLÍTICAS ATUAIS
-- =====================================================

SELECT 
    'POLÍTICAS ATUAIS - PROFILES' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

SELECT 
    'POLÍTICAS ATUAIS - NOTIFICATION_PREFERENCES' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'notification_preferences' 
AND schemaname = 'public';

-- 2. REMOVER POLÍTICAS EXISTENTES
-- =====================================================

-- Remover políticas existentes de profiles
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Remover políticas existentes de notification_preferences
DROP POLICY IF EXISTS "notification_preferences_policy" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can view own preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON public.notification_preferences;

-- 3. CRIAR POLÍTICAS CORRETAS PARA PROFILES
-- =====================================================

-- Política para SELECT (visualizar)
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Política para INSERT (criar)
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para UPDATE (atualizar)
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Política para DELETE (deletar)
CREATE POLICY "Users can delete own profile" ON public.profiles
FOR DELETE USING (auth.uid() = id);

-- 4. CRIAR POLÍTICAS CORRETAS PARA NOTIFICATION_PREFERENCES
-- =====================================================

-- Política para SELECT (visualizar)
CREATE POLICY "Users can view own preferences" ON public.notification_preferences
FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT (criar)
CREATE POLICY "Users can insert own preferences" ON public.notification_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (atualizar)
CREATE POLICY "Users can update own preferences" ON public.notification_preferences
FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE (deletar)
CREATE POLICY "Users can delete own preferences" ON public.notification_preferences
FOR DELETE USING (auth.uid() = user_id);

-- 5. VERIFICAR POLÍTICAS CRIADAS
-- =====================================================

SELECT 
    'POLÍTICAS CRIADAS - PROFILES' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

SELECT 
    'POLÍTICAS CRIADAS - NOTIFICATION_PREFERENCES' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'notification_preferences' 
AND schemaname = 'public';

-- 6. CRIAR PERFIL PARA USUÁRIO ESPECÍFICO (COM RLS ATIVO)
-- =====================================================

-- Usar SECURITY DEFINER para contornar RLS temporariamente
CREATE OR REPLACE FUNCTION create_user_profile_safe(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Inserir perfil
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
    WHERE u.id = p_user_id
    ON CONFLICT (id) DO NOTHING;

    -- Inserir preferências
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
    VALUES (
        p_user_id,
        true,
        true,
        true,
        true,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CRIAR PERFIL PARA USUÁRIO ESPECÍFICO
-- =====================================================

SELECT create_user_profile_safe('4a1bca5c-833c-4f57-8bce-235842b34067');

-- 8. CRIAR PERFIS PARA TODOS OS USUÁRIOS SEM PERFIL
-- =====================================================

DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT u.id 
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE p.id IS NULL
    LOOP
        PERFORM create_user_profile_safe(user_record.id);
    END LOOP;
END $$;

-- 9. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se o usuário específico agora tem perfil
SELECT 
    'VERIFICAÇÃO FINAL - PERFIL' as info,
    p.id,
    p.email,
    p.full_name,
    p.user_type,
    p.created_at
FROM public.profiles p
WHERE p.id = '4a1bca5c-833c-4f57-8bce-235842b34067';

-- Verificar se o usuário específico agora tem preferências
SELECT 
    'VERIFICAÇÃO FINAL - PREFERÊNCIAS' as info,
    np.user_id,
    np.push_enabled,
    np.message_notifications,
    np.created_at
FROM public.notification_preferences np
WHERE np.user_id = '4a1bca5c-833c-4f57-8bce-235842b34067';

-- Verificação geral
SELECT 
    'VERIFICAÇÃO FINAL GERAL - PERFIS' as info,
    COUNT(*) as total_usuarios,
    COUNT(p.id) as usuarios_com_perfil,
    COUNT(*) - COUNT(p.id) as usuarios_sem_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

SELECT 
    'VERIFICAÇÃO FINAL GERAL - PREFERÊNCIAS' as info,
    COUNT(*) as total_usuarios,
    COUNT(np.user_id) as usuarios_com_preferencias,
    COUNT(*) - COUNT(np.user_id) as usuarios_sem_preferencias
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id;

-- 10. LIMPEZA
-- =====================================================

-- Remover função temporária
DROP FUNCTION IF EXISTS create_user_profile_safe(UUID);

-- ✅ RESULTADO ESPERADO:
-- 1. Políticas RLS corretas criadas
-- 2. RLS mantido ativo (segurança preservada)
-- 3. Perfil criado para usuário específico
-- 4. Preferências criadas para usuário específico
-- 5. Perfis criados para todos os usuários sem perfil
-- 6. Preferências criadas para todos os usuários sem preferências
-- 7. Verificação final de que tudo foi criado
-- 8. Segurança mantida com RLS ativo

-- 🛡️ VANTAGENS DESTA SOLUÇÃO:
-- - RLS mantido ativo (segurança preservada)
-- - Políticas corretas criadas
-- - Perfis criados de forma segura
-- - Solução permanente e segura
-- - Não compromete a segurança dos dados

-- 📋 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Verifique se as políticas foram criadas
-- 3. Teste o login do usuário específico
-- 4. Confirme que o erro 406 foi resolvido
-- 5. Teste criação de novos usuários
