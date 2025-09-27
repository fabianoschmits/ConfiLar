const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAfterFix() {
  try {
    console.log('🧪 Testando queries após correções...')

    const tests = [
      {
        name: 'post_reactions com profiles',
        query: () => supabase
          .from('post_reactions')
          .select(`
            id,
            reaction_type,
            created_at,
            profiles!inner(
              id,
              name
            )
          `)
          .limit(1)
      },
      {
        name: 'feed_posts com profiles',
        query: () => supabase
          .from('feed_posts')
          .select(`
            id,
            user_id,
            content,
            images,
            location_city,
            location_state,
            likes_count,
            comments_count,
            created_at,
            user:profiles!feed_posts_user_id_fkey(
              id,
              full_name,
              avatar_url,
              user_type
            )
          `)
          .limit(1)
      },
      {
        name: 'notifications com profiles',
        query: () => supabase
          .from('notifications')
          .select(`
            id,
            user_id,
            title,
            message,
            type,
            category,
            is_read,
            action_url,
            action_label,
            created_at,
            user:profiles!notifications_user_id_fkey(
              id,
              full_name,
              avatar_url,
              user_type
            )
          `)
          .limit(1)
      },
      {
        name: 'post_comments com profiles',
        query: () => supabase
          .from('post_comments')
          .select(`
            id,
            post_id,
            user_id,
            parent_id,
            content,
            mentions,
            hashtags,
            created_at,
            updated_at,
            is_deleted,
            likes_count,
            user:profiles!post_comments_user_id_fkey(
              id,
              full_name,
              avatar_url,
              user_type
            )
          `)
          .limit(1)
      }
    ]

    const results = []

    for (const test of tests) {
      try {
        console.log(`\n🔍 Testando: ${test.name}`)
        const { data, error } = await test.query()

        if (error) {
          console.log(`❌ Erro: ${error.message}`)
          console.log(`🔍 Código: ${error.code}`)
          results.push({ name: test.name, status: '❌', error: error.message })
        } else {
          console.log(`✅ Funcionando!`)
          console.log(`📊 Dados retornados: ${data?.length || 0} registros`)
          results.push({ name: test.name, status: '✅', error: null })
        }
      } catch (err) {
        console.log(`❌ Erro inesperado: ${err.message}`)
        results.push({ name: test.name, status: '❌', error: err.message })
      }
    }

    console.log('\n📊 RESUMO DOS TESTES:')
    console.log('=' .repeat(60))
    
    results.forEach(result => {
      console.log(`${result.name.padEnd(30)} ${result.status}`)
      if (result.error) {
        console.log(`   Erro: ${result.error}`)
      }
    })

    const successCount = results.filter(r => r.status === '✅').length
    const totalCount = results.length

    console.log(`\n📈 RESULTADO: ${successCount}/${totalCount} testes passaram`)

    if (successCount === totalCount) {
      console.log('🎉 Todos os testes passaram! O banco está funcionando corretamente.')
    } else {
      console.log('⚠️ Alguns testes falharam. Verifique os erros acima.')
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testAfterFix()
}

module.exports = { testAfterFix }
