const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oolqodaehouaidxuowtw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbHFvZGFlaG91YWlkeHVvd3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTg4NTQsImV4cCI6MjA3MTI3NDg1NH0.h1OxM9qHsUFdtsTBA_halxFXZzLkS5viSfjugPYe9UY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRealtimeConnection() {
  console.log('🔍 Verificando conexão Realtime...\n');
  
  try {
    // 1. Verificar se a tabela notifications existe
    console.log('1️⃣ Verificando tabela notifications...');
    
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);

    if (notificationsError) {
      console.log('❌ Erro ao acessar tabela notifications:', notificationsError.message);
      console.log('💡 Solução: A tabela notifications pode não existir ou ter problemas de RLS');
    } else {
      console.log('✅ Tabela notifications acessível');
    }

    // 2. Verificar se há dados na tabela
    const { data: notificationsCount, error: countError } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Erro ao contar notificações:', countError.message);
    } else {
      console.log(`📊 Total de notificações: ${notificationsCount || 0}`);
    }

    // 3. Testar conexão Realtime
    console.log('\n2️⃣ Testando conexão Realtime...');
    
    const testChannel = supabase
      .channel('connection-test')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('📨 Mudança detectada:', payload);
        }
      )
      .subscribe((status) => {
        console.log('🔗 Status da conexão:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conexão Realtime estabelecida com sucesso');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Erro no canal Realtime');
        } else if (status === 'TIMED_OUT') {
          console.log('⏰ Timeout na conexão Realtime');
        } else if (status === 'CLOSED') {
          console.log('🔒 Conexão Realtime fechada');
        }
      });

    // Aguardar 5 segundos para testar a conexão
    setTimeout(() => {
      console.log('\n3️⃣ Resultado do teste:');
      console.log('🔗 Status final:', testChannel.state);
      
      // Desconectar do canal de teste
      supabase.removeChannel(testChannel);
      console.log('🔌 Canal de teste desconectado');
    }, 5000);

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

checkRealtimeConnection().catch(console.error);
