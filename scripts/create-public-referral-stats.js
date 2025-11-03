/**
 * Script para criar função pública de estatísticas do programa de indicações
 * 
 * Esta função permite que usuários anônimos vejam estatísticas agregadas
 * do programa de indicações na página inicial.
 */

const fs = require('fs');
const path = require('path');

// Ler o arquivo SQL
const sqlFile = path.join(__dirname, 'create-public-referral-stats-function.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

console.log('📄 SQL para criar função pública de estatísticas de indicações:');
console.log('==========================================\n');
console.log(sql);
console.log('\n==========================================\n');
console.log('📋 INSTRUÇÕES:');
console.log('1. Copie o conteúdo do arquivo SQL acima');
console.log('2. Acesse o Supabase Dashboard: https://supabase.com/dashboard');
console.log('3. Vá em SQL Editor');
console.log('4. Cole o SQL e execute');
console.log('\n✅ Ou execute diretamente via linha de comando se tiver acesso ao banco\n');

