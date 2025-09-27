const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeletePosts() {
  console.log('🧪 Testando funcionalidade de deletar posts...\n');
  
  try {
    // 1. Verificar posts existentes
    console.log('1️⃣ Verificando posts existentes...');
    const { data: existingPosts, error: existingError } = await supabase
      .from('feed_posts')
      .select('id, title, user_id, created_at, metadata')
      .order('created_at', { ascending: false })
      .limit(10);

    if (existingError) {
      console.log('❌ Erro ao buscar posts existentes:', existingError.message);
      return;
    }

    console.log(`📊 Posts encontrados: ${existingPosts?.length || 0}`);
    if (existingPosts && existingPosts.length > 0) {
      console.log('📋 Posts disponíveis:');
      existingPosts.forEach((post, index) => {
        console.log(`${index + 1}. ID: ${post.id}`);
        console.log(`   Título: ${post.title}`);
        console.log(`   User ID: ${post.user_id}`);
        console.log(`   Criado: ${post.created_at}`);
        console.log(`   Tipo: ${post.metadata?.type || 'N/A'}`);
        console.log('');
      });
    }

    // 2. Verificar estrutura da tabela feed_posts
    console.log('2️⃣ Verificando estrutura da tabela feed_posts...');
    const { data: structureData, error: structureError } = await supabase
      .from('feed_posts')
      .select('*')
      .limit(1);

    if (structureError) {
      console.log('❌ Erro ao verificar estrutura:', structureError.message);
    } else {
      console.log('✅ Tabela feed_posts acessível');
      if (structureData && structureData.length > 0) {
        console.log('📋 Colunas disponíveis:', Object.keys(structureData[0]));
      }
    }

    // 3. Testar permissões de delete (sem autenticação)
    console.log('\n3️⃣ Testando permissões de delete...');
    if (existingPosts && existingPosts.length > 0) {
      const testPost = existingPosts[0];
      console.log(`📝 Testando delete do post: ${testPost.id}`);
      
      const { error: deleteError } = await supabase
        .from('feed_posts')
        .delete()
        .eq('id', testPost.id);

      if (deleteError) {
        console.log('❌ Erro ao deletar post:', deleteError.message);
        console.log('📋 Detalhes do erro:', deleteError);
        
        if (deleteError.message.includes('RLS')) {
          console.log('💡 SOLUÇÃO: Erro de RLS (Row Level Security) - usuário precisa estar autenticado');
        }
      } else {
        console.log('✅ Post deletado com sucesso (sem autenticação)');
      }
    }

    // 4. Verificar posts de favoritos especificamente
    console.log('\n4️⃣ Verificando posts de favoritos...');
    const { data: favoritePosts, error: favoriteError } = await supabase
      .from('feed_posts')
      .select('id, title, user_id, created_at, metadata')
      .eq('metadata->>type', 'favorite')
      .order('created_at', { ascending: false })
      .limit(5);

    if (favoriteError) {
      console.log('❌ Erro ao buscar posts de favoritos:', favoriteError.message);
    } else {
      console.log(`📊 Posts de favoritos: ${favoritePosts?.length || 0}`);
      if (favoritePosts && favoritePosts.length > 0) {
        console.log('📋 Posts de favoritos:');
        favoritePosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title} (${post.user_id})`);
        });
      }
    }

    // 5. Verificar se há posts que podem ser deletados
    console.log('\n5️⃣ Verificando posts que podem ser deletados...');
    const { data: deletablePosts, error: deletableError } = await supabase
      .from('feed_posts')
      .select('id, title, user_id, created_at, metadata')
      .not('metadata->>type', 'eq', 'system')
      .order('created_at', { ascending: false })
      .limit(5);

    if (deletableError) {
      console.log('❌ Erro ao buscar posts deletáveis:', deletableError.message);
    } else {
      console.log(`📊 Posts que podem ser deletados: ${deletablePosts?.length || 0}`);
      if (deletablePosts && deletablePosts.length > 0) {
        console.log('📋 Posts deletáveis:');
        deletablePosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title} (${post.user_id})`);
        });
      }
    }

    // 6. Resumo
    console.log('\n📊 RESUMO:');
    console.log(`✅ Posts existentes: ${existingPosts?.length || 0}`);
    console.log(`✅ Posts de favoritos: ${favoritePosts?.length || 0}`);
    console.log(`✅ Posts deletáveis: ${deletablePosts?.length || 0}`);

    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('1. Verificar se o usuário está autenticado ao tentar deletar');
    console.log('2. Verificar se o usuário é o dono do post');
    console.log('3. Verificar se o post pode ser deletado (não é do sistema)');
    console.log('4. Implementar confirmação antes de deletar');

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testDeletePosts().catch(console.error);
