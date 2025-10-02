-- =====================================================
-- VERIFICAR E CORRIGIR REALTIME
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Verificar se Realtime está habilitado nas tabelas
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 2. Habilitar Realtime para notifications (se não estiver)
-- Isso deve ser feito no Dashboard do Supabase:
-- Database → Replication → selecionar tabela notifications → Enable

-- 3. Verificar políticas RLS de notifications
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'notifications';

-- 4. Garantir que RLS permite leitura
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT 
  USING (auth.uid() = user_id);

-- 5. Política para inserção (sistema pode criar para qualquer usuário)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON notifications;

CREATE POLICY "Enable insert for authenticated users" ON notifications
  FOR INSERT 
  WITH CHECK (true);

-- 6. Política para atualização (usuário atualiza apenas suas)
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Política para deleção (usuário deleta apenas suas)
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 8. Garantir RLS habilitado
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 9. Verificar resultado
SELECT 
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY cmd;

-- 10. IMPORTANTE: Habilitar Realtime no Dashboard
/*
Para corrigir o WebSocket:
1. Vá para: Supabase Dashboard
2. Database → Replication
3. Procure a tabela "notifications"
4. Clique em "Enable" se não estiver habilitado
5. Salvar

Isso resolve o erro de WebSocket!
*/

SELECT '✅ RLS corrigido! Agora habilite Realtime no Dashboard.' as status;
