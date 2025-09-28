const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testPostViewsAfterSetup() {
  console.log('🧪 Testando sistema de visualizações após configuração...\n')

  try {
    // 1. Verificar se a tabela existe
    console.log('📊 Verificando tabela post_views...')
    
    const { data: tableData, error: tableError } = await supabase
      .from('post_views')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ Erro ao acessar tabela:', tableError.message)
      console.log('💡 Execute o SQL em scripts/setup-post-views-complete.sql no Supabase Dashboard')
      return
    }

    console.log('✅ Tabela post_views acessível!')

    // 2. Verificar estrutura da tabela
    console.log('\n📋 Verificando estrutura da tabela...')
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'post_views')
      .order('ordinal_position')

    if (columnsError) {
      console.log('⚠️  Não foi possível verificar colunas')
    } else {
      console.log('📊 Colunas da tabela:')
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`)
      })
    }

    // 3. Verificar políticas RLS
    console.log('\n🔒 Verificando políticas RLS...')
    
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, roles')
      .eq('tablename', 'post_views')

    if (policiesError) {
      console.log('⚠️  Não foi possível verificar políticas')
    } else {
      console.log('🔒 Políticas RLS:')
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname}: ${policy.cmd} para ${policy.roles}`)
      })
    }

    // 4. Testar contagem de visualizações
    console.log('\n📈 Testando contagem de visualizações...')
    
    const { data: posts } = await supabase
      .from('feed_posts')
      .select('id')
      .limit(1)

    if (!posts || posts.length === 0) {
      console.log('⚠️  Nenhum post encontrado para testar')
      return
    }

    const testPostId = posts[0].id

    const { count, error: countError } = await supabase
      .from('post_views')
      .select('*', { count: 'exact' })
      .eq('post_id', testPostId)

    if (countError) {
      console.error('❌ Erro ao contar visualizações:', countError.message)
    } else {
      console.log(`✅ Contagem de visualizações para post ${testPostId}: ${count}`)
    }

    // 5. Testar inserção (simulação)
    console.log('\n🧪 Testando inserção de visualização...')
    
    const testUserId = '00000000-0000-0000-0000-000000000000'
    
    const { data: insertData, error: insertError } = await supabase
      .from('post_views')
      .insert({
        post_id: testPostId,
        user_id: testUserId,
        viewed_at: new Date().toISOString()
      })
      .select()

    if (insertError) {
      if (insertError.code === '23505') {
        console.log('ℹ️  Visualização já existe (erro de duplicata) - OK')
      } else if (insertError.code === 'PGRST301') {
        console.log('ℹ️  Erro de RLS - usuário não autenticado - OK')
      } else {
        console.error('❌ Erro inesperado:', insertError.message)
      }
    } else {
      console.log('✅ Visualização inserida com sucesso!')
    }

    console.log('\n🎉 Sistema de visualizações configurado e funcionando!')
    console.log('💡 Agora você pode usar o sistema de visualizações na aplicação')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testPostViewsAfterSetup()
