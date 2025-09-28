-- =============================================
-- SCRIPT CORRIGIDO PARA CRIAR SISTEMA DE DENÚNCIAS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Remover tabela existente se houver problemas
DROP TABLE IF EXISTS reports CASCADE;

-- 2. Criar tabela de denúncias
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

-- 3. Criar índices para performance
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_priority ON reports(priority);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
DROP POLICY IF EXISTS "Admins can update all reports" ON reports;

-- 6. Criar políticas RLS
-- Política para usuários verem suas próprias denúncias
CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Política para usuários inserirem suas próprias denúncias
CREATE POLICY "Users can insert their own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Política para usuários atualizarem suas próprias denúncias (apenas se pendente)
CREATE POLICY "Users can update their own reports" ON reports
  FOR UPDATE USING (auth.uid() = reporter_id AND status = 'pending');

-- Política para admins verem todas as denúncias
CREATE POLICY "Admins can view all reports" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Política para admins atualizarem todas as denúncias
CREATE POLICY "Admins can update all reports" ON reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- 7. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar trigger para atualizar updated_at
CREATE TRIGGER trigger_update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();

-- 9. Criar view para estatísticas de denúncias
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

-- 10. Criar view para denúncias com informações relacionadas
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

-- 11. Inserir dados de exemplo (opcional - remover em produção)
-- Comentado para evitar erros se não houver usuários
-- INSERT INTO reports (type, reason, description, reporter_id, reported_user_id, priority) VALUES
-- ('user', 'Comportamento inadequado', 'Usuário enviando mensagens ofensivas', 
--  (SELECT id FROM auth.users LIMIT 1), 
--  (SELECT id FROM auth.users LIMIT 1 OFFSET 1), 
--  'high'),
-- ('post', 'Conteúdo inapropriado', 'Post contém informações falsas sobre serviços', 
--  (SELECT id FROM auth.users LIMIT 1), 
--  NULL, 
--  'medium'),
-- ('message', 'Spam', 'Usuário enviando mensagens repetitivas', 
--  (SELECT id FROM auth.users LIMIT 1), 
--  (SELECT id FROM auth.users LIMIT 1 OFFSET 2), 
--  'low')
-- ON CONFLICT DO NOTHING;

-- 12. Comentários para documentação
COMMENT ON TABLE reports IS 'Tabela para armazenar denúncias de usuários sobre conteúdo ou outros usuários';
COMMENT ON COLUMN reports.type IS 'Tipo da denúncia: user, post, message, review, other';
COMMENT ON COLUMN reports.reason IS 'Motivo da denúncia (ex: spam, conteúdo inapropriado)';
COMMENT ON COLUMN reports.description IS 'Descrição detalhada da denúncia';
COMMENT ON COLUMN reports.status IS 'Status da denúncia: pending, reviewing, resolved, dismissed';
COMMENT ON COLUMN reports.priority IS 'Prioridade da denúncia: low, medium, high, urgent';
COMMENT ON COLUMN reports.admin_notes IS 'Notas do administrador sobre a denúncia';
COMMENT ON COLUMN reports.resolution IS 'Resolução aplicada à denúncia';

-- 13. Verificar se tudo foi criado corretamente
SELECT 
  'Tabela reports criada com sucesso!' as status,
  COUNT(*) as total_reports
FROM reports;
