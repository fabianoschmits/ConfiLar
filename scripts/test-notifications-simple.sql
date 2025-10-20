-- =====================================================
-- TESTE SIMPLES DO SISTEMA DE NOTIFICAÇÕES
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Verificar se a tabela notifications existe e sua estrutura
SELECT 
  'ESTRUTURA_NOTIFICATIONS' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'notifications'
ORDER BY ordinal_position;

-- Verificar se há notificações na tabela
SELECT 
  'CONTAGEM_NOTIFICATIONS' as status,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE is_read = false) as unread_count,
  COUNT(*) FILTER (WHERE is_read = true) as read_count
FROM notifications;

-- Verificar políticas RLS
SELECT 
  'POLITICAS_RLS' as status,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY policyname;

-- Verificar se RLS está habilitado
SELECT 
  'RLS_STATUS' as status,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'notifications';

-- Testar inserção de notificação de teste
INSERT INTO notifications (
  user_id,
  title,
  message,
  type,
  is_read,
  priority
) VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'Teste de Notificação',
  'Esta é uma notificação de teste para verificar se o sistema está funcionando.',
  'info',
  false,
  'normal'
) RETURNING id, title, created_at;

-- Verificar se a notificação foi inserida
SELECT 
  'NOTIFICACAO_TESTE' as status,
  id,
  title,
  message,
  type,
  is_read,
  created_at
FROM notifications 
WHERE title = 'Teste de Notificação'
ORDER BY created_at DESC
LIMIT 1;

-- Limpar notificação de teste
DELETE FROM notifications 
WHERE title = 'Teste de Notificação';

SELECT 
  'RESUMO_TESTE' as status,
  'Sistema de notificações testado com sucesso!' as resultado,
  NOW() as timestamp;
