const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkReactionTypes() {
  try {
    console.log('🔍 Verificando tipos de reação existentes...')

    // Verificar quais tipos de reação existem
    const { data: reactions, error } = await supabase
      .from('post_reactions')
      .select('reaction_type')
      .limit(100)

    if (error) {
      console.error('❌ Erro ao buscar reações:', error.message)
      return
    }

    if (!reactions || reactions.length === 0) {
      console.log('✅ Nenhuma reação encontrada - tabela vazia')
      return
    }

    // Contar tipos únicos
    const typeCounts = {}
    reactions.forEach(reaction => {
      const type = reaction.reaction_type
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    console.log('\n📊 TIPOS DE REAÇÃO ENCONTRADOS:')
    console.log('=' .repeat(50))
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      const isSupported = ['like', 'heart', 'laugh', 'fire'].includes(type)
      const status = isSupported ? '✅' : '❌'
      console.log(`${type.padEnd(15)} ${count.toString().padStart(3)} registros ${status}`)
    })

    const unsupportedTypes = Object.keys(typeCounts).filter(type => 
      !['like', 'heart', 'laugh', 'fire'].includes(type)
    )

    if (unsupportedTypes.length > 0) {
      console.log('\n⚠️ TIPOS NÃO SUPORTADOS ENCONTRADOS:')
      unsupportedTypes.forEach(type => {
        console.log(`   - ${type}: ${typeCounts[type]} registros`)
      })
      
      console.log('\n🔧 SOLUÇÃO:')
      console.log('1. Execute o script: scripts/fix-database-with-cleanup.sql')
      console.log('2. Isso removerá os registros incompatíveis')
      console.log('3. Aplicará as correções necessárias')
    } else {
      console.log('\n✅ Todos os tipos de reação são suportados!')
    }

    console.log('\n📋 PRÓXIMOS PASSOS:')
    if (unsupportedTypes.length > 0) {
      console.log('🔧 Execute o script SQL no Supabase Dashboard')
      console.log('📄 Arquivo: scripts/fix-database-with-cleanup.sql')
      console.log('⚠️ Isso removerá registros com tipos antigos')
    } else {
      console.log('✅ Nenhuma ação necessária')
      console.log('✅ Execute o script de correção normal')
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkReactionTypes()
}

module.exports = { checkReactionTypes }
