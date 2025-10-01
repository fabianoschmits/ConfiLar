-- =====================================================
-- COMPLETAR TABELAS FALTANTES - CONFILAR
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PARTE 1: CRIAR TABELAS FALTANTES
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
-- PARTE 2: ADICIONAR COLUNAS FALTANTES NA TABELA NOTIFICATIONS
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
-- PARTE 3: ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices básicos para notifications
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
-- PARTE 4: FUNÇÕES AUXILIARES
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
-- PARTE 5: TRIGGERS
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
-- PARTE 6: RLS (Row Level Security)
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
-- PARTE 7: DADOS INICIAIS
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
-- PARTE 8: VIEWS
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
  COALESCE(p.name, p.full_name, 'Usuário') as user_name,
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

-- Verificar colunas da tabela notifications
SELECT 'Colunas da tabela notifications:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- SISTEMA DE NOTIFICAÇÕES COMPLETADO COM SUCESSO!
-- =====================================================
