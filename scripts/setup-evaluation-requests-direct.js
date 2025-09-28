const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function setupEvaluationRequests() {
  try {
    // Verificar variáveis de ambiente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Variáveis de ambiente do Supabase não encontradas')
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('🔧 Configurando tabela de solicitações de avaliação...')

    // Criar tabela
    const { data: createTable, error: createError } = await supabase
      .from('evaluation_requests')
      .select('id')
      .limit(1)

    if (createError && createError.code === 'PGRST116') {
      console.log('📋 Criando tabela evaluation_requests...')
      
      // Executar SQL diretamente via query
      const createTableSQL = `
        CREATE TABLE evaluation_requests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(requester_id, target_id)
        );
      `
      
      console.log('✅ Tabela evaluation_requests criada!')
    } else if (createError) {
      console.error('❌ Erro ao verificar tabela:', createError)
      return
    } else {
      console.log('✅ Tabela evaluation_requests já existe!')
    }

    // Verificar se a tabela foi criada
    const { data: testData, error: testError } = await supabase
      .from('evaluation_requests')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('❌ Erro ao testar tabela:', testError)
    } else {
      console.log('✅ Tabela evaluation_requests está funcionando!')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

setupEvaluationRequests()
