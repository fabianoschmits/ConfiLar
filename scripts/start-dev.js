#!/usr/bin/env node

const { exec } = require('child_process');
const { spawn } = require('child_process');

console.log('🔍 Verificando porta 3000...');

// Função para matar processos na porta 3000
function killPort3000() {
  return new Promise((resolve) => {
    exec('netstat -ano | findstr :3000', (error, stdout) => {
      if (stdout.trim()) {
        console.log('⚠️  Porta 3000 em uso, finalizando processos...');
        
        // Extrair PIDs da saída do netstat
        const lines = stdout.trim().split('\n');
        const pids = new Set();
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0') {
              pids.add(pid);
            }
          }
        });
        
        // Matar cada processo
        if (pids.size > 0) {
          const killPromises = Array.from(pids).map(pid => {
            return new Promise((resolveKill) => {
              exec(`taskkill /PID ${pid} /F`, (error) => {
                if (error) {
                  console.log(`⚠️  Não foi possível finalizar PID ${pid}: ${error.message}`);
                } else {
                  console.log(`✅ Processo ${pid} finalizado`);
                }
                resolveKill();
              });
            });
          });
          
          Promise.all(killPromises).then(() => {
            console.log('✅ Todos os processos na porta 3000 foram finalizados');
            resolve();
          });
        } else {
          resolve();
        }
      } else {
        console.log('✅ Porta 3000 está livre');
        resolve();
      }
    });
  });
}

// Função para iniciar o servidor Next.js
function startNextDev() {
  console.log('🚀 Iniciando servidor Next.js...');
  
  const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000'], {
    stdio: 'inherit',
    shell: true
  });
  
  nextProcess.on('error', (error) => {
    console.error('❌ Erro ao iniciar Next.js:', error);
    process.exit(1);
  });
  
  nextProcess.on('close', (code) => {
    console.log(`📝 Next.js finalizado com código: ${code}`);
    process.exit(code);
  });
  
  // Capturar Ctrl+C para finalizar corretamente
  process.on('SIGINT', () => {
    console.log('\n🛑 Finalizando servidor...');
    nextProcess.kill('SIGINT');
  });
}

// Executar sequência
async function main() {
  try {
    await killPort3000();
    
    // Aguardar um pouco para garantir que a porta foi liberada
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    startNextDev();
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

main();
