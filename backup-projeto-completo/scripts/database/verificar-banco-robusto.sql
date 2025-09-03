-- =====================================================
-- VERIFICAÇÃO ROBUSTA DO BANCO DE DADOS CONFILAR
-- =====================================================
-- Script que verifica a estrutura real antes de fazer consultas

-- 1. VERIFICAR ESTRUTURA REAL DA TABELA CONVERSATION_PARTICIPANTS
SELECT 
    'ESTRUTURA CONVERSATION_PARTICIPANTS' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR TABELAS PRINCIPAIS E RLS
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

-- 3. VERIFICAR ESTRUTURA DA TABELA PROFILES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. VERIFICAR ESTRUTURA DA TABELA CONVERSATIONS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'conversations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. VERIFICAR ESTRUTURA DA TABELA MESSAGES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
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

-- 7. VERIFICAR CONTAGEM DE REGISTROS (CONSULTAS SEGURAS)
SELECT 'PROFILES' as tabela, COUNT(*) as total FROM profiles
UNION ALL
SELECT 'CONVERSATIONS' as tabela, COUNT(*) as total FROM conversations
UNION ALL
SELECT 'MESSAGES' as tabela, COUNT(*) as total FROM messages
UNION ALL
SELECT 'NOTIFICATIONS' as tabela, COUNT(*) as total FROM notifications;

-- 8. VERIFICAR CONVERSATION_PARTICIPANTS (CONSULTA CONDICIONAL)
DO $$
DECLARE
    col_name text;
BEGIN
    -- Verificar se existe participant_id ou profile_id
    SELECT column_name INTO col_name
    FROM information_schema.columns 
    WHERE table_name = 'conversation_participants' 
    AND table_schema = 'public'
    AND column_name IN ('participant_id', 'profile_id')
    LIMIT 1;
    
    IF col_name = 'participant_id' THEN
        RAISE NOTICE 'Usando participant_id para conversation_participants';
        EXECUTE 'SELECT ''CONVERSATION_PARTICIPANTS'' as tabela, COUNT(*) as total FROM conversation_participants';
    ELSIF col_name = 'profile_id' THEN
        RAISE NOTICE 'Usando profile_id para conversation_participants';
        EXECUTE 'SELECT ''CONVERSATION_PARTICIPANTS'' as tabela, COUNT(*) as total FROM conversation_participants';
    ELSE
        RAISE NOTICE 'Coluna de participante não encontrada em conversation_participants';
    END IF;
END $$;

-- 9. VERIFICAR PROBLEMAS CRÍTICOS (CONSULTAS SEGURAS)
-- Mensagens sem remetente válido
SELECT 
    'MENSAGENS SEM REMETENTE VÁLIDO' as problema,
    COUNT(*) as quantidade
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
WHERE p.id IS NULL;

-- Notificações sem usuário válido
SELECT 
    'NOTIFICAÇÕES SEM USUÁRIO VÁLIDO' as problema,
    COUNT(*) as quantidade
FROM notifications n
LEFT JOIN profiles p ON n.user_id = p.id
WHERE p.id IS NULL;

-- 10. VERIFICAR CHAVES ESTRANGEIRAS
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

-- 11. RESUMO FINAL
SELECT 
    'RESUMO ROBUSTO' as secao,
    'Verificação das tabelas principais concluída' as status,
    'Verifique se RLS está desabilitado em todas as tabelas' as acao;
