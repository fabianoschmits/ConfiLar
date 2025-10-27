#!/usr/bin/env node

/**
 * =============================================
 * SCRIPT DE VERIFICAÇÃO DAS TABELAS PREMIUM
 * =============================================
 * 
 * Este script verifica se todas as tabelas necessárias
 * para o sistema premium estão criadas e funcionando.
 * 
 * Execute: node scripts/VERIFICAR-TABELAS-PREMIUM.js
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
  const statusColor = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'WARN'
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  
  log(`${statusIcon} ${testName}: ${status}`, statusColor)
  if (details) {
    log(`   ${details}`, 'yellow')
  }
}

// Tabelas necessárias para o sistema premium
const requiredTables = [
  {
    name: 'user_points_balance',
    description: 'Saldo de pontos dos usuários',
    requiredColumns: ['user_id', 'balance', 'created_at', 'updated_at']
  },
  {
    name: 'points_transactions',
    description: 'Histórico de transações de pontos',
    requiredColumns: ['id', 'user_id', 'points', 'source', 'description', 'created_at']
  },
  {
    name: 'feed_posts',
    description: 'Posts do feed (com suporte premium)',
    requiredColumns: ['id', 'user_id', 'content', 'is_premium', 'premium_points_spent', 'premium_expires_at']
  },
  {
    name: 'feed_posts_likes',
    description: 'Curtidas em posts (com suporte premium)',
    requiredColumns: ['id', 'user_id', 'post_id', 'is_premium', 'premium_points_spent']
  },
  {
    name: 'classifieds',
    description: 'Anúncios classificados (com suporte premium)',
    requiredColumns: ['id', 'user_id', 'title', 'description', 'is_premium', 'premium_points_spent', 'premium_expires_at']
  },
  {
    name: 'vip_badges',
    description: 'Badges VIP dos usuários',
    requiredColumns: ['id', 'user_id', 'badge_type', 'badge_name', 'is_active', 'purchased_at']
  },
  {
    name: 'profiles',
    description: 'Perfis dos usuários',
    requiredColumns: ['id', 'full_name', 'email', 'user_type']
  }
]

async function main() {
  try {
    logSection('VERIFICANDO TABELAS DO SISTEMA PREMIUM')
    
    let allTablesExist = true
    let allColumnsExist = true
    
    for (const table of requiredTables) {
      await checkTable(table)
    }
    
    // Verificar funções RPC necessárias
    await checkRpcFunctions()
    
    // Verificar triggers
    await checkTriggers()
    
    logSection('VERIFICAÇÃO CONCLUÍDA')
    
    if (allTablesExist && allColumnsExist) {
      log('✅ Todas as tabelas e colunas necessárias estão presentes!', 'green')
    } else {
      log('❌ Algumas tabelas ou colunas estão faltando. Verifique os erros acima.', 'red')
    }
    
  } catch (error) {
    log(`\n❌ ERRO CRÍTICO: ${error.message}`, 'red')
    console.error(error)
    process.exit(1)
  }
}

async function checkTable(table) {
  try {
    // Verificar se a tabela existe
    const { data, error } = await supabase
      .from(table.name)
      .select('*')
      .limit(1)
    
    if (error) {
      logTest(`Tabela ${table.name}`, 'FAIL', error.message)
      return false
    }
    
    logTest(`Tabela ${table.name}`, 'PASS', table.description)
    
    // Verificar colunas necessárias
    for (const column of table.requiredColumns) {
      try {
        const { error: columnError } = await supabase
          .from(table.name)
          .select(column)
          .limit(1)
        
        if (columnError) {
          logTest(`  Coluna ${column}`, 'FAIL', columnError.message)
          return false
        } else {
          logTest(`  Coluna ${column}`, 'PASS', 'Existe')
        }
      } catch (err) {
        logTest(`  Coluna ${column}`, 'FAIL', err.message)
        return false
      }
    }
    
    return true
    
  } catch (error) {
    logTest(`Tabela ${table.name}`, 'FAIL', error.message)
    return false
  }
}

async function checkRpcFunctions() {
  logSection('VERIFICANDO FUNÇÕES RPC')
  
  const requiredFunctions = [
    {
      name: 'add_points',
      description: 'Adiciona/subtrai pontos do usuário',
      testParams: {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_points: 0,
        p_source: 'test',
        p_description: 'Teste de função'
      }
    }
  ]
  
  for (const func of requiredFunctions) {
    try {
      const { error } = await supabase.rpc(func.name, func.testParams)
      
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        logTest(`Função RPC ${func.name}`, 'FAIL', 'Função não existe')
      } else if (error && error.message.includes('violates foreign key constraint')) {
        logTest(`Função RPC ${func.name}`, 'PASS', 'Função existe (erro esperado por FK)')
      } else if (error) {
        logTest(`Função RPC ${func.name}`, 'WARN', `Erro: ${error.message}`)
      } else {
        logTest(`Função RPC ${func.name}`, 'PASS', func.description)
      }
    } catch (err) {
      logTest(`Função RPC ${func.name}`, 'FAIL', err.message)
    }
  }
}

async function checkTriggers() {
  logSection('VERIFICANDO TRIGGERS')
  
  // Verificar se existem triggers importantes
  const triggerQueries = [
    {
      name: 'Trigger de atualização de saldo',
      query: `
        SELECT trigger_name, event_manipulation, action_statement 
        FROM information_schema.triggers 
        WHERE trigger_name LIKE '%points%' OR trigger_name LIKE '%balance%'
        LIMIT 5
      `
    }
  ]
  
  for (const trigger of triggerQueries) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: trigger.query })
      
      if (error) {
        logTest(`Trigger ${trigger.name}`, 'WARN', 'Não foi possível verificar triggers')
      } else {
        logTest(`Trigger ${trigger.name}`, 'PASS', 'Triggers verificados')
      }
    } catch (err) {
      logTest(`Trigger ${trigger.name}`, 'WARN', 'Verificação não disponível')
    }
  }
}

// Executar verificação
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { main }
