const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWelcomeSystem() {
  console.log('🧪 Testando sistema de boas-vindas...\n');
  
  try {
    // 1. Verificar posts de boas-vindas existentes
    console.log('1️⃣ Verificando posts de boas-vindas...');
    
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
        welcomePosts.forEach((post, index) => {
          console.log(`  ${index + 1}. ${post.title} (${post.created_at})`);
        });
      }
    }

    // 2. Verificar usuários recentes (últimos 7 dias)
    console.log('\n2️⃣ Verificando usuários recentes...');
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, user_type, created_at')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(5);

    if (usersError) {
      console.log('❌ Erro ao buscar usuários recentes:', usersError.message);
    } else {
      console.log(`📊 Usuários recentes (últimos 7 dias): ${recentUsers?.length || 0}`);
      if (recentUsers && recentUsers.length > 0) {
        recentUsers.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.full_name} (${user.user_type}) - ${user.created_at}`);
        });
      }
    }

    // 3. Verificar se há usuários sem posts de boas-vindas
    console.log('\n3️⃣ Verificando usuários sem posts de boas-vindas...');
    
    if (recentUsers && recentUsers.length > 0) {
      for (const user of recentUsers) {
        // Verificar se existe post de boas-vindas para este usuário
        const { data: existingWelcomePost, error: postError } = await supabase
          .from('feed_posts')
          .select('id')
          .eq('metadata->>type', 'welcome')
          .eq('user_id', user.id)
          .single();

        if (postError && postError.code === 'PGRST116') {
          console.log(`⚠️ Usuário sem post de boas-vindas: ${user.full_name} (${user.id})`);
          
          // Tentar criar post de boas-vindas para este usuário
          console.log(`🔄 Tentando criar post de boas-vindas para ${user.full_name}...`);
          
          const message = `🎉 ${user.full_name} se juntou à comunidade`;
          
          const { data: newPost, error: createError } = await supabase
            .from('feed_posts')
            .insert({
              professional_id: user.id,
              user_id: user.id,
              title: message,
              description: message,
              images: [],
              location_state: user.location_state || 'SP',
              location_city: user.location_city || 'São Paulo',
              likes_count: 0,
              comments_count: 0,
              is_active: true,
              is_public: true,
              is_featured: false,
              tags: ['sistema', 'boas-vindas'],
              metadata: { 
                type: 'welcome', 
                user: user.full_name,
                user_type: user.user_type,
                location_city: user.location_city,
                location_state: user.location_state,
                bio: user.bio,
                avatar_url: user.avatar_url
              }
            })
            .select()
            .single();

          if (createError) {
            console.log(`❌ Erro ao criar post de boas-vindas para ${user.full_name}: ${createError.message}`);
          } else {
            console.log(`✅ Post de boas-vindas criado para ${user.full_name}: ${newPost.id}`);
          }
        } else if (existingWelcomePost) {
          console.log(`✅ Post de boas-vindas já existe para: ${user.full_name}`);
        }
      }
    }

    // 4. Testar criação manual de post de boas-vindas
    console.log('\n4️⃣ Testando criação manual de post de boas-vindas...');
    
    // Usar um usuário existente para teste
    const { data: testUser, error: testUserError } = await supabase
      .from('profiles')
      .select('id, full_name, user_type, location_city, location_state, bio, avatar_url')
      .limit(1)
      .single();

    if (testUserError) {
      console.log('❌ Erro ao buscar usuário para teste:', testUserError.message);
    } else {
      console.log(`🧪 Testando com usuário: ${testUser.full_name}`);
      
      const testMessage = `🎉 ${testUser.full_name} se juntou à comunidade (TESTE)`;
      
      const { data: testPost, error: testError } = await supabase
        .from('feed_posts')
        .insert({
          professional_id: testUser.id,
          user_id: testUser.id,
          title: testMessage,
          description: testMessage,
          images: [],
          location_state: testUser.location_state || 'SP',
          location_city: testUser.location_city || 'São Paulo',
          likes_count: 0,
          comments_count: 0,
          is_active: true,
          is_public: true,
          is_featured: false,
          tags: ['sistema', 'boas-vindas', 'teste'],
          metadata: { 
            type: 'welcome', 
            user: testUser.full_name,
            user_type: testUser.user_type,
            location_city: testUser.location_city,
            location_state: testUser.location_state,
            bio: testUser.bio,
            avatar_url: testUser.avatar_url
          }
        })
        .select()
        .single();

      if (testError) {
        console.log(`❌ Erro ao criar post de teste: ${testError.message}`);
      } else {
        console.log(`✅ Post de teste criado: ${testPost.id}`);
      }
    }

    // 5. Resumo final
    console.log('\n📊 RESUMO FINAL:');
    console.log(`✅ Posts de boas-vindas existentes: ${welcomePosts?.length || 0}`);
    console.log(`✅ Usuários recentes: ${recentUsers?.length || 0}`);
    console.log(`📊 Total de posts no feed: ${(await supabase.from('feed_posts').select('id')).data?.length || 0}`);

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testWelcomeSystem().catch(console.error);
