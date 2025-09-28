const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testReportsSystem() {
  console.log('🧪 Testando sistema de denúncias (versão simples)...\n')

  try {
    // 1. Verificar se a tabela existe
    console.log('📊 Verificando tabela reports...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('reports')
      .select('id')
      .limit(1)

    if (tableError) {
      console.error('❌ Erro ao acessar tabela reports:', tableError.message)
      console.log('💡 Execute o script setup-reports-system-fixed.sql no Supabase primeiro!')
      return
    }
    console.log('✅ Tabela reports acessível!')

    // 2. Verificar estrutura da tabela
    console.log('\n📋 Verificando estrutura da tabela...')
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'reports' })
    
    if (columnsError) {
      console.log('⚠️ Não foi possível verificar colunas automaticamente')
      console.log('💡 Verifique manualmente se a tabela tem as colunas: id, type, reason, description, status, priority, reporter_id, created_at, updated_at')
    } else {
      console.log('✅ Estrutura da tabela verificada')
      console.log('📋 Colunas encontradas:', columns)
    }

    // 3. Testar inserção de denúncia (sem dados reais)
    console.log('\n🧪 Testando estrutura da tabela...')
    
    // Verificar se existem usuários
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (usersError || !users || users.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado para testar inserção')
      console.log('💡 Crie um usuário primeiro ou execute o script SQL sem os dados de exemplo')
      return
    }

    const reporterId = users[0].id
    console.log(`📝 Usando usuário ${reporterId} para teste`)

    // Testar inserção (sem commit)
    console.log('🧪 Testando inserção de denúncia...')
    const { data: reportData, error: insertError } = await supabase
      .from('reports')
      .insert({
        type: 'user',
        reason: 'Teste de sistema',
        description: 'Esta é uma denúncia de teste para verificar o sistema',
        priority: 'low',
        reporter_id: reporterId,
        reported_user_id: reporterId, // Usando o mesmo usuário para teste
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao inserir denúncia:', insertError.message)
      console.log('💡 Verifique se todas as colunas existem e se as políticas RLS estão corretas')
      return
    }

    console.log('✅ Denúncia inserida com sucesso!')
    console.log(`📋 ID da denúncia: ${reportData.id}`)

    // Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...')
    const { error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportData.id)

    if (deleteError) {
      console.log('⚠️ Não foi possível limpar dados de teste:', deleteError.message)
    } else {
      console.log('✅ Dados de teste removidos')
    }

    // 4. Testar busca de denúncias
    console.log('\n🔍 Testando busca de denúncias...')
    const { data: reports, error: fetchError } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (fetchError) {
      console.error('❌ Erro ao buscar denúncias:', fetchError.message)
      return
    }

    console.log(`✅ Encontradas ${reports.length} denúncias`)
    if (reports.length > 0) {
      console.log('📋 Última denúncia:')
      console.log(`   - ID: ${reports[0].id}`)
      console.log(`   - Tipo: ${reports[0].type}`)
      console.log(`   - Motivo: ${reports[0].reason}`)
      console.log(`   - Status: ${reports[0].status}`)
      console.log(`   - Prioridade: ${reports[0].priority}`)
      console.log(`   - Criada em: ${new Date(reports[0].created_at).toLocaleString()}`)
    }

    // 5. Testar view de estatísticas
    console.log('\n📊 Testando view de estatísticas...')
    const { data: stats, error: statsError } = await supabase
      .from('reports_stats')
      .select('*')
      .single()

    if (statsError) {
      console.log('⚠️ Não foi possível acessar view de estatísticas:', statsError.message)
    } else {
      console.log('✅ View de estatísticas funcionando:')
      console.log(`   - Total: ${stats.total_reports}`)
      console.log(`   - Pendentes: ${stats.pending_reports}`)
      console.log(`   - Resolvidas: ${stats.resolved_reports}`)
      console.log(`   - Últimas 24h: ${stats.reports_last_24h}`)
    }

    console.log('\n🎉 Sistema de denúncias configurado e funcionando!')
    console.log('💡 Agora você pode usar o sistema de denúncias na aplicação')

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message)
  }
}

// Executar teste
testReportsSystem()
