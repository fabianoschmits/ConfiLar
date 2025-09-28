const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function createEvaluationTable() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Variáveis de ambiente não encontradas')
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('🔧 Criando tabela evaluation_requests...')

    // Tentar criar a tabela usando uma query SQL direta
    const { data, error } = await supabase
      .from('evaluation_requests')
      .select('id')
      .limit(1)

    if (error && error.code === 'PGRST116') {
      console.log('📋 Tabela não existe, criando...')
      
      // Como não podemos executar SQL diretamente, vamos criar um registro de teste
      // que forçará a criação da tabela
      const { data: testData, error: testError } = await supabase
        .from('evaluation_requests')
        .insert({
          requester_id: '00000000-0000-0000-0000-000000000001',
          target_id: '00000000-0000-0000-0000-000000000002',
          status: 'pending'
        })
        .select()

      if (testError) {
        console.error('❌ Erro ao criar tabela:', testError.message)
        console.log('💡 Você precisa criar a tabela manualmente no Supabase Dashboard')
        console.log('📝 SQL para executar:')
        console.log(`
CREATE TABLE evaluation_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, target_id)
);

-- RLS
ALTER TABLE evaluation_requests ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view their own evaluation requests" ON evaluation_requests
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = target_id);

CREATE POLICY "Users can create evaluation requests" ON evaluation_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id AND auth.uid() != target_id);

CREATE POLICY "Users can update their own evaluation requests" ON evaluation_requests
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = target_id);

CREATE POLICY "Users can delete their own evaluation requests" ON evaluation_requests
  FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = target_id);
        `)
      } else {
        console.log('✅ Tabela criada com sucesso!')
        console.log('📊 Dados de teste:', testData)
      }
    } else if (error) {
      console.error('❌ Erro inesperado:', error)
    } else {
      console.log('✅ Tabela evaluation_requests já existe!')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createEvaluationTable()
