const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Função para filtrar por estado (simulando a lógica dos hooks)
function filterByState(users, stateFilter) {
  return users.filter(user => {
    const userState = user.location_state
    const filterState = stateFilter
    
    // Verificar se é uma sigla (2 caracteres) ou nome completo
    if (filterState.length === 2) {
      // É uma sigla, comparar diretamente
      return userState === filterState
    } else {
      // É um nome completo, verificar se corresponde à sigla do usuário
      // Mapear nomes para siglas
      const stateMapping = {
        'Rio Grande do Sul': 'RS',
        'São Paulo': 'SP',
        'Rio de Janeiro': 'RJ',
        'Minas Gerais': 'MG',
        'Bahia': 'BA',
        'Paraná': 'PR',
        'Santa Catarina': 'SC',
        'Goiás': 'GO',
        'Pernambuco': 'PE',
        'Ceará': 'CE',
        'Pará': 'PA',
        'Maranhão': 'MA',
        'Paraíba': 'PB',
        'Amazonas': 'AM',
        'Espírito Santo': 'ES',
        'Piauí': 'PI',
        'Alagoas': 'AL',
        'Tocantins': 'TO',
        'Rio Grande do Norte': 'RN',
        'Acre': 'AC',
        'Amapá': 'AP',
        'Rondônia': 'RO',
        'Roraima': 'RR',
        'Sergipe': 'SE',
        'Mato Grosso': 'MT',
        'Mato Grosso do Sul': 'MS',
        'Distrito Federal': 'DF'
      }
      
      const expectedSigla = stateMapping[filterState]
      return expectedSigla ? userState === expectedSigla : userState === filterState
    }
  })
}

async function testFlexibleFilter() {
  console.log('🧪 Testando filtro flexível de estados...')
  
  try {
    // Buscar usuários
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, full_name, location_state, location_city')
      .not('location_state', 'is', null)
      .not('location_state', 'eq', '')
    
    if (error) {
      console.error('❌ Erro ao buscar usuários:', error)
      return
    }
    
    console.log(`📊 Total de usuários com estado: ${users?.length || 0}`)
    
    if (users && users.length > 0) {
      // Teste 1: Filtro por sigla
      console.log('\n🔍 Teste 1: Filtro por SIGLA "RS"')
      const filtroSigla = filterByState(users, 'RS')
      console.log(`✅ Resultado: ${filtroSigla.length} usuários encontrados`)
      filtroSigla.slice(0, 3).forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.full_name} - ${user.location_state}`)
      })
      
      // Teste 2: Filtro por nome completo
      console.log('\n🔍 Teste 2: Filtro por NOME COMPLETO "Rio Grande do Sul"')
      const filtroNome = filterByState(users, 'Rio Grande do Sul')
      console.log(`✅ Resultado: ${filtroNome.length} usuários encontrados`)
      filtroNome.slice(0, 3).forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.full_name} - ${user.location_state}`)
      })
      
      // Teste 3: Verificar se os resultados são iguais
      console.log('\n🔍 Teste 3: Comparação dos resultados')
      const resultadosIguais = filtroSigla.length === filtroNome.length
      console.log(`✅ Resultados iguais: ${resultadosIguais ? 'SIM' : 'NÃO'}`)
      
      if (resultadosIguais) {
        console.log('🎉 SUCESSO: O filtro flexível está funcionando!')
        console.log('   - Aceita tanto sigla (RS) quanto nome completo (Rio Grande do Sul)')
        console.log('   - Ambos retornam os mesmos resultados')
      } else {
        console.log('❌ ERRO: Os resultados não são iguais')
      }
      
      // Teste 4: Testar com estado que não existe
      console.log('\n🔍 Teste 4: Filtro por estado inexistente "XX"')
      const filtroInexistente = filterByState(users, 'XX')
      console.log(`✅ Resultado: ${filtroInexistente.length} usuários encontrados (deve ser 0)`)
      
    } else {
      console.log('⚠️ Nenhum usuário com estado encontrado')
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

testFlexibleFilter()
