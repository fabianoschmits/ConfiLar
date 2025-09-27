const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReviewNotification() {
  console.log('🧪 Testando sistema de notificações de avaliações...\n');
  
  try {
    // 1. Verificar avaliações existentes
    console.log('1️⃣ Verificando avaliações existentes...');
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, reviewer_id, reviewed_id, rating_person, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (reviewsError) {
      console.log('❌ Erro ao buscar avaliações:', reviewsError.message);
      return;
    }

    console.log(`📊 Avaliações encontradas: ${reviews?.length || 0}`);
    if (reviews && reviews.length > 0) {
      reviews.forEach((review, index) => {
        console.log(`${index + 1}. Reviewer: ${review.reviewer_id} → Reviewed: ${review.reviewed_id} (${review.rating_person}/5) - ${review.created_at}`);
      });
    }

    // 2. Verificar posts de avaliações existentes
    console.log('\n2️⃣ Verificando posts de avaliações...');
    const { data: reviewPosts, error: reviewPostsError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at, metadata')
      .eq('metadata->>type', 'review')
      .order('created_at', { ascending: false })
      .limit(3);

    if (reviewPostsError) {
      console.log('❌ Erro ao buscar posts de avaliações:', reviewPostsError.message);
    } else {
      console.log(`📊 Posts de avaliações: ${reviewPosts?.length || 0}`);
      if (reviewPosts && reviewPosts.length > 0) {
        reviewPosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title} (${post.created_at})`);
        });
      }
    }

    // 3. Verificar se há avaliações sem posts correspondentes
    console.log('\n3️⃣ Verificando avaliações sem posts...');
    if (reviews && reviews.length > 0) {
      for (const review of reviews) {
        // Verificar se existe post para esta avaliação
        const { data: existingPost, error: postError } = await supabase
          .from('feed_posts')
          .select('id')
          .eq('metadata->>type', 'review')
          .eq('metadata->>reviewer', review.reviewer_id)
          .eq('metadata->>reviewed', review.reviewed_id)
          .single();

        if (postError && postError.code === 'PGRST116') {
          console.log(`⚠️ Avaliação sem post: Reviewer ${review.reviewer_id} → Reviewed ${review.reviewed_id} (${review.rating_person}/5)`);
        } else if (existingPost) {
          console.log(`✅ Post existe para: Reviewer ${review.reviewer_id} → Reviewed ${review.reviewed_id}`);
        }
      }
    }

    // 4. Testar criação manual de post de avaliação
    console.log('\n4️⃣ Testando criação manual de post...');
    if (reviews && reviews.length > 0) {
      const review = reviews[0]; // Pegar a primeira avaliação
      
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
        console.log('❌ Erro ao buscar dados dos usuários');
        return;
      }

      console.log(`👤 Reviewer: ${reviewerData.full_name}`);
      console.log(`👤 Reviewed: ${reviewedData.full_name}`);

      // Criar post manualmente
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
        console.log('❌ Erro ao criar post manual:', createError.message);
      } else {
        console.log('✅ Post criado com sucesso:', newPost.id);
        console.log('📝 Título:', newPost.title);
      }
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testReviewNotification().catch(console.error);
