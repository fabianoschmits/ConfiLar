const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFixedQuery() {
  try {
    console.log('🔍 Testando query corrigida...')
    
    // Query corrigida (sem user_avatar_url)
    const { data, error } = await supabase
      .from('classified_ads')
      .select(`
        id,
        user_id,
        user_name,
        user_type,
        title,
        description,
        category,
        location_state,
        location_city,
        created_at,
        is_active,
        views,
        ad_type
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('❌ Erro na query corrigida:', error)
    } else {
      console.log('✅ Query corrigida funcionou!')
      console.log(`📊 Encontrados ${data?.length || 0} anúncios:`)
      
      if (data && data.length > 0) {
        data.forEach((ad, index) => {
          console.log(`${index + 1}. ${ad.title} - ${ad.user_name} (${ad.ad_type})`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testFixedQuery()
