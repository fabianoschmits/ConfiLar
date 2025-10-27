const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'
);

const USER_ID = '5f3a507a-6ab2-430c-b20e-1bd322a85c3b';
const POINTS_TO_ADD = 100000;

async function addTestPoints() {
  try {
    console.log('🚀 Iniciando adição de pontos de teste...');
    console.log(`👤 Usuário: ${USER_ID}`);
    console.log(`💰 Pontos a adicionar: ${POINTS_TO_ADD.toLocaleString()}`);

    // 1. Verificar se o usuário existe
    console.log('\n1️⃣ Verificando se o usuário existe...');
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(USER_ID);
    
    if (userError) {
      console.error('❌ Erro ao verificar usuário:', userError.message);
      return;
    }
    
    if (!user.user) {
      console.error('❌ Usuário não encontrado:', USER_ID);
      return;
    }
    
    console.log('✅ Usuário encontrado:', user.user.email);

    // 2. Verificar saldo atual
    console.log('\n2️⃣ Verificando saldo atual...');
    const { data: currentBalance, error: balanceError } = await supabase
      .from('user_points_balance')
      .select('*')
      .eq('user_id', USER_ID)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar saldo:', balanceError.message);
      return;
    }

    const currentPoints = currentBalance?.balance || 0;
    console.log(`📊 Saldo atual: ${currentPoints.toLocaleString()} pontos`);

    // 3. Atualizar saldo de pontos
    console.log('\n3️⃣ Atualizando saldo de pontos...');
    const { data: balanceData, error: balanceUpdateError } = await supabase
      .from('user_points_balance')
      .upsert({
        user_id: USER_ID,
        balance: POINTS_TO_ADD,
        level: 1,
        total_earned: POINTS_TO_ADD,
        total_spent: 0,
        available_balance: POINTS_TO_ADD,
        updated_at: new Date().toISOString()
      })
      .select();

    if (balanceUpdateError) {
      console.error('❌ Erro ao atualizar saldo:', balanceUpdateError.message);
      return;
    }

    console.log('✅ Saldo atualizado com sucesso');

    // 4. Criar transação de pontos
    console.log('\n4️⃣ Criando transação de pontos...');
    const { data: transactionData, error: transactionError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: USER_ID,
        points: POINTS_TO_ADD,
        source: 'admin_bonus',
        description: 'Pontos de teste para sistema premium - 100.000 pontos',
        metadata: {
          admin_action: true,
          test_points: true,
          amount: POINTS_TO_ADD
        }
      })
      .select();

    if (transactionError) {
      console.error('❌ Erro ao criar transação:', transactionError.message);
      return;
    }

    console.log('✅ Transação criada com sucesso');

    // 5. Verificar resultado final
    console.log('\n5️⃣ Verificando resultado final...');
    const { data: finalBalance, error: finalError } = await supabase
      .from('user_points_balance')
      .select('*')
      .eq('user_id', USER_ID)
      .single();

    if (finalError) {
      console.error('❌ Erro ao verificar saldo final:', finalError.message);
      return;
    }

    console.log('\n🎉 SUCESSO! Pontos adicionados com sucesso!');
    console.log('='.repeat(50));
    console.log(`👤 Usuário: ${USER_ID}`);
    console.log(`📧 Email: ${user.user.email}`);
    console.log(`💰 Saldo atual: ${finalBalance.balance.toLocaleString()} pontos`);
    console.log(`📈 Total ganho: ${finalBalance.total_earned.toLocaleString()} pontos`);
    console.log(`📉 Total gasto: ${finalBalance.total_spent.toLocaleString()} pontos`);
    console.log(`🎯 Saldo disponível: ${finalBalance.available_balance.toLocaleString()} pontos`);
    console.log('='.repeat(50));
    
    console.log('\n🧪 Agora você pode testar:');
    console.log('• ✅ Curtidas premium (5 pontos cada)');
    console.log('• ✅ Posts premium (50 pontos cada)');
    console.log('• ✅ Anúncios premium (200 pontos cada)');
    console.log('• ✅ Sistema de níveis VIP');
    console.log('• ✅ Dashboard de pontos');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o script
addTestPoints();
