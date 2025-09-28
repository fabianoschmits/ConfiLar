require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

async function cleanDuplicateRequests() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Variáveis de ambiente não encontradas')
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('🧹 Limpando solicitações duplicadas...')

    // 1. Verificar solicitações existentes
    console.log('1. Verificando solicitações existentes...')
    const { data: allRequests, error: fetchError } = await supabase
      .from('evaluation_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Erro ao buscar solicitações:', fetchError)
      return
    }

    console.log(`📊 Total de solicitações: ${allRequests?.length || 0}`)

    if (allRequests && allRequests.length > 0) {
      console.log('📋 Solicitações existentes:')
      allRequests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.requester_id} -> ${req.target_id} (${req.status}) - ${req.created_at}`)
      })
    }

    // 2. Identificar duplicatas
    console.log('\n2. Identificando duplicatas...')
    const duplicates = new Map()
    
    if (allRequests) {
      allRequests.forEach(request => {
        const key = `${request.requester_id}-${request.target_id}`
        if (duplicates.has(key)) {
          duplicates.get(key).push(request)
        } else {
          duplicates.set(key, [request])
        }
      })
    }

    const duplicatePairs = Array.from(duplicates.entries()).filter(([key, requests]) => requests.length > 1)
    
    if (duplicatePairs.length > 0) {
      console.log(`🔍 Encontradas ${duplicatePairs.length} duplicatas:`)
      duplicatePairs.forEach(([key, requests]) => {
        console.log(`  - ${key}: ${requests.length} solicitações`)
      })
    } else {
      console.log('✅ Nenhuma duplicata encontrada!')
    }

    // 3. Limpar duplicatas (manter apenas a mais recente)
    if (duplicatePairs.length > 0) {
      console.log('\n3. Limpando duplicatas...')
      
      for (const [key, requests] of duplicatePairs) {
        // Ordenar por data de criação (mais recente primeiro)
        const sortedRequests = requests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        
        // Manter apenas a primeira (mais recente) e deletar as outras
        const toDelete = sortedRequests.slice(1)
        
        for (const request of toDelete) {
          console.log(`🗑️ Deletando solicitação duplicada: ${request.id}`)
          
          const { error: deleteError } = await supabase
            .from('evaluation_requests')
            .delete()
            .eq('id', request.id)
          
          if (deleteError) {
            console.error(`❌ Erro ao deletar ${request.id}:`, deleteError)
          } else {
            console.log(`✅ Deletada com sucesso: ${request.id}`)
          }
        }
      }
    }

    // 4. Verificar resultado final
    console.log('\n4. Verificando resultado final...')
    const { data: finalRequests, error: finalError } = await supabase
      .from('evaluation_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (finalError) {
      console.error('❌ Erro ao verificar resultado:', finalError)
    } else {
      console.log(`✅ Solicitações restantes: ${finalRequests?.length || 0}`)
    }

    console.log('\n🎉 Limpeza concluída!')
    console.log('\n💡 O sistema de avaliações deve funcionar sem erros agora!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

cleanDuplicateRequests()

