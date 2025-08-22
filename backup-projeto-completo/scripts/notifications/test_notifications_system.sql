-- =====================================================
-- TESTE DO SISTEMA DE NOTIFICAÇÕES
-- =====================================================

-- 1. Verificar estrutura das tabelas
SELECT 
    '📋 ESTRUTURA DA TABELA NOTIFICATIONS' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'notifications'
ORDER BY ordinal_position;

SELECT 
    '📋 ESTRUTURA DA TABELA NOTIFICATION_PREFERENCES' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'notification_preferences'
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS
SELECT 
    '🔒 POLÍTICAS RLS - NOTIFICATIONS' as info,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notifications';

SELECT 
    '🔒 POLÍTICAS RLS - NOTIFICATION_PREFERENCES' as info,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notification_preferences';

-- 3. Verificar índices
SELECT 
    '📊 ÍNDICES - NOTIFICATIONS' as info,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'notifications';

SELECT 
    '📊 ÍNDICES - NOTIFICATION_PREFERENCES' as info,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'notification_preferences';

-- 4. Contar registros
SELECT 
    '📊 CONTAGEM DE REGISTROS' as info,
    (SELECT COUNT(*) FROM public.notifications) as total_notifications,
    (SELECT COUNT(*) FROM public.notifications WHERE is_read = false) as unread_notifications,
    (SELECT COUNT(*) FROM public.notification_preferences) as total_preferences;

-- 5. Verificar usuários com notificações
SELECT 
    '👥 USUÁRIOS COM NOTIFICAÇÕES' as info,
    n.user_id,
    p.full_name,
    p.email,
    COUNT(n.id) as total_notifications,
    COUNT(CASE WHEN n.is_read = false THEN 1 END) as unread_notifications
FROM public.notifications n
LEFT JOIN public.profiles p ON n.user_id = p.id
GROUP BY n.user_id, p.full_name, p.email
ORDER BY total_notifications DESC;

-- 6. Verificar usuários com preferências
SELECT 
    '👥 USUÁRIOS COM PREFERÊNCIAS' as info,
    np.user_id,
    p.full_name,
    p.email,
    np.push,
    np.email as email_enabled,
    np.inApp,
    np.messages,
    np.reviews,
    np.updates,
    np.marketing
FROM public.notification_preferences np
LEFT JOIN public.profiles p ON np.user_id = p.id
ORDER BY p.full_name;

-- 7. Testar inserção de notificação (substitua USER_ID pelo ID real de um usuário)
-- INSERT INTO public.notifications (user_id, title, message, type, category, is_read)
-- VALUES ('USER_ID_AQUI', 'Teste do Sistema', 'Esta é uma notificação de teste para verificar se o sistema está funcionando.', 'info', 'system', false);

-- 8. Verificar triggers
SELECT 
    '⚡ TRIGGERS' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND (event_object_table = 'notifications' OR event_object_table = 'notification_preferences');

-- 9. Verificar funções
SELECT 
    '🔧 FUNÇÕES' as info,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%notification%';

-- 10. Status final
SELECT 
    '✅ STATUS FINAL' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') 
        THEN 'Tabela notifications: ✅ EXISTE'
        ELSE 'Tabela notifications: ❌ NÃO EXISTE'
    END as notifications_table,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notification_preferences') 
        THEN 'Tabela notification_preferences: ✅ EXISTE'
        ELSE 'Tabela notification_preferences: ❌ NÃO EXISTE'
    END as preferences_table,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications' AND rowsecurity = true) 
        THEN 'RLS notifications: ✅ HABILITADO'
        ELSE 'RLS notifications: ❌ DESABILITADO'
    END as notifications_rls,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notification_preferences' AND rowsecurity = true) 
        THEN 'RLS preferences: ✅ HABILITADO'
        ELSE 'RLS preferences: ❌ DESABILITADO'
    END as preferences_rls;
