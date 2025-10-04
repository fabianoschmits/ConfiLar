/**
 * Script para atualizar a estrutura da tabela notification_preferences
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateNotificationPreferencesSchema() {
  console.log('🔧 Atualizando estrutura da tabela notification_preferences...\n')
  
  try {
    // 1. Verificar estrutura atual
    console.log('1️⃣ Verificando estrutura atual...')
    const { data: currentData, error: currentError } = await supabase
      .from('notification_preferences')
      .select('*')
      .limit(1)
      .single()

    if (currentError) {
      console.error('❌ Erro ao verificar estrutura atual:', currentError)
      return
    }

    console.log('📊 Estrutura atual:')
    Object.keys(currentData).forEach(key => {
      console.log(`   - ${key}`)
    })

    // 2. Verificar colunas faltantes
    console.log('\n2️⃣ Verificando colunas faltantes...')
    const requiredColumns = [
      'email_enabled',
      'marketing_notifications',
      'sms_notifications',
      'system_notifications',
      'quiet_hours_start',
      'quiet_hours_end',
      'timezone'
    ]

    const existingColumns = Object.keys(currentData)
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))

    if (missingColumns.length === 0) {
      console.log('✅ Todas as colunas necessárias já existem!')
      return
    }

    console.log('❌ Colunas faltantes:', missingColumns)

    // 3. Atualizar registros existentes com valores padrão
    console.log('\n3️⃣ Atualizando registros existentes...')
    const { data: updateData, error: updateError } = await supabase
      .from('notification_preferences')
      .update({
        email_enabled: true,
        marketing_notifications: false,
        sms_notifications: false,
        system_notifications: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        timezone: 'America/Sao_Paulo',
        updated_at: new Date().toISOString()
      })
      .select()

    if (updateError) {
      console.error('❌ Erro ao atualizar registros:', updateError)
      console.log('🔧 Isso pode indicar que as colunas ainda não existem na tabela')
      console.log('💡 Execute o SQL manualmente no Supabase Dashboard:')
      console.log(`
-- Adicionar colunas faltantes
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT true;

ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS marketing_notifications BOOLEAN DEFAULT false;

ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false;

ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS system_notifications BOOLEAN DEFAULT true;

ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME DEFAULT '22:00';

ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME DEFAULT '08:00';

ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo';
      `)
      return
    }

    console.log(`✅ ${updateData?.length || 0} registros atualizados!`)

    // 4. Verificar estrutura final
    console.log('\n4️⃣ Verificando estrutura final...')
    const { data: finalData, error: finalError } = await supabase
      .from('notification_preferences')
      .select('*')
      .limit(1)
      .single()

    if (finalError) {
      console.error('❌ Erro ao verificar estrutura final:', finalError)
      return
    }

    console.log('📊 Estrutura final:')
    Object.keys(finalData).forEach(key => {
      const value = finalData[key]
      console.log(`   - ${key}: ${typeof value} (${value})`)
    })

    // 5. Verificar se todas as colunas estão presentes
    const finalColumns = Object.keys(finalData)
    const stillMissing = requiredColumns.filter(col => !finalColumns.includes(col))

    if (stillMissing.length === 0) {
      console.log('\n✅ Todas as colunas necessárias estão presentes!')
    } else {
      console.log('\n❌ Ainda faltam colunas:', stillMissing)
    }

    console.log('\n✅ Atualização da estrutura concluída!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar atualização
updateNotificationPreferencesSchema().then(() => {
  console.log('\n✅ Atualização finalizada!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Erro na atualização:', error)
  process.exit(1)
})
