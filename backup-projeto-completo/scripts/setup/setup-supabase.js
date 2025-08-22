// Script de configuração automática do Supabase ConfiLar-v4
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🚀 Configurando Supabase ConfiLar-v4...');

// Estas variáveis serão preenchidas com as credenciais do seu projeto
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'COLOQUE_A_URL_AQUI';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'COLOQUE_A_CHAVE_SERVICE_ROLE_AQUI';

if (SUPABASE_URL === 'COLOQUE_A_URL_AQUI' || SUPABASE_SERVICE_KEY === 'COLOQUE_A_CHAVE_SERVICE_ROLE_AQUI') {
  console.log('❌ Configure as credenciais do Supabase primeiro!');
  console.log('1. Vá para Settings > API no dashboard do Supabase');
  console.log('2. Copie Project URL e service_role key');
  console.log('3. Atualize o arquivo .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  try {
    console.log('\n🔍 Conectando ao Supabase...');
    
    // Testar conexão
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('✅ Conectado! Tabela profiles não existe ainda (será criada)');
    } else if (error) {
      throw error;
    } else {
      console.log('✅ Conectado! Tabela profiles já existe');
    }
    
    console.log('\n📋 Iniciando configuração do banco...');
    
    // Aqui serão executadas todas as migrações automaticamente
    // quando você me passar as credenciais
    
    console.log('🎯 Aguardando credenciais para continuar...');
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
  }
}

setupDatabase();









