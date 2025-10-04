/**
 * Script para atualizar perfis existentes que têm dados completos mas não estão marcados como profile_completed: true
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateCompletedProfiles() {
  console.log('🔄 Atualizando perfis completos...\n')
  
  try {
    // 1. Buscar perfis que têm dados básicos mas não estão marcados como completos
    console.log('1️⃣ Buscando perfis que precisam ser atualizados...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, location_state, location_city, profile_completed')
      .or('profile_completed.is.null,profile_completed.eq.false')

    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError)
      return
    }

    console.log(`✅ Encontrados ${profiles?.length || 0} perfis para verificar`)

    let updatedCount = 0
    let skippedCount = 0

    // 2. Verificar cada perfil e atualizar se necessário
    for (const profile of profiles || []) {
      // Verificar se o perfil tem dados básicos preenchidos
      const hasBasicData = profile.full_name && 
                          profile.full_name !== 'Usuário' && 
                          profile.full_name.trim() !== '' &&
                          profile.phone && 
                          profile.phone.trim() !== '' &&
                          profile.location_state && 
                          profile.location_city

      if (hasBasicData) {
        console.log(`🔄 Atualizando perfil: ${profile.full_name}`)
        console.log(`   - Telefone: "${profile.phone}"`)
        console.log(`   - Localização: ${profile.location_state}, ${profile.location_city}`)

        // Atualizar o perfil para marcá-lo como completo
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            profile_completed: true,
            profile_completion_score: 100,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)

        if (updateError) {
          console.error(`❌ Erro ao atualizar perfil ${profile.full_name}:`, updateError)
        } else {
          console.log(`✅ Perfil ${profile.full_name} atualizado com sucesso!`)
          updatedCount++
        }
      } else {
        console.log(`⏭️ Pulando perfil ${profile.full_name} - dados incompletos`)
        console.log(`   - Nome: "${profile.full_name}"`)
        console.log(`   - Telefone: "${profile.phone}"`)
        console.log(`   - Localização: ${profile.location_state}, ${profile.location_city}`)
        skippedCount++
      }
    }

    console.log('\n📊 Resumo da atualização:')
    console.log(`   - Perfis atualizados: ${updatedCount}`)
    console.log(`   - Perfis pulados: ${skippedCount}`)
    console.log(`   - Total processados: ${profiles?.length || 0}`)

    // 3. Verificar resultado final
    console.log('\n3️⃣ Verificando resultado final...')
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('id, full_name, profile_completed')
      .limit(10)

    if (finalError) {
      console.error('❌ Erro ao verificar resultado final:', finalError)
      return
    }

    const completedProfiles = finalProfiles?.filter(p => p.profile_completed === true).length || 0
    const totalProfiles = finalProfiles?.length || 0

    console.log('📈 Estatísticas finais:')
    console.log(`   - Perfis completos: ${completedProfiles}`)
    console.log(`   - Total de perfis: ${totalProfiles}`)
    console.log(`   - Percentual completo: ${totalProfiles > 0 ? Math.round((completedProfiles / totalProfiles) * 100) : 0}%`)

    console.log('\n✅ Atualização de perfis concluída!')
    console.log('🎉 Perfis completos foram marcados corretamente!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar atualização
updateCompletedProfiles().then(() => {
  console.log('\n✅ Atualização finalizada!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Erro na atualização:', error)
  process.exit(1)
})
