const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runFinalTest() {
  try {
    console.log('🎯 EXECUTANDO TESTE FINAL APÓS CORREÇÕES')
    console.log('=' .repeat(60))

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
            professional_id,
            title,
            description,
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
    let successCount = 0

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
          successCount++
        }
      } catch (err) {
        console.log(`❌ Erro inesperado: ${err.message}`)
        results.push({ name: test.name, status: '❌', error: err.message })
      }
    }

    console.log('\n📊 RESUMO FINAL:')
    console.log('=' .repeat(60))
    
    results.forEach(result => {
      console.log(`${result.name.padEnd(30)} ${result.status}`)
      if (result.error) {
        console.log(`   Erro: ${result.error}`)
      }
    })

    console.log(`\n📈 RESULTADO: ${successCount}/${results.length} testes passaram`)

    if (successCount === results.length) {
      console.log('\n🎉 SUCESSO! Todos os testes passaram!')
      console.log('✅ O banco de dados está funcionando corretamente')
      console.log('✅ Todas as queries estão funcionando')
      console.log('✅ Os relacionamentos foram criados')
      console.log('✅ Os campos faltantes foram adicionados')
    } else {
      console.log('\n⚠️ AINDA HÁ PROBLEMAS:')
      console.log('1. Execute o script SQL no Supabase Dashboard')
      console.log('2. Use o arquivo: scripts/final-database-fix.sql')
      console.log('3. Execute novamente este teste')
    }

    console.log('\n📋 PRÓXIMOS PASSOS:')
    if (successCount === results.length) {
      console.log('✅ Banco corrigido com sucesso!')
      console.log('✅ A aplicação deve funcionar normalmente agora')
      console.log('✅ Os erros 400 devem ter desaparecido')
    } else {
      console.log('🔧 Execute o script SQL no Supabase Dashboard')
      console.log('📄 Arquivo: scripts/final-database-fix.sql')
      console.log('🔄 Execute novamente: node scripts/run-final-test.js')
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runFinalTest()
}

module.exports = { runFinalTest }
