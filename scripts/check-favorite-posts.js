const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFavoritePosts() {
  console.log('🔍 Verificando posts de favoritos...\n');
  
  try {
    // 1. Verificar todos os posts de favoritos
    console.log('1️⃣ Verificando posts de favoritos...');
    const { data: favoritePosts, error: favoriteError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at, metadata, user_id, professional_id')
      .eq('metadata->>type', 'favorite')
      .order('created_at', { ascending: false });

    if (favoriteError) {
      console.log('❌ Erro ao buscar posts de favoritos:', favoriteError.message);
      return;
    }

    console.log(`📊 Total de posts de favoritos: ${favoritePosts?.length || 0}`);

    if (favoritePosts && favoritePosts.length > 0) {
      console.log('\n📋 Posts de favoritos:');
      favoritePosts.forEach((post, index) => {
        const timeAgo = Math.round((new Date() - new Date(post.created_at)) / 1000);
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Criado: ${post.created_at} (${timeAgo}s atrás)`);
        console.log(`   User ID: ${post.user_id}`);
        console.log(`   Professional ID: ${post.professional_id}`);
        console.log(`   Metadata: ${JSON.stringify(post.metadata)}`);
        console.log('');
      });

      // 2. Verificar se há posts duplicados
      console.log('2️⃣ Verificando duplicatas...');
      const duplicates = [];
      for (let i = 0; i < favoritePosts.length - 1; i++) {
        const current = favoritePosts[i];
        const next = favoritePosts[i + 1];
        
        if (current.title === next.title && 
            current.user_id === next.user_id && 
            current.professional_id === next.professional_id) {
          duplicates.push({ current, next });
        }
      }

      if (duplicates.length > 0) {
        console.log(`⚠️ ATENÇÃO: ${duplicates.length} pares de posts duplicados encontrados!`);
        duplicates.forEach((dup, index) => {
          console.log(`${index + 1}. "${dup.current.title}"`);
          console.log(`   Post 1: ${dup.current.id} (${dup.current.created_at})`);
          console.log(`   Post 2: ${dup.next.id} (${dup.next.created_at})`);
        });
      } else {
        console.log('✅ Nenhuma duplicata encontrada');
      }
    }

    // 3. Verificar posts recentes (últimos 10 minutos)
    console.log('\n3️⃣ Verificando posts recentes...');
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const { data: recentPosts, error: recentError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at, metadata')
      .gte('created_at', tenMinutesAgo.toISOString())
      .order('created_at', { ascending: false });

    if (recentError) {
      console.log('❌ Erro ao buscar posts recentes:', recentError.message);
    } else {
      console.log(`📊 Posts criados nos últimos 10 minutos: ${recentPosts?.length || 0}`);
      if (recentPosts && recentPosts.length > 0) {
        console.log('📋 Posts recentes:');
        recentPosts.forEach((post, index) => {
          const timeAgo = Math.round((new Date() - new Date(post.created_at)) / 1000);
          console.log(`${index + 1}. ${post.title} (${timeAgo}s atrás)`);
        });
      }
    }

    // 4. Resumo
    console.log('\n📊 RESUMO:');
    console.log(`✅ Total de posts de favoritos: ${favoritePosts?.length || 0}`);
    console.log(`✅ Posts duplicados: ${duplicates?.length || 0}`);
    console.log(`✅ Posts recentes (10min): ${recentPosts?.length || 0}`);

    if (duplicates && duplicates.length > 0) {
      console.log('\n⚠️ RECOMENDAÇÃO:');
      console.log('Há posts duplicados. Considere limpar os duplicados ou verificar o sistema de notificações.');
    } else {
      console.log('\n✅ SISTEMA FUNCIONANDO CORRETAMENTE');
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkFavoritePosts().catch(console.error);
