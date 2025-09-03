-- =====================================================
-- VERIFICAÇÃO SIMPLIFICADA DO BANCO DE DADOS CONFILAR
-- =====================================================
-- Versão corrigida e simplificada para evitar erros de sintaxe

-- 1. VERIFICAR TODAS AS TABELAS EXISTENTES
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '🔒 RLS ATIVO'
        ELSE '🔓 RLS DESATIVADO'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. VERIFICAR TODAS AS POLÍTICAS RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. VERIFICAR ESTRUTURA DA TABELA PROFILES
SELECT 
    'PROFILES' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('id', 'email') THEN 'OBRIGATÓRIO'
        ELSE 'OPCIONAL'
    END as importancia
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. VERIFICAR ESTRUTURA DA TABELA CONVERSATIONS
SELECT 
    'CONVERSATIONS' as tabela,
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
    'MESSAGES' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. VERIFICAR ESTRUTURA DA TABELA CONVERSATION_PARTICIPANTS
SELECT 
    'CONVERSATION_PARTICIPANTS' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'conversation_participants' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. VERIFICAR ESTRUTURA DA TABELA NOTIFICATIONS
SELECT 
    'NOTIFICATIONS' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. VERIFICAR CHAVES ESTRANGEIRAS (VERSÃO SIMPLIFICADA)
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
ORDER BY tc.table_name, kcu.column_name;

-- 9. VERIFICAR ÍNDICES
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 10. VERIFICAR TRIGGERS
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 11. VERIFICAR TIPOS PERSONALIZADOS
SELECT 
    typname,
    typtype,
    typcategory
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e'  -- Enum types
ORDER BY typname;

-- 12. VERIFICAR SEQUÊNCIAS
SELECT 
    sequence_name,
    data_type,
    start_value,
    increment
FROM information_schema.sequences 
WHERE sequence_schema = 'public'
ORDER BY sequence_name;

-- 13. VERIFICAR FUNÇÕES (VERSÃO SIMPLIFICADA)
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 14. VERIFICAR DADOS NAS TABELAS PRINCIPAIS
SELECT 
    'PROFILES' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as com_email,
    COUNT(CASE WHEN full_name IS NOT NULL THEN 1 END) as com_nome,
    COUNT(CASE WHEN user_type IS NOT NULL THEN 1 END) as com_tipo
FROM profiles;

SELECT 
    'CONVERSATIONS' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN created_at IS NOT NULL THEN 1 END) as com_data_criacao
FROM conversations;

SELECT 
    'MESSAGES' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN sender_id IS NOT NULL THEN 1 END) as com_remetente,
    COUNT(CASE WHEN content IS NOT NULL THEN 1 END) as com_conteudo
FROM messages;

SELECT 
    'CONVERSATION_PARTICIPANTS' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN participant_id IS NOT NULL THEN 1 END) as com_participante,
    COUNT(CASE WHEN conversation_id IS NOT NULL THEN 1 END) as com_conversa
FROM conversation_participants;

SELECT 
    'NOTIFICATIONS' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as com_usuario,
    COUNT(CASE WHEN title IS NOT NULL THEN 1 END) as com_titulo
FROM notifications;

-- 15. VERIFICAR PROBLEMAS POTENCIAIS
-- Verificar mensagens sem remetente válido
SELECT 
    'MENSAGENS SEM REMETENTE VÁLIDO' as problema,
    COUNT(*) as quantidade
FROM messages m
LEFT JOIN profiles p ON m.sender_id = p.id
WHERE p.id IS NULL;

-- Verificar conversas sem participantes
SELECT 
    'CONVERSAS SEM PARTICIPANTES' as problema,
    COUNT(*) as quantidade
FROM conversations c
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE cp.conversation_id IS NULL;

-- Verificar notificações sem usuário válido
SELECT 
    'NOTIFICAÇÕES SEM USUÁRIO VÁLIDO' as problema,
    COUNT(*) as quantidade
FROM notifications n
LEFT JOIN profiles p ON n.user_id = p.id
WHERE p.id IS NULL;

-- 16. VERIFICAR CONFIGURAÇÕES DO SUPABASE
-- Verificar se RLS está ativo nas tabelas principais
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '🔒 RLS ATIVO - PODE CAUSAR ERRO 406'
        ELSE '🔓 RLS DESATIVADO - OK'
    END as status_rls
FROM pg_tables 
WHERE tablename IN ('profiles', 'conversations', 'messages', 'conversation_participants', 'notifications')
AND schemaname = 'public';

-- 17. RECOMENDAÇÕES FINAIS
SELECT 
    'RECOMENDAÇÕES' as tipo,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'profiles' 
            AND rowsecurity = true 
            AND schemaname = 'public'
        ) THEN '⚠️ DESABILITAR RLS NA TABELA PROFILES PARA EVITAR ERRO 406'
        ELSE '✅ RLS DESABILITADO EM PROFILES - OK'
    END as recomendacao;

-- 18. RESUMO EXECUTIVO
SELECT 
    'RESUMO EXECUTIVO' as secao,
    'Verificação completa do banco de dados concluída' as status,
    'Verifique os resultados acima para identificar problemas' as acao;
