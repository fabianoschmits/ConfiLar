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

async function createAuthUser() {
  console.log('👤 Criando usuário de autenticação para fabiano39@gmail.com...\n')

  try {
    // 1. Verificar se o perfil existe
    console.log('📋 Verificando perfil existente...')
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'fabiano39@gmail.com')
      .single()

    if (profileError) {
      console.log('❌ Perfil não encontrado:', profileError.message)
      return
    }

    console.log(`✅ Perfil encontrado: ${profile.id}`)
    console.log(`   Nome: ${profile.full_name}`)
    console.log(`   Email: ${profile.email}`)

    // 2. Criar usuário de autenticação
    console.log('\n🔐 Criando usuário de autenticação...')
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'fabiano39@gmail.com',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        full_name: profile.full_name,
        user_type: profile.user_type
      }
    })

    if (authError) {
      console.log('❌ Erro ao criar usuário de autenticação:', authError.message)
      
      // Se o usuário já existe, tentar atualizar
      if (authError.message.includes('already registered')) {
        console.log('\n🔄 Usuário já existe, tentando atualizar...')
        
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          profile.id, // Usar o ID do perfil
          {
            password: '123456',
            email_confirm: true
          }
        )

        if (updateError) {
          console.log('❌ Erro ao atualizar usuário:', updateError.message)
        } else {
          console.log('✅ Usuário atualizado com sucesso!')
          console.log(`   Nova senha: 123456`)
        }
      }
      return
    }

    console.log('✅ Usuário de autenticação criado!')
    console.log(`   ID: ${authUser.user?.id}`)
    console.log(`   Email: ${authUser.user?.email}`)
    console.log(`   Senha: 123456`)

    // 3. Atualizar o perfil com o ID de autenticação correto
    console.log('\n📝 Atualizando perfil com ID de autenticação...')
    
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ 
        id: authUser.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)

    if (updateProfileError) {
      console.log('⚠️ Aviso: Não foi possível atualizar o ID do perfil:', updateProfileError.message)
    } else {
      console.log('✅ Perfil atualizado com ID de autenticação!')
    }

    // 4. Atualizar o saldo de pontos com o novo ID
    console.log('\n💰 Atualizando saldo de pontos...')
    
    const { error: updateBalanceError } = await supabase
      .from('user_points_balance')
      .update({ 
        user_id: authUser.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.id)

    if (updateBalanceError) {
      console.log('⚠️ Aviso: Não foi possível atualizar o saldo:', updateBalanceError.message)
    } else {
      console.log('✅ Saldo de pontos atualizado!')
    }

    // 5. Testar login
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
createAuthUser()
  .then(() => {
    console.log('\n✅ Criação de usuário concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })


