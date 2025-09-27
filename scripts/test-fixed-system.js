const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFixedSystem() {
  console.log('🧪 Testando sistema após correções...\n');
  
  try {
    // 1. Verificar dados recentes que devem gerar posts
    console.log('1️⃣ Verificando dados recentes...');
    
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
    
    // Recomendações recentes
    const { data: recentRecs, error: recError } = await supabase
      .from('user_recommendations')
      .select('id, recommender_id, recommended_id, created_at')
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false });

    if (recError) {
      console.log('❌ Erro ao buscar recomendações recentes:', recError.message);
    } else {
      console.log(`📊 Recomendações recentes (última hora): ${recentRecs?.length || 0}`);
      if (recentRecs && recentRecs.length > 0) {
        recentRecs.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec.recommender_id} → ${rec.recommended_id} (${rec.created_at})`);
        });
      }
    }

    // Favoritos recentes
    const { data: recentFavs, error: favError } = await supabase
      .from('favorites')
      .select('id, user_id, professional_id, created_at')
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false });

    if (favError) {
      console.log('❌ Erro ao buscar favoritos recentes:', favError.message);
    } else {
      console.log(`📊 Favoritos recentes (última hora): ${recentFavs?.length || 0}`);
      if (recentFavs && recentFavs.length > 0) {
        recentFavs.forEach((fav, index) => {
          console.log(`  ${index + 1}. ${fav.user_id} → ${fav.professional_id} (${fav.created_at})`);
        });
      }
    }

    // 2. Verificar posts automáticos correspondentes
    console.log('\n2️⃣ Verificando posts automáticos correspondentes...');
    
    const { data: autoPosts, error: autoError } = await supabase
      .from('feed_posts')
      .select('id, title, metadata, created_at')
      .in('metadata->>type', ['recommendation', 'favorite', 'review', 'welcome'])
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false });

    if (autoError) {
      console.log('❌ Erro ao buscar posts automáticos:', autoError.message);
    } else {
      console.log(`📊 Posts automáticos recentes: ${autoPosts?.length || 0}`);
      if (autoPosts && autoPosts.length > 0) {
        autoPosts.forEach((post, index) => {
          console.log(`  ${index + 1}. ${post.title} (${post.metadata?.type}) - ${post.created_at}`);
        });
      }
    }

    // 3. Testar criação manual de post (simulando o sistema)
    console.log('\n3️⃣ Testando criação manual de post...');
    
    if (recentRecs && recentRecs.length > 0) {
      const rec = recentRecs[0];
      
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
        console.log(`🧪 Testando criação de post para: ${fromUser.full_name} → ${toUser.full_name}`);
        
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
          console.log('💡 Problema ainda persiste - RLS ou permissões');
        } else {
          console.log('✅ Post de teste criado com sucesso:', testPost.id);
          console.log('🎉 Sistema funcionando!');
        }
      }
    }

    // 4. Resumo do teste
    console.log('\n📊 RESUMO DO TESTE:');
    console.log(`✅ Recomendações recentes: ${recentRecs?.length || 0}`);
    console.log(`✅ Favoritos recentes: ${recentFavs?.length || 0}`);
    console.log(`✅ Posts automáticos recentes: ${autoPosts?.length || 0}`);
    
    if (autoPosts && autoPosts.length === 0 && (recentRecs?.length > 0 || recentFavs?.length > 0)) {
      console.log('\n🚨 PROBLEMA IDENTIFICADO:');
      console.log('❌ Dados recentes existem mas não geraram posts automáticos');
      console.log('💡 Possíveis causas:');
      console.log('   1. Sistema de monitoramento não está executando');
      console.log('   2. Problemas de RLS ainda persistem');
      console.log('   3. Sistema não está sendo chamado no feed');
    } else if (autoPosts && autoPosts.length > 0) {
      console.log('\n✅ SISTEMA FUNCIONANDO:');
      console.log('🎉 Posts automáticos estão sendo criados corretamente!');
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testFixedSystem().catch(console.error);
