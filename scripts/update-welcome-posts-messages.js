/**
 * Script para atualizar posts de boas-vindas existentes com as novas mensagens personalizadas
 */

const { createClient } = require('@supabase/supabase-js')
const { getRandomWelcomeMessage } = require('../src/data/welcomeMessages.ts')

const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateWelcomePostsMessages() {
  console.log('🔄 Atualizando posts de boas-vindas com mensagens personalizadas...\n')
  
  try {
    // Buscar todos os posts de boas-vindas
    const { data: welcomePosts, error: fetchError } = await supabase
      .from('feed_posts')
      .select('id, user_id, metadata, title, description, content')
      .eq('metadata->>type', 'welcome')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Erro ao buscar posts de boas-vindas:', fetchError)
      return
    }

    console.log(`📊 Encontrados ${welcomePosts?.length || 0} posts de boas-vindas`)

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const post of welcomePosts || []) {
      try {
        const userName = post.metadata?.user || 'Usuário'
        const userType = post.metadata?.user_type || 'client'
        
        // Gerar nova mensagem personalizada
        const newMessage = getRandomWelcomeMessage(userType, userName)
        
        // Verificar se a mensagem já é personalizada (não contém a mensagem padrão)
        const isAlreadyPersonalized = !post.content.includes('se juntou à comunidade') && 
                                     !post.content.includes('acabei de me juntar')
        
        if (isAlreadyPersonalized) {
          console.log(`⏭️ Pulando ${userName} - já tem mensagem personalizada`)
          skippedCount++
          continue
        }

        // Atualizar o post com a nova mensagem
        const { error: updateError } = await supabase
          .from('feed_posts')
          .update({
            description: newMessage,
            content: newMessage,
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id)

        if (updateError) {
          console.error(`❌ Erro ao atualizar post de ${userName}:`, updateError)
          errorCount++
        } else {
          console.log(`✅ Atualizado: ${userName} - ${newMessage.substring(0, 50)}...`)
          updatedCount++
        }

        // Pequena pausa para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`❌ Erro ao processar post ${post.id}:`, error)
        errorCount++
      }
    }

    console.log('\n📊 Resumo da atualização:')
    console.log(`✅ Posts atualizados: ${updatedCount}`)
    console.log(`⏭️ Posts pulados: ${skippedCount}`)
    console.log(`❌ Erros: ${errorCount}`)

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar atualização
updateWelcomePostsMessages().then(() => {
  console.log('\n✅ Atualização concluída!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Erro na atualização:', error)
  process.exit(1)
})
