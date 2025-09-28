const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testPostViews() {
  console.log('🧪 Testando sistema de visualizações...\n')

  try {
    // Verificar se a tabela existe tentando fazer uma query simples
    console.log('📊 Verificando tabela post_views...')
    
    const { data, error } = await supabase
      .from('post_views')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Erro ao acessar tabela post_views:', error.message)
      console.log('💡 A tabela pode não existir. Execute o SQL em scripts/create-post-views-table.sql')
      return
    }

    console.log('✅ Tabela post_views acessível')
    console.log(`📈 Total de visualizações: ${data.length}`)

    // Testar inserção de uma visualização
    console.log('\n🧪 Testando inserção de visualização...')
    
    const { data: posts } = await supabase
      .from('feed_posts')
      .select('id')
      .limit(1)

    if (!posts || posts.length === 0) {
      console.log('⚠️  Nenhum post encontrado para testar')
      return
    }

    const testPostId = posts[0].id
    const testUserId = '00000000-0000-0000-0000-000000000000' // UUID de teste

    const { data: insertData, error: insertError } = await supabase
      .from('post_views')
      .insert({
        post_id: testPostId,
        user_id: testUserId,
        viewed_at: new Date().toISOString()
      })
      .select()

    if (insertError) {
      console.error('❌ Erro ao inserir visualização:', insertError.message)
      
      if (insertError.code === '23505') {
        console.log('ℹ️  Visualização já existe (erro de duplicata)')
      } else if (insertError.code === 'PGRST301') {
        console.log('ℹ️  Erro de RLS - usuário não autenticado')
      }
    } else {
      console.log('✅ Visualização inserida com sucesso')
    }

    // Testar contagem de visualizações
    console.log('\n📊 Testando contagem de visualizações...')
    
    const { count, error: countError } = await supabase
      .from('post_views')
      .select('*', { count: 'exact' })
      .eq('post_id', testPostId)

    if (countError) {
      console.error('❌ Erro ao contar visualizações:', countError.message)
    } else {
      console.log(`✅ Contagem de visualizações: ${count}`)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testPostViews()
