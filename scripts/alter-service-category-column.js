const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://oolqodaehouaidxuowtw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5ODg1NCwiZXhwIjoyMDcxMjc0ODU0fQ.1FLdgPEei6Xbe1Bbp-M-3kMul4gGrI0baNFJDnIvr34'
)

async function alterColumn() {
  console.log('🔧 Iniciando alteração da coluna service_category_id...\n')
  
  try {
    // Como não podemos executar ALTER TABLE diretamente via API REST do Supabase,
    // vamos informar ao usuário que precisa executar manualmente
    console.log('⚠️  ATENÇÃO: Esta alteração precisa ser feita manualmente no Supabase Dashboard')
    console.log('\n📋 INSTRUÇÕES:')
    console.log('1. Acesse: https://supabase.com/dashboard/project/oolqodaehouaidxuowtw')
    console.log('2. Vá em "SQL Editor"')
    console.log('3. Execute o seguinte SQL:\n')
    
    const sql = `
-- Remover constraint de foreign key se existir
ALTER TABLE feed_posts 
DROP CONSTRAINT IF EXISTS feed_posts_service_category_id_fkey;

-- Alterar tipo da coluna de UUID para VARCHAR(100)
ALTER TABLE feed_posts 
ALTER COLUMN service_category_id TYPE VARCHAR(100) 
USING service_category_id::text;
    `.trim()
    
    console.log('─'.repeat(60))
    console.log(sql)
    console.log('─'.repeat(60))
    
    console.log('\n4. Clique em "Run" para executar')
    console.log('5. Verifique se a mensagem de sucesso apareceu')
    
    console.log('\n✅ Após executar o SQL, volte e teste criar um post com serviço!')
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

alterColumn()

