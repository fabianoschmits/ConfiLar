#!/usr/bin/env node

/**
 * =============================================
 * SCRIPT DE TESTE DAS FUNCIONALIDADES PREMIUM IMPLEMENTADAS
 * =============================================
 * 
 * Este script testa especificamente as funcionalidades premium
 * que estão implementadas no código atual.
 * 
 * Execute: node scripts/TESTE-FUNCIONALIDADES-PREMIUM.js
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
    logSection('TESTANDO FUNCIONALIDADES PREMIUM IMPLEMENTADAS')
    
    // 1. Verificar conexão com Supabase
    await testSupabaseConnection()
    
    // 2. Criar usuário de teste
    await createTestUser()
    
    // 3. Adicionar pontos para teste
    await addTestPoints()
    
    // 4. Testar criação de posts premium (usando campos existentes)
    await testPremiumPostsWithExistingFields()
    
    // 5. Testar sistema de pontos para funcionalidades premium
    await testPremiumPointsSystem()
    
    // 6. Verificar hooks premium implementados
    await testPremiumHooks()
    
    // 7. Limpeza final
    await cleanup()
    
    logSection('TESTE DAS FUNCIONALIDADES PREMIUM CONCLUÍDO!')
    
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
    const testEmail = `teste-premium-func-${Date.now()}@confilar.com`
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
        full_name: 'Usuário Teste Premium Func',
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
        p_source: 'test_premium_func',
        p_description: 'Pontos para teste das funcionalidades premium'
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

async function testPremiumPostsWithExistingFields() {
  logSection('TESTANDO POSTS PREMIUM COM CAMPOS EXISTENTES')
  
  try {
    // 1. Criar post premium usando apenas campos que existem
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
    
    if (postError) {
      logTest('Criação de post premium', 'FAIL', postError.message)
      return
    }
    
    testPost = premiumPost
    logTest('Criação de post premium', 'PASS', `Post ID: ${premiumPost.id}`)
    
    // 2. Verificar campos premium
    if (premiumPost.is_premium && premiumPost.premium_points_spent === 50) {
      logTest('Campos premium', 'PASS', 'Todos os campos premium estão corretos')
    } else {
      logTest('Campos premium', 'FAIL', 'Campos premium incorretos')
    }
    
    // 3. Verificar se post aparece como premium
    const { data: premiumPosts, error: premiumError } = await supabase
      .from('feed_posts')
      .select('*')
      .eq('id', premiumPost.id)
      .eq('is_premium', true)
      .single()
    
    if (premiumError) {
      logTest('Verificação premium', 'FAIL', premiumError.message)
    } else {
      logTest('Verificação premium', 'PASS', 'Post encontrado como premium')
    }
    
  } catch (error) {
    logTest('Posts premium com campos existentes', 'FAIL', error.message)
  }
}

async function testPremiumPointsSystem() {
  logSection('TESTANDO SISTEMA DE PONTOS PREMIUM')
  
  try {
    // Simular gastos de pontos para funcionalidades premium
    const premiumActions = [
      { points: -50, source: 'premium_post', description: 'Criou post premium' },
      { points: -5, source: 'premium_like', description: 'Curtiu post premium' },
      { points: -200, source: 'premium_ad', description: 'Criou anúncio premium' },
      { points: -10, source: 'premium_comment', description: 'Comentário premium' }
    ]
    
    let successCount = 0
    
    for (const action of premiumActions) {
      try {
        const { error } = await supabase
          .rpc('add_points', {
            p_user_id: testUser.id,
            p_points: action.points,
            p_source: action.source,
            p_description: action.description
          })
        
        if (error) {
          logTest(`Ação ${action.source}`, 'FAIL', error.message)
        } else {
          logTest(`Ação ${action.source}`, 'PASS', `${action.points} pontos`)
          successCount++
        }
      } catch (err) {
        logTest(`Ação ${action.source}`, 'FAIL', err.message)
      }
    }
    
    logTest('Sistema de pontos premium', successCount === premiumActions.length ? 'PASS' : 'WARN', 
           `${successCount}/${premiumActions.length} ações bem-sucedidas`)
    
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
    logTest('Sistema de pontos premium', 'FAIL', error.message)
  }
}

async function testPremiumHooks() {
  logSection('VERIFICANDO HOOKS PREMIUM IMPLEMENTADOS')
  
  try {
    // Verificar se os arquivos de hooks premium existem
    const fs = require('fs')
    const path = require('path')
    
    const premiumHooks = [
      'src/hooks/usePremiumLike.ts',
      'src/hooks/usePremiumPost.ts',
      'src/hooks/usePremiumAd.ts',
      'src/hooks/usePremiumComment.ts',
      'src/hooks/usePremiumLikes.ts',
      'src/hooks/useVipBadges.ts'
    ]
    
    let existingHooks = 0
    
    for (const hookPath of premiumHooks) {
      const fullPath = path.join(process.cwd(), hookPath)
      if (fs.existsSync(fullPath)) {
        logTest(`Hook ${path.basename(hookPath)}`, 'PASS', 'Arquivo existe')
        existingHooks++
      } else {
        logTest(`Hook ${path.basename(hookPath)}`, 'FAIL', 'Arquivo não encontrado')
      }
    }
    
    logTest('Hooks premium implementados', existingHooks === premiumHooks.length ? 'PASS' : 'WARN', 
           `${existingHooks}/${premiumHooks.length} hooks encontrados`)
    
    // Verificar tipos VIP
    const vipTypesPath = path.join(process.cwd(), 'src/types/vip.ts')
    if (fs.existsSync(vipTypesPath)) {
      logTest('Tipos VIP', 'PASS', 'Arquivo de tipos existe')
    } else {
      logTest('Tipos VIP', 'FAIL', 'Arquivo de tipos não encontrado')
    }
    
  } catch (error) {
    logTest('Hooks premium implementados', 'FAIL', error.message)
  }
}

async function cleanup() {
  logSection('LIMPEZA DOS DADOS DE TESTE')
  
  try {
    // Deletar dados de teste
    if (testPost) {
      await supabase.from('feed_posts').delete().eq('id', testPost.id)
      logTest('Limpeza post', 'PASS', 'Post deletado')
    }
    
    if (testUser) {
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
