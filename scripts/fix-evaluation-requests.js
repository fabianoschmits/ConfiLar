require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

async function fixEvaluationRequests() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Variáveis de ambiente não encontradas')
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('🔧 Corrigindo sistema de avaliações...')

    // 1. Verificar usuários válidos
    console.log('1. Verificando usuários válidos...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, user_type')
      .limit(10)

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError)
      return
    }

    console.log(`📊 Usuários encontrados: ${profiles?.length || 0}`)
    
    if (profiles && profiles.length > 0) {
      console.log('👥 Usuários disponíveis:')
      profiles.forEach(profile => {
        console.log(`  - ${profile.full_name} (${profile.user_type}) - ID: ${profile.id}`)
      })
    }

    // 2. Verificar solicitações existentes
    console.log('\n2. Verificando solicitações existentes...')
    const { data: requests, error: requestsError } = await supabase
      .from('evaluation_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('❌ Erro ao buscar solicitações:', requestsError)
      return
    }

    console.log(`📊 Solicitações encontradas: ${requests?.length || 0}`)

    // 3. Testar criação de solicitação com usuários válidos
    if (profiles && profiles.length >= 2) {
      console.log('\n3. Testando criação de solicitação...')
      
      const requesterId = profiles[0].id
      const targetId = profiles[1].id
      
      console.log(`📝 Criando solicitação: ${profiles[0].full_name} -> ${profiles[1].full_name}`)
      
      const { data: newRequest, error: createError } = await supabase
        .from('evaluation_requests')
        .insert({
          requester_id: requesterId,
          target_id: targetId,
          status: 'pending'
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Erro ao criar solicitação:', createError)
      } else {
        console.log('✅ Solicitação criada com sucesso!')
        console.log('📋 ID da solicitação:', newRequest.id)
      }
    }

    console.log('\n🎉 Verificação concluída!')
    console.log('\n💡 O sistema de avaliações deve estar funcionando agora!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

fixEvaluationRequests()

