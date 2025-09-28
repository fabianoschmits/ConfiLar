const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function debugIBGEMapping() {
  console.log('🔍 Debugando mapeamento IBGE vs Banco de Dados...')
  
  try {
    // 1. Buscar estados do IBGE (simulando o que o frontend recebe)
    const ibgeEstados = [
      { nome: 'Rio Grande do Sul', sigla: 'RS' },
      { nome: 'São Paulo', sigla: 'SP' },
      { nome: 'Rio de Janeiro', sigla: 'RJ' }
    ]
    
    console.log('🗺️ Estados do IBGE:')
    ibgeEstados.forEach(estado => {
      console.log(`  - ${estado.nome} (${estado.sigla})`)
    })
    
    // 2. Buscar estados únicos do banco
    const { data: allUsers, error } = await supabase
      .from('profiles')
      .select('location_state')
      .not('location_state', 'is', null)
      .not('location_state', 'eq', '')
    
    if (error) {
      console.error('❌ Erro ao buscar estados do banco:', error)
      return
    }
    
    const estadosBanco = [...new Set(allUsers?.map(user => user.location_state) || [])]
    console.log('\n💾 Estados no banco de dados:', estadosBanco)
    
    // 3. Verificar mapeamento
    console.log('\n🔍 Verificando mapeamento:')
    ibgeEstados.forEach(estadoIBGE => {
      const existeNoBanco = estadosBanco.includes(estadoIBGE.sigla)
      console.log(`  ${estadoIBGE.nome} (${estadoIBGE.sigla}) -> ${existeNoBanco ? '✅' : '❌'} no banco`)
      
      if (existeNoBanco) {
        // Contar quantos usuários tem esse estado
        const usuariosComEstado = allUsers?.filter(user => user.location_state === estadoIBGE.sigla).length || 0
        console.log(`    📊 ${usuariosComEstado} usuários encontrados`)
      }
    })
    
    // 4. Testar filtro com nome completo vs sigla
    console.log('\n🧪 Testando diferentes formatos de filtro:')
    
    const estadoTeste = 'RS'
    const nomeCompletoTeste = 'Rio Grande do Sul'
    
    // Teste 1: Filtro por sigla (como está no banco)
    const { data: filtroSigla, error: erroSigla } = await supabase
      .from('profiles')
      .select('id, full_name, location_state, location_city')
      .eq('location_state', estadoTeste)
    
    console.log(`  Filtro por sigla "${estadoTeste}": ${filtroSigla?.length || 0} usuários`)
    
    // Teste 2: Filtro por nome completo (como pode estar sendo passado)
    const { data: filtroNome, error: erroNome } = await supabase
      .from('profiles')
      .select('id, full_name, location_state, location_city')
      .eq('location_state', nomeCompletoTeste)
    
    console.log(`  Filtro por nome "${nomeCompletoTeste}": ${filtroNome?.length || 0} usuários`)
    
    // 5. Verificar se o problema está na interface
    console.log('\n🎯 Diagnóstico:')
    if (filtroSigla?.length > 0 && filtroNome?.length === 0) {
      console.log('  ✅ O banco funciona com SIGLA')
      console.log('  ❌ O banco NÃO funciona com NOME COMPLETO')
      console.log('  🔧 PROBLEMA: A interface pode estar passando o nome completo em vez da sigla!')
    } else if (filtroSigla?.length === 0) {
      console.log('  ❌ Problema no banco de dados ou na query')
    } else {
      console.log('  ✅ Ambos os formatos funcionam')
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

debugIBGEMapping()
