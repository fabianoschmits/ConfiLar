const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugPostCreationSystem() {
  console.log('🔍 Debugando sistema de criação de posts...\n');
  
  try {
    // 1. Verificar se a tabela feed_posts existe e tem as colunas corretas
    console.log('1️⃣ Verificando estrutura da tabela feed_posts...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('feed_posts')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('❌ Erro ao acessar tabela feed_posts:', tableError.message);
      console.log('💡 Possível problema: Tabela não existe ou problemas de RLS');
      return;
    }

    console.log('✅ Tabela feed_posts acessível');

    // 2. Verificar posts existentes
    console.log('\n2️⃣ Verificando posts existentes...');
    
    const { data: existingPosts, error: postsError } = await supabase
      .from('feed_posts')
      .select('id, title, user_id, created_at, metadata')
      .order('created_at', { ascending: false })
      .limit(5);

    if (postsError) {
      console.log('❌ Erro ao buscar posts:', postsError.message);
    } else {
      console.log(`📊 Total de posts: ${existingPosts?.length || 0}`);
      if (existingPosts && existingPosts.length > 0) {
        existingPosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title} (${post.created_at})`);
          console.log(`   Tipo: ${post.metadata?.type || 'normal'}`);
        });
      }
    }

    // 3. Verificar dados nas tabelas fonte
    console.log('\n3️⃣ Verificando dados nas tabelas fonte...');
    
    // User recommendations
    const { data: recommendations, error: recError } = await supabase
      .from('user_recommendations')
      .select('id, recommender_id, recommended_id, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (recError) {
      console.log('❌ Erro ao buscar recomendações:', recError.message);
    } else {
      console.log(`📊 Recomendações: ${recommendations?.length || 0}`);
      if (recommendations && recommendations.length > 0) {
        recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec.recommender_id} → ${rec.recommended_id} (${rec.created_at})`);
        });
      }
    }

    // Favorites
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('id, user_id, professional_id, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (favError) {
      console.log('❌ Erro ao buscar favoritos:', favError.message);
    } else {
      console.log(`📊 Favoritos: ${favorites?.length || 0}`);
      if (favorites && favorites.length > 0) {
        favorites.forEach((fav, index) => {
          console.log(`  ${index + 1}. ${fav.user_id} → ${fav.professional_id} (${fav.created_at})`);
        });
      }
    }

    // Reviews
    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select('id, reviewer_id, reviewed_id, rating_person, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (reviewError) {
      console.log('❌ Erro ao buscar avaliações:', reviewError.message);
    } else {
      console.log(`📊 Avaliações: ${reviews?.length || 0}`);
      if (reviews && reviews.length > 0) {
        reviews.forEach((review, index) => {
          console.log(`  ${index + 1}. ${review.reviewer_id} → ${review.reviewed_id} (${review.rating_person}/5) - ${review.created_at}`);
        });
      }
    }

    // 4. Testar criação manual de post
    console.log('\n4️⃣ Testando criação manual de post...');
    
    // Usar dados de uma recomendação existente
    if (recommendations && recommendations.length > 0) {
      const rec = recommendations[0];
      
      // Buscar dados dos usuários
      const { data: fromUser, error: fromUserError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', rec.recommender_id)
        .single();

      const { data: toUser, error: toUserError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', rec.recommended_id)
        .single();

      if (fromUserError || toUserError) {
        console.log('❌ Erro ao buscar dados dos usuários');
      } else if (fromUser && toUser) {
        console.log(`🧪 Testando com: ${fromUser.full_name} → ${toUser.full_name}`);
        
        const testMessage = `💡 ${fromUser.full_name} recomendou ${toUser.full_name}`;
        
        const { data: testPost, error: testError } = await supabase
          .from('feed_posts')
          .insert({
            professional_id: rec.recommended_id,
            user_id: rec.recommender_id,
            title: testMessage,
            description: testMessage,
            images: [],
            location_state: 'SP',
            location_city: 'São Paulo',
            likes_count: 0,
            comments_count: 0,
            is_active: true,
            is_public: true,
            is_featured: false,
            tags: ['sistema', 'recomendação', 'teste'],
            metadata: { 
              type: 'recommendation', 
              from_user: fromUser.full_name,
              to_user: toUser.full_name
            }
          })
          .select()
          .single();

        if (testError) {
          console.log('❌ Erro ao criar post de teste:', testError.message);
          console.log('💡 Possível problema: RLS, colunas faltando, ou permissões');
        } else {
          console.log('✅ Post de teste criado com sucesso:', testPost.id);
        }
      }
    }

    // 5. Verificar se há posts automáticos correspondentes
    console.log('\n5️⃣ Verificando posts automáticos correspondentes...');
    
    const { data: autoPosts, error: autoError } = await supabase
      .from('feed_posts')
      .select('id, title, metadata, created_at')
      .in('metadata->>type', ['recommendation', 'favorite', 'review', 'welcome'])
      .order('created_at', { ascending: false })
      .limit(10);

    if (autoError) {
      console.log('❌ Erro ao buscar posts automáticos:', autoError.message);
    } else {
      console.log(`📊 Posts automáticos: ${autoPosts?.length || 0}`);
      if (autoPosts && autoPosts.length > 0) {
        autoPosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title} (${post.metadata?.type}) - ${post.created_at}`);
        });
      }
    }

    // 6. Resumo do diagnóstico
    console.log('\n📊 DIAGNÓSTICO FINAL:');
    console.log(`✅ Tabela feed_posts: ${tableError ? '❌ ERRO' : '✅ OK'}`);
    console.log(`✅ Posts existentes: ${existingPosts?.length || 0}`);
    console.log(`✅ Recomendações: ${recommendations?.length || 0}`);
    console.log(`✅ Favoritos: ${favorites?.length || 0}`);
    console.log(`✅ Avaliações: ${reviews?.length || 0}`);
    console.log(`✅ Posts automáticos: ${autoPosts?.length || 0}`);

    if (autoPosts && autoPosts.length === 0) {
      console.log('\n🚨 PROBLEMA IDENTIFICADO:');
      console.log('❌ Nenhum post automático encontrado');
      console.log('💡 Possíveis causas:');
      console.log('   1. Sistema de monitoramento não está executando');
      console.log('   2. Problemas de RLS impedindo criação de posts');
      console.log('   3. Sistema não está sendo chamado no feed');
      console.log('   4. Dados nas tabelas fonte não estão sendo detectados');
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

debugPostCreationSystem().catch(console.error);
