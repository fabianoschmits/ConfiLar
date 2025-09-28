const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function createEvaluationTableFinal() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Variáveis de ambiente não encontradas')
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('🔧 Criando tabela evaluation_requests no Supabase...')

    // SQL para criar a tabela
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS evaluation_requests (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(requester_id, target_id)
      );
    `

    // Executar SQL usando RPC
    const { data: createResult, error: createError } = await supabase.rpc('exec', {
      sql: createTableSQL
    })

    if (createError) {
      console.log('⚠️ Erro ao executar SQL via RPC:', createError.message)
      console.log('💡 Tentando método alternativo...')
      
      // Método alternativo: tentar inserir um registro de teste
      try {
        const { data: testData, error: testError } = await supabase
          .from('evaluation_requests')
          .insert({
            requester_id: '00000000-0000-0000-0000-000000000001',
            target_id: '00000000-0000-0000-0000-000000000002',
            status: 'pending'
          })
          .select()

        if (testError) {
          console.error('❌ Tabela não existe e não pode ser criada automaticamente')
          console.log('📝 Execute este SQL no Supabase Dashboard:')
          console.log(createTableSQL)
          console.log('\n🔐 Depois execute as políticas RLS:')
          console.log(`
ALTER TABLE evaluation_requests ENABLE ROW LEVEL SECURITY;

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
      } catch (insertError) {
        console.error('❌ Erro ao inserir dados de teste:', insertError)
      }
    } else {
      console.log('✅ Tabela criada com sucesso via RPC!')
      console.log('📊 Resultado:', createResult)
    }

    // Verificar se a tabela existe agora
    console.log('\n🔍 Verificando se a tabela existe...')
    const { data: checkData, error: checkError } = await supabase
      .from('evaluation_requests')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('❌ Tabela ainda não existe:', checkError.message)
    } else {
      console.log('✅ Tabela evaluation_requests está funcionando!')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createEvaluationTableFinal()
