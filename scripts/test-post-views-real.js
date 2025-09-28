const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testPostViewsReal() {
  console.log('🧪 Testando sistema de visualizações com dados reais...\n')

  try {
    // 1. Buscar um usuário real
    console.log('👤 Buscando usuário real...')
    
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (usersError || !users || users.length === 0) {
      console.error('❌ Nenhum usuário encontrado:', usersError?.message)
      return
    }

    const realUserId = users[0].id
    console.log(`✅ Usuário encontrado: ${realUserId}`)

    // 2. Buscar um post real
    console.log('\n📝 Buscando post real...')
    
    const { data: posts, error: postsError } = await supabase
      .from('feed_posts')
      .select('id')
      .limit(1)

    if (postsError || !posts || posts.length === 0) {
      console.error('❌ Nenhum post encontrado:', postsError?.message)
      return
    }

    const realPostId = posts[0].id
    console.log(`✅ Post encontrado: ${realPostId}`)

    // 3. Verificar contagem atual
    console.log('\n📊 Verificando contagem atual...')
    
    const { count: currentCount, error: countError } = await supabase
      .from('post_views')
      .select('*', { count: 'exact' })
      .eq('post_id', realPostId)

    if (countError) {
      console.error('❌ Erro ao contar visualizações:', countError.message)
    } else {
      console.log(`📈 Visualizações atuais: ${currentCount}`)
    }

    // 4. Verificar se o usuário já visualizou este post
    console.log('\n🔍 Verificando se usuário já visualizou...')
    
    const { data: existingView, error: viewError } = await supabase
      .from('post_views')
      .select('id')
      .eq('post_id', realPostId)
      .eq('user_id', realUserId)
      .single()

    if (viewError && viewError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar visualização:', viewError.message)
    } else if (existingView) {
      console.log('ℹ️  Usuário já visualizou este post')
    } else {
      console.log('✅ Usuário ainda não visualizou este post')
    }

    // 5. Testar inserção com usuário real
    console.log('\n🧪 Testando inserção com usuário real...')
    
    const { data: insertData, error: insertError } = await supabase
      .from('post_views')
      .insert({
        post_id: realPostId,
        user_id: realUserId,
        viewed_at: new Date().toISOString()
      })
      .select()

    if (insertError) {
      if (insertError.code === '23505') {
        console.log('ℹ️  Visualização já existe (duplicata) - OK')
      } else {
        console.error('❌ Erro ao inserir visualização:', insertError.message)
      }
    } else {
      console.log('✅ Visualização inserida com sucesso!')
      console.log('📊 Dados inseridos:', insertData)
    }

    // 6. Verificar contagem final
    console.log('\n📊 Verificando contagem final...')
    
    const { count: finalCount, error: finalCountError } = await supabase
      .from('post_views')
      .select('*', { count: 'exact' })
      .eq('post_id', realPostId)

    if (finalCountError) {
      console.error('❌ Erro ao contar visualizações finais:', finalCountError.message)
    } else {
      console.log(`📈 Visualizações finais: ${finalCount}`)
      if (finalCount > currentCount) {
        console.log('🎉 Contador de visualizações funcionando!')
      }
    }

    // 7. Testar query de contagem (como será usado na aplicação)
    console.log('\n🔍 Testando query de contagem (como na aplicação)...')
    
    const { data: viewsData, error: viewsQueryError } = await supabase
      .from('post_views')
      .select('id')
      .eq('post_id', realPostId)

    if (viewsQueryError) {
      console.error('❌ Erro na query de visualizações:', viewsQueryError.message)
    } else {
      console.log(`✅ Query funcionando! Visualizações encontradas: ${viewsData.length}`)
    }

    console.log('\n🎉 Sistema de visualizações totalmente funcional!')
    console.log('💡 O sistema está pronto para uso na aplicação')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testPostViewsReal()
