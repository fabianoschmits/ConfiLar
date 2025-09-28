-- =============================================
-- SCRIPT PARA SISTEMA DE DENÚNCIAS COM ADMINISTRADORES
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Remover tabela existente se houver problemas
DROP TABLE IF EXISTS reports CASCADE;

-- 2. Criar tabela de administradores (opcional)
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'moderator' CHECK (role IN ('moderator', 'admin', 'super_admin')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. Criar tabela de denúncias
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('user', 'post', 'message', 'review', 'other')),
  reason VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
  reported_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  admin_notes TEXT,
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índices para performance
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_priority ON reports(priority);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_admins_user_id ON admins(user_id);

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 6. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
DROP POLICY IF EXISTS "Admins can update all reports" ON reports;
DROP POLICY IF EXISTS "Admins can view admins table" ON admins;

-- 7. Criar políticas RLS para denúncias
-- Política para usuários verem suas próprias denúncias
CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Política para usuários inserirem suas próprias denúncias
CREATE POLICY "Users can insert their own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Política para usuários atualizarem suas próprias denúncias (apenas se pendente)
CREATE POLICY "Users can update their own reports" ON reports
  FOR UPDATE USING (auth.uid() = reporter_id AND status = 'pending');

-- Política para administradores verem todas as denúncias
CREATE POLICY "Admins can view all reports" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

-- Política para administradores atualizarem todas as denúncias
CREATE POLICY "Admins can update all reports" ON reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

-- 8. Políticas RLS para tabela de administradores
CREATE POLICY "Admins can view admins table" ON admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

-- 9. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Criar trigger para atualizar updated_at
CREATE TRIGGER trigger_update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();

-- 11. Criar view para estatísticas de denúncias
CREATE OR REPLACE VIEW reports_stats AS
SELECT 
  COUNT(*) as total_reports,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_reports,
  COUNT(*) FILTER (WHERE status = 'reviewing') as reviewing_reports,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_reports,
  COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed_reports,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as reports_last_24h,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as reports_last_7d,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as reports_last_30d
FROM reports;

-- 12. Criar view para denúncias com informações relacionadas
CREATE OR REPLACE VIEW reports_with_details AS
SELECT 
  r.id,
  r.type,
  r.reason,
  r.description,
  r.status,
  r.priority,
  r.reporter_id,
  r.reported_user_id,
  r.reported_post_id,
  r.reported_message_id,
  r.admin_notes,
  r.resolution,
  r.created_at,
  r.updated_at,
  reporter.full_name as reporter_name,
  reporter.email as reporter_email,
  reporter.user_type as reporter_type,
  reported_user.full_name as reported_user_name,
  reported_user.email as reported_user_email,
  reported_user.user_type as reported_user_type,
  fp.title as reported_post_title,
  fp.content as reported_post_content
FROM reports r
LEFT JOIN profiles reporter ON r.reporter_id = reporter.id
LEFT JOIN profiles reported_user ON r.reported_user_id = reported_user.id
LEFT JOIN feed_posts fp ON r.reported_post_id = fp.id;

-- 13. Função para adicionar administrador
CREATE OR REPLACE FUNCTION add_admin(admin_user_id UUID, admin_role VARCHAR DEFAULT 'moderator')
RETURNS UUID AS $$
DECLARE
  new_admin_id UUID;
BEGIN
  INSERT INTO admins (user_id, role, created_by)
  VALUES (admin_user_id, admin_role, auth.uid())
  RETURNING id INTO new_admin_id;
  
  RETURN new_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Função para verificar se usuário é administrador
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Comentários para documentação
COMMENT ON TABLE reports IS 'Tabela para armazenar denúncias de usuários sobre conteúdo ou outros usuários';
COMMENT ON TABLE admins IS 'Tabela para armazenar administradores do sistema';
COMMENT ON COLUMN reports.type IS 'Tipo da denúncia: user, post, message, review, other';
COMMENT ON COLUMN reports.reason IS 'Motivo da denúncia (ex: spam, conteúdo inapropriado)';
COMMENT ON COLUMN reports.description IS 'Descrição detalhada da denúncia';
COMMENT ON COLUMN reports.status IS 'Status da denúncia: pending, reviewing, resolved, dismissed';
COMMENT ON COLUMN reports.priority IS 'Prioridade da denúncia: low, medium, high, urgent';
COMMENT ON COLUMN reports.admin_notes IS 'Notas do administrador sobre a denúncia';
COMMENT ON COLUMN reports.resolution IS 'Resolução aplicada à denúncia';
COMMENT ON COLUMN admins.role IS 'Papel do administrador: moderator, admin, super_admin';

-- 16. Verificar se tudo foi criado corretamente
SELECT 
  'Sistema de denúncias com administradores criado com sucesso!' as status,
  COUNT(*) as total_reports
FROM reports;

-- 17. Instruções para adicionar administradores
-- Para adicionar um administrador, execute:
-- SELECT add_admin('USER_ID_AQUI', 'admin');
-- 
-- Para verificar se um usuário é administrador:
-- SELECT is_admin('USER_ID_AQUI');
