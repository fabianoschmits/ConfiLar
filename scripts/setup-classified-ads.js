const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupClassifiedAds() {
  try {
    console.log('🔍 Verificando se a tabela classified_ads existe...')
    
    // Verificar se a tabela existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('classified_ads')
      .select('id')
      .limit(1)

    if (tableError) {
      console.log('⚠️ Tabela classified_ads não existe ou há erro de acesso:', tableError.message)
      console.log('📋 Execute o script SQL para criar a tabela: scripts/check-classified-ads-table.sql')
      return
    }

    console.log('✅ Tabela classified_ads existe!')
    
    // Verificar quantos anúncios existem
    const { data: ads, error: adsError } = await supabase
      .from('classified_ads')
      .select('id, title, user_name, ad_type')
      .eq('is_active', true)

    if (adsError) {
      console.error('❌ Erro ao buscar anúncios:', adsError.message)
      return
    }

    console.log(`📊 Encontrados ${ads.length} anúncios ativos:`)
    ads.forEach((ad, index) => {
      console.log(`${index + 1}. ${ad.title} - ${ad.user_name} (${ad.ad_type})`)
    })

    if (ads.length === 0) {
      console.log('📝 Nenhum anúncio encontrado. Execute o script SQL para inserir dados: scripts/insert-sample-classified-ads.sql')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

setupClassifiedAds()
