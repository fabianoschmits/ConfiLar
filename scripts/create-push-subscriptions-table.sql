-- =====================================================
-- TABELA PARA PUSH SUBSCRIPTIONS - CONFILAR PWA
-- =====================================================

-- Criar tabela para armazenar subscriptions de notificações push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para performance
  UNIQUE(user_id, endpoint)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- RLS (Row Level Security)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem gerenciar apenas suas próprias subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Política: Admins podem ver todas as subscriptions
CREATE POLICY "Admins can view all push subscriptions" ON push_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Comentários para documentação
COMMENT ON TABLE push_subscriptions IS 'Armazena subscriptions de notificações push dos usuários';
COMMENT ON COLUMN push_subscriptions.user_id IS 'ID do usuário proprietário da subscription';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Endpoint do service worker para push notifications';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'Chave pública P256DH para criptografia';
COMMENT ON COLUMN push_subscriptions.auth IS 'Chave de autenticação para push notifications';





















