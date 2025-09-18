#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// ===================================
// CONFIGURAÇÃO DE VARIÁVEIS OBRIGATÓRIAS
// ===================================

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

const RECOMMENDED_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
]

const OPTIONAL_VARS = [
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  'NEXT_PUBLIC_POSTHOG_KEY',
  'NEXT_PUBLIC_SENTRY_DSN',
  'DISCORD_WEBHOOK_URL'
]

// ===================================
// FUNÇÕES UTILITÁRIAS
// ===================================

function loadEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    const vars = {}
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          vars[key.trim()] = valueParts.join('=').trim()
        }
      }
    })
    
    return vars
  } catch (error) {
    return null
  }
}

function validateVariable(name, value) {
  const validations = {
    'NEXT_PUBLIC_SUPABASE_URL': (val) => {
      if (!val) return 'é obrigatória'
      if (!val.startsWith('https://')) return 'deve começar com https://'
      if (!val.includes('supabase.co')) return 'deve ser uma URL válida do Supabase'
      return null
    },
    
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': (val) => {
      if (!val) return 'é obrigatória'
      if (val.length < 100) return 'parece muito curta para uma chave válida'
      return null
    },
    
    'NEXTAUTH_SECRET': (val) => {
      if (!val) return 'é recomendada para segurança'
      if (val.length < 32) return 'deve ter pelo menos 32 caracteres'
      return null
    },
    
    'NEXTAUTH_URL': (val) => {
      if (!val) return 'é recomendada'
      if (!val.startsWith('http')) return 'deve ser uma URL válida'
      return null
    }
  }
  
  const validator = validations[name]
  return validator ? validator(value) : null
}

// ===================================
// VALIDAÇÃO PRINCIPAL
// ===================================

function validateEnvironment() {
  console.log('🔍 Validando configuração de ambiente...\n')
  
  // Verificar arquivos de ambiente
  const envLocal = loadEnvFile('.env.local')
  const envExample = loadEnvFile('env.template')
  
  if (!envLocal && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('❌ Nenhum arquivo .env.local encontrado e variáveis não estão no sistema')
    console.log('💡 Execute: cp env.template .env.local')
    console.log('💡 Em seguida, configure suas variáveis de ambiente\n')
    process.exit(1)
  }
  
  // Usar variáveis do arquivo ou do sistema
  const env = envLocal || process.env
  
  let errors = 0
  let warnings = 0
  
  // Validar variáveis obrigatórias
  console.log('📋 Variáveis Obrigatórias:')
  REQUIRED_VARS.forEach(varName => {
    const value = env[varName] || process.env[varName]
    const error = validateVariable(varName, value)
    
    if (!value) {
      console.log(`❌ ${varName}: NÃO DEFINIDA`)
      errors++
    } else if (error) {
      console.log(`⚠️  ${varName}: ${error}`)
      warnings++
    } else {
      console.log(`✅ ${varName}: OK`)
    }
  })
  
  // Validar variáveis recomendadas
  console.log('\n📋 Variáveis Recomendadas:')
  RECOMMENDED_VARS.forEach(varName => {
    const value = env[varName] || process.env[varName]
    const error = validateVariable(varName, value)
    
    if (!value) {
      console.log(`⚠️  ${varName}: NÃO DEFINIDA (recomendado)`)
      warnings++
    } else if (error) {
      console.log(`⚠️  ${varName}: ${error}`)
      warnings++
    } else {
      console.log(`✅ ${varName}: OK`)
    }
  })
  
  // Mostrar variáveis opcionais
  console.log('\n📋 Variáveis Opcionais:')
  OPTIONAL_VARS.forEach(varName => {
    const value = env[varName] || process.env[varName]
    
    if (value) {
      console.log(`✅ ${varName}: CONFIGURADA`)
    } else {
      console.log(`➖ ${varName}: não configurada`)
    }
  })
  
  // Resumo
  console.log('\n📊 Resumo da Validação:')
  console.log(`✅ Sucesso: ${REQUIRED_VARS.length + RECOMMENDED_VARS.length - errors - warnings}`)
  console.log(`⚠️  Avisos: ${warnings}`)
  console.log(`❌ Erros: ${errors}`)
  
  if (errors > 0) {
    console.log('\n❌ Configuração inválida! Corrija os erros antes de continuar.')
    process.exit(1)
  } else if (warnings > 0) {
    console.log('\n⚠️  Configuração com avisos. Recomenda-se corrigir para melhor funcionamento.')
  } else {
    console.log('\n🎉 Configuração válida!')
  }
  
  // Verificações adicionais
  console.log('\n🔧 Verificações Adicionais:')
  
  // Verificar se é produção sem debug mode
  const isProduction = process.env.NODE_ENV === 'production'
  const debugMode = env.NEXT_PUBLIC_DEBUG_MODE === 'true'
  
  if (isProduction && debugMode) {
    console.log('⚠️  Debug mode ativado em produção - desative para melhor performance')
  } else {
    console.log('✅ Debug mode configurado corretamente')
  }
  
  // Verificar URLs de produção
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  if (isProduction && supabaseUrl && supabaseUrl.includes('localhost')) {
    console.log('❌ URL do Supabase aponta para localhost em produção!')
    errors++
  }
  
  console.log('\n✨ Validação concluída!')
  
  if (errors > 0) {
    process.exit(1)
  }
}

// ===================================
// EXECUÇÃO
// ===================================

if (require.main === module) {
  validateEnvironment()
}

module.exports = { validateEnvironment }

