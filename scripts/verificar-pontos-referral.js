/**
 * Script para verificar se os pontos estão sendo creditados corretamente
 * para o referrer que teve contas criadas usando seu código de referral
 * 
 * Verifica:
 * 1. Saldo de pontos atual do referrer
 * 2. Transações relacionadas a referrals
 * 3. Histórico de pontos de referral
 * 4. Se os triggers estão funcionando
 */

const { createClient } = require('@supabase/supabase-js')
const path = require('path')
const fs = require('fs')

// Carregar variáveis de ambiente
const envLocalPath = path.join(process.cwd(), '.env.local')
const envPath = path.join(process.cwd(), '.env')

if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath })
} else if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath })
} else {
  require('dotenv').config()
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ID do referrer (Fabiano)
const REFERRER_ID = '9f161f13-0e85-4c2e-bf45-1fe0eaf0ac9a'
const REFERRAL_CODE = 'FABIAN4540'

async function verificarPontosReferral() {
  console.log('🔍 [VERIFICAÇÃO] Verificando pontos de referral...\n')
  console.log(`📋 Referrer ID: ${REFERRER_ID}`)
  console.log(`📋 Código: ${REFERRAL_CODE}\n`)

  try {
    // 1. Buscar dados do referrer
    console.log('='.repeat(60))
    console.log('📝 PASSO 1: Dados do referrer')
    console.log('='.repeat(60))

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, points_balance')
      .eq('id', REFERRER_ID)
      .single()

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError)
      return
    }

    console.log('✅ Perfil encontrado:')
    console.log(`   - Nome: ${profile.full_name}`)
    console.log(`   - Email: ${profile.email || 'N/A'}`)
    console.log(`   - Saldo de pontos: ${profile.points_balance || 0} ConfiPoints\n`)

    // 2. Buscar estatísticas de referral
    console.log('='.repeat(60))
    console.log('📝 PASSO 2: Estatísticas de referral')
    console.log('='.repeat(60))

    const { data: stats, error: statsError } = await supabase
      .from('user_referral_stats')
      .select('*')
      .eq('user_id', REFERRER_ID)
      .single()

    if (statsError) {
      console.error('❌ Erro ao buscar stats:', statsError)
    } else {
      console.log('✅ Estatísticas de referral:')
      console.log(`   - Total de indicações: ${stats.total_referrals || 0}`)
      console.log(`   - Indicações ativas: ${stats.active_referrals || 0}`)
      console.log(`   - Indicações completadas: ${stats.completed_referrals || 0}`)
      console.log(`   - Total de pontos (referral): ${stats.total_points || 0}`)
      console.log(`   - Tier: ${stats.tier || 'none'}\n`)
    }

    // 3. Contar referrals criados
    console.log('='.repeat(60))
    console.log('📝 PASSO 3: Referrals criados')
    console.log('='.repeat(60))

    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select('id, referred_id, status, created_at')
      .eq('referrer_id', REFERRER_ID)
      .order('created_at', { ascending: false })

    if (referralsError) {
      console.error('❌ Erro ao buscar referrals:', referralsError)
    } else {
      console.log(`✅ Total de referrals encontrados: ${referrals?.length || 0}`)
      
      const pendingCount = referrals?.filter(r => r.status === 'pending').length || 0
      const activeCount = referrals?.filter(r => r.status === 'active').length || 0
      const completedCount = referrals?.filter(r => r.status === 'completed').length || 0
      
      console.log(`   - Pending: ${pendingCount}`)
      console.log(`   - Active: ${activeCount}`)
      console.log(`   - Completed: ${completedCount}`)
      
      // Calcular pontos esperados (200 por cada referral criado)
      const pontosEsperadosCadastro = (referrals?.length || 0) * 200
      console.log(`\n💰 Pontos esperados por cadastros: ${pontosEsperadosCadastro} (${referrals?.length || 0} × 200)\n`)
    }

    // 4. Buscar histórico de pontos de referral
    console.log('='.repeat(60))
    console.log('📝 PASSO 4: Histórico de pontos de referral')
    console.log('='.repeat(60))

    const { data: referralPoints, error: referralPointsError } = await supabase
      .from('referral_points_history')
      .select('*')
      .eq('user_id', REFERRER_ID)
      .order('created_at', { ascending: false })

    if (referralPointsError) {
      console.error('❌ Erro ao buscar histórico de pontos de referral:', referralPointsError)
      console.log('⚠️ Tabela referral_points_history pode não existir\n')
    } else {
      console.log(`✅ Total de registros no histórico: ${referralPoints?.length || 0}`)
      
      if (referralPoints && referralPoints.length > 0) {
        const totalPontosReferral = referralPoints.reduce((sum, p) => sum + (p.points || 0), 0)
        console.log(`💰 Total de pontos no histórico: ${totalPontosReferral}`)
        
        console.log('\n📋 Últimos 10 registros:')
        referralPoints.slice(0, 10).forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.action_type}: +${p.points} pontos (${new Date(p.created_at).toLocaleString('pt-BR')})`)
        })
      }
      console.log('')
    }

    // 5. Buscar transações de pontos gerais
    console.log('='.repeat(60))
    console.log('📝 PASSO 5: Transações de pontos gerais')
    console.log('='.repeat(60))

    const { data: transactions, error: transactionsError } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', REFERRER_ID)
      .or('source.ilike.referral%,source.ilike.%referral%')
      .order('created_at', { ascending: false })
      .limit(20)

    if (transactionsError) {
      console.error('❌ Erro ao buscar transações:', transactionsError)
      console.log('⚠️ Pode ser que não haja transações relacionadas a referral na tabela principal\n')
    } else {
      console.log(`✅ Transações relacionadas a referral: ${transactions?.length || 0}`)
      
      if (transactions && transactions.length > 0) {
        const totalPontosTransacoes = transactions
          .filter(t => t.type === 'credit' || t.type === 'earn')
          .reduce((sum, t) => sum + (t.amount || 0), 0)
        
        console.log(`💰 Total de pontos nas transações: ${totalPontosTransacoes}`)
        
        console.log('\n📋 Últimas transações:')
        transactions.slice(0, 10).forEach((t, i) => {
          const tipo = t.type === 'credit' || t.type === 'earn' ? '+' : '-'
          console.log(`   ${i + 1}. ${t.source}: ${tipo}${Math.abs(t.amount || 0)} pontos (${new Date(t.created_at).toLocaleString('pt-BR')})`)
        })
      }
      console.log('')
    }

    // 6. Verificar saldo na view user_points_balance (se existir)
    console.log('='.repeat(60))
    console.log('📝 PASSO 6: Saldo na view user_points_balance')
    console.log('='.repeat(60))

    const { data: balanceData, error: balanceError } = await supabase
      .from('user_points_balance')
      .select('*')
      .eq('user_id', REFERRER_ID)
      .single()

    if (balanceError) {
      console.log('⚠️ View user_points_balance não encontrada ou sem dados')
      console.log(`   Erro: ${balanceError.message}\n`)
    } else {
      console.log('✅ Saldo na view:')
      console.log(`   - Balance: ${balanceData.balance || 0}`)
      console.log(`   - Total earned: ${balanceData.total_earned || 0}`)
      console.log(`   - Total spent: ${balanceData.total_spent || 0}`)
      console.log(`   - Daily earned: ${balanceData.daily_earned || 0}\n`)
    }

    // 7. Resumo final
    console.log('='.repeat(60))
    console.log('📊 RESUMO FINAL')
    console.log('='.repeat(60))
    console.log(`👤 Referrer: ${profile.full_name}`)
    console.log(`📧 Email: ${profile.email || 'N/A'}`)
    console.log(`\n📈 Estatísticas:`)
    console.log(`   - Total de referrals: ${stats?.total_referrals || 0}`)
    console.log(`   - Saldo no perfil: ${profile.points_balance || 0} ConfiPoints`)
    console.log(`   - Total de pontos (referral stats): ${stats?.total_points || 0}`)
    
    const pontosEsperados = (referrals?.length || 0) * 200
    const pontosRecebidos = referralPoints?.reduce((sum, p) => sum + (p.points || 0), 0) || 0
    
    console.log(`\n💰 Análise de pontos:`)
    console.log(`   - Pontos esperados (cadastros): ${pontosEsperados} (${referrals?.length || 0} × 200)`)
    console.log(`   - Pontos recebidos (histórico): ${pontosRecebidos}`)
    
    if (pontosEsperados > 0) {
      const diferenca = pontosRecebidos - pontosEsperados
      if (diferenca === 0) {
        console.log(`   ✅ Status: Pontos corretos!`)
      } else if (diferenca > 0) {
        console.log(`   ✅ Status: Recebeu mais pontos do que esperado (+${diferenca})`)
      } else {
        console.log(`   ⚠️ Status: Faltam ${Math.abs(diferenca)} pontos`)
        console.log(`   🔍 Possível problema: Triggers não estão executando corretamente`)
      }
    } else {
      console.log(`   ⚠️ Nenhum referral encontrado para calcular pontos esperados`)
    }

    console.log('\n✅ Verificação concluída!')

  } catch (error) {
    console.error('\n❌ Erro na verificação:', error)
    throw error
  }
}

// Executar verificação
verificarPontosReferral()
  .then(() => {
    console.log('\n✅ Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  })
