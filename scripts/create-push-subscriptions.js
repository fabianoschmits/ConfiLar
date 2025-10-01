const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = `
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
`;

async function executeSQL() {
  try {
    console.log('🚀 EXECUTANDO SCRIPT SQL PARA PUSH_SUBSCRIPTIONS');
    console.log('=' * 50);
    
    // Executar SQL diretamente
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      return;
    }
    
    console.log('✅ TABELA PUSH_SUBSCRIPTIONS CRIADA COM SUCESSO!');
    console.log('📊 ESTRUTURA DA TABELA:');
    console.log('   - id: UUID (Primary Key)');
    console.log('   - user_id: UUID (Foreign Key -> profiles)');
    console.log('   - endpoint: TEXT (Push endpoint)');
    console.log('   - p256dh: TEXT (Public key)');
    console.log('   - auth: TEXT (Auth key)');
    console.log('   - created_at: TIMESTAMP');
    console.log('   - updated_at: TIMESTAMP');
    console.log('   - RLS habilitado');
    console.log('   - Índices criados');
    console.log('   - Triggers configurados');
    
    // Verificar se a tabela foi criada
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'push_subscriptions');
    
    if (tableError) {
      console.log('⚠️ Não foi possível verificar a criação da tabela');
    } else if (tables && tables.length > 0) {
      console.log('✅ Tabela push_subscriptions confirmada no banco!');
    }
    
  } catch (error) {
    console.error('❌ Erro na execução:', error);
  }
}

executeSQL();


