const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupPostViews() {
  console.log('🔧 Configurando sistema de visualizações...\n')

  try {
    // SQL para criar a tabela
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS post_views (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      );
    `

    console.log('📝 Criando tabela post_views...')
    
    // Usar a função SQL direta
    const { data: createData, error: createError } = await supabase
      .rpc('sql', { query: createTableSQL })

    if (createError) {
      console.error('❌ Erro ao criar tabela:', createError)
      
      // Tentar método alternativo
      console.log('🔄 Tentando método alternativo...')
      
      const { data: altData, error: altError } = await supabase
        .from('post_views')
        .select('id')
        .limit(1)
      
      if (altError && altError.code === 'PGRST116') {
        console.log('💡 Tabela não existe. Execute manualmente no Supabase Dashboard:')
        console.log('\n📋 SQL para executar:')
        console.log(createTableSQL)
        console.log('\n📋 Índices:')
        console.log(`
          CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
          CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
          CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);
        `)
        console.log('\n📋 RLS:')
        console.log(`
          ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Users can view their own post views" ON post_views
            FOR SELECT USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can insert their own post views" ON post_views
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Users can delete their own post views" ON post_views
            FOR DELETE USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can view post view counts" ON post_views
            FOR SELECT USING (true);
        `)
        return
      }
    } else {
      console.log('✅ Tabela criada com sucesso!')
    }

    // Testar se a tabela foi criada
    console.log('🧪 Testando acesso à tabela...')
    
    const { data: testData, error: testError } = await supabase
      .from('post_views')
      .select('*')
      .limit(1)

    if (testError) {
      console.error('❌ Erro ao acessar tabela:', testError)
    } else {
      console.log('✅ Tabela acessível!')
      console.log(`📊 Total de registros: ${testData.length}`)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

setupPostViews()
