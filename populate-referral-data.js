const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'
);

async function createReferralData() {
  console.log('🔍 Buscando usuários existentes...');
  
  // Buscar usuários existentes
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .limit(10);
    
  if (usersError) {
    console.error('❌ Erro ao buscar usuários:', usersError);
    return;
  }
  
  console.log('📋 Usuários encontrados:', users.length);
  
  // Criar dados de referral para cada usuário
  for (const user of users) {
    const referralCode = user.full_name.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 6) + Math.floor(Math.random() * 10000);
    
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
      console.error('❌ Erro ao inserir para', user.full_name, ':', insertError);
    } else {
      console.log('✅ Criado código', referralCode, 'para', user.full_name);
    }
  }
}

createReferralData();
