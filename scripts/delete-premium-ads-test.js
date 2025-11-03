#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deletePremiumAds() {
  try {
    console.log('🔍 Verificando anúncios premium existentes...\n')

    // 1. Buscar todos os anúncios premium
    const { data: premiumAds, error: fetchError } = await supabase
      .from('classified_ads')
      .select('id, title, user_name, is_premium, is_featured, created_at')
      .eq('is_premium', true)
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw new Error(`Erro ao buscar anúncios: ${fetchError.message}`)
    }

    if (!premiumAds || premiumAds.length === 0) {
      console.log('✅ Nenhum anúncio premium encontrado.')
      return
    }

    console.log(`📋 Encontrados ${premiumAds.length} anúncio(s) premium:\n`)
    
    premiumAds.forEach((ad, index) => {
      const hoursAgo = Math.floor((new Date() - new Date(ad.created_at)) / (1000 * 60 * 60))
      console.log(`${index + 1}. ${ad.title}`)
      console.log(`   ID: ${ad.id}`)
      console.log(`   Usuário: ${ad.user_name}`)
      console.log(`   Criado: ${hoursAgo} horas atrás`)
      console.log(`   Featured: ${ad.is_featured ? 'Sim' : 'Não'}\n`)
    })

    console.log('🗑️  Deletando todos os anúncios premium...\n')

    // 2. Deletar todos os anúncios premium
    const { data: deletedData, error: deleteError } = await supabase
      .from('classified_ads')
      .delete()
      .eq('is_premium', true)
      .select()

    if (deleteError) {
      throw new Error(`Erro ao deletar anúncios: ${deleteError.message}`)
    }

    console.log(`✅ ${premiumAds.length} anúncio(s) premium deletado(s) com sucesso!\n`)

    // 3. Verificar se ainda existem anúncios premium
    const { count: remainingCount, error: countError } = await supabase
      .from('classified_ads')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true)

    if (countError) {
      console.log('⚠️  Erro ao verificar anúncios restantes:', countError.message)
    } else {
      console.log(`📊 Anúncios premium restantes: ${remainingCount || 0}`)
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  }
}

// Executar
if (require.main === module) {
  deletePremiumAds()
    .then(() => {
      console.log('\n✅ Processo concluído!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error)
      process.exit(1)
    })
}

module.exports = { deletePremiumAds }

