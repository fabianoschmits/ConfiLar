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

async function fixUserAuth() {
  console.log('🔧 Corrigindo autenticação do usuário fabiano39@gmail.com...\n')

  try {
    // 1. Buscar todos os usuários para encontrar o correto
    console.log('👥 Buscando usuário de autenticação...')
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError.message)
      return
    }

    const authUser = users.users.find(u => u.email === 'fabiano39@gmail.com')
    
    if (!authUser) {
      console.error('❌ Usuário de autenticação não encontrado')
      return
    }

    console.log(`✅ Usuário de autenticação encontrado: ${authUser.id}`)
    console.log(`   Email: ${authUser.email}`)
    console.log(`   Criado em: ${authUser.created_at}`)

    // 2. Resetar senha
    console.log('\n🔑 Resetando senha...')
    
    const { data: resetData, error: resetError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      {
        password: '123456',
        email_confirm: true
      }
    )

    if (resetError) {
      console.error('❌ Erro ao resetar senha:', resetError.message)
      return
    }

    console.log('✅ Senha resetada com sucesso!')
    console.log(`   Nova senha: 123456`)

    // 3. Verificar se o ID do perfil corresponde ao ID de autenticação
    console.log('\n🔄 Verificando sincronização de IDs...')
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'fabiano39@gmail.com')
      .single()

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message)
      return
    }

    console.log(`📋 Perfil encontrado: ${profile.id}`)
    
    if (profile.id !== authUser.id) {
      console.log('⚠️ IDs não coincidem! Corrigindo...')
      
      // Atualizar o perfil com o ID correto de autenticação
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ 
          id: authUser.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (updateProfileError) {
        console.log('❌ Erro ao atualizar perfil:', updateProfileError.message)
      } else {
        console.log('✅ Perfil atualizado com ID de autenticação!')
      }

      // Atualizar o saldo de pontos
      const { error: updateBalanceError } = await supabase
        .from('user_points_balance')
        .update({ 
          user_id: authUser.id,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.id)

      if (updateBalanceError) {
        console.log('❌ Erro ao atualizar saldo:', updateBalanceError.message)
      } else {
        console.log('✅ Saldo de pontos atualizado!')
      }
    } else {
      console.log('✅ IDs já estão sincronizados!')
    }

    // 4. Testar login
    console.log('\n🧪 Testando login...')
    
    const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: 'fabiano39@gmail.com',
      password: '123456'
    })

    if (loginError) {
      console.log('❌ Erro no teste de login:', loginError.message)
    } else {
      console.log('✅ Login bem-sucedido!')
      console.log(`   Usuário ID: ${loginData.user?.id}`)
      
      // Testar acesso ao saldo
      const { data: balanceData, error: balanceError } = await supabaseAnon
        .from('user_points_balance')
        .select('*')
        .eq('user_id', loginData.user.id)
        .single()

      if (balanceError) {
        console.log('❌ Erro ao acessar saldo:', balanceError.message)
        console.log('   Código:', balanceError.code)
      } else {
        console.log('✅ Saldo acessível!')
        console.log(`   Saldo: ${balanceData.balance} pontos`)
      }

      // Testar acesso às transferências
      console.log('\n🔄 Testando acesso às transferências...')
      
      const { data: transfersData, error: transfersError } = await supabaseAnon
        .from('points_transfers')
        .select('*')
        .or(`from_user_id.eq.${loginData.user.id},to_user_id.eq.${loginData.user.id}`)
        .limit(5)

      if (transfersError) {
        console.log('❌ Erro ao acessar transferências:', transfersError.message)
        console.log('   Código:', transfersError.code)
      } else {
        console.log('✅ Transferências acessíveis!')
        console.log(`   Registros encontrados: ${transfersData?.length || 0}`)
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar o script
fixUserAuth()
  .then(() => {
    console.log('\n✅ Correção de autenticação concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })


