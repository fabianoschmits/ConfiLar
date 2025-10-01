-- =====================================================
-- SISTEMA DE NOTIFICAÇÕES - CONFILAR (CORRIGIDO)
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PARTE 1: LIMPEZA (Execute primeiro)
-- =====================================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view their own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can view their own logs" ON notification_logs;

-- Remover triggers existentes
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;

-- Remover views existentes
DROP VIEW IF EXISTS notification_stats;
DROP VIEW IF EXISTS recent_notifications;

-- Remover funções existentes
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS create_notification(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS mark_notification_read(UUID, UUID);
DROP FUNCTION IF EXISTS cleanup_expired_notifications();

-- =====================================================
-- PARTE 2: TABELAS (Execute segundo)
-- =====================================================

-- Tabela notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'message', 'review', 'booking', 'verification', 'achievement', 
    'system', 'chat', 'evaluation', 'recommendation', 'favorite',
    'follow', 'profile_view', 'post_like', 'post_comment', 'availability',
    'portfolio', 'reputation', 'admin', 'security', 'maintenance',
    'update', 'reminder', 'success', 'warning', 'error', 'info'
  )),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabela notification_preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  in_app_notifications BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  vibration_enabled BOOLEAN DEFAULT TRUE,
  desktop_notifications BOOLEAN DEFAULT TRUE,
  mobile_notifications BOOLEAN DEFAULT TRUE,
  message_notifications BOOLEAN DEFAULT TRUE,
  review_notifications BOOLEAN DEFAULT TRUE,
  system_notifications BOOLEAN DEFAULT TRUE,
  achievement_notifications BOOLEAN DEFAULT TRUE,
  security_notifications BOOLEAN DEFAULT TRUE,
  marketing_notifications BOOLEAN DEFAULT FALSE,
  notification_frequency TEXT DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

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
-- PARTE 3: ÍNDICES (Execute terceiro)
-- =====================================================

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

-- Índices compostos
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_type ON notifications(created_at, type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_action ON notification_logs(user_id, action);

-- =====================================================
-- PARTE 4: FUNÇÕES (Execute quarto)
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar notificação
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_priority TEXT DEFAULT 'normal',
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, title, message, type, priority, action_url, metadata, expires_at
  ) VALUES (
    p_user_id, p_title, p_message, p_type, p_priority, p_action_url, p_metadata, p_expires_at
  ) RETURNING id INTO notification_id;
  
  INSERT INTO notification_logs (notification_id, user_id, action)
  VALUES (notification_id, p_user_id, 'created');
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications 
  SET is_read = TRUE, updated_at = NOW()
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  INSERT INTO notification_logs (notification_id, user_id, action)
  VALUES (p_notification_id, p_user_id, 'read');
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar notificações expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PARTE 5: TRIGGERS (Execute quinto)
-- =====================================================

-- Triggers para updated_at
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at 
  BEFORE UPDATE ON notification_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at 
  BEFORE UPDATE ON notification_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PARTE 6: RLS (Execute sexto)
-- =====================================================

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Políticas para notification_preferences
CREATE POLICY "Users can view their own preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para notification_logs
CREATE POLICY "Users can view their own logs" ON notification_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert logs" ON notification_logs
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- PARTE 7: DADOS INICIAIS (Execute sétimo)
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
-- PARTE 8: VIEWS (Execute oitavo)
-- =====================================================

-- View para estatísticas de notificações
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
  user_id,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE is_read = FALSE) as unread_count,
  COUNT(*) FILTER (WHERE type = 'message') as message_count,
  COUNT(*) FILTER (WHERE type = 'review') as review_count,
  COUNT(*) FILTER (WHERE type = 'system') as system_count,
  COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
  MAX(created_at) as last_notification
FROM notifications
GROUP BY user_id;

-- View para notificações recentes
CREATE OR REPLACE VIEW recent_notifications AS
SELECT 
  n.*,
  COALESCE(p.name, 'Usuário') as user_name,
  p.avatar_url
FROM notifications n
LEFT JOIN profiles p ON n.user_id = p.id
WHERE n.created_at >= NOW() - INTERVAL '7 days'
ORDER BY n.created_at DESC;

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

-- =====================================================
-- SISTEMA DE NOTIFICAÇÕES CRIADO COM SUCESSO!
-- =====================================================
