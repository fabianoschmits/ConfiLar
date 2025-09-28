const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkPostViewsTable() {
  console.log('🔍 Verificando estrutura da tabela post_views...\n')

  try {
    // Verificar se a tabela existe
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'post_views')

    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError)
      return
    }

    if (tables.length === 0) {
      console.log('❌ Tabela post_views não existe!')
      console.log('📝 Criando tabela post_views...')
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS post_views (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(post_id, user_id)
          );
          
          CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
          CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
          CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);
        `
      })

      if (createError) {
        console.error('❌ Erro ao criar tabela:', createError)
        return
      }

      console.log('✅ Tabela post_views criada com sucesso!')
    } else {
      console.log('✅ Tabela post_views existe')
    }

    // Verificar estrutura da tabela
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'post_views')
      .order('ordinal_position')

    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError)
      return
    }

    console.log('\n📊 Estrutura da tabela post_views:')
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`)
    })

    // Verificar RLS
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, permissive, roles, cmd, qual')
      .eq('tablename', 'post_views')

    if (policiesError) {
      console.log('⚠️  Não foi possível verificar políticas RLS')
    } else {
      console.log('\n🔒 Políticas RLS:')
      if (policies.length === 0) {
        console.log('  ⚠️  Nenhuma política RLS encontrada')
        console.log('📝 Criando políticas RLS...')
        
        const { error: rlsError } = await supabase.rpc('exec_sql', {
          sql: `
            ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view their own post views" ON post_views
              FOR SELECT USING (auth.uid() = user_id);
            
            CREATE POLICY "Users can insert their own post views" ON post_views
              FOR INSERT WITH CHECK (auth.uid() = user_id);
            
            CREATE POLICY "Users can delete their own post views" ON post_views
              FOR DELETE USING (auth.uid() = user_id);
          `
        })

        if (rlsError) {
          console.error('❌ Erro ao criar políticas RLS:', rlsError)
        } else {
          console.log('✅ Políticas RLS criadas com sucesso!')
        }
      } else {
        policies.forEach(policy => {
          console.log(`  - ${policy.policyname}: ${policy.cmd} para ${policy.roles}`)
        })
      }
    }

    // Verificar dados existentes
    const { data: viewsData, error: viewsError } = await supabase
      .from('post_views')
      .select('*', { count: 'exact' })
      .limit(5)

    if (viewsError) {
      console.error('❌ Erro ao verificar dados:', viewsError)
      return
    }

    console.log(`\n📈 Dados existentes: ${viewsData.length} visualizações`)
    if (viewsData.length > 0) {
      console.log('📋 Últimas visualizações:')
      viewsData.forEach(view => {
        console.log(`  - Post: ${view.post_id}, User: ${view.user_id}, Data: ${view.viewed_at}`)
      })
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkPostViewsTable()
