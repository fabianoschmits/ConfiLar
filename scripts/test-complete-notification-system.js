const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteNotificationSystem() {
  console.log('🧪 Testando sistema completo de notificações...\n');
  
  try {
    // 1. Verificar estado atual do sistema
    console.log('1️⃣ Estado atual do sistema...');
    
    const { data: allPosts, error: allPostsError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at, metadata')
      .order('created_at', { ascending: false })
      .limit(10);

    if (allPostsError) {
      console.log('❌ Erro ao buscar posts:', allPostsError.message);
      return;
    }

    console.log(`📊 Total de posts no feed: ${allPosts?.length || 0}`);
    
    // Agrupar por tipo
    const postsByType = {};
    if (allPosts) {
      allPosts.forEach(post => {
        const type = post.metadata?.type || 'unknown';
        if (!postsByType[type]) {
          postsByType[type] = [];
        }
        postsByType[type].push(post);
      });
    }

    Object.keys(postsByType).forEach(type => {
      console.log(`  📝 ${type}: ${postsByType[type].length} posts`);
    });

    // 2. Verificar dados nas tabelas fonte (últimos 7 dias)
    console.log('\n2️⃣ Dados nas tabelas fonte (últimos 7 dias)...');
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // Reviews
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, reviewer_id, reviewed_id, rating_person, created_at')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(5);

    if (reviewsError) {
      console.log('❌ Erro ao buscar reviews:', reviewsError.message);
    } else {
      console.log(`📊 Reviews (últimos 7 dias): ${reviewsData?.length || 0}`);
      if (reviewsData && reviewsData.length > 0) {
        reviewsData.forEach((review, index) => {
          console.log(`  ${index + 1}. ${review.reviewer_id} → ${review.reviewed_id} (${review.rating_person}/5) - ${review.created_at}`);
        });
      }
    }

    // Favorites
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('favorites')
      .select('id, user_id, professional_id, created_at')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(5);

    if (favoritesError) {
      console.log('❌ Erro ao buscar favorites:', favoritesError.message);
    } else {
      console.log(`📊 Favorites (últimos 7 dias): ${favoritesData?.length || 0}`);
      if (favoritesData && favoritesData.length > 0) {
        favoritesData.forEach((fav, index) => {
          console.log(`  ${index + 1}. ${fav.user_id} → ${fav.professional_id} - ${fav.created_at}`);
        });
      }
    }

    // User recommendations
    const { data: recData, error: recError } = await supabase
      .from('user_recommendations')
      .select('id, recommender_id, recommended_id, created_at')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recError) {
      console.log('❌ Erro ao buscar user_recommendations:', recError.message);
    } else {
      console.log(`📊 User recommendations (últimos 7 dias): ${recData?.length || 0}`);
      if (recData && recData.length > 0) {
        recData.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec.recommender_id} → ${rec.recommended_id} - ${rec.created_at}`);
        });
      }
    }

    // 3. Verificar se há avaliações sem posts correspondentes
    console.log('\n3️⃣ Verificando avaliações sem posts...');
    
    if (reviewsData && reviewsData.length > 0) {
      for (const review of reviewsData) {
        // Verificar se existe post para esta avaliação
        const { data: existingPost, error: postError } = await supabase
          .from('feed_posts')
          .select('id')
          .eq('metadata->>type', 'review')
          .eq('metadata->>reviewer', review.reviewer_id)
          .eq('metadata->>reviewed', review.reviewed_id)
          .single();

        if (postError && postError.code === 'PGRST116') {
          console.log(`⚠️ Avaliação sem post: ${review.reviewer_id} → ${review.reviewed_id} (${review.rating_person}/5)`);
          
          // Tentar criar post para esta avaliação
          console.log(`🔄 Tentando criar post para esta avaliação...`);
          
          // Buscar dados dos usuários
          const { data: reviewerData, error: reviewerError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', review.reviewer_id)
            .single();

          const { data: reviewedData, error: reviewedError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', review.reviewed_id)
            .single();

          if (reviewerError || reviewedError) {
            console.log(`❌ Erro ao buscar dados dos usuários para review ${review.id}`);
            continue;
          }

          if (reviewerData && reviewedData) {
            const stars = '⭐'.repeat(Math.min(review.rating_person, 5));
            const message = `⭐ ${reviewerData.full_name} avaliou ${reviewedData.full_name} com ${stars} (${review.rating_person}/5)`;
            
            const { data: newPost, error: createError } = await supabase
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

            if (createError) {
              console.log(`❌ Erro ao criar post para review ${review.id}: ${createError.message}`);
            } else {
              console.log(`✅ Post criado com sucesso para review ${review.id}: ${newPost.id}`);
            }
          }
        } else if (existingPost) {
          console.log(`✅ Post já existe para review: ${review.reviewer_id} → ${review.reviewed_id}`);
        }
      }
    }

    // 4. Resumo final
    console.log('\n📊 RESUMO FINAL:');
    console.log(`✅ Posts de recomendações: ${postsByType['recommendation']?.length || 0}`);
    console.log(`✅ Posts de favoritos: ${postsByType['favorite']?.length || 0}`);
    console.log(`✅ Posts de avaliações: ${postsByType['review']?.length || 0}`);
    console.log(`✅ Posts de boas-vindas: ${postsByType['welcome']?.length || 0}`);
    console.log(`📊 Total de posts: ${allPosts?.length || 0}`);

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testCompleteNotificationSystem().catch(console.error);
