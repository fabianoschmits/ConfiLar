const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
  try {
    console.log('🔍 Testando query exata que está falhando...')
    
    // Teste 1: Query simples
    console.log('\n📋 Teste 1: Query simples')
    const { data: simpleData, error: simpleError } = await supabase
      .from('classified_ads')
      .select('id, title')
      .limit(5)

    if (simpleError) {
      console.error('❌ Erro na query simples:', simpleError)
    } else {
      console.log('✅ Query simples funcionou:', simpleData?.length || 0, 'registros')
    }

    // Teste 2: Query com filtro is_active
    console.log('\n📋 Teste 2: Query com filtro is_active')
    const { data: activeData, error: activeError } = await supabase
      .from('classified_ads')
      .select('id, title, is_active')
      .eq('is_active', true)
      .limit(5)

    if (activeError) {
      console.error('❌ Erro na query com filtro:', activeError)
    } else {
      console.log('✅ Query com filtro funcionou:', activeData?.length || 0, 'registros')
    }

    // Teste 3: Query completa (a que está falhando)
    console.log('\n📋 Teste 3: Query completa')
    const { data: fullData, error: fullError } = await supabase
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
        user_avatar_url,
        ad_type
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (fullError) {
      console.error('❌ Erro na query completa:', fullError)
      console.log('🔍 Detalhes do erro:', {
        message: fullError.message,
        details: fullError.details,
        hint: fullError.hint,
        code: fullError.code
      })
    } else {
      console.log('✅ Query completa funcionou:', fullData?.length || 0, 'registros')
      if (fullData && fullData.length > 0) {
        console.log('📊 Primeiro registro:', {
          id: fullData[0].id,
          title: fullData[0].title,
          user_name: fullData[0].user_name,
          ad_type: fullData[0].ad_type
        })
      }
    }

    // Teste 4: Verificar estrutura da tabela
    console.log('\n📋 Teste 4: Verificar estrutura da tabela')
    const { data: structureData, error: structureError } = await supabase
      .from('classified_ads')
      .select('*')
      .limit(1)

    if (structureError) {
      console.error('❌ Erro ao verificar estrutura:', structureError)
    } else {
      console.log('✅ Estrutura da tabela OK')
      if (structureData && structureData.length > 0) {
        console.log('📊 Colunas disponíveis:', Object.keys(structureData[0]))
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

testQuery()
