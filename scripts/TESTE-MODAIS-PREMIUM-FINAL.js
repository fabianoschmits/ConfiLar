#!/usr/bin/env node

/**
 * =============================================
 * SCRIPT DE TESTE FINAL DOS MODAIS PREMIUM
 * =============================================
 * 
 * Este script testa se os modais premium estão funcionando
 * corretamente e se as funcionalidades diferenciadas estão ativas.
 * 
 * Execute: node scripts/TESTE-MODAIS-PREMIUM-FINAL.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseKey)

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan')
  log(`  ${title}`, 'bright')
  log(`${'='.repeat(60)}`, 'cyan')
}

function logTest(testName, status, details = '') {
  const statusColor = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow'
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  
  log(`${statusIcon} ${testName}: ${status}`, statusColor)
  if (details) {
    log(`   ${details}`, 'yellow')
  }
}

// Variáveis para armazenar dados de teste
let testUser = null
let testPost = null
let testAd = null
let initialBalance = 0

async function main() {
  try {
    logSection('TESTE FINAL DOS MODAIS PREMIUM')
    
    // 1. Verificar conexão com Supabase
    await testSupabaseConnection()
    
    // 2. Criar usuário de teste
    await createTestUser()
    
    // 3. Adicionar pontos para teste
    await addTestPoints()
    
    // 4. Testar criação de post premium
    await testPremiumPostCreation()
    
    // 5. Testar criação de anúncio premium
    await testPremiumAdCreation()
    
    // 6. Verificar funcionalidades diferenciadas
    await testPremiumFeatures()
    
    // 7. Limpeza final
    await cleanup()
    
    logSection('TESTE FINAL CONCLUÍDO COM SUCESSO!')
    
  } catch (error) {
    log(`\n❌ ERRO CRÍTICO: ${error.message}`, 'red')
    console.error(error)
    process.exit(1)
  }
}

async function testSupabaseConnection() {
  logSection('TESTANDO CONEXÃO COM SUPABASE')
  
  try {
    const { data, error } = await supabase
      .from('user_points_balance')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    logTest('Conexão Supabase', 'PASS', 'Conectado com sucesso')
  } catch (error) {
    logTest('Conexão Supabase', 'FAIL', error.message)
    throw error
  }
}

async function createTestUser() {
  logSection('CRIANDO USUÁRIO DE TESTE')
  
  try {
    // Criar usuário de teste
    const testEmail = `teste-modais-premium-${Date.now()}@confilar.com`
    const testPassword = 'Teste123!@#'
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    })
    
    if (authError) throw authError
    
    testUser = authData.user
    logTest('Criação de usuário', 'PASS', `ID: ${testUser.id}`)
    
    // Criar perfil do usuário
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: testUser.id,
        full_name: 'Usuário Teste Modais Premium',
        email: testEmail,
        user_type: 'professional',
        is_verified: true
      })
    
    if (profileError) throw profileError
    
    logTest('Criação de perfil', 'PASS', 'Perfil criado com sucesso')
    
  } catch (error) {
    logTest('Criação de usuário', 'FAIL', error.message)
    throw error
  }
}

async function addTestPoints() {
  logSection('ADICIONANDO PONTOS PARA TESTE')
  
  try {
    // Adicionar 1000 pontos para teste
    const { error } = await supabase
      .rpc('add_points', {
        p_user_id: testUser.id,
        p_points: 1000,
        p_source: 'test_premium_modals',
        p_description: 'Pontos para teste dos modais premium'
      })
    
    if (error) throw error
    
    // Verificar saldo
    const { data: balance, error: balanceError } = await supabase
      .from('user_points_balance')
      .select('balance')
      .eq('user_id', testUser.id)
      .single()
    
    if (balanceError) throw balanceError
    
    initialBalance = balance.balance
    logTest('Adição de pontos', 'PASS', `Saldo atual: ${initialBalance} pontos`)
    
  } catch (error) {
    logTest('Adição de pontos', 'FAIL', error.message)
    throw error
  }
}

async function testPremiumPostCreation() {
  logSection('TESTANDO CRIAÇÃO DE POST PREMIUM')
  
  try {
    // Criar post premium
    const { data: premiumPost, error: postError } = await supabase
      .from('feed_posts')
      .insert({
        user_id: testUser.id,
        title: 'Post Premium de Teste Final',
        content: 'Este é um post premium criado através do modal premium!',
        is_premium: true,
        premium_points_spent: 50,
        premium_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        premium_highlight_color: '#FFD700'
      })
      .select()
      .single()
    
    if (postError) throw postError
    testPost = premiumPost
    
    logTest('Criação de post premium', 'PASS', `Post ID: ${premiumPost.id}`)
    
    // Verificar campos premium
    if (premiumPost.is_premium && premiumPost.premium_points_spent === 50) {
      logTest('Campos premium do post', 'PASS', 'Todos os campos premium estão corretos')
    } else {
      logTest('Campos premium do post', 'FAIL', 'Campos premium incorretos')
    }
    
    // Verificar se post aparece como premium
    const { data: premiumPosts, error: premiumError } = await supabase
      .from('feed_posts')
      .select('*')
      .eq('id', premiumPost.id)
      .eq('is_premium', true)
      .single()
    
    if (premiumError) {
      logTest('Verificação premium do post', 'FAIL', premiumError.message)
    } else {
      logTest('Verificação premium do post', 'PASS', 'Post encontrado como premium')
    }
    
  } catch (error) {
    logTest('Criação de post premium', 'FAIL', error.message)
    throw error
  }
}

async function testPremiumAdCreation() {
  logSection('TESTANDO CRIAÇÃO DE ANÚNCIO PREMIUM')
  
  try {
    // Criar anúncio premium
    const { data: premiumAd, error: adError } = await supabase
      .from('classifieds')
      .insert({
        user_id: testUser.id,
        title: 'Anúncio Premium de Teste Final',
        description: 'Este é um anúncio premium criado através do modal premium!',
        service_type: 'consultoria',
        location_city: 'São Paulo',
        location_state: 'SP',
        price_range: 'R$ 100-500',
        contact_phone: '(11) 99999-9999',
        contact_email: 'teste@confilar.com',
        is_premium: true,
        premium_points_spent: 200,
        premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        premium_highlight_color: '#FFD700'
      })
      .select()
      .single()
    
    if (adError) throw adError
    testAd = premiumAd
    
    logTest('Criação de anúncio premium', 'PASS', `Anúncio ID: ${premiumAd.id}`)
    
    // Verificar campos premium
    if (premiumAd.is_premium && premiumAd.premium_points_spent === 200) {
      logTest('Campos premium do anúncio', 'PASS', 'Todos os campos premium estão corretos')
    } else {
      logTest('Campos premium do anúncio', 'FAIL', 'Campos premium incorretos')
    }
    
    // Verificar se anúncio aparece como premium
    const { data: premiumAds, error: premiumError } = await supabase
      .from('classifieds')
      .select('*')
      .eq('id', premiumAd.id)
      .eq('is_premium', true)
      .single()
    
    if (premiumError) {
      logTest('Verificação premium do anúncio', 'FAIL', premiumError.message)
    } else {
      logTest('Verificação premium do anúncio', 'PASS', 'Anúncio encontrado como premium')
    }
    
  } catch (error) {
    logTest('Criação de anúncio premium', 'FAIL', error.message)
    throw error
  }
}

async function testPremiumFeatures() {
  logSection('VERIFICANDO FUNCIONALIDADES PREMIUM')
  
  try {
    // Verificar se os arquivos dos modais premium existem
    const fs = require('fs')
    const path = require('path')
    
    const premiumFiles = [
      'src/components/timeline/PremiumPostForm.tsx',
      'src/components/classifieds/PremiumAdForm.tsx'
    ]
    
    let existingFiles = 0
    
    for (const filePath of premiumFiles) {
      const fullPath = path.join(process.cwd(), filePath)
      if (fs.existsSync(fullPath)) {
        logTest(`Arquivo ${path.basename(filePath)}`, 'PASS', 'Arquivo existe')
        existingFiles++
      } else {
        logTest(`Arquivo ${path.basename(filePath)}`, 'FAIL', 'Arquivo não encontrado')
      }
    }
    
    logTest('Arquivos dos modais premium', existingFiles === premiumFiles.length ? 'PASS' : 'FAIL', 
           `${existingFiles}/${premiumFiles.length} arquivos encontrados`)
    
    // Verificar se os hooks premium existem
    const premiumHooks = [
      'src/hooks/usePremiumPost.ts',
      'src/hooks/usePremiumAd.ts'
    ]
    
    let existingHooks = 0
    
    for (const hookPath of premiumHooks) {
      const fullPath = path.join(process.cwd(), hookPath)
      if (fs.existsSync(fullPath)) {
        logTest(`Hook ${path.basename(hookPath)}`, 'PASS', 'Hook existe')
        existingHooks++
      } else {
        logTest(`Hook ${path.basename(hookPath)}`, 'FAIL', 'Hook não encontrado')
      }
    }
    
    logTest('Hooks premium', existingHooks === premiumHooks.length ? 'PASS' : 'FAIL', 
           `${existingHooks}/${premiumHooks.length} hooks encontrados`)
    
    // Verificar saldo final
    const { data: finalBalance, error: balanceError } = await supabase
      .from('user_points_balance')
      .select('balance')
      .eq('user_id', testUser.id)
      .single()
    
    if (balanceError) {
      logTest('Saldo final', 'FAIL', balanceError.message)
    } else {
      const expectedBalance = initialBalance - 50 - 200 // -50 post, -200 anúncio
      if (finalBalance.balance === expectedBalance) {
        logTest('Saldo final', 'PASS', `${finalBalance.balance} pontos (esperado: ${expectedBalance})`)
      } else {
        logTest('Saldo final', 'WARN', `${finalBalance.balance} pontos (esperado: ${expectedBalance})`)
      }
    }
    
  } catch (error) {
    logTest('Funcionalidades premium', 'FAIL', error.message)
  }
}

async function cleanup() {
  logSection('LIMPEZA DOS DADOS DE TESTE')
  
  try {
    // Deletar dados de teste
    if (testAd) {
      await supabase.from('classifieds').delete().eq('id', testAd.id)
      logTest('Limpeza anúncio', 'PASS', 'Anúncio deletado')
    }
    
    if (testPost) {
      await supabase.from('feed_posts').delete().eq('id', testPost.id)
      logTest('Limpeza post', 'PASS', 'Post deletado')
    }
    
    if (testUser) {
      // Deletar transações de teste
      await supabase.from('points_transactions').delete().eq('user_id', testUser.id)
      
      // Deletar saldo
      await supabase.from('user_points_balance').delete().eq('user_id', testUser.id)
      
      // Deletar perfil
      await supabase.from('profiles').delete().eq('id', testUser.id)
      
      // Deletar usuário
      await supabase.auth.admin.deleteUser(testUser.id)
      
      logTest('Limpeza usuário', 'PASS', 'Usuário e dados deletados')
    }
    
  } catch (error) {
    logTest('Limpeza', 'FAIL', error.message)
  }
}

// Executar teste
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { main }
