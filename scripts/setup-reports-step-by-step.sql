-- =============================================
-- SCRIPT PASSO A PASSO PARA CRIAR SISTEMA DE DENÚNCIAS
-- Execute cada seção separadamente no Supabase Dashboard > SQL Editor
-- =============================================

-- PASSO 1: Remover tabela existente se houver problemas
DROP TABLE IF EXISTS reports CASCADE;

-- PASSO 2: Criar tabela de denúncias (execute apenas esta parte primeiro)
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

-- PASSO 3: Verificar se a tabela foi criada (execute esta parte para testar)
SELECT 
  'Tabela reports criada com sucesso!' as status,
  COUNT(*) as total_reports
FROM reports;
