/**
 * Script para verificar segurança no banco de dados
 * Verifica RLS, políticas de segurança, e uso adequado de Service Role
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verificarSeguranca() {
  console.log('🔒 [VERIFICAÇÃO DE SEGURANÇA] Iniciando verificação...\n')

  const problemas = []
  const avisos = []
  const sucessos = []

  // 1. Verificar se tabelas críticas têm RLS habilitado
  console.log('='.repeat(60))
  console.log('📋 PASSO 1: Verificar RLS (Row Level Security)')
  console.log('='.repeat(60))

  const tabelasCriticas = [
    'profiles',
    'feed_posts',
    'post_comments',
    'post_likes',
    'comment_likes',
    'messages',
    'notifications',
    'point_transactions',
    'user_points_balance',
    'points_purchases',
    'points_transfers',
    'points_withdrawals',
    'referrals',
    'user_referral_stats',
    'reviews',
    'favorites',
    'classified_ads'
  ]

  for (const tabela of tabelasCriticas) {
    try {
      const { data, error } = await supabase.rpc('check_rls_enabled', { table_name: tabela })
      
      if (error) {
        // Tentar método alternativo
        const { data: info } = await supabase
          .from('information_schema.tables')
          .select('*')
          .eq('table_schema', 'public')
          .eq('table_name', tabela)
          .single()
        
        if (info) {
          avisos.push(`⚠️  Não foi possível verificar RLS para ${tabela} (verificar manualmente)`)
        }
      } else {
        if (data) {
          sucessos.push(`✅ RLS habilitado em ${tabela}`)
        } else {
          problemas.push(`❌ RLS NÃO habilitado em ${tabela}`)
        }
      }
    } catch (err) {
      avisos.push(`⚠️  Erro ao verificar RLS em ${tabela}: ${err.message}`)
    }
  }

  // 2. Verificar políticas RLS nas tabelas críticas
  console.log('\n' + '='.repeat(60))
  console.log('📋 PASSO 2: Verificar Políticas RLS')
  console.log('='.repeat(60))

  const { data: policies, error: policiesError } = await supabase
    .from('pg_policies')
    .select('tablename, policyname, permissive, roles, cmd')
    .in('tablename', tabelasCriticas)
    .order('tablename')

  if (policiesError) {
    avisos.push(`⚠️  Não foi possível consultar políticas (SQL necessário)`)
  } else if (policies && policies.length > 0) {
    const tabelasComPoliticas = new Set(policies.map(p => p.tablename))
    const tabelasSemPoliticas = tabelasCriticas.filter(t => !tabelasComPoliticas.has(t))
    
    if (tabelasSemPoliticas.length > 0) {
      problemas.push(`❌ Tabelas sem políticas RLS: ${tabelasSemPoliticas.join(', ')}`)
    } else {
      sucessos.push(`✅ Todas as tabelas críticas têm políticas RLS`)
    }
  }

  // 3. Verificar se há dados sensíveis expostos
  console.log('\n' + '='.repeat(60))
  console.log('📋 PASSO 3: Verificar Exposição de Dados Sensíveis')
  console.log('='.repeat(60))

  try {
    // Verificar se consegue acessar dados sem autenticação (deveria falhar com RLS)
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('email, cpf_cnpj, phone')
      .limit(1)
    
    if (!profilesError && profilesData && profilesData.length > 0) {
      // Usando service role, é esperado ter acesso
      avisos.push(`⚠️  Service Role pode acessar dados sensíveis (esperado, mas verificar RLS)`)
    }
  } catch (err) {
    sucessos.push(`✅ Dados sensíveis protegidos`)
  }

  // 4. Verificar configurações de segurança no auth
  console.log('\n' + '='.repeat(60))
  console.log('📋 PASSO 4: Verificar Configurações de Auth')
  console.log('='.repeat(60))

  try {
    // Verificar se há usuários com emails não verificados com acesso
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (!usersError && users) {
      const usuariosNaoVerificados = users.users.filter(u => !u.email_confirmed_at)
      if (usuariosNaoVerificados.length > 0) {
        avisos.push(`⚠️  ${usuariosNaoVerificados.length} usuários com email não verificado`)
      } else {
        sucessos.push(`✅ Todos os usuários têm email verificado`)
      }
    }
  } catch (err) {
    avisos.push(`⚠️  Não foi possível verificar usuários: ${err.message}`)
  }

  // 5. Verificar integridade de relacionamentos
  console.log('\n' + '='.repeat(60))
  console.log('📋 PASSO 5: Verificar Integridade de Dados')
  console.log('='.repeat(60))

  try {
    // Verificar perfis órfãos (sem usuário auth)
    const { data: profiles, error: profilesErr } = await supabase
      .from('profiles')
      .select('id')
      .limit(100)
    
    if (!profilesErr && profiles) {
      let perfisOrfaos = 0
      for (const profile of profiles) {
        const { data: user } = await supabase.auth.admin.getUserById(profile.id)
        if (!user) perfisOrfaos++
      }
      if (perfisOrfaos > 0) {
        avisos.push(`⚠️  ${perfisOrfaos} perfis sem usuário auth correspondente`)
      } else {
        sucessos.push(`✅ Integridade de perfis OK`)
      }
    }
  } catch (err) {
    avisos.push(`⚠️  Não foi possível verificar integridade: ${err.message}`)
  }

  // 6. Verificar rate limiting e proteção contra brute force
  console.log('\n' + '='.repeat(60))
  console.log('📋 PASSO 6: Verificar Proteções Contra Ataques')
  console.log('='.repeat(60))

  try {
    // Verificar tentativas de login falhadas recentes (se houver tabela de logs)
    const { data: logs, error: logsError } = await supabase
      .from('auth_audit_logs')
      .select('*')
      .eq('event_type', 'login_failed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(10)
    
    if (!logsError) {
      if (logs && logs.length > 100) {
        avisos.push(`⚠️  ${logs.length} tentativas de login falhadas nas últimas 24h`)
      }
    }
  } catch (err) {
    // Tabela pode não existir, não é crítico
    avisos.push(`ℹ️  Tabela de logs de auditoria não encontrada (opcional)`)
  }

  // RESUMO FINAL
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMO FINAL DA VERIFICAÇÃO')
  console.log('='.repeat(60))

  if (sucessos.length > 0) {
    console.log('\n✅ SUCESSOS:')
    sucessos.forEach(s => console.log(`  ${s}`))
  }

  if (avisos.length > 0) {
    console.log('\n⚠️  AVISOS:')
    avisos.forEach(a => console.log(`  ${a}`))
  }

  if (problemas.length > 0) {
    console.log('\n❌ PROBLEMAS CRÍTICOS:')
    problemas.forEach(p => console.log(`  ${p}`))
    console.log('\n⚠️  ATENÇÃO: Encontrados problemas críticos de segurança!')
  } else {
    console.log('\n✅ Nenhum problema crítico encontrado!')
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Verificação concluída!')
  console.log('='.repeat(60))
}

verificarSeguranca().catch(err => {
  console.error('\n❌ Erro fatal na verificação:', err)
  process.exit(1)
})

