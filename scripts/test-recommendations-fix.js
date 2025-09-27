const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRecommendationsFix() {
  console.log('🧪 Testando correção do monitoramento de recomendações...\n');
  
  try {
    // 1. Testar a query corrigida
    console.log('1️⃣ Testando query corrigida...');
    const { data, error } = await supabase
      .from('user_recommendations')
      .select(`
        id,
        recommendation_type,
        created_at,
        recommender_id,
        recommended_id
      `)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24 horas
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.log('❌ Erro na query corrigida:', error.message);
      console.log('📋 Detalhes:', error);
    } else {
      console.log('✅ Query corrigida funcionou!');
      console.log(`📊 Resultados encontrados: ${data?.length || 0}`);
      
      if (data && data.length > 0) {
        console.log('📋 Dados encontrados:');
        data.forEach((rec, index) => {
          console.log(`${index + 1}. ID: ${rec.id}`);
          console.log(`   Recommender: ${rec.recommender_id}`);
          console.log(`   Recommended: ${rec.recommended_id}`);
          console.log(`   Tipo: ${rec.recommendation_type}`);
          console.log(`   Data: ${rec.created_at}`);
          console.log('');
        });
      }
    }

    // 2. Testar busca de dados dos usuários
    console.log('2️⃣ Testando busca de dados dos usuários...');
    if (data && data.length > 0) {
      const recommendation = data[0];
      
      // Buscar dados do recommender
      const { data: fromUserData, error: fromUserError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', recommendation.recommender_id)
        .single();

      // Buscar dados do recommended
      const { data: toUserData, error: toUserError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', recommendation.recommended_id)
        .single();

      if (fromUserError) {
        console.log('❌ Erro ao buscar dados do recommender:', fromUserError.message);
      } else {
        console.log('✅ Dados do recommender encontrados:', fromUserData);
      }

      if (toUserError) {
        console.log('❌ Erro ao buscar dados do recommended:', toUserError.message);
      } else {
        console.log('✅ Dados do recommended encontrados:', toUserData);
      }

      if (fromUserData && toUserData) {
        console.log('✅ Sistema de busca de usuários funcionando!');
        console.log(`📋 Exemplo: ${fromUserData.full_name} recomendou ${toUserData.full_name}`);
      }
    }

    // 3. Verificar se há posts de recomendações no feed
    console.log('\n3️⃣ Verificando posts de recomendações no feed...');
    const { data: recommendationPosts, error: recPostsError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at, metadata')
      .eq('metadata->>type', 'recommendation')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recPostsError) {
      console.log('❌ Erro ao buscar posts de recomendações:', recPostsError.message);
    } else {
      console.log(`📊 Posts de recomendações no feed: ${recommendationPosts?.length || 0}`);
      if (recommendationPosts && recommendationPosts.length > 0) {
        console.log('📋 Posts de recomendações:');
        recommendationPosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title} (${post.created_at})`);
        });
      }
    }

    // 4. Resumo
    console.log('\n📊 RESUMO:');
    console.log(`✅ Query corrigida: ${error ? 'ERRO' : 'OK'}`);
    console.log(`✅ Dados encontrados: ${data?.length || 0}`);
    console.log(`✅ Posts de recomendações: ${recommendationPosts?.length || 0}`);

    if (!error) {
      console.log('\n🎉 SUCESSO: Monitoramento de recomendações corrigido!');
      console.log('✅ O erro "Failed to load resource: the server responded with a status of 400" deve ter sido resolvido');
    } else {
      console.log('\n⚠️ ATENÇÃO: Ainda há erros no monitoramento de recomendações');
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testRecommendationsFix().catch(console.error);
