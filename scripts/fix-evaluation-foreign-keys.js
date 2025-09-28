require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

async function fixEvaluationForeignKeys() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Variáveis de ambiente não encontradas')
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('🔧 Corrigindo foreign keys da tabela evaluation_requests...')

    // 1. Verificar se há registros órfãos
    console.log('1. Verificando registros órfãos...')
    const { data: orphanRecords, error: orphanError } = await supabase
      .from('evaluation_requests')
      .select(`
        id,
        requester_id,
        target_id,
        status,
        created_at
      `)

    if (orphanError) {
      console.error('❌ Erro ao verificar registros órfãos:', orphanError)
      return
    }

    console.log(`📊 Total de registros: ${orphanRecords?.length || 0}`)

    // 2. Verificar se os IDs existem na tabela profiles
    if (orphanRecords && orphanRecords.length > 0) {
      console.log('2. Verificando IDs válidos na tabela profiles...')
      
      for (const record of orphanRecords) {
        // Verificar requester_id
        const { data: requesterExists, error: requesterError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', record.requester_id)
          .single()

        if (requesterError) {
          console.log(`❌ requester_id ${record.requester_id} não existe na tabela profiles`)
        } else {
          console.log(`✅ requester_id ${record.requester_id} existe`)
        }

        // Verificar target_id
        const { data: targetExists, error: targetError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', record.target_id)
          .single()

        if (targetError) {
          console.log(`❌ target_id ${record.target_id} não existe na tabela profiles`)
        } else {
          console.log(`✅ target_id ${record.target_id} existe`)
        }
      }
    }

    // 3. Verificar se há usuários na tabela profiles
    console.log('3. Verificando usuários na tabela profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, user_type')
      .limit(5)

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError)
      return
    }

    console.log(`📊 Usuários encontrados: ${profiles?.length || 0}`)
    if (profiles && profiles.length > 0) {
      console.log('👥 Primeiros usuários:')
      profiles.forEach(profile => {
        console.log(`  - ${profile.full_name} (${profile.user_type}) - ID: ${profile.id}`)
      })
    }

    console.log('\n🎉 Verificação concluída!')
    console.log('\n💡 PRÓXIMOS PASSOS:')
    console.log('1. Se há registros órfãos, você pode deletá-los')
    console('2. Se não há usuários na tabela profiles, crie alguns usuários primeiro')
    console.log('3. Teste o sistema de avaliações novamente')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

fixEvaluationForeignKeys()

