require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

async function fixEvaluationRLS() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Variáveis de ambiente não encontradas')
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('🔧 Verificando e corrigindo políticas RLS...')

    // 1. Verificar se a tabela existe
    console.log('1. Verificando tabela evaluation_requests...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('evaluation_requests')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('❌ Tabela evaluation_requests não existe:', tableError)
      return
    }

    console.log('✅ Tabela evaluation_requests existe!')

    // 2. Testar inserção com service role (bypass RLS)
    console.log('2. Testando inserção com service role...')
    const { data: testInsert, error: insertError } = await supabase
      .from('evaluation_requests')
      .insert({
        requester_id: '0de9bbad-1faf-435b-9efb-31eb156550d8',
        target_id: 'f7444305-a3bd-4d71-874a-bb95fd27f96a',
        status: 'pending'
      })
      .select()

    if (insertError) {
      console.error('❌ Erro ao inserir com service role:', insertError)
    } else {
      console.log('✅ Inserção com service role funcionou!')
      console.log('📋 ID da solicitação:', testInsert[0]?.id)
    }

    // 3. Testar busca
    console.log('3. Testando busca...')
    const { data: testSelect, error: selectError } = await supabase
      .from('evaluation_requests')
      .select('*')
      .eq('requester_id', '0de9bbad-1faf-435b-9efb-31eb156550d8')
      .eq('target_id', 'f7444305-a3bd-4d71-874a-bb95fd27f96a')

    if (selectError) {
      console.error('❌ Erro ao buscar:', selectError)
    } else {
      console.log('✅ Busca funcionou!')
      console.log('📊 Registros encontrados:', testSelect?.length || 0)
    }

    // 4. Verificar se os usuários existem
    console.log('4. Verificando usuários...')
    const { data: requester, error: requesterError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', '0de9bbad-1faf-435b-9efb-31eb156550d8')
      .single()

    if (requesterError) {
      console.error('❌ Requester não existe:', requesterError)
    } else {
      console.log('✅ Requester existe:', requester.full_name)
    }

    const { data: target, error: targetError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', 'f7444305-a3bd-4d71-874a-bb95fd27f96a')
      .single()

    if (targetError) {
      console.error('❌ Target não existe:', targetError)
    } else {
      console.log('✅ Target existe:', target.full_name)
    }

    console.log('\n🎉 Verificação concluída!')
    console.log('\n💡 PRÓXIMOS PASSOS:')
    console.log('1. Se os usuários não existem, crie-os primeiro')
    console.log('2. Se a inserção falhou, verifique as políticas RLS')
    console.log('3. Teste o sistema novamente')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

fixEvaluationRLS()


