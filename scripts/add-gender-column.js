const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'
);

async function addGenderColumn() {
  try {
    console.log('🔧 Adicionando coluna gender na tabela profiles...');
    
    // Primeiro, vamos verificar se a coluna já existe
    const { data: checkData, error: checkError } = await supabase
      .from('profiles')
      .select('gender')
      .limit(1);
    
    if (checkError && checkError.code === '42703') {
      console.log('✅ Coluna gender não existe, vamos criá-la...');
      
      // Usar a API REST diretamente para executar SQL
      const response = await fetch('https://oolqodaehouaidxuowtw.supabase.co/rest/v1/rpc/exec_sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'
        },
        body: JSON.stringify({
          sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(10);'
        })
      });
      
      if (response.ok) {
        console.log('✅ Coluna gender adicionada com sucesso!');
        
        // Verificar se a coluna foi criada
        const { data: verifyData, error: verifyError } = await supabase
          .from('profiles')
          .select('gender')
          .limit(1);
        
        if (verifyError) {
          console.log('❌ Erro ao verificar coluna:', verifyError);
        } else {
          console.log('✅ Coluna gender verificada com sucesso!');
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Erro ao adicionar coluna:', errorText);
      }
    } else if (checkError) {
      console.log('❌ Erro ao verificar coluna:', checkError);
    } else {
      console.log('✅ Coluna gender já existe!');
    }
  } catch (err) {
    console.log('❌ Erro geral:', err);
  }
}

addGenderColumn();
