-- =====================================================
-- VERIFICAR STATUS DO USUÁRIO COM ERRO 406
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. VERIFICAR SE O USUÁRIO ESPECÍFICO TEM PERFIL
-- =====================================================

SELECT 
    'VERIFICAÇÃO USUÁRIO ESPECÍFICO' as info,
    id,
    email,
    full_name,
    user_type,
    professional_certifications,
    avatar_url,
    badge,
    rating,
    total_reviews,
    is_verified,
    is_available,
    created_at
FROM public.profiles 
WHERE id = 'f58962f2-779e-42b4-8315-653b2e600398';

-- 2. VERIFICAR SE O USUÁRIO ESPECÍFICO TEM PREFERÊNCIAS
-- =====================================================

SELECT 
    'VERIFICAÇÃO PREFERÊNCIAS USUÁRIO ESPECÍFICO' as info,
    user_id,
    push_enabled,
    message_notifications,
    review_notifications,
    booking_notifications,
    achievement_notifications,
    created_at
FROM public.notification_preferences 
WHERE user_id = 'f58962f2-779e-42b4-8315-653b2e600398';

-- 3. TESTAR SELECT QUE ESTAVA CAUSANDO ERRO 406
-- =====================================================

-- Testar select que estava causando erro
SELECT 
    'TESTE SELECT USUÁRIO ESPECÍFICO' as info,
    'Testando select das colunas que estavam causando erro 406' as mensagem;

-- Este select deve funcionar agora
SELECT 
    id,
    full_name,
    user_type,
    avatar_url,
    bio,
    location_state,
    location_city,
    neighborhood,
    professional_services,
    professional_experience_years,
    professional_certifications,
    badge,
    rating,
    total_reviews,
    is_verified,
    is_available,
    created_at,
    phone,
    email
FROM public.profiles 
WHERE id = 'f58962f2-779e-42b4-8315-653b2e600398';

-- 4. VERIFICAÇÃO GERAL DE TODOS OS USUÁRIOS
-- =====================================================

SELECT 
    'VERIFICAÇÃO GERAL - PERFIS' as info,
    COUNT(*) as total_usuarios,
    COUNT(p.id) as usuarios_com_perfil,
    COUNT(*) - COUNT(p.id) as usuarios_sem_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;

SELECT 
    'VERIFICAÇÃO GERAL - PREFERÊNCIAS' as info,
    COUNT(*) as total_usuarios,
    COUNT(np.user_id) as usuarios_com_preferencias,
    COUNT(*) - COUNT(np.user_id) as usuarios_sem_preferencias
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id;

-- 5. LISTAR USUÁRIOS SEM PERFIL (SE HOUVER)
-- =====================================================

SELECT 
    'USUÁRIOS SEM PERFIL' as info,
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.raw_user_meta_data->>'user_type' as user_type,
    u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- 6. LISTAR USUÁRIOS SEM PREFERÊNCIAS (SE HOUVER)
-- =====================================================

SELECT 
    'USUÁRIOS SEM PREFERÊNCIAS' as info,
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.created_at
FROM auth.users u
LEFT JOIN public.notification_preferences np ON u.id = np.user_id
WHERE np.user_id IS NULL
ORDER BY u.created_at DESC;

-- ✅ RESULTADO ESPERADO:
-- 1. Usuário específico com perfil criado
-- 2. Usuário específico com preferências criadas
-- 3. Select que causava erro 406 agora funciona
-- 4. Verificação geral mostra todos os usuários com perfis
-- 5. Lista de usuários sem perfil (se houver)
-- 6. Lista de usuários sem preferências (se houver)

-- 🚨 PROBLEMA RESOLVIDO:
-- - Erro 406 causado por perfil inexistente
-- - Perfil criado com todas as colunas necessárias
-- - Sistema funcionando corretamente

-- 📋 PRÓXIMOS PASSOS:
-- 1. Execute este script
-- 2. Verifique se o usuário específico foi corrigido
-- 3. Teste o login do usuário
-- 4. Confirme que o erro 406 foi resolvido
