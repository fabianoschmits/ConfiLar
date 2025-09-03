-- =====================================================
-- VERIFICAÇÃO ESSENCIAL DO BANCO DE DADOS CONFILAR
-- =====================================================
-- Script simplificado e robusto para verificar apenas o essencial

-- 1. VERIFICAR TABELAS PRINCIPAIS E RLS
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '🔒 RLS ATIVO'
        ELSE '🔓 RLS DESATIVADO'
    END as rls_status
FROM pg_tables 
WHERE tablename IN ('profiles', 'conversations', 'messages', 'conversation_participants', 'notifications')
AND schemaname = 'public'
ORDER BY tablename;

-- 2. VERIFICAR ESTRUTURA DA TABELA PROFILES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR ESTRUTURA DA TABELA CONVERSATIONS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. VERIFICAR ESTRUTURA DA TABELA MESSAGES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. VERIFICAR ESTRUTURA DA TABELA CONVERSATION_PARTICIPANTS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. VERIFICAR ESTRUTURA DA TABELA NOTIFICATIONS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. VERIFICAR CONTAGEM DE REGISTROS
SELECT 'PROFILES' as tabela, COUNT(*) as total FROM profiles
UNION ALL
SELECT 'CONVERSATIONS' as tabela, COUNT(*) as total FROM conversations
UNION ALL
SELECT 'MESSAGES' as tabela, COUNT(*) as total FROM messages
UNION ALL
SELECT 'CONVERSATION_PARTICIPANTS' as tabela, COUNT(*) as total FROM conversation_participants
UNION ALL
SELECT 'NOTIFICATIONS' as tabela, COUNT(*) as total FROM notifications;

-- 8. VERIFICAR PROBLEMAS CRÍTICOS
-- Mensagens sem remetente válido
SELECT 
    'MENSAGENS SEM REMETENTE VÁLIDO' as problema,
    COUNT(*) as quantidade
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
WHERE p.id IS NULL;

-- Conversas sem participantes
SELECT 
    'CONVERSAS SEM PARTICIPANTES' as problema,
    COUNT(*) as quantidade
FROM conversations c
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE cp.conversation_id IS NULL;

-- Notificações sem usuário válido
SELECT 
    'NOTIFICAÇÕES SEM USUÁRIO VÁLIDO' as problema,
    COUNT(*) as quantidade
FROM notifications n
LEFT JOIN profiles p ON n.user_id = p.id
WHERE p.id IS NULL;

-- 9. VERIFICAR CHAVES ESTRANGEIRAS
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name IN ('profiles', 'conversations', 'messages', 'conversation_participants', 'notifications')
ORDER BY tc.table_name, kcu.column_name;

-- 10. RESUMO FINAL
SELECT 
    'RESUMO ESSENCIAL' as secao,
    'Verificação das tabelas principais concluída' as status,
    'Verifique se RLS está desabilitado em todas as tabelas' as acao;
