const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecommendationsTable() {
  console.log('🔍 Verificando tabela de recomendações...\n');
  
  try {
    // 1. Verificar se a tabela recommendations existe
    console.log('1️⃣ Verificando se a tabela recommendations existe...');
    const { data: recommendationsData, error: recommendationsError } = await supabase
      .from('recommendations')
      .select('*')
      .limit(1);

    if (recommendationsError) {
      console.log('❌ Erro ao acessar tabela recommendations:', recommendationsError.message);
      console.log('📋 Detalhes do erro:', recommendationsError);
    } else {
      console.log('✅ Tabela recommendations existe e é acessível');
      console.log(`📊 Dados encontrados: ${recommendationsData?.length || 0}`);
    }

    // 2. Verificar outras tabelas relacionadas
    console.log('\n2️⃣ Verificando tabelas relacionadas...');
    
    // Verificar tabela profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(3);

    if (profilesError) {
      console.log('❌ Erro ao acessar tabela profiles:', profilesError.message);
    } else {
      console.log('✅ Tabela profiles acessível');
      console.log(`📊 Usuários encontrados: ${profilesData?.length || 0}`);
    }

    // Verificar tabela reviews
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, rating_person, reviewer_id, reviewed_id')
      .limit(3);

    if (reviewsError) {
      console.log('❌ Erro ao acessar tabela reviews:', reviewsError.message);
    } else {
      console.log('✅ Tabela reviews acessível');
      console.log(`📊 Avaliações encontradas: ${reviewsData?.length || 0}`);
    }

    // Verificar tabela favorites
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('favorites')
      .select('id, user_id, professional_id')
      .limit(3);

    if (favoritesError) {
      console.log('❌ Erro ao acessar tabela favorites:', favoritesError.message);
    } else {
      console.log('✅ Tabela favorites acessível');
      console.log(`📊 Favoritos encontrados: ${favoritesData?.length || 0}`);
    }

    // 3. Verificar se há tabelas com nomes similares
    console.log('\n3️⃣ Verificando tabelas com nomes similares...');
    
    // Tentar acessar tabela user_recommendations
    const { data: userRecData, error: userRecError } = await supabase
      .from('user_recommendations')
      .select('*')
      .limit(1);

    if (userRecError) {
      console.log('❌ Tabela user_recommendations não existe:', userRecError.message);
    } else {
      console.log('✅ Tabela user_recommendations existe');
    }

    // Tentar acessar tabela professional_recommendations
    const { data: profRecData, error: profRecError } = await supabase
      .from('professional_recommendations')
      .select('*')
      .limit(1);

    if (profRecError) {
      console.log('❌ Tabela professional_recommendations não existe:', profRecError.message);
    } else {
      console.log('✅ Tabela professional_recommendations existe');
    }

    // 4. Verificar estrutura da tabela recommendations se existir
    if (!recommendationsError) {
      console.log('\n4️⃣ Verificando estrutura da tabela recommendations...');
      const { data: structureData, error: structureError } = await supabase
        .from('recommendations')
        .select('*')
        .limit(1);

      if (structureError) {
        console.log('❌ Erro ao verificar estrutura:', structureError.message);
      } else {
        console.log('✅ Estrutura da tabela recommendations:');
        if (structureData && structureData.length > 0) {
          console.log('📋 Colunas disponíveis:', Object.keys(structureData[0]));
        } else {
          console.log('📋 Tabela vazia, mas acessível');
        }
      }
    }

    // 5. Resumo
    console.log('\n📊 RESUMO:');
    console.log(`✅ Tabela recommendations: ${recommendationsError ? 'NÃO EXISTE' : 'EXISTE'}`);
    console.log(`✅ Tabela profiles: ${profilesError ? 'ERRO' : 'OK'}`);
    console.log(`✅ Tabela reviews: ${reviewsError ? 'ERRO' : 'OK'}`);
    console.log(`✅ Tabela favorites: ${favoritesError ? 'ERRO' : 'OK'}`);

    if (recommendationsError) {
      console.log('\n💡 SOLUÇÃO:');
      console.log('A tabela recommendations não existe. O sistema de notificações deve ser ajustado para:');
      console.log('1. Desabilitar monitoramento de recomendações');
      console.log('2. Ou criar a tabela recommendations');
      console.log('3. Ou usar uma tabela alternativa');
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkRecommendationsTable().catch(console.error);
