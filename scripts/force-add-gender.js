const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'
);

async function forceAddGenderColumn() {
  try {
    console.log('🔧 Tentando forçar a criação da coluna gender...');
    
    // Tentar inserir um registro temporário com gender para forçar a criação da coluna
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: 'temp-gender-test-' + Date.now(),
        email: 'test@example.com',
        full_name: 'Test User',
        gender: 'male'
      })
      .select();
    
    if (error) {
      console.log('❌ Erro ao inserir registro de teste:', error);
      
      if (error.code === '42703') {
        console.log('💡 A coluna gender não existe. Você precisa adicioná-la manualmente no dashboard do Supabase.');
        console.log('📝 SQL para executar no dashboard:');
        console.log('ALTER TABLE profiles ADD COLUMN gender VARCHAR(10);');
        console.log('');
        console.log('🔗 Acesse: https://supabase.com/dashboard/project/oolqodaehouaidxuowtw/editor');
        console.log('📋 Vá em SQL Editor e execute o comando acima.');
      }
    } else {
      console.log('✅ Registro inserido com sucesso! A coluna gender já existe.');
      
      // Limpar o registro de teste
      await supabase
        .from('profiles')
        .delete()
        .eq('id', 'temp-gender-test-' + Date.now());
      
      console.log('🧹 Registro de teste removido.');
    }
  } catch (err) {
    console.log('❌ Erro geral:', err);
  }
}

forceAddGenderColumn();
