#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addPointsToUser() {
  const userId = process.argv[2] || 'f7444305-a3bd-4d71-874a-bb95fd27f96a' // Seu ID por padrão
  const points = parseInt(process.argv[3]) || 10000 // 10.000 pontos por padrão

  console.log(`💰 Adicionando ${points} pontos para o usuário ${userId}...\n`)

  try {
    // 1. Verificar se o usuário existe
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('❌ Usuário não encontrado:', profileError.message)
      return
    }

    console.log(`👤 Usuário encontrado: ${profile.full_name} (${profile.email})`)

    // 2. Verificar saldo atual
    const { data: currentBalance, error: balanceError } = await supabase
      .from('user_points_balance')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (balanceError && balanceError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar saldo:', balanceError.message)
      return
    }

    const currentPoints = currentBalance?.balance || 0
    console.log(`📊 Saldo atual: ${currentPoints} pontos`)

    // 3. Criar transação
    const { data: transaction, error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type: 'earn',
        source: 'admin_bonus',
        amount: points,
        description: `Bônus administrativo - ${points} pontos adicionados`,
        metadata: {
          admin_action: true,
          reason: 'Restauração de pontos para conta principal'
        }
      })
      .select()
      .single()

    if (transactionError) {
      console.error('❌ Erro ao criar transação:', transactionError.message)
      return
    }

    console.log(`✅ Transação criada: ${transaction.id}`)

    // 4. Atualizar saldo do usuário
    const newBalance = currentPoints + points
    const newTotalEarned = (currentBalance?.total_earned || 0) + points

    let updateResult
    if (currentBalance) {
      // Atualizar registro existente
      updateResult = await supabase
        .from('user_points_balance')
        .update({
          balance: newBalance,
          total_earned: newTotalEarned,
          available_balance: newBalance
        })
        .eq('user_id', userId)
        .select()
        .single()
    } else {
      // Criar novo registro
      updateResult = await supabase
        .from('user_points_balance')
        .insert({
          user_id: userId,
          balance: newBalance,
          total_earned: newTotalEarned,
          total_spent: 0,
          available_balance: newBalance,
          level: 'bronze',
          last_daily_reset: new Date().toISOString()
        })
        .select()
        .single()
    }

    if (updateResult.error) {
      console.error('❌ Erro ao atualizar saldo:', updateResult.error.message)
      return
    }

    console.log(`✅ Saldo atualizado:`)
    console.log(`   Novo saldo: ${updateResult.data.balance} pontos`)
    console.log(`   Total ganho: ${updateResult.data.total_earned} pontos`)
    console.log(`   Disponível: ${updateResult.data.available_balance} pontos`)

    // 5. Atualizar estatísticas do usuário
    const { error: statsError } = await supabase
      .from('user_points_stats')
      .upsert({
        user_id: userId,
        balance: newBalance,
        total_earned: newTotalEarned,
        total_spent: currentBalance?.total_spent || 0,
        level: currentBalance?.level || 'bronze'
      })

    if (statsError) {
      console.error('⚠️ Aviso: Erro ao atualizar estatísticas:', statsError.message)
    } else {
      console.log(`✅ Estatísticas atualizadas`)
    }

    console.log(`\n🎉 ${points} pontos adicionados com sucesso!`)
    console.log(`📈 Saldo final: ${newBalance} pontos`)

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar o script
addPointsToUser()
  .then(() => {
    console.log('\n✅ Operação concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })


