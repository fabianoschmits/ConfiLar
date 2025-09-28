const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function debugFilterIssue() {
  console.log('🔍 Debugando problema de filtros...')
  
  try {
    // 1. Verificar se há usuários no banco
    const { data: allUsers, error: allUsersError } = await supabase
      .from('profiles')
      .select('id, full_name, location_state, location_city, user_type')
      .limit(10)
    
    if (allUsersError) {
      console.error('❌ Erro ao buscar usuários:', allUsersError)
      return
    }
    
    console.log('📊 Total de usuários encontrados:', allUsers?.length || 0)
    
    if (allUsers && allUsers.length > 0) {
      console.log('👥 Primeiros usuários:')
      allUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.full_name} - ${user.location_state} - ${user.location_city} - ${user.user_type}`)
      })
      
      // 2. Verificar estados únicos
      const estadosUnicos = [...new Set(allUsers.map(user => user.location_state).filter(Boolean))]
      console.log('🗺️ Estados únicos encontrados:', estadosUnicos)
      
      // 3. Testar filtro por estado específico
      const estadoTeste = estadosUnicos[0]
      if (estadoTeste) {
        console.log(`\n🧪 Testando filtro por estado: "${estadoTeste}"`)
        
        const { data: filteredUsers, error: filterError } = await supabase
          .from('profiles')
          .select('id, full_name, location_state, location_city, user_type')
          .eq('location_state', estadoTeste)
        
        if (filterError) {
          console.error('❌ Erro ao filtrar por estado:', filterError)
        } else {
          console.log(`✅ Filtro por estado "${estadoTeste}": ${filteredUsers?.length || 0} usuários encontrados`)
          if (filteredUsers && filteredUsers.length > 0) {
            filteredUsers.forEach((user, index) => {
              console.log(`  ${index + 1}. ${user.full_name} - ${user.location_state} - ${user.location_city}`)
            })
          }
        }
      }
      
      // 4. Verificar cidades únicas
      const cidadesUnicas = [...new Set(allUsers.map(user => user.location_city).filter(Boolean))]
      console.log('🏙️ Cidades únicas encontradas:', cidadesUnicas)
      
      // 5. Testar filtro por cidade específica
      const cidadeTeste = cidadesUnicas[0]
      if (cidadeTeste) {
        console.log(`\n🧪 Testando filtro por cidade: "${cidadeTeste}"`)
        
        const { data: filteredByCity, error: cityFilterError } = await supabase
          .from('profiles')
          .select('id, full_name, location_state, location_city, user_type')
          .eq('location_city', cidadeTeste)
        
        if (cityFilterError) {
          console.error('❌ Erro ao filtrar por cidade:', cityFilterError)
        } else {
          console.log(`✅ Filtro por cidade "${cidadeTeste}": ${filteredByCity?.length || 0} usuários encontrados`)
          if (filteredByCity && filteredByCity.length > 0) {
            filteredByCity.forEach((user, index) => {
              console.log(`  ${index + 1}. ${user.full_name} - ${user.location_state} - ${user.location_city}`)
            })
          }
        }
      }
      
      // 6. Testar filtro combinado (estado + cidade)
      if (estadoTeste && cidadeTeste) {
        console.log(`\n🧪 Testando filtro combinado: Estado "${estadoTeste}" + Cidade "${cidadeTeste}"`)
        
        const { data: filteredCombined, error: combinedError } = await supabase
          .from('profiles')
          .select('id, full_name, location_state, location_city, user_type')
          .eq('location_state', estadoTeste)
          .eq('location_city', cidadeTeste)
        
        if (combinedError) {
          console.error('❌ Erro ao filtrar combinado:', combinedError)
        } else {
          console.log(`✅ Filtro combinado: ${filteredCombined?.length || 0} usuários encontrados`)
          if (filteredCombined && filteredCombined.length > 0) {
            filteredCombined.forEach((user, index) => {
              console.log(`  ${index + 1}. ${user.full_name} - ${user.location_state} - ${user.location_city}`)
            })
          }
        }
      }
      
      // 7. Verificar se há problemas de case sensitivity
      console.log('\n🔤 Verificando problemas de case sensitivity...')
      const estadosComCase = allUsers.map(user => ({
        original: user.location_state,
        upper: user.location_state?.toUpperCase(),
        lower: user.location_state?.toLowerCase()
      }))
      
      const cidadesComCase = allUsers.map(user => ({
        original: user.location_city,
        upper: user.location_city?.toUpperCase(),
        lower: user.location_city?.toLowerCase()
      }))
      
      const estadosUnicosCase = [...new Set(estadosComCase.map(e => e.original))]
      const cidadesUnicasCase = [...new Set(cidadesComCase.map(c => c.original))]
      
      console.log('📝 Estados com case original:', estadosUnicosCase)
      console.log('📝 Cidades com case original:', cidadesUnicasCase)
    } else {
      console.log('⚠️ Nenhum usuário encontrado no banco de dados')
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

debugFilterIssue()
