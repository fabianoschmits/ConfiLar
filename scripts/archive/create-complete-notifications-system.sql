-- =====================================================
-- SISTEMA COMPLETO DE NOTIFICAÇÕES - CONFILAR
-- =====================================================

-- =====================================================
-- 1. TABELA NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'info', 'success', 'warning', 'error', 'message', 
    'review', 'booking', 'verification', 'achievement', 
    'system', 'chat', 'evaluation', 'recommendation'
  )),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- =====================================================
-- 2. TABELA NOTIFICATION_PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  chat_notifications BOOLEAN DEFAULT TRUE,
  review_notifications BOOLEAN DEFAULT TRUE,
  booking_notifications BOOLEAN DEFAULT TRUE,
  system_notifications BOOLEAN DEFAULT TRUE,
  marketing_notifications BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- =====================================================
-- 3. TABELA NOTIFICATION_TEMPLATES
-- =====================================================

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

-- Inserir templates padrão
INSERT INTO notification_templates (name, type, title_template, message_template) VALUES
('chat_message', 'chat', 'Nova mensagem de {{sender_name}}', '{{sender_name}} enviou uma mensagem: "{{message_preview}}"'),
('review_received', 'review', 'Nova avaliação recebida', '{{reviewer_name}} avaliou seu trabalho com {{rating}} estrelas'),
('recommendation_received', 'recommendation', 'Nova recomendação', '{{recommender_name}} recomendou seu trabalho'),
('booking_request', 'booking', 'Nova solicitação de serviço', '{{client_name}} solicitou seus serviços'),
('system_update', 'system', 'Atualização do sistema', '{{message}}'),
('achievement_unlocked', 'achievement', 'Conquista desbloqueada!', 'Você desbloqueou a conquista: {{achievement_name}}')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 4. TABELA NOTIFICATION_QUEUE
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'push', 'sms', 'in_app')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled_at ON notification_queue(scheduled_at);

-- =====================================================
-- 5. RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

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
CREATE POLICY "Users can manage their own preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para notification_templates (apenas admins)
CREATE POLICY "Admins can manage templates" ON notification_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

-- Políticas para notification_queue (apenas sistema)
CREATE POLICY "System can manage queue" ON notification_queue
  FOR ALL USING (true);

-- =====================================================
-- 6. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para criar notificação
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal',
  p_metadata JSONB DEFAULT '{}',
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, title, message, type, action_url, priority, metadata, expires_at
  ) VALUES (
    p_user_id, p_title, p_message, p_type, p_action_url, p_priority, p_metadata, p_expires_at
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications 
  SET is_read = TRUE, updated_at = NOW()
  WHERE id = p_notification_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para obter notificações não lidas
CREATE OR REPLACE FUNCTION get_unread_notifications(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  message TEXT,
  type TEXT,
  action_url TEXT,
  priority TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT n.id, n.title, n.message, n.type, n.action_url, n.priority, n.created_at
  FROM notifications n
  WHERE n.user_id = p_user_id 
    AND n.is_read = FALSE
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
  ORDER BY n.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar notificações antigas
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications 
  WHERE expires_at IS NOT NULL 
    AND expires_at < NOW()
    AND is_read = TRUE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at em notifications
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Trigger para atualizar updated_at em notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Trigger para atualizar updated_at em notification_templates
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- =====================================================
-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE notifications IS 'Armazena todas as notificações dos usuários';
COMMENT ON TABLE notification_preferences IS 'Preferências de notificação dos usuários';
COMMENT ON TABLE notification_templates IS 'Templates para diferentes tipos de notificação';
COMMENT ON TABLE notification_queue IS 'Fila de notificações para processamento assíncrono';

COMMENT ON COLUMN notifications.type IS 'Tipo da notificação: info, success, warning, error, message, review, booking, verification, achievement, system, chat, evaluation, recommendation';
COMMENT ON COLUMN notifications.priority IS 'Prioridade: low, normal, high, urgent';
COMMENT ON COLUMN notifications.metadata IS 'Dados adicionais em formato JSON';
COMMENT ON COLUMN notifications.expires_at IS 'Data de expiração da notificação (opcional)';

COMMENT ON COLUMN notification_preferences.quiet_hours_start IS 'Horário de início do modo silencioso';
COMMENT ON COLUMN notification_preferences.quiet_hours_end IS 'Horário de fim do modo silencioso';
COMMENT ON COLUMN notification_preferences.timezone IS 'Fuso horário do usuário';

COMMENT ON COLUMN notification_queue.channel IS 'Canal de envio: email, push, sms, in_app';
COMMENT ON COLUMN notification_queue.status IS 'Status: pending, sent, failed, cancelled';
COMMENT ON COLUMN notification_queue.retry_count IS 'Número de tentativas de reenvio';
COMMENT ON COLUMN notification_queue.max_retries IS 'Número máximo de tentativas';



