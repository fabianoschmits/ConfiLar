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

async function createPushSubscriptionsTable() {
  try {
    console.log('🚀 CRIANDO TABELA PUSH_SUBSCRIPTIONS');
    console.log('=' * 50);
    
    // 1. Criar tabela
    console.log('📋 Criando tabela push_subscriptions...');
    const { error: createError } = await supabase
      .from('push_subscriptions')
      .select('id')
      .limit(1);
    
    if (createError && createError.code === 'PGRST116') {
      // Tabela não existe, vamos criar
      console.log('✅ Tabela push_subscriptions não existe, criando...');
      
      // Como não podemos executar DDL diretamente via client,
      // vamos usar uma abordagem diferente
      console.log('⚠️ Para criar a tabela, execute o SQL manualmente no Supabase SQL Editor:');
      console.log('');
      console.log('-- =====================================================');
      console.log('-- TABELA PARA PUSH SUBSCRIPTIONS - CONFILAR PWA');
      console.log('-- =====================================================');
      console.log('');
      console.log('CREATE TABLE IF NOT EXISTS push_subscriptions (');
      console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
      console.log('  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,');
      console.log('  endpoint TEXT NOT NULL,');
      console.log('  p256dh TEXT NOT NULL,');
      console.log('  auth TEXT NOT NULL,');
      console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
      console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
      console.log('  UNIQUE(user_id, endpoint)');
      console.log(');');
      console.log('');
      console.log('-- Índices para performance');
      console.log('CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);');
      console.log('CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);');
      console.log('');
      console.log('-- RLS (Row Level Security)');
      console.log('ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;');
      console.log('');
      console.log('-- Política: Usuários podem gerenciar apenas suas próprias subscriptions');
      console.log('CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions');
      console.log('  FOR ALL USING (auth.uid() = user_id);');
      console.log('');
      console.log('-- Política: Admins podem ver todas as subscriptions');
      console.log('CREATE POLICY "Admins can view all push subscriptions" ON push_subscriptions');
      console.log('  FOR SELECT USING (');
      console.log('    EXISTS (');
      console.log('      SELECT 1 FROM admins');
      console.log('      WHERE admins.user_id = auth.uid()');
      console.log('    )');
      console.log('  );');
      console.log('');
      console.log('-- Função para atualizar updated_at');
      console.log('CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()');
      console.log('RETURNS TRIGGER AS $$');
      console.log('BEGIN');
      console.log('  NEW.updated_at = NOW();');
      console.log('  RETURN NEW;');
      console.log('END;');
      console.log('$$ LANGUAGE plpgsql;');
      console.log('');
      console.log('-- Trigger para atualizar updated_at');
      console.log('CREATE TRIGGER update_push_subscriptions_updated_at');
      console.log('  BEFORE UPDATE ON push_subscriptions');
      console.log('  FOR EACH ROW');
      console.log('  EXECUTE FUNCTION update_push_subscriptions_updated_at();');
      console.log('');
      console.log('-- Comentários para documentação');
      console.log('COMMENT ON TABLE push_subscriptions IS \'Armazena subscriptions de notificações push dos usuários\';');
      console.log('COMMENT ON COLUMN push_subscriptions.user_id IS \'ID do usuário proprietário da subscription\';');
      console.log('COMMENT ON COLUMN push_subscriptions.endpoint IS \'Endpoint do service worker para push notifications\';');
      console.log('COMMENT ON COLUMN push_subscriptions.p256dh IS \'Chave pública P256DH para criptografia\';');
      console.log('COMMENT ON COLUMN push_subscriptions.auth IS \'Chave de autenticação para push notifications\';');
      console.log('');
      console.log('🎯 INSTRUÇÕES:');
      console.log('1. Acesse o Supabase Dashboard');
      console.log('2. Vá para SQL Editor');
      console.log('3. Cole o SQL acima');
      console.log('4. Execute o script');
      console.log('5. Verifique se a tabela foi criada');
      
    } else if (createError) {
      console.error('❌ Erro ao verificar tabela:', createError);
    } else {
      console.log('✅ Tabela push_subscriptions já existe!');
    }
    
  } catch (error) {
    console.error('❌ Erro na execução:', error);
  }
}

createPushSubscriptionsTable();



