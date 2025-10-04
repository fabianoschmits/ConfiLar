const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateNotificationSchema() {
  console.log('🔧 Atualizando schema da tabela notification_preferences...\n')

  try {
    // 1. Verificar estrutura atual
    console.log('1. Verificando estrutura atual...')
    const { data: currentData, error: currentError } = await supabase
      .from('notification_preferences')
      .select('*')
      .limit(1)

    if (currentError) {
      console.error('❌ Erro ao acessar tabela:', currentError.message)
      return
    }

    console.log('✅ Tabela acessível')

    // 2. Tentar inserir um registro com todas as colunas para identificar quais estão faltando
    console.log('\n2. Testando inserção com todas as colunas...')
    
    const testRecord = {
      user_id: '00000000-0000-0000-0000-000000000000',
      push_enabled: true,
      sound_enabled: true,
      vibration_enabled: true,
      message_notifications: true,
      review_notifications: true,
      favorite_notifications: true,
      recommendation_notifications: true,
      booking_notifications: false,
      system_notifications: true,
      email_enabled: true,
      marketing_notifications: false,
      sms_notifications: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      timezone: 'America/Sao_Paulo'
    }

    const { data: insertData, error: insertError } = await supabase
      .from('notification_preferences')
      .insert(testRecord)
      .select()

    if (insertError) {
      console.log('⚠️ Erro ao inserir (esperado se colunas estão faltando):', insertError.message)
      
      // Identificar quais colunas estão faltando
      const missingColumns = []
      if (insertError.message.includes('sound_enabled')) missingColumns.push('sound_enabled')
      if (insertError.message.includes('vibration_enabled')) missingColumns.push('vibration_enabled')
      if (insertError.message.includes('favorite_notifications')) missingColumns.push('favorite_notifications')
      if (insertError.message.includes('recommendation_notifications')) missingColumns.push('recommendation_notifications')
      
      console.log('📋 Colunas que precisam ser adicionadas:', missingColumns)
      
      // Como não podemos executar ALTER TABLE diretamente via API, vamos informar o usuário
      console.log('\n💡 Para adicionar as colunas faltantes, execute este SQL no Supabase:')
      console.log('\n-- Adicionar colunas faltantes')
      missingColumns.forEach(column => {
        console.log(`ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS ${column} BOOLEAN DEFAULT true;`)
      })
      
      console.log('\n-- Atualizar registros existentes')
      console.log('UPDATE notification_preferences SET')
      missingColumns.forEach((column, index) => {
        console.log(`  ${column} = true${index < missingColumns.length - 1 ? ',' : ''}`)
      })
      console.log('WHERE ' + missingColumns.map(col => `${col} IS NULL`).join(' OR '))
      
    } else {
      console.log('✅ Todas as colunas já existem!')
      console.log('📋 Colunas disponíveis:')
      const columns = Object.keys(insertData[0])
      columns.forEach(column => {
        console.log(`   - ${column}`)
      })
    }

    // 3. Verificar se podemos atualizar um registro existente
    console.log('\n3. Testando atualização de registro existente...')
    
    // Buscar um usuário real
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (usersError || !users.length) {
      console.log('⚠️ Nenhum usuário encontrado para teste')
      return
    }

    const testUserId = users[0].id
    console.log(`👤 Testando com usuário: ${testUserId}`)

    // Tentar atualizar apenas as colunas que sabemos que existem
    const { data: updateData, error: updateError } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: testUserId,
        push_enabled: true,
        message_notifications: false, // Testando desabilitar mensagens
        review_notifications: true,
        booking_notifications: false,
        system_notifications: true,
        email_enabled: true,
        marketing_notifications: false,
        sms_notifications: false
      }, { onConflict: 'user_id' })
      .select()

    if (updateError) {
      console.error('❌ Erro ao atualizar:', updateError.message)
    } else {
      console.log('✅ Atualização bem-sucedida!')
      console.log('📋 Configurações salvas:')
      console.log(`   - Mensagens: ${updateData[0].message_notifications ? 'Habilitadas' : 'Desabilitadas'}`)
      console.log(`   - Push: ${updateData[0].push_enabled ? 'Habilitado' : 'Desabilitado'}`)
      console.log(`   - Email: ${updateData[0].email_enabled ? 'Habilitado' : 'Desabilitado'}`)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar atualização
updateNotificationSchema()
