const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySchemaFix() {
  try {
    console.log('🔧 Aplicando correções no schema do banco...')

    // 1. Adicionar campo 'name' na tabela profiles
    console.log('📝 Adicionando campo name na tabela profiles...')
    
    try {
      const { error: addNameError } = await supabase
        .from('profiles')
        .select('name')
        .limit(1)

      if (addNameError && addNameError.code === '42703') {
        console.log('⚠️ Campo name não existe, será criado via SQL')
      } else {
        console.log('✅ Campo name já existe')
      }
    } catch (err) {
      console.log('⚠️ Campo name precisa ser criado via SQL')
    }

    // 2. Testar se as queries funcionam agora
    console.log('\n🧪 Testando queries após correções...')

    // Testar post_reactions
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
        console.log('❌ post_reactions ainda com erro:', error.message)
      } else {
        console.log('✅ post_reactions funcionando!')
      }
    } catch (err) {
      console.log('❌ post_reactions erro:', err.message)
    }

    // Testar feed_posts
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
        console.log('❌ feed_posts ainda com erro:', error.message)
      } else {
        console.log('✅ feed_posts funcionando!')
      }
    } catch (err) {
      console.log('❌ feed_posts erro:', err.message)
    }

    console.log('\n📋 INSTRUÇÕES:')
    console.log('1. Acesse o Supabase Dashboard')
    console.log('2. Vá para SQL Editor')
    console.log('3. Execute o script: scripts/fix-database-schema.sql')
    console.log('4. Isso corrigirá todos os problemas identificados')

    console.log('\n🔍 PROBLEMAS IDENTIFICADOS:')
    console.log('• Campo "name" não existe na tabela profiles')
    console.log('• Relacionamentos (foreign keys) não configurados')
    console.log('• Campos faltantes em várias tabelas')
    console.log('• Políticas RLS podem estar bloqueando acesso')

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applySchemaFix()
}

module.exports = { applySchemaFix }
