const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecommendationsStructure() {
  console.log('🔍 Verificando estrutura da tabela recommendations...\n');
  
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
      }
    }

    // 3. Testar query específica que está falhando
    console.log('\n3️⃣ Testando query específica que está falhando...');
    const testQuery = {
      select: 'id,reason,created_at,from_user_id,to_user_id',
      created_at: 'gte.2025-09-26T16:13:15.956Z',
      order: 'created_at.desc',
      limit: 5
    };

    console.log('📋 Query de teste:', testQuery);

    const { data: testData, error: testError } = await supabase
      .from('recommendations')
      .select('id,reason,created_at,from_user_id,to_user_id')
      .gte('created_at', '2025-09-26T16:13:15.956Z')
      .order('created_at', { ascending: false })
      .limit(5);

    if (testError) {
      console.log('❌ Erro na query de teste:', testError.message);
      console.log('📋 Detalhes do erro:', testError);
    } else {
      console.log('✅ Query de teste funcionou');
      console.log(`📊 Resultados: ${testData?.length || 0}`);
    }

    // 4. Verificar se as colunas existem
    console.log('\n4️⃣ Verificando se as colunas existem...');
    const { data: columnTest, error: columnError } = await supabase
      .from('recommendations')
      .select('id')
      .limit(1);

    if (columnError) {
      console.log('❌ Erro ao verificar coluna id:', columnError.message);
    } else {
      console.log('✅ Coluna id existe');
    }

    // 5. Tentar inserir um registro de teste
    console.log('\n5️⃣ Tentando inserir um registro de teste...');
    const { data: insertData, error: insertError } = await supabase
      .from('recommendations')
      .insert({
        from_user_id: 'test-user-1',
        to_user_id: 'test-user-2',
        reason: 'Teste de recomendação'
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Erro ao inserir registro de teste:', insertError.message);
      console.log('📋 Detalhes do erro:', insertError);
    } else {
      console.log('✅ Registro de teste inserido com sucesso');
      console.log('📋 Dados inseridos:', insertData);
      
      // Deletar o registro de teste
      const { error: deleteError } = await supabase
        .from('recommendations')
        .delete()
        .eq('id', insertData.id);
      
      if (deleteError) {
        console.log('⚠️ Erro ao deletar registro de teste:', deleteError.message);
      } else {
        console.log('✅ Registro de teste deletado');
      }
    }

    // 6. Resumo
    console.log('\n📊 RESUMO:');
    console.log(`✅ Tabela recommendations: ${recommendationsError ? 'ERRO' : 'OK'}`);
    console.log(`✅ Tabela user_recommendations: ${userRecError ? 'ERRO' : 'OK'}`);
    console.log(`✅ Query de teste: ${testError ? 'ERRO' : 'OK'}`);
    console.log(`✅ Inserção de teste: ${insertError ? 'ERRO' : 'OK'}`);

    if (testError) {
      console.log('\n💡 SOLUÇÃO:');
      console.log('A query está falhando. Possíveis causas:');
      console.log('1. Colunas não existem na tabela');
      console.log('2. Permissões RLS bloqueando a query');
      console.log('3. Estrutura da tabela diferente do esperado');
    }

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkRecommendationsStructure().catch(console.error);
