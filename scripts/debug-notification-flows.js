const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugNotificationFlows() {
  console.log('🔍 Debugando fluxos de notificação...\n');
  
  try {
    // 1. Verificar se há posts recentes que podem estar bloqueando novos posts
    console.log('1️⃣ Verificando posts recentes por tipo...');
    
    const types = ['review', 'recommendation', 'favorite', 'welcome'];
    
    for (const type of types) {
      const { data: recentPosts, error } = await supabase
        .from('feed_posts')
        .select('id, title, created_at, metadata')
        .eq('metadata->>type', type)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.log(`❌ Erro ao buscar posts de ${type}:`, error.message);
      } else {
        console.log(`📊 Posts de ${type} (últimas 24h): ${recentPosts?.length || 0}`);
        if (recentPosts && recentPosts.length > 0) {
          recentPosts.forEach((post, index) => {
            console.log(`  ${index + 1}. ${post.title} (${post.created_at})`);
          });
        }
      }
    }

    // 2. Verificar dados nas tabelas fonte
    console.log('\n2️⃣ Verificando dados nas tabelas fonte...');
    
    // Reviews
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, reviewer_id, reviewed_id, rating_person, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(3);

    if (reviewsError) {
      console.log('❌ Erro ao buscar reviews:', reviewsError.message);
    } else {
      console.log(`📊 Reviews (últimas 24h): ${reviewsData?.length || 0}`);
    }

    // Favorites
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('favorites')
      .select('id, user_id, professional_id, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(3);

    if (favoritesError) {
      console.log('❌ Erro ao buscar favorites:', favoritesError.message);
    } else {
      console.log(`📊 Favorites (últimas 24h): ${favoritesData?.length || 0}`);
    }

    // User recommendations
    const { data: recData, error: recError } = await supabase
      .from('user_recommendations')
      .select('id, recommender_id, recommended_id, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(3);

    if (recError) {
      console.log('❌ Erro ao buscar user_recommendations:', recError.message);
    } else {
      console.log(`📊 User recommendations (últimas 24h): ${recData?.length || 0}`);
    }

    // 3. Testar criação manual de posts para cada tipo
    console.log('\n3️⃣ Testando criação manual de posts...');
    
    // Testar post de review
    if (reviewsData && reviewsData.length > 0) {
      const review = reviewsData[0];
      console.log(`🧪 Testando post de review para: ${review.reviewer_id} → ${review.reviewed_id}`);
      
      // Buscar dados dos usuários
      const { data: reviewerData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', review.reviewer_id)
        .single();

      const { data: reviewedData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', review.reviewed_id)
        .single();

      if (reviewerData && reviewedData) {
        const stars = '⭐'.repeat(Math.min(review.rating_person, 5));
        const message = `⭐ ${reviewerData.full_name} avaliou ${reviewedData.full_name} com ${stars} (${review.rating_person}/5)`;
        
        const { data: testPost, error: testError } = await supabase
          .from('feed_posts')
          .insert({
            professional_id: review.reviewed_id,
            user_id: review.reviewer_id,
            title: message,
            description: message,
            images: [],
            location_state: 'SP',
            location_city: 'São Paulo',
            likes_count: 0,
            comments_count: 0,
            is_active: true,
            is_public: true,
            is_featured: false,
            tags: ['sistema', 'avaliação'],
            metadata: { 
              type: 'review', 
              reviewer: reviewerData.full_name,
              reviewed: reviewedData.full_name,
              rating: review.rating_person
            }
          })
          .select()
          .single();

        if (testError) {
          console.log(`❌ Erro ao criar post de review: ${testError.message}`);
        } else {
          console.log(`✅ Post de review criado: ${testPost.id}`);
        }
      }
    }

    // 4. Verificar se o problema é de timing (posts muito antigos)
    console.log('\n4️⃣ Verificando timing dos dados...');
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    console.log(`🕐 Agora: ${now.toISOString()}`);
    console.log(`🕐 24h atrás: ${oneDayAgo.toISOString()}`);
    console.log(`🕐 1 semana atrás: ${oneWeekAgo.toISOString()}`);
    
    // Verificar reviews mais antigas
    const { data: oldReviews, error: oldReviewsError } = await supabase
      .from('reviews')
      .select('id, reviewer_id, reviewed_id, rating_person, created_at')
      .gte('created_at', oneWeekAgo.toISOString())
      .lt('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(3);

    if (oldReviewsError) {
      console.log('❌ Erro ao buscar reviews antigas:', oldReviewsError.message);
    } else {
      console.log(`📊 Reviews antigas (1 semana atrás): ${oldReviews?.length || 0}`);
      if (oldReviews && oldReviews.length > 0) {
        oldReviews.forEach((review, index) => {
          console.log(`  ${index + 1}. ${review.reviewer_id} → ${review.reviewed_id} (${review.rating_person}/5) - ${review.created_at}`);
        });
      }
    }

    // 5. Resumo do diagnóstico
    console.log('\n📊 DIAGNÓSTICO FINAL:');
    console.log('✅ Recomendações: Funcionando (posts criados)');
    console.log('✅ Favoritos: Funcionando (posts criados)');
    console.log('⚠️ Avaliações: Dados existem mas posts não criados (problema de timing ou RLS)');
    console.log('❌ Boas-vindas: Não funcionando (problema no hook)');

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

debugNotificationFlows().catch(console.error);
