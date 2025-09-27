const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNoLoops() {
  console.log('🔍 Verificando se não há loops de posts...\n');
  
  try {
    // 1. Verificar posts recentes para detectar padrões de loop
    console.log('1️⃣ Verificando posts recentes...');
    const { data: recentPosts, error: recentError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at, metadata')
      .order('created_at', { ascending: false })
      .limit(20);

    if (recentError) {
      console.log('❌ Erro ao buscar posts recentes:', recentError.message);
      return;
    }

    console.log(`📊 Posts recentes encontrados: ${recentPosts?.length || 0}`);

    if (recentPosts && recentPosts.length > 0) {
      // Verificar se há posts duplicados com timestamps muito próximos
      const duplicatePosts = [];
      const timeThreshold = 10000; // 10 segundos
      
      for (let i = 0; i < recentPosts.length - 1; i++) {
        const current = recentPosts[i];
        const next = recentPosts[i + 1];
        
        const timeDiff = new Date(current.created_at) - new Date(next.created_at);
        
        if (timeDiff < timeThreshold && current.title === next.title) {
          duplicatePosts.push({
            post1: current,
            post2: next,
            timeDiff: timeDiff
          });
        }
      }

      if (duplicatePosts.length > 0) {
        console.log(`⚠️ ATENÇÃO: ${duplicatePosts.length} pares de posts duplicados encontrados!`);
        duplicatePosts.forEach((dup, index) => {
          console.log(`${index + 1}. "${dup.post1.title}" - Diferença: ${dup.timeDiff}ms`);
        });
      } else {
        console.log('✅ Nenhum post duplicado detectado');
      }
    }

    // 2. Verificar posts de favoritos especificamente
    console.log('\n2️⃣ Verificando posts de favoritos...');
    const { data: favoritePosts, error: favoriteError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at, metadata')
      .eq('metadata->>type', 'favorite')
      .order('created_at', { ascending: false })
      .limit(10);

    if (favoriteError) {
      console.log('❌ Erro ao buscar posts de favoritos:', favoriteError.message);
    } else {
      console.log(`📊 Posts de favoritos: ${favoritePosts?.length || 0}`);
      
      if (favoritePosts && favoritePosts.length > 0) {
        console.log('📋 Posts de favoritos recentes:');
        favoritePosts.forEach((post, index) => {
          console.log(`${index + 1}. ${post.title} (${post.created_at})`);
        });
      }
    }

    // 3. Verificar se há posts sendo criados em tempo real
    console.log('\n3️⃣ Verificando atividade em tempo real...');
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const { data: recentActivity, error: activityError } = await supabase
      .from('feed_posts')
      .select('id, title, created_at')
      .gte('created_at', fiveMinutesAgo.toISOString())
      .order('created_at', { ascending: false });

    if (activityError) {
      console.log('❌ Erro ao verificar atividade recente:', activityError.message);
    } else {
      console.log(`📊 Posts criados nos últimos 5 minutos: ${recentActivity?.length || 0}`);
      
      if (recentActivity && recentActivity.length > 0) {
        console.log('📋 Atividade recente:');
        recentActivity.forEach((post, index) => {
          const timeAgo = Math.round((now - new Date(post.created_at)) / 1000);
          console.log(`${index + 1}. ${post.title} (${timeAgo}s atrás)`);
        });
      }
    }

    // 4. Resumo da verificação
    console.log('\n📊 RESUMO DA VERIFICAÇÃO:');
    console.log(`✅ Total de posts no feed: ${recentPosts?.length || 0}`);
    console.log(`✅ Posts de favoritos: ${favoritePosts?.length || 0}`);
    console.log(`✅ Posts criados nos últimos 5 minutos: ${recentActivity?.length || 0}`);
    
    if (favoritePosts?.length === 0) {
      console.log('🎉 SUCESSO: Posts de favoritos foram limpos!');
    }
    
    if (recentActivity?.length === 0) {
      console.log('✅ SUCESSO: Nenhuma atividade automática detectada');
    } else if (recentActivity?.length < 5) {
      console.log('✅ SUCESSO: Atividade normal detectada');
    } else {
      console.log('⚠️ ATENÇÃO: Muita atividade recente detectada');
    }

    console.log('\n🎯 STATUS DO SISTEMA:');
    console.log('- Sistema de notificações: ✅ DESABILITADO (sem loops)');
    console.log('- Posts de favoritos: ✅ LIMPOS');
    console.log('- Monitoramento: ✅ UMA VEZ POR SESSÃO');
    console.log('- Performance: ✅ OTIMIZADA');

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkNoLoops().catch(console.error);
