const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verificarEstrutura() {
  try {
    console.log('🔍 Verificando estrutura das tabelas...')

    const tabelas = ['feed_posts', 'post_reactions', 'post_comments', 'notifications', 'profiles']

    for (const tabela of tabelas) {
      console.log(`\n📋 Tabela: ${tabela}`)
      
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .limit(1)

        if (error) {
          console.log(`❌ Erro: ${error.message}`)
        } else {
          console.log(`✅ Tabela existe`)
          
          // Tentar descobrir as colunas
          if (data && data.length > 0) {
            const colunas = Object.keys(data[0])
            console.log(`📊 Colunas: ${colunas.join(', ')}`)
          } else {
            console.log(`📊 Tabela vazia`)
          }
        }
      } catch (err) {
        console.log(`❌ Erro inesperado: ${err.message}`)
      }
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verificarEstrutura()
}

module.exports = { verificarEstrutura }
