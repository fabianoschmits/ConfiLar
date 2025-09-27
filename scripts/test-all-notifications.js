const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAllNotifications() {
  console.log('🧪 Testando todos os tipos de notificações...\n');
  
  try {
    // 1. Verificar posts de recomendações (que está funcionando)
    console.log('1️⃣ Verificando posts de recomendações...');
    const { data: recommendationPosts, error: recError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at, metadata')
      .eq('metadata->>type', 'recommendation')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recError) {
      console.log('❌ Erro ao buscar posts de recomendações:', recError.message);
    } else {
      console.log(`📊 Posts de recomendações: ${recommendationPosts?.length || 0}`);
      if (recommendationPosts && recommendationPosts.length > 0) {
        console.log('📋 Posts de recomendações:');
        recommendationPosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title} (${post.created_at})`);
        });
      }
    }

    // 2. Verificar posts de favoritos
    console.log('\n2️⃣ Verificando posts de favoritos...');
    const { data: favoritePosts, error: favError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at, metadata')
      .eq('metadata->>type', 'favorite')
      .order('created_at', { ascending: false })
      .limit(5);

    if (favError) {
      console.log('❌ Erro ao buscar posts de favoritos:', favError.message);
    } else {
      console.log(`📊 Posts de favoritos: ${favoritePosts?.length || 0}`);
      if (favoritePosts && favoritePosts.length > 0) {
        console.log('📋 Posts de favoritos:');
        favoritePosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title} (${post.created_at})`);
        });
      }
    }

    // 3. Verificar posts de avaliações
    console.log('\n3️⃣ Verificando posts de avaliações...');
    const { data: reviewPosts, error: reviewError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at, metadata')
      .eq('metadata->>type', 'review')
      .order('created_at', { ascending: false })
      .limit(5);

    if (reviewError) {
      console.log('❌ Erro ao buscar posts de avaliações:', reviewError.message);
    } else {
      console.log(`📊 Posts de avaliações: ${reviewPosts?.length || 0}`);
      if (reviewPosts && reviewPosts.length > 0) {
        console.log('📋 Posts de avaliações:');
        reviewPosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title} (${post.created_at})`);
        });
      }
    }

    // 4. Verificar posts de boas-vindas
    console.log('\n4️⃣ Verificando posts de boas-vindas...');
    const { data: welcomePosts, error: welcomeError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at, metadata')
      .eq('metadata->>type', 'welcome')
      .order('created_at', { ascending: false })
      .limit(5);

    if (welcomeError) {
      console.log('❌ Erro ao buscar posts de boas-vindas:', welcomeError.message);
    } else {
      console.log(`📊 Posts de boas-vindas: ${welcomePosts?.length || 0}`);
      if (welcomePosts && welcomePosts.length > 0) {
        console.log('📋 Posts de boas-vindas:');
        welcomePosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title} (${post.created_at})`);
        });
      }
    }

    // 5. Verificar dados nas tabelas relacionadas
    console.log('\n5️⃣ Verificando dados nas tabelas relacionadas...');
    
    // Verificar tabela favorites
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('favorites')
      .select('id, user_id, professional_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (favoritesError) {
      console.log('❌ Erro ao buscar favoritos:', favoritesError.message);
    } else {
      console.log(`📊 Favoritos na tabela: ${favoritesData?.length || 0}`);
      if (favoritesData && favoritesData.length > 0) {
        console.log('📋 Favoritos recentes:');
        favoritesData.forEach((fav, index) => {
          console.log(`${index + 1}. User: ${fav.user_id} → Professional: ${fav.professional_id} (${fav.created_at})`);
        });
      }
    }

    // Verificar tabela reviews
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, reviewer_id, reviewed_id, rating_person, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (reviewsError) {
      console.log('❌ Erro ao buscar avaliações:', reviewsError.message);
    } else {
      console.log(`📊 Avaliações na tabela: ${reviewsData?.length || 0}`);
      if (reviewsData && reviewsData.length > 0) {
        console.log('📋 Avaliações recentes:');
        reviewsData.forEach((review, index) => {
          console.log(`${index + 1}. Reviewer: ${review.reviewer_id} → Reviewed: ${review.reviewed_id} (${review.rating_person}/5) - ${review.created_at}`);
        });
      }
    }

    // Verificar tabela user_recommendations
    const { data: userRecData, error: userRecError } = await supabase
      .from('user_recommendations')
      .select('id, recommender_id, recommended_id, recommendation_type, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (userRecError) {
      console.log('❌ Erro ao buscar recomendações:', userRecError.message);
    } else {
      console.log(`📊 Recomendações na tabela: ${userRecData?.length || 0}`);
      if (userRecData && userRecData.length > 0) {
        console.log('📋 Recomendações recentes:');
        userRecData.forEach((rec, index) => {
          console.log(`${index + 1}. Recommender: ${rec.recommender_id} → Recommended: ${rec.recommended_id} (${rec.recommendation_type}) - ${rec.created_at}`);
        });
      }
    }

    // 6. Resumo
    console.log('\n📊 RESUMO:');
    console.log(`✅ Posts de recomendações: ${recommendationPosts?.length || 0}`);
    console.log(`✅ Posts de favoritos: ${favoritePosts?.length || 0}`);
    console.log(`✅ Posts de avaliações: ${reviewPosts?.length || 0}`);
    console.log(`✅ Posts de boas-vindas: ${welcomePosts?.length || 0}`);
    console.log(`✅ Favoritos na tabela: ${favoritesData?.length || 0}`);
    console.log(`✅ Avaliações na tabela: ${reviewsData?.length || 0}`);
    console.log(`✅ Recomendações na tabela: ${userRecData?.length || 0}`);

    console.log('\n🔍 DIAGNÓSTICO:');
    if (recommendationPosts && recommendationPosts.length > 0) {
      console.log('✅ Sistema de recomendações: FUNCIONANDO');
    } else {
      console.log('❌ Sistema de recomendações: NÃO FUNCIONANDO');
    }

    if (favoritePosts && favoritePosts.length > 0) {
      console.log('✅ Sistema de favoritos: FUNCIONANDO');
    } else if (favoritesData && favoritesData.length > 0) {
      console.log('⚠️ Sistema de favoritos: DADOS EXISTEM MAS POSTS NÃO CRIADOS');
    } else {
      console.log('❌ Sistema de favoritos: NÃO FUNCIONANDO (sem dados)');
    }

    if (reviewPosts && reviewPosts.length > 0) {
      console.log('✅ Sistema de avaliações: FUNCIONANDO');
    } else if (reviewsData && reviewsData.length > 0) {
      console.log('⚠️ Sistema de avaliações: DADOS EXISTEM MAS POSTS NÃO CRIADOS');
    } else {
      console.log('❌ Sistema de avaliações: NÃO FUNCIONANDO (sem dados)');
    }

    if (welcomePosts && welcomePosts.length > 0) {
      console.log('✅ Sistema de boas-vindas: FUNCIONANDO');
    } else {
      console.log('❌ Sistema de boas-vindas: NÃO FUNCIONANDO');
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testAllNotifications().catch(console.error);
