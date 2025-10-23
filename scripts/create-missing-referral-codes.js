const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'
);

async function createMissingReferralCodes() {
  console.log('🔍 Buscando todos os usuários...');
  
  // 1. Buscar todos os usuários
  const { data: allUsers, error: usersError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .not('full_name', 'is', null)
    .neq('full_name', '');
    
  if (usersError) {
    console.error('❌ Erro ao buscar usuários:', usersError);
    return;
  }
  
  console.log(`📋 Encontrados ${allUsers.length} usuários`);
  
  // 2. Buscar usuários que já têm códigos
  const { data: existingCodes, error: codesError } = await supabase
    .from('user_referral_stats')
    .select('user_id');
    
  if (codesError) {
    console.error('❌ Erro ao buscar códigos existentes:', codesError);
    return;
  }
  
  const existingUserIds = new Set(existingCodes.map(item => item.user_id));
  console.log(`📊 ${existingUserIds.size} usuários já possuem códigos`);
  
  // 3. Identificar usuários sem códigos
  const usersWithoutCodes = allUsers.filter(user => !existingUserIds.has(user.id));
  console.log(`🔧 ${usersWithoutCodes.length} usuários precisam de códigos`);
  
  if (usersWithoutCodes.length === 0) {
    console.log('✅ Todos os usuários já possuem códigos de referência!');
    return;
  }
  
  // 4. Criar códigos para usuários sem códigos
  for (const user of usersWithoutCodes) {
    if (!user.full_name) continue;
    
    // Gerar código baseado no nome
    const namePart = user.full_name.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 6);
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const referralCode = namePart + randomPart;
    
    console.log(`🔧 Criando código ${referralCode} para ${user.full_name}...`);
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_referral_stats')
      .insert({
        user_id: user.id,
        referral_code: referralCode,
        total_referrals: 0,
        total_points: 0,
        tier: 'bronze',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (insertError) {
      console.error(`❌ Erro ao criar código para ${user.full_name}:`, insertError);
    } else {
      console.log(`✅ Código ${referralCode} criado para ${user.full_name}`);
    }
  }
  
  // 5. Verificar resultado final
  console.log('\n📊 Verificando resultado final...');
  const { data: finalStats, error: finalError } = await supabase
    .from('user_referral_stats')
    .select('referral_code, user_id')
    .limit(5);
    
  if (finalError) {
    console.error('❌ Erro ao verificar resultado:', finalError);
  } else {
    console.log('📋 Códigos de referência criados:');
    for (const item of finalStats) {
      // Buscar nome do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', item.user_id)
        .single();
        
      console.log(`- ${item.referral_code} (${profile?.full_name || 'Sem nome'})`);
    }
  }
}

createMissingReferralCodes();
