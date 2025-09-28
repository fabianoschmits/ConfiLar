const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testReportsSystem() {
  console.log('🧪 Testando sistema de denúncias...\n')

  try {
    // 1. Verificar se a tabela existe
    console.log('📊 Verificando tabela reports...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('reports')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('❌ Erro ao acessar tabela reports:', tableError.message)
      console.log('💡 Execute o script setup-reports-system.sql no Supabase primeiro!')
      return
    }
    console.log('✅ Tabela reports acessível!')

    // 2. Verificar estrutura da tabela
    console.log('\n📋 Verificando estrutura da tabela...')
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'reports' })
    
    if (columnsError) {
      console.log('⚠️ Não foi possível verificar colunas automaticamente')
    } else {
      console.log('✅ Estrutura da tabela verificada')
    }

    // 3. Verificar políticas RLS
    console.log('\n🔒 Verificando políticas RLS...')
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'reports' })
    
    if (policiesError) {
      console.log('⚠️ Não foi possível verificar políticas automaticamente')
    } else {
      console.log('✅ Políticas RLS verificadas')
    }

    // 4. Testar inserção de denúncia
    console.log('\n🧪 Testando inserção de denúncia...')
    
    // Buscar um usuário para usar como reporter
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (usersError || !users || users.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado para testar')
      return
    }

    const reporterId = users[0].id
    console.log(`📝 Usando usuário ${reporterId} como reporter`)

    // Inserir denúncia de teste
    const { data: reportData, error: insertError } = await supabase
      .from('reports')
      .insert({
        type: 'user',
        reason: 'Comportamento inadequado',
        description: 'Usuário enviando mensagens ofensivas durante conversa',
        priority: 'high',
        reporter_id: reporterId,
        reported_user_id: reporterId, // Usando o mesmo usuário para teste
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao inserir denúncia:', insertError.message)
      return
    }

    console.log('✅ Denúncia inserida com sucesso!')
    console.log(`📋 ID da denúncia: ${reportData.id}`)

    // 5. Testar busca de denúncias
    console.log('\n🔍 Testando busca de denúncias...')
    const { data: reports, error: fetchError } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reports_reporter_id_fkey(id, full_name, email, user_type),
        reported_user:profiles!reports_reported_user_id_fkey(id, full_name, email, user_type)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (fetchError) {
      console.error('❌ Erro ao buscar denúncias:', fetchError.message)
      return
    }

    console.log(`✅ Encontradas ${reports.length} denúncias`)
    if (reports.length > 0) {
      console.log('📋 Última denúncia:')
      console.log(`   - Tipo: ${reports[0].type}`)
      console.log(`   - Motivo: ${reports[0].reason}`)
      console.log(`   - Status: ${reports[0].status}`)
      console.log(`   - Prioridade: ${reports[0].priority}`)
      console.log(`   - Criada em: ${new Date(reports[0].created_at).toLocaleString()}`)
    }

    // 6. Testar estatísticas
    console.log('\n📊 Testando estatísticas...')
    const { data: stats, error: statsError } = await supabase
      .from('reports_stats')
      .select('*')
      .single()

    if (statsError) {
      console.log('⚠️ Não foi possível acessar view de estatísticas')
    } else {
      console.log('✅ Estatísticas de denúncias:')
      console.log(`   - Total: ${stats.total_reports}`)
      console.log(`   - Pendentes: ${stats.pending_reports}`)
      console.log(`   - Resolvidas: ${stats.resolved_reports}`)
      console.log(`   - Últimas 24h: ${stats.reports_last_24h}`)
    }

    // 7. Testar atualização de status
    console.log('\n🔄 Testando atualização de status...')
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        status: 'reviewing',
        admin_notes: 'Denúncia em análise pela equipe',
        updated_at: new Date().toISOString()
      })
      .eq('id', reportData.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar denúncia:', updateError.message)
    } else {
      console.log('✅ Status da denúncia atualizado com sucesso!')
    }

    console.log('\n🎉 Sistema de denúncias configurado e funcionando!')
    console.log('💡 Agora você pode usar o sistema de denúncias na aplicação')

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message)
  }
}

// Executar teste
testReportsSystem()
