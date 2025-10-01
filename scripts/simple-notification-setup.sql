-- =====================================================
-- CONFIGURAÇÃO SIMPLES DE NOTIFICAÇÕES - CONFILAR
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PARTE 1: CRIAR APENAS AS TABELAS FALTANTES
-- =====================================================

-- Tabela notification_templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela notification_logs
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'sent', 'delivered', 'read', 'clicked', 'dismissed', 'expired')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PARTE 2: ADICIONAR COLUNA FALTANTE
-- =====================================================

-- Adicionar coluna expires_at se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' 
                   AND column_name = 'expires_at') THEN
        ALTER TABLE notifications ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- =====================================================
-- PARTE 3: ÍNDICES BÁSICOS
-- =====================================================

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- Índices para notification_logs
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_action ON notification_logs(action);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);

-- =====================================================
-- PARTE 4: FUNÇÃO SIMPLES PARA CRIAR NOTIFICAÇÃO
-- =====================================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_priority TEXT DEFAULT 'normal',
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, title, message, type, priority, action_url, metadata
  ) VALUES (
    p_user_id, p_title, p_message, p_type, p_priority, p_action_url, p_metadata
  ) RETURNING id INTO notification_id;
  
  -- Log da criação
  INSERT INTO notification_logs (notification_id, user_id, action)
  VALUES (notification_id, p_user_id, 'created');
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PARTE 5: DADOS INICIAIS
-- =====================================================

-- Templates de notificação
INSERT INTO notification_templates (name, type, title_template, message_template) VALUES
('welcome', 'system', '🎉 Bem-vindo ao ConfiLar!', 'Sua conta foi criada com sucesso. Complete seu perfil para começar!'),
('new_message', 'message', 'Nova mensagem de {sender_name}', 'Você recebeu uma nova mensagem'),
('new_review', 'review', 'Nova avaliação de {reviewer_name}', 'Você recebeu uma avaliação de {rating} estrelas'),
('new_favorite', 'favorite', '{favoriter_name} adicionou você aos favoritos', 'Seu perfil foi adicionado aos favoritos'),
('profile_view', 'profile_view', '{viewer_name} visualizou seu perfil', 'Alguém visualizou seu perfil profissional'),
('achievement', 'achievement', '🏆 Nova conquista: {achievement_name}', '{description}'),
('verification', 'verification', 'Verificação {status}', 'Sua verificação de {verification_type} foi {status}'),
('security', 'security', '🔒 Alerta de segurança', '{event}: {action}'),
('maintenance', 'maintenance', '🔧 Manutenção programada', 'O sistema passará por manutenção em {start_time} por {duration}'),
('update', 'update', '🆕 Atualização v{version}', 'Novas funcionalidades: {features}')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'notification%'
ORDER BY table_name;

-- Verificar templates inseridos
SELECT 'Templates inseridos:' as status;
SELECT name, type FROM notification_templates ORDER BY name;

-- Verificar colunas da tabela notifications
SELECT 'Colunas da tabela notifications:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- SISTEMA DE NOTIFICAÇÕES CONFIGURADO COM SUCESSO!
-- =====================================================
