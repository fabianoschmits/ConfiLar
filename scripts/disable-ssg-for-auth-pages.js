const fs = require('fs');
const path = require('path');

// Lista de páginas que usam useAuthContext
const authPages = [
  'src/app/dashboard/page.tsx',
  'src/app/portfolio/page.tsx',
  'src/app/avaliacoes/page.tsx',
  'src/app/editarperfil/page.tsx',
  'src/app/alterar-email/page.tsx',
  'src/app/recuperar-senha/page.tsx',
  'src/app/nova-senha/page.tsx',
  'src/app/logout/page.tsx',
  'src/app/classificados/page.tsx',
  'src/app/acordo/[id]/page.tsx',
  'src/app/sobre/page.tsx',
  'src/app/ajuda/page.tsx',
  'src/app/reautenticacao/page.tsx',
  'src/app/teste-notificacoes/page.tsx',
  'src/app/admin/monitor/page.tsx',
  'src/app/admin/notificacoes/page.tsx',
  'src/app/perfil/[id]/page.tsx',
  'src/app/home/page.tsx',
  'src/app/feed/page.tsx',
  'src/app/not-found.tsx'
];

function addDynamicExport(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`Arquivo não encontrado: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar se já tem export const dynamic
    if (content.includes('export const dynamic')) {
      console.log(`Já tem dynamic export: ${filePath}`);
      return;
    }

    // Adicionar export const dynamic = 'force-dynamic' após 'use client'
    if (content.includes("'use client'")) {
      content = content.replace(
        /('use client')/,
        "$1\n\n// Desabilitar SSG para esta página\nexport const dynamic = 'force-dynamic'"
      );
    } else {
      // Se não tem 'use client', adicionar no início
      content = "'use client'\n\n// Desabilitar SSG para esta página\nexport const dynamic = 'force-dynamic'\n\n" + content;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Adicionado dynamic export: ${filePath}`);
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

// Processar todas as páginas
console.log('🚀 Desabilitando SSG para páginas que usam useAuthContext...\n');

authPages.forEach(addDynamicExport);

console.log('\n✅ Processamento concluído!');







