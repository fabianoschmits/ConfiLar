const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function testEvaluationSystem() {
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

    console.log('🧪 Testando novo sistema de avaliações...')

    // 1. Verificar se a tabela existe
    console.log('\n1. Verificando se a tabela evaluation_requests existe...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('evaluation_requests')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('❌ Tabela evaluation_requests não existe:', tableError.message)
      console.log('💡 Execute o script de criação da tabela primeiro')
      return
    }

    console.log('✅ Tabela evaluation_requests existe!')

    // 2. Testar inserção de uma solicitação
    console.log('\n2. Testando inserção de solicitação...')
    const testRequesterId = '00000000-0000-0000-0000-000000000001'
    const testTargetId = '00000000-0000-0000-0000-000000000002'

    const { data: insertData, error: insertError } = await supabase
      .from('evaluation_requests')
      .insert({
        requester_id: testRequesterId,
        target_id: testTargetId,
        status: 'pending'
      })
      .select()

    if (insertError) {
      console.error('❌ Erro ao inserir solicitação:', insertError.message)
    } else {
      console.log('✅ Solicitação inserida com sucesso!')
      console.log('📊 Dados:', insertData)
    }

    // 3. Testar busca de solicitações
    console.log('\n3. Testando busca de solicitações...')
    const { data: requests, error: fetchError } = await supabase
      .from('evaluation_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (fetchError) {
      console.error('❌ Erro ao buscar solicitações:', fetchError.message)
    } else {
      console.log('✅ Solicitações encontradas:', requests?.length || 0)
      if (requests && requests.length > 0) {
        console.log('📋 Primeira solicitação:', requests[0])
      }
    }

    // 4. Testar atualização de status
    if (insertData && insertData.length > 0) {
      console.log('\n4. Testando atualização de status...')
      const requestId = insertData[0].id

      const { data: updateData, error: updateError } = await supabase
        .from('evaluation_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .select()

      if (updateError) {
        console.error('❌ Erro ao atualizar status:', updateError.message)
      } else {
        console.log('✅ Status atualizado com sucesso!')
        console.log('📊 Dados atualizados:', updateData)
      }
    }

    console.log('\n🎉 Teste do sistema de avaliações concluído!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testEvaluationSystem()
