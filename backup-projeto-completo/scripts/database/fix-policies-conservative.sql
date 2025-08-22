-- Script conservador para corrigir políticas RLS
-- Execute no SQL Editor do Supabase

-- ========================================
-- 1. REMOVER APENAS POLÍTICAS PROBLEMÁTICAS
-- ========================================

-- Remover apenas as políticas "Enable all for authenticated users" que podem estar causando conflito
DROP POLICY IF EXISTS "Enable all for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON conversation_participants;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON messages;

-- ========================================
-- 2. VERIFICAR POLÍTICAS RESTANTES
-- ========================================
SELECT 
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename, policyname;

-- ========================================
-- 3. SE NÃO HOUVER POLÍTICAS, CRIAR UMA SIMPLES
-- ========================================
-- Execute apenas se não houver políticas restantes
DO $$
BEGIN
  -- Verificar se conversations tem políticas
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations') THEN
    CREATE POLICY "conversations_default" ON conversations FOR ALL USING (true);
  END IF;
  
  -- Verificar se conversation_participants tem políticas
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_participants') THEN
    CREATE POLICY "participants_default" ON conversation_participants FOR ALL USING (true);
  END IF;
  
  -- Verificar se messages tem políticas
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages') THEN
    CREATE POLICY "messages_default" ON messages FOR ALL USING (true);
  END IF;
END $$;

-- ========================================
-- 4. VERIFICAR RESULTADO FINAL
-- ========================================
SELECT 
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename, policyname;
