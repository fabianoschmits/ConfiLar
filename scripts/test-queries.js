const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testQueries() {
  try {
    console.log('🧪 Testando queries que estão falhando...')

    // 1. Testar query de post_reactions
    console.log('\n1️⃣ Testando post_reactions...')
    try {
      const { data, error } = await supabase
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

      if (error) {
        console.log('❌ Erro:', error.message)
        console.log('🔍 Código:', error.code)
      } else {
        console.log('✅ Query funcionou!')
        console.log('📊 Dados:', data)
      }
    } catch (err) {
      console.log('❌ Erro inesperado:', err.message)
    }

    // 2. Testar query de feed_posts
    console.log('\n2️⃣ Testando feed_posts...')
    try {
      const { data, error } = await supabase
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

      if (error) {
        console.log('❌ Erro:', error.message)
        console.log('🔍 Código:', error.code)
      } else {
        console.log('✅ Query funcionou!')
        console.log('📊 Dados:', data)
      }
    } catch (err) {
      console.log('❌ Erro inesperado:', err.message)
    }

    // 3. Testar query de notifications
    console.log('\n3️⃣ Testando notifications...')
    try {
      const { data, error } = await supabase
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

      if (error) {
        console.log('❌ Erro:', error.message)
        console.log('🔍 Código:', error.code)
      } else {
        console.log('✅ Query funcionou!')
        console.log('📊 Dados:', data)
      }
    } catch (err) {
      console.log('❌ Erro inesperado:', err.message)
    }

    // 4. Testar query de post_comments
    console.log('\n4️⃣ Testando post_comments...')
    try {
      const { data, error } = await supabase
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

      if (error) {
        console.log('❌ Erro:', error.message)
        console.log('🔍 Código:', error.code)
      } else {
        console.log('✅ Query funcionou!')
        console.log('📊 Dados:', data)
      }
    } catch (err) {
      console.log('❌ Erro inesperado:', err.message)
    }

    console.log('\n📋 DIAGNÓSTICO:')
    console.log('Se todas as queries falharam, o problema pode ser:')
    console.log('1. Relacionamentos (foreign keys) não configurados corretamente')
    console.log('2. Campos que não existem nas tabelas')
    console.log('3. Políticas RLS bloqueando o acesso')
    console.log('4. Tipos de dados incompatíveis')

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testQueries()
}

module.exports = { testQueries }
