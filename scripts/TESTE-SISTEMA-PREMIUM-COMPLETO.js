#!/usr/bin/env node

/**
 * =============================================
 * SCRIPT DE TESTE COMPLETO DO SISTEMA PREMIUM
 * =============================================
 * 
 * Este script testa:
 * 1. Sistema de curtidas premium
 * 2. Criação de posts premium
 * 3. Criação de anúncios premium
 * 4. Verificação de pontos e saldos
 * 5. Validação de funcionalidades VIP
 * 
 * Execute: node scripts/TESTE-SISTEMA-PREMIUM-COMPLETO.js
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
let testUser2 = null // Segundo usuário para curtir posts
let testPost = null
let testAd = null
let initialBalance = 0

async function main() {
  try {
    logSection('INICIANDO TESTE DO SISTEMA PREMIUM')
    
    // 1. Verificar conexão com Supabase
    await testSupabaseConnection()
    
    // 2. Criar usuários de teste
    await createTestUsers()
    
    // 3. Adicionar pontos para teste
    await addTestPoints()
    
    // 4. Testar sistema de curtidas premium
    await testPremiumLikes()
    
    // 5. Testar criação de posts premium
    await testPremiumPosts()
    
    // 6. Testar criação de anúncios premium
    await testPremiumAds()
    
    // 7. Testar sistema VIP
    await testVipSystem()
    
    // 8. Limpeza final
    await cleanup()
    
    logSection('TESTE CONCLUÍDO COM SUCESSO!')
    
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

async function createTestUsers() {
  logSection('CRIANDO USUÁRIOS DE TESTE')
  
  try {
    // Criar primeiro usuário de teste
    const testEmail1 = `teste-premium-1-${Date.now()}@confilar.com`
    const testPassword = 'Teste123!@#'
    
    const { data: authData1, error: authError1 } = await supabase.auth.admin.createUser({
      email: testEmail1,
      password: testPassword,
      email_confirm: true
    })
    
    if (authError1) throw authError1
    
    testUser = authData1.user
    logTest('Criação de usuário 1', 'PASS', `ID: ${testUser.id}`)
    
    // Criar perfil do primeiro usuário
    const { error: profileError1 } = await supabase
      .from('profiles')
      .insert({
        id: testUser.id,
        full_name: 'Usuário Teste Premium 1',
        email: testEmail1,
        user_type: 'professional',
        is_verified: true
      })
    
    if (profileError1) throw profileError1
    
    // Criar segundo usuário de teste
    const testEmail2 = `teste-premium-2-${Date.now()}@confilar.com`
    
    const { data: authData2, error: authError2 } = await supabase.auth.admin.createUser({
      email: testEmail2,
      password: testPassword,
      email_confirm: true
    })
    
    if (authError2) throw authError2
    
    testUser2 = authData2.user
    logTest('Criação de usuário 2', 'PASS', `ID: ${testUser2.id}`)
    
    // Criar perfil do segundo usuário
    const { error: profileError2 } = await supabase
      .from('profiles')
      .insert({
        id: testUser2.id,
        full_name: 'Usuário Teste Premium 2',
        email: testEmail2,
        user_type: 'professional',
        is_verified: true
      })
    
    if (profileError2) throw profileError2
    
    logTest('Criação de perfis', 'PASS', 'Perfis criados com sucesso')
    
  } catch (error) {
    logTest('Criação de usuários', 'FAIL', error.message)
    throw error
  }
}

async function addTestPoints() {
  logSection('ADICIONANDO PONTOS PARA TESTE')
  
  try {
    // Adicionar 1000 pontos para ambos os usuários
    const { error: error1 } = await supabase
      .rpc('add_points', {
        p_user_id: testUser.id,
        p_points: 1000,
        p_source: 'test_premium',
        p_description: 'Pontos para teste do sistema premium - Usuário 1'
      })
    
    if (error1) throw error1
    
    const { error: error2 } = await supabase
      .rpc('add_points', {
        p_user_id: testUser2.id,
        p_points: 1000,
        p_source: 'test_premium',
        p_description: 'Pontos para teste do sistema premium - Usuário 2'
      })
    
    if (error2) throw error2
    
    // Verificar saldos
    const { data: balance1, error: balanceError1 } = await supabase
      .from('user_points_balance')
      .select('balance')
      .eq('user_id', testUser.id)
      .single()
    
    if (balanceError1) throw balanceError1
    
    const { data: balance2, error: balanceError2 } = await supabase
      .from('user_points_balance')
      .select('balance')
      .eq('user_id', testUser2.id)
      .single()
    
    if (balanceError2) throw balanceError2
    
    initialBalance = balance1.balance
    logTest('Adição de pontos', 'PASS', `Usuário 1: ${balance1.balance} pontos, Usuário 2: ${balance2.balance} pontos`)
    
  } catch (error) {
    logTest('Adição de pontos', 'FAIL', error.message)
    throw error
  }
}

async function testPremiumLikes() {
  logSection('TESTANDO SISTEMA DE CURTIDAS PREMIUM')
  
  try {
    // 1. Criar um post normal primeiro
    const { data: postData, error: postError } = await supabase
      .from('feed_posts')
      .insert({
        user_id: testUser.id,
        title: 'Post de Teste',
        content: 'Post de teste para curtidas premium',
        is_premium: false
      })
      .select()
      .single()
    
    if (postError) throw postError
    testPost = postData
    
    logTest('Criação de post', 'PASS', `Post ID: ${testPost.id}`)
    
    // 2. Testar curtida premium (usuário 2 curtindo post do usuário 1)
    const { data: likeData, error: likeError } = await supabase
      .from('feed_posts_likes')
      .insert({
        user_id: testUser2.id,
        post_id: testPost.id,
        is_premium: true,
        premium_points_spent: 5
      })
      .select()
      .single()
    
    if (likeError) throw likeError
    
    logTest('Curtida premium', 'PASS', `Curtida ID: ${likeData.id}`)
    
    // 3. Verificar dedução de pontos do usuário 2
    const { data: newBalance, error: balanceError } = await supabase
      .from('user_points_balance')
      .select('balance')
      .eq('user_id', testUser2.id)
      .single()
    
    if (balanceError) throw balanceError
    
    const expectedBalance = initialBalance - 5
    if (newBalance.balance === expectedBalance) {
      logTest('Dedução de pontos', 'PASS', `Saldo usuário 2: ${newBalance.balance} (esperado: ${expectedBalance})`)
    } else {
      logTest('Dedução de pontos', 'FAIL', `Saldo usuário 2: ${newBalance.balance} (esperado: ${expectedBalance})`)
    }
    
    // 4. Verificar se curtida aparece como premium
    const { data: premiumLikes, error: premiumError } = await supabase
      .from('feed_posts_likes')
      .select('*')
      .eq('post_id', testPost.id)
      .eq('is_premium', true)
    
    if (premiumError) throw premiumError
    
    if (premiumLikes.length > 0) {
      logTest('Verificação premium', 'PASS', `${premiumLikes.length} curtida(s) premium encontrada(s)`)
    } else {
      logTest('Verificação premium', 'FAIL', 'Nenhuma curtida premium encontrada')
    }
    
  } catch (error) {
    logTest('Sistema de curtidas premium', 'FAIL', error.message)
    throw error
  }
}

async function testPremiumPosts() {
  logSection('TESTANDO CRIAÇÃO DE POSTS PREMIUM')
  
  try {
    // 1. Criar post premium
    const { data: premiumPost, error: postError } = await supabase
      .from('feed_posts')
      .insert({
        user_id: testUser.id,
        title: 'Post Premium de Teste',
        content: 'Este é um post premium destacado!',
        is_premium: true,
        premium_points_spent: 50,
        premium_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        premium_highlight_color: '#FFD700'
      })
      .select()
      .single()
    
    if (postError) throw postError
    
    logTest('Criação de post premium', 'PASS', `Post ID: ${premiumPost.id}`)
    
    // 2. Verificar campos premium
    if (premiumPost.is_premium && premiumPost.premium_points_spent === 50) {
      logTest('Campos premium', 'PASS', 'Todos os campos premium estão corretos')
    } else {
      logTest('Campos premium', 'FAIL', 'Campos premium incorretos')
    }
    
    // 3. Verificar dedução de pontos
    const { data: balance, error: balanceError } = await supabase
      .from('user_points_balance')
      .select('balance')
      .eq('user_id', testUser.id)
      .single()
    
    if (balanceError) throw balanceError
    
    const expectedBalance = initialBalance - 5 - 50 // -5 da curtida, -50 do post
    if (balance.balance === expectedBalance) {
      logTest('Dedução de pontos (post)', 'PASS', `Saldo: ${balance.balance}`)
    } else {
      logTest('Dedução de pontos (post)', 'FAIL', `Saldo: ${balance.balance} (esperado: ${expectedBalance})`)
    }
    
  } catch (error) {
    logTest('Criação de posts premium', 'FAIL', error.message)
    throw error
  }
}

async function testPremiumAds() {
  logSection('TESTANDO CRIAÇÃO DE ANÚNCIOS PREMIUM')
  
  try {
    // 1. Criar anúncio premium
    const { data: premiumAd, error: adError } = await supabase
      .from('classifieds')
      .insert({
        user_id: testUser.id,
        title: 'Serviço Premium de Teste',
        description: 'Este é um anúncio premium destacado para teste',
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
    
    // 2. Verificar campos premium
    if (premiumAd.is_premium && premiumAd.premium_points_spent === 200) {
      logTest('Campos premium (anúncio)', 'PASS', 'Todos os campos premium estão corretos')
    } else {
      logTest('Campos premium (anúncio)', 'FAIL', 'Campos premium incorretos')
    }
    
    // 3. Verificar dedução de pontos
    const { data: balance, error: balanceError } = await supabase
      .from('user_points_balance')
      .select('balance')
      .eq('user_id', testUser.id)
      .single()
    
    if (balanceError) throw balanceError
    
    const expectedBalance = initialBalance - 5 - 50 - 200 // -5 curtida, -50 post, -200 anúncio
    if (balance.balance === expectedBalance) {
      logTest('Dedução de pontos (anúncio)', 'PASS', `Saldo: ${balance.balance}`)
    } else {
      logTest('Dedução de pontos (anúncio)', 'FAIL', `Saldo: ${balance.balance} (esperado: ${expectedBalance})`)
    }
    
  } catch (error) {
    logTest('Criação de anúncios premium', 'FAIL', error.message)
    throw error
  }
}

async function testVipSystem() {
  logSection('TESTANDO SISTEMA VIP')
  
  try {
    // 1. Verificar se tabela vip_badges existe
    const { data: badges, error: badgesError } = await supabase
      .from('vip_badges')
      .select('*')
      .limit(1)
    
    if (badgesError) {
      logTest('Tabela VIP badges', 'FAIL', 'Tabela não existe ou erro de acesso')
      return
    }
    
    logTest('Tabela VIP badges', 'PASS', 'Tabela existe e acessível')
    
    // 2. Testar criação de badge VIP
    const { data: vipBadge, error: vipError } = await supabase
      .from('vip_badges')
      .insert({
        user_id: testUser.id,
        badge_type: 'vip_gold',
        badge_name: 'VIP Gold',
        badge_description: 'Cliente VIP Gold - Comprou R$ 100+ em pontos',
        badge_icon: '👑',
        badge_color: '#FFD700',
        is_active: true,
        purchased_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (vipError) {
      logTest('Criação de badge VIP', 'FAIL', vipError.message)
    } else {
      logTest('Criação de badge VIP', 'PASS', `Badge ID: ${vipBadge.id}`)
    }
    
    // 3. Verificar histórico de transações
    const { data: transactions, error: transError } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', testUser.id)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (transError) {
      logTest('Histórico de transações', 'FAIL', transError.message)
    } else {
      logTest('Histórico de transações', 'PASS', `${transactions.length} transações encontradas`)
      
      // Mostrar resumo das transações
      transactions.forEach((trans, index) => {
        log(`   ${index + 1}. ${trans.description}: ${trans.points} pontos`, 'yellow')
      })
    }
    
  } catch (error) {
    logTest('Sistema VIP', 'FAIL', error.message)
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
      
      logTest('Limpeza usuário 1', 'PASS', 'Usuário 1 e dados deletados')
    }
    
    if (testUser2) {
      // Deletar transações de teste
      await supabase.from('points_transactions').delete().eq('user_id', testUser2.id)
      
      // Deletar saldo
      await supabase.from('user_points_balance').delete().eq('user_id', testUser2.id)
      
      // Deletar perfil
      await supabase.from('profiles').delete().eq('id', testUser2.id)
      
      // Deletar usuário
      await supabase.auth.admin.deleteUser(testUser2.id)
      
      logTest('Limpeza usuário 2', 'PASS', 'Usuário 2 e dados deletados')
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
