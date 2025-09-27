const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Carregar variáveis de ambiente
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = {}
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        envVars[key.trim()] = value
      }
    })
    Object.assign(process.env, envVars)
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createPostViewsTable() {
  console.log('🔧 Criando tabela post_views...')
  
  try {
    // SQL para criar a tabela
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS post_views (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
      CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
      CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_post_views_unique ON post_views(post_id, user_id);
    `
    
    const enableRLSSQL = `
      ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;
    `
    
    const createPoliciesSQL = `
      CREATE POLICY "Users can view their own post views" ON post_views
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert their own post views" ON post_views
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can view post view counts" ON post_views
        FOR SELECT USING (true);
    `
    
    // Executar SQLs
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    if (tableError) {
      console.error('❌ Erro ao criar tabela:', tableError)
      return
    }
    
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexesSQL })
    if (indexError) {
      console.error('❌ Erro ao criar índices:', indexError)
      return
    }
    
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLSSQL })
    if (rlsError) {
      console.error('❌ Erro ao habilitar RLS:', rlsError)
      return
    }
    
    const { error: policyError } = await supabase.rpc('exec_sql', { sql: createPoliciesSQL })
    if (policyError) {
      console.error('❌ Erro ao criar políticas:', policyError)
      return
    }
    
    console.log('✅ Tabela post_views criada com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createPostViewsTable()
