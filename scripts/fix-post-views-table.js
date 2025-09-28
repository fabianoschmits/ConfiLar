const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixPostViewsTable() {
  console.log('🔧 Corrigindo tabela post_views...\n')

  try {
    // Tentar criar a tabela se não existir
    console.log('📝 Criando/verificando tabela post_views...')
    
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
      `
    })

    if (createError) {
      console.error('❌ Erro ao criar tabela:', createError)
      return
    }

    console.log('✅ Tabela post_views criada/verificada')

    // Criar índices
    console.log('📝 Criando índices...')
    
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
        CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
        CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);
      `
    })

    if (indexError) {
      console.error('❌ Erro ao criar índices:', indexError)
    } else {
      console.log('✅ Índices criados')
    }

    // Configurar RLS
    console.log('📝 Configurando RLS...')
    
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view their own post views" ON post_views;
        DROP POLICY IF EXISTS "Users can insert their own post views" ON post_views;
        DROP POLICY IF EXISTS "Users can delete their own post views" ON post_views;
        
        CREATE POLICY "Users can view their own post views" ON post_views
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own post views" ON post_views
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own post views" ON post_views
          FOR DELETE USING (auth.uid() = user_id);
      `
    })

    if (rlsError) {
      console.error('❌ Erro ao configurar RLS:', rlsError)
    } else {
      console.log('✅ RLS configurado')
    }

    // Testar inserção
    console.log('🧪 Testando inserção...')
    
    const { data: testData, error: testError } = await supabase
      .from('post_views')
      .select('*')
      .limit(1)

    if (testError) {
      console.error('❌ Erro ao testar tabela:', testError)
    } else {
      console.log('✅ Tabela funcionando corretamente')
    }

    console.log('\n🎉 Tabela post_views configurada com sucesso!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

fixPostViewsTable()
