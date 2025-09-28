const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function checkEvaluationStatus() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Variáveis de ambiente não encontradas')
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('🔍 Verificando status do sistema de avaliações...\n')

    // 1. Verificar se a tabela evaluation_requests existe
    console.log('1. Verificando tabela evaluation_requests...')
    const { data: tableData, error: tableError } = await supabase
      .from('evaluation_requests')
      .select('id')
      .limit(1)

    if (tableError) {
      console.log('❌ Tabela evaluation_requests NÃO existe')
      console.log('💡 Erro:', tableError.message)
      console.log('\n🔧 SOLUÇÃO:')
      console.log('1. Acesse o Supabase Dashboard')
      console.log('2. Vá para SQL Editor')
      console.log('3. Execute o SQL do arquivo SETUP_EVALUATION_TABLE.md')
      console.log('4. Execute o SQL do arquivo FIX_EVALUATION_ERRORS.md')
      return
    } else {
      console.log('✅ Tabela evaluation_requests existe!')
    }

    // 2. Verificar se a tabela profiles existe (necessária para foreign keys)
    console.log('\n2. Verificando tabela profiles...')
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (profilesError) {
      console.log('❌ Tabela profiles NÃO existe')
      console.log('💡 Erro:', profilesError.message)
      console.log('\n🔧 SOLUÇÃO:')
      console.log('1. A tabela profiles é necessária para o sistema funcionar')
      console.log('2. Verifique se o projeto está configurado corretamente')
      return
    } else {
      console.log('✅ Tabela profiles existe!')
    }

    // 3. Testar inserção de uma solicitação de teste
    console.log('\n3. Testando inserção de solicitação...')
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
      console.log('❌ Erro ao inserir solicitação de teste')
      console.log('💡 Erro:', insertError.message)
      console.log('\n🔧 SOLUÇÃO:')
      console.log('1. Verifique se as políticas RLS estão configuradas')
      console.log('2. Verifique se as foreign keys estão corretas')
    } else {
      console.log('✅ Inserção de solicitação funcionando!')
      console.log('📊 Dados inseridos:', insertData)
    }

    // 4. Testar busca de solicitações
    console.log('\n4. Testando busca de solicitações...')
    const { data: searchData, error: searchError } = await supabase
      .from('evaluation_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (searchError) {
      console.log('❌ Erro ao buscar solicitações')
      console.log('💡 Erro:', searchError.message)
    } else {
      console.log('✅ Busca de solicitações funcionando!')
      console.log('📊 Solicitações encontradas:', searchData?.length || 0)
    }

    console.log('\n🎉 Sistema de avaliações está funcionando corretamente!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkEvaluationStatus()
