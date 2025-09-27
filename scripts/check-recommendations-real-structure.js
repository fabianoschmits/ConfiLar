const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecommendationsRealStructure() {
  console.log('🔍 Verificando estrutura real da tabela recommendations...\n');
  
  try {
    // 1. Verificar estrutura da tabela recommendations
    console.log('1️⃣ Verificando estrutura da tabela recommendations...');
    const { data: recommendationsData, error: recommendationsError } = await supabase
      .from('recommendations')
      .select('*')
      .limit(1);

    if (recommendationsError) {
      console.log('❌ Erro ao acessar tabela recommendations:', recommendationsError.message);
      return;
    }

    console.log('✅ Tabela recommendations acessível');
    console.log(`📊 Dados encontrados: ${recommendationsData?.length || 0}`);

    // 2. Verificar estrutura da tabela user_recommendations
    console.log('\n2️⃣ Verificando estrutura da tabela user_recommendations...');
    const { data: userRecData, error: userRecError } = await supabase
      .from('user_recommendations')
      .select('*')
      .limit(1);

    if (userRecError) {
      console.log('❌ Erro ao acessar tabela user_recommendations:', userRecError.message);
    } else {
      console.log('✅ Tabela user_recommendations acessível');
      console.log(`📊 Dados encontrados: ${userRecData?.length || 0}`);
      if (userRecData && userRecData.length > 0) {
        console.log('📋 Estrutura da tabela user_recommendations:');
        console.log('Colunas:', Object.keys(userRecData[0]));
        console.log('📋 Dados de exemplo:', userRecData[0]);
      }
    }

    // 3. Testar query com estrutura correta
    console.log('\n3️⃣ Testando query com estrutura correta...');
    
    // Testar com user_recommendations
    const { data: userRecTest, error: userRecTestError } = await supabase
      .from('user_recommendations')
      .select('id,recommender_id,recommended_id,recommendation_type,created_at')
      .gte('created_at', '2025-09-26T16:13:15.956Z')
      .order('created_at', { ascending: false })
      .limit(5);

    if (userRecTestError) {
      console.log('❌ Erro na query user_recommendations:', userRecTestError.message);
    } else {
      console.log('✅ Query user_recommendations funcionou');
      console.log(`📊 Resultados: ${userRecTest?.length || 0}`);
      if (userRecTest && userRecTest.length > 0) {
        console.log('📋 Dados encontrados:', userRecTest[0]);
      }
    }

    // 4. Verificar se há dados em user_recommendations
    console.log('\n4️⃣ Verificando dados em user_recommendations...');
    const { data: allUserRec, error: allUserRecError } = await supabase
      .from('user_recommendations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (allUserRecError) {
      console.log('❌ Erro ao buscar todos os dados:', allUserRecError.message);
    } else {
      console.log(`📊 Total de registros em user_recommendations: ${allUserRec?.length || 0}`);
      if (allUserRec && allUserRec.length > 0) {
        console.log('📋 Dados encontrados:');
        allUserRec.forEach((rec, index) => {
          console.log(`${index + 1}. ID: ${rec.id}, Recommender: ${rec.recommender_id}, Recommended: ${rec.recommended_id}, Tipo: ${rec.recommendation_type}, Data: ${rec.created_at}`);
        });
      }
    }

    // 5. Resumo e recomendação
    console.log('\n📊 RESUMO:');
    console.log(`✅ Tabela recommendations: ${recommendationsError ? 'ERRO' : 'OK'}`);
    console.log(`✅ Tabela user_recommendations: ${userRecError ? 'ERRO' : 'OK'}`);
    console.log(`✅ Query user_recommendations: ${userRecTestError ? 'ERRO' : 'OK'}`);
    console.log(`✅ Dados em user_recommendations: ${allUserRec?.length || 0}`);

    console.log('\n💡 RECOMENDAÇÃO:');
    if (userRecData && userRecData.length > 0) {
      console.log('✅ Use a tabela user_recommendations em vez de recommendations');
      console.log('📋 Colunas corretas: recommender_id, recommended_id, recommendation_type, created_at');
    } else {
      console.log('⚠️ Ambas as tabelas estão vazias ou não acessíveis');
      console.log('💡 Considere desabilitar o monitoramento de recomendações');
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkRecommendationsRealStructure().catch(console.error);
