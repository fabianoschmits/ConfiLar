const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDeleteUI() {
  console.log('🔍 Verificando interface de deletar posts...\n');
  
  try {
    // 1. Verificar posts atuais
    console.log('1️⃣ Verificando posts atuais...');
    const { data: currentPosts, error: currentError } = await supabase
      .from('feed_posts')
      .select('id, title, user_id, created_at, metadata')
      .order('created_at', { ascending: false })
      .limit(10);

    if (currentError) {
      console.log('❌ Erro ao buscar posts atuais:', currentError.message);
      return;
    }

    console.log(`📊 Posts atuais: ${currentPosts?.length || 0}`);
    if (currentPosts && currentPosts.length > 0) {
      console.log('📋 Posts disponíveis:');
      currentPosts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   ID: ${post.id}`);
        console.log(`   User ID: ${post.user_id}`);
        console.log(`   Tipo: ${post.metadata?.type || 'N/A'}`);
        console.log(`   Criado: ${post.created_at}`);
        console.log('');
      });
    }

    // 2. Verificar se há posts com user_id null
    console.log('2️⃣ Verificando posts com user_id null...');
    const nullUserPosts = currentPosts?.filter(post => !post.user_id) || [];
    console.log(`📊 Posts com user_id null: ${nullUserPosts.length}`);
    
    if (nullUserPosts.length > 0) {
      console.log('📋 Posts sem usuário:');
      nullUserPosts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title} (ID: ${post.id})`);
      });
    }

    // 3. Verificar posts de favoritos
    console.log('\n3️⃣ Verificando posts de favoritos...');
    const favoritePosts = currentPosts?.filter(post => post.metadata?.type === 'favorite') || [];
    console.log(`📊 Posts de favoritos: ${favoritePosts.length}`);
    
    if (favoritePosts.length > 0) {
      console.log('📋 Posts de favoritos:');
      favoritePosts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   User ID: ${post.user_id}`);
        console.log(`   Pode ser deletado: ${post.user_id ? 'SIM' : 'NÃO'}`);
        console.log('');
      });
    }

    // 4. Verificar posts normais
    console.log('\n4️⃣ Verificando posts normais...');
    const normalPosts = currentPosts?.filter(post => !post.metadata?.type) || [];
    console.log(`📊 Posts normais: ${normalPosts.length}`);
    
    if (normalPosts.length > 0) {
      console.log('📋 Posts normais:');
      normalPosts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   User ID: ${post.user_id}`);
        console.log(`   Pode ser deletado: ${post.user_id ? 'SIM' : 'NÃO'}`);
        console.log('');
      });
    }

    // 5. Testar delete com diferentes cenários
    console.log('\n5️⃣ Testando delete com diferentes cenários...');
    
    // Testar delete de post com user_id
    const postWithUser = currentPosts?.find(post => post.user_id) || null;
    if (postWithUser) {
      console.log(`📝 Testando delete de post com user_id: ${postWithUser.title}`);
      const { error: deleteWithUserError } = await supabase
        .from('feed_posts')
        .delete()
        .eq('id', postWithUser.id);

      if (deleteWithUserError) {
        console.log('❌ Erro ao deletar post com user_id:', deleteWithUserError.message);
      } else {
        console.log('✅ Post com user_id deletado com sucesso!');
      }
    }

    // Testar delete de post sem user_id
    const postWithoutUser = currentPosts?.find(post => !post.user_id) || null;
    if (postWithoutUser) {
      console.log(`📝 Testando delete de post sem user_id: ${postWithoutUser.title}`);
      const { error: deleteWithoutUserError } = await supabase
        .from('feed_posts')
        .delete()
        .eq('id', postWithoutUser.id);

      if (deleteWithoutUserError) {
        console.log('❌ Erro ao deletar post sem user_id:', deleteWithoutUserError.message);
      } else {
        console.log('✅ Post sem user_id deletado com sucesso!');
      }
    }

    // 6. Verificar posts restantes
    console.log('\n6️⃣ Verificando posts restantes...');
    const { data: remainingPosts, error: remainingError } = await supabase
      .from('feed_posts')
      .select('id, title, user_id, created_at, metadata')
      .order('created_at', { ascending: false })
      .limit(10);

    if (remainingError) {
      console.log('❌ Erro ao buscar posts restantes:', remainingError.message);
    } else {
      console.log(`📊 Posts restantes: ${remainingPosts?.length || 0}`);
    }

    // 7. Resumo
    console.log('\n📊 RESUMO:');
    console.log(`✅ Posts iniciais: ${currentPosts?.length || 0}`);
    console.log(`✅ Posts restantes: ${remainingPosts?.length || 0}`);
    console.log(`✅ Posts deletados: ${(currentPosts?.length || 0) - (remainingPosts?.length || 0)}`);

    console.log('\n💡 DIAGNÓSTICO:');
    if ((currentPosts?.length || 0) === (remainingPosts?.length || 0)) {
      console.log('⚠️ PROBLEMA: Posts não estão sendo deletados');
      console.log('🔍 Possíveis causas:');
      console.log('1. RLS (Row Level Security) bloqueando delete');
      console.log('2. Permissões insuficientes');
      console.log('3. Posts estão sendo recriados automaticamente');
      console.log('4. Problema na interface do usuário');
    } else {
      console.log('✅ Posts estão sendo deletados corretamente');
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkDeleteUI().catch(console.error);
