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

async function resetPassword() {
  console.log('🔐 Resetando senha para fabiano39@gmail.com...\n')

  try {
    // 1. Buscar o usuário pelo email
    console.log('👤 Buscando usuário...')
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError.message)
      return
    }

    const user = users.users.find(u => u.email === 'fabiano39@gmail.com')
    
    if (!user) {
      console.error('❌ Usuário fabiano39@gmail.com não encontrado')
      return
    }

    console.log(`✅ Usuário encontrado: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Criado em: ${user.created_at}`)

    // 2. Resetar a senha
    console.log('\n🔑 Resetando senha...')
    
    const { data: resetData, error: resetError } = await supabase.auth.admin.updateUserById(
      user.id,
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

    // 3. Testar login com a nova senha
    console.log('\n🧪 Testando login com nova senha...')
    
    const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email: 'fabiano39@gmail.com',
      password: '123456'
    })

    if (authError) {
      console.log('❌ Erro no teste de login:', authError.message)
    } else {
      console.log('✅ Login bem-sucedido!')
      console.log(`   Usuário ID: ${authData.user?.id}`)
      
      // 4. Testar acesso ao saldo
      console.log('\n💰 Testando acesso ao saldo...')
      
      const { data: balanceData, error: balanceError } = await supabaseAnon
        .from('user_points_balance')
        .select('*')
        .eq('user_id', authData.user.id)
        .single()

      if (balanceError) {
        console.log('❌ Erro ao acessar saldo:', balanceError.message)
      } else {
        console.log('✅ Saldo acessível!')
        console.log(`   Saldo: ${balanceData.balance} pontos`)
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar o script
resetPassword()
  .then(() => {
    console.log('\n✅ Reset de senha concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })


