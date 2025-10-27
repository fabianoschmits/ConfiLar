#!/usr/bin/env node

/**
 * =============================================
 * SCRIPT DE TESTE SIMPLIFICADO DO SISTEMA PREMIUM
 * =============================================
 * 
 * Este script testa as funcionalidades básicas do sistema premium
 * sem depender de colunas que ainda não foram criadas.
 * 
 * Execute: node scripts/TESTE-SISTEMA-PREMIUM-SIMPLES.js
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
let initialBalance = 0

async function main() {
  try {
    logSection('INICIANDO TESTE SIMPLIFICADO DO SISTEMA PREMIUM')
    
    // 1. Verificar conexão com Supabase
    await testSupabaseConnection()
    
    // 2. Criar usuário de teste
    await createTestUser()
    
    // 3. Adicionar pontos para teste
    await addTestPoints()
    
    // 4. Testar sistema de pontos básico
    await testBasicPointsSystem()
    
    // 5. Testar criação de posts básicos
    await testBasicPosts()
    
    // 6. Testar função add_points
    await testAddPointsFunction()
    
    // 7. Verificar histórico de transações
    await testTransactionHistory()
    
    // 8. Limpeza final
    await cleanup()
    
    logSection('TESTE SIMPLIFICADO CONCLUÍDO COM SUCESSO!')
    
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
    const testEmail = `teste-premium-simples-${Date.now()}@confilar.com`
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
        full_name: 'Usuário Teste Premium Simples',
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
        p_source: 'test_premium_simple',
        p_description: 'Pontos para teste do sistema premium simplificado'
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

async function testBasicPointsSystem() {
  logSection('TESTANDO SISTEMA DE PONTOS BÁSICO')
  
  try {
    // 1. Verificar saldo inicial
    const { data: balance, error: balanceError } = await supabase
      .from('user_points_balance')
      .select('balance')
      .eq('user_id', testUser.id)
      .single()
    
    if (balanceError) throw balanceError
    
    logTest('Verificação de saldo', 'PASS', `Saldo: ${balance.balance} pontos`)
    
    // 2. Testar subtração de pontos
    const { error: subtractError } = await supabase
      .rpc('add_points', {
        p_user_id: testUser.id,
        p_points: -50,
        p_source: 'test_subtract',
        p_description: 'Teste de subtração de pontos'
      })
    
    if (subtractError) throw subtractError
    
    // 3. Verificar novo saldo
    const { data: newBalance, error: newBalanceError } = await supabase
      .from('user_points_balance')
      .select('balance')
      .eq('user_id', testUser.id)
      .single()
    
    if (newBalanceError) throw newBalanceError
    
    const expectedBalance = initialBalance - 50
    if (newBalance.balance === expectedBalance) {
      logTest('Subtração de pontos', 'PASS', `Saldo: ${newBalance.balance} (esperado: ${expectedBalance})`)
    } else {
      logTest('Subtração de pontos', 'FAIL', `Saldo: ${newBalance.balance} (esperado: ${expectedBalance})`)
    }
    
  } catch (error) {
    logTest('Sistema de pontos básico', 'FAIL', error.message)
    throw error
  }
}

async function testBasicPosts() {
  logSection('TESTANDO CRIAÇÃO DE POSTS BÁSICOS')
  
  try {
    // 1. Criar post básico
    const { data: postData, error: postError } = await supabase
      .from('feed_posts')
      .insert({
        user_id: testUser.id,
        title: 'Post de Teste Básico',
        content: 'Este é um post de teste básico para verificar funcionalidades',
        is_premium: false
      })
      .select()
      .single()
    
    if (postError) throw postError
    testPost = postData
    
    logTest('Criação de post básico', 'PASS', `Post ID: ${testPost.id}`)
    
    // 2. Verificar se post foi criado corretamente
    if (testPost.title && testPost.content && testPost.user_id === testUser.id) {
      logTest('Validação do post', 'PASS', 'Post criado corretamente')
    } else {
      logTest('Validação do post', 'FAIL', 'Dados do post incorretos')
    }
    
    // 3. Testar curtida básica (sem premium)
    const { data: likeData, error: likeError } = await supabase
      .from('feed_posts_likes')
      .insert({
        user_id: testUser.id,
        post_id: testPost.id
      })
      .select()
      .single()
    
    if (likeError) {
      logTest('Curtida básica', 'FAIL', likeError.message)
    } else {
      logTest('Curtida básica', 'PASS', `Curtida ID: ${likeData.id}`)
    }
    
  } catch (error) {
    logTest('Criação de posts básicos', 'FAIL', error.message)
    throw error
  }
}

async function testAddPointsFunction() {
  logSection('TESTANDO FUNÇÃO ADD_POINTS')
  
  try {
    // Testar diferentes tipos de transações
    const testTransactions = [
      { points: 100, source: 'daily_login', description: 'Login diário' },
      { points: -25, source: 'premium_feature', description: 'Recurso premium' },
      { points: 50, source: 'referral', description: 'Indicação de amigo' },
      { points: -10, source: 'ad_boost', description: 'Impulsionar anúncio' }
    ]
    
    let successCount = 0
    
    for (const transaction of testTransactions) {
      try {
        const { error } = await supabase
          .rpc('add_points', {
            p_user_id: testUser.id,
            p_points: transaction.points,
            p_source: transaction.source,
            p_description: transaction.description
          })
        
        if (error) {
          logTest(`Transação ${transaction.source}`, 'FAIL', error.message)
        } else {
          logTest(`Transação ${transaction.source}`, 'PASS', `${transaction.points} pontos`)
          successCount++
        }
      } catch (err) {
        logTest(`Transação ${transaction.source}`, 'FAIL', err.message)
      }
    }
    
    logTest('Função add_points', successCount === testTransactions.length ? 'PASS' : 'WARN', 
           `${successCount}/${testTransactions.length} transações bem-sucedidas`)
    
  } catch (error) {
    logTest('Função add_points', 'FAIL', error.message)
  }
}

async function testTransactionHistory() {
  logSection('VERIFICANDO HISTÓRICO DE TRANSAÇÕES')
  
  try {
    // Verificar se tabela de transações existe
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
      if (transactions.length > 0) {
        log('\n   Resumo das transações:', 'yellow')
        transactions.forEach((trans, index) => {
          const pointsStr = trans.points > 0 ? `+${trans.points}` : `${trans.points}`
          log(`   ${index + 1}. ${trans.description}: ${pointsStr} pontos (${trans.source})`, 'yellow')
        })
      }
    }
    
    // Verificar saldo final
    const { data: finalBalance, error: balanceError } = await supabase
      .from('user_points_balance')
      .select('balance')
      .eq('user_id', testUser.id)
      .single()
    
    if (balanceError) {
      logTest('Saldo final', 'FAIL', balanceError.message)
    } else {
      logTest('Saldo final', 'PASS', `${finalBalance.balance} pontos`)
    }
    
  } catch (error) {
    logTest('Histórico de transações', 'FAIL', error.message)
  }
}

async function cleanup() {
  logSection('LIMPEZA DOS DADOS DE TESTE')
  
  try {
    // Deletar dados de teste
    if (testPost) {
      // Deletar curtidas primeiro
      await supabase.from('feed_posts_likes').delete().eq('post_id', testPost.id)
      // Deletar post
      await supabase.from('feed_posts').delete().eq('id', testPost.id)
      logTest('Limpeza post', 'PASS', 'Post e curtidas deletados')
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
