const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDeleteInterface() {
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
        console.log('');
      });
    }

    // 2. Verificar se há posts de favoritos
    console.log('2️⃣ Verificando posts de favoritos...');
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

    // 3. Verificar se há posts normais
    console.log('3️⃣ Verificando posts normais...');
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

    // 4. Testar delete de posts de favoritos
    console.log('4️⃣ Testando delete de posts de favoritos...');
    if (favoritePosts.length > 0) {
      const testPost = favoritePosts[0];
      console.log(`📝 Testando delete do post: ${testPost.title}`);
      
      const { error: deleteError } = await supabase
        .from('feed_posts')
        .delete()
        .eq('id', testPost.id);

      if (deleteError) {
        console.log('❌ Erro ao deletar post de favorito:', deleteError.message);
        console.log('📋 Detalhes do erro:', deleteError);
      } else {
        console.log('✅ Post de favorito deletado com sucesso!');
        
        // Verificar se foi realmente deletado
        const { data: checkPost, error: checkError } = await supabase
          .from('feed_posts')
          .select('id')
          .eq('id', testPost.id)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          console.log('✅ Post confirmado como deletado (não encontrado)');
        } else if (checkPost) {
          console.log('⚠️ Post ainda existe após delete');
        }
      }
    }

    // 5. Testar delete de posts normais
    console.log('\n5️⃣ Testando delete de posts normais...');
    if (normalPosts.length > 0) {
      const testPost = normalPosts[0];
      console.log(`📝 Testando delete do post: ${testPost.title}`);
      
      const { error: deleteError } = await supabase
        .from('feed_posts')
        .delete()
        .eq('id', testPost.id);

      if (deleteError) {
        console.log('❌ Erro ao deletar post normal:', deleteError.message);
        console.log('📋 Detalhes do erro:', deleteError);
      } else {
        console.log('✅ Post normal deletado com sucesso!');
        
        // Verificar se foi realmente deletado
        const { data: checkPost, error: checkError } = await supabase
          .from('feed_posts')
          .select('id')
          .eq('id', testPost.id)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          console.log('✅ Post confirmado como deletado (não encontrado)');
        } else if (checkPost) {
          console.log('⚠️ Post ainda existe após delete');
        }
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
      if (remainingPosts && remainingPosts.length > 0) {
        console.log('📋 Posts restantes:');
        remainingPosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title}`);
        });
      }
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
      
      console.log('\n💡 SOLUÇÕES:');
      console.log('1. Verificar se o usuário está autenticado');
      console.log('2. Verificar se o usuário é o dono do post');
      console.log('3. Verificar se há RLS configurado');
      console.log('4. Verificar se há triggers que recriam posts');
    } else {
      console.log('✅ Posts estão sendo deletados corretamente');
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkDeleteInterface().catch(console.error);
