const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFavoriteFlow() {
  console.log('🧪 Testando fluxo de favoritos...\n');
  
  try {
    // 1. Verificar usuários disponíveis
    console.log('1️⃣ Verificando usuários disponíveis...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, user_type')
      .limit(5);

    if (usersError) {
      console.log('❌ Erro ao buscar usuários:', usersError.message);
      return;
    }

    console.log(`📊 Usuários encontrados: ${users?.length || 0}`);
    if (users && users.length > 0) {
      console.log('📋 Usuários disponíveis:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.full_name} (${user.user_type}) - ID: ${user.id}`);
      });
    }

    // 2. Verificar favoritos existentes
    console.log('\n2️⃣ Verificando favoritos existentes...');
    const { data: existingFavorites, error: favoritesError } = await supabase
      .from('favorites')
      .select('*')
      .limit(5);

    if (favoritesError) {
      console.log('❌ Erro ao buscar favoritos:', favoritesError.message);
    } else {
      console.log(`📊 Favoritos existentes: ${existingFavorites?.length || 0}`);
    }

    // 3. Verificar posts de favoritos no feed
    console.log('\n3️⃣ Verificando posts de favoritos no feed...');
    const { data: favoritePosts, error: favoritePostsError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at, metadata')
      .eq('metadata->>type', 'favorite')
      .order('created_at', { ascending: false })
      .limit(5);

    if (favoritePostsError) {
      console.log('❌ Erro ao buscar posts de favoritos:', favoritePostsError.message);
    } else {
      console.log(`📊 Posts de favoritos no feed: ${favoritePosts?.length || 0}`);
      if (favoritePosts && favoritePosts.length > 0) {
        console.log('📋 Posts de favoritos:');
        favoritePosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title} (${post.created_at})`);
        });
      }
    }

    // 4. Verificar estrutura da tabela favorites
    console.log('\n4️⃣ Verificando estrutura da tabela favorites...');
    const { data: favoritesStructure, error: structureError } = await supabase
      .from('favorites')
      .select('*')
      .limit(1);

    if (structureError) {
      console.log('❌ Erro ao verificar estrutura da tabela favorites:', structureError.message);
    } else {
      console.log('✅ Tabela favorites acessível');
    }

    // 5. Verificar se o sistema de notificações está funcionando
    console.log('\n5️⃣ Verificando sistema de notificações...');
    const { data: notificationPosts, error: notificationError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at, metadata, tags')
      .or('metadata->>type.eq.favorite,metadata->>type.eq.welcome,metadata->>type.eq.review,metadata->>type.eq.recommendation')
      .order('created_at', { ascending: false })
      .limit(10);

    if (notificationError) {
      console.log('❌ Erro ao buscar posts de notificações:', notificationError.message);
    } else {
      console.log(`📊 Posts de notificações: ${notificationPosts?.length || 0}`);
      if (notificationPosts && notificationPosts.length > 0) {
        console.log('📋 Posts de notificações:');
        notificationPosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title} (${post.metadata?.type || 'N/A'})`);
        });
      }
    }

    // 6. Simular adição de favorito (sem autenticação)
    console.log('\n6️⃣ Simulando adição de favorito...');
    if (users && users.length >= 2) {
      const user1 = users[0];
      const user2 = users[1];
      
      console.log(`📝 Simulando: ${user1.full_name} adiciona ${user2.full_name} aos favoritos`);
      
      // Verificar se já existe
      const { data: existing, error: checkError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user1.id)
        .eq('professional_id', user2.id)
        .maybeSingle();

      if (checkError) {
        console.log('❌ Erro ao verificar favorito existente:', checkError.message);
      } else if (existing) {
        console.log('ℹ️ Favorito já existe');
      } else {
        console.log('ℹ️ Favorito não existe, seria criado em ambiente autenticado');
      }
    }

    // 7. Resumo do fluxo
    console.log('\n📊 RESUMO DO FLUXO:');
    console.log(`✅ Usuários disponíveis: ${users?.length || 0}`);
    console.log(`✅ Favoritos existentes: ${existingFavorites?.length || 0}`);
    console.log(`✅ Posts de favoritos: ${favoritePosts?.length || 0}`);
    console.log(`✅ Posts de notificações: ${notificationPosts?.length || 0}`);
    console.log(`✅ Sistema de notificações: ${notificationPosts && notificationPosts.length > 0 ? 'ATIVO' : 'INATIVO'}`);

    console.log('\n🎯 STATUS DO SISTEMA:');
    if (favoritePosts && favoritePosts.length > 0) {
      console.log('✅ Sistema de favoritos: FUNCIONANDO (posts sendo criados)');
    } else {
      console.log('⚠️ Sistema de favoritos: NÃO TESTADO (nenhum post de favorito encontrado)');
    }

    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Acesse o feed social no navegador');
    console.log('2. Adicione alguém aos favoritos');
    console.log('3. Verifique se aparece um post no feed');
    console.log('4. Execute este script novamente para verificar');

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testFavoriteFlow().catch(console.error);
