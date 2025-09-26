const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupFeedBucket() {
  try {
    console.log('🚀 Configurando bucket para imagens do feed...')

    // Verificar se o bucket já existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError)
      return
    }

    const feedBucket = buckets?.find(bucket => bucket.name === 'feed-images')
    
    if (feedBucket) {
      console.log('✅ Bucket "feed-images" já existe')
      return
    }

    // Criar o bucket
    const { data, error } = await supabase.storage.createBucket('feed-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    })

    if (error) {
      console.error('❌ Erro ao criar bucket:', error)
      return
    }

    console.log('✅ Bucket "feed-images" criado com sucesso!')
    console.log('📁 Configurações:')
    console.log('   - Público: Sim')
    console.log('   - Tipos permitidos: JPEG, PNG, WebP')
    console.log('   - Tamanho máximo: 5MB')

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupFeedBucket()
}

module.exports = { setupFeedBucket }
