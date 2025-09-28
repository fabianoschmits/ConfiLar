const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function checkReviewsStructure() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Variáveis de ambiente não encontradas')
      return
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('🔍 Verificando estrutura da tabela reviews...\n')

    // Buscar uma avaliação existente para ver a estrutura
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(1)

    if (reviewsError) {
      console.log('❌ Erro ao buscar reviews:', reviewsError.message)
      return
    }

    if (reviewsData && reviewsData.length > 0) {
      console.log('✅ Estrutura da tabela reviews:')
      console.log('📊 Colunas encontradas:', Object.keys(reviewsData[0]))
      console.log('📋 Dados de exemplo:', reviewsData[0])
    } else {
      console.log('⚠️ Nenhuma avaliação encontrada na tabela')
    }

    // Verificar estrutura da tabela profiles
    console.log('\n🔍 Verificando estrutura da tabela profiles...')
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      console.log('❌ Erro ao buscar profiles:', profilesError.message)
      return
    }

    if (profilesData && profilesData.length > 0) {
      console.log('✅ Estrutura da tabela profiles:')
      console.log('📊 Colunas encontradas:', Object.keys(profilesData[0]))
      console.log('📋 Dados de exemplo:', profilesData[0])
    } else {
      console.log('⚠️ Nenhum perfil encontrado na tabela')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkReviewsStructure()
