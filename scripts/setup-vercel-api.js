#!/usr/bin/env node

/**
 * Script para configurar deploy automático na Vercel via API
 * Usa a API da Vercel para conectar o repositório e configurar deploy contínuo
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configurações
const VERCEL_API_TOKEN = process.env.VERCEL_TOKEN || 'seu_token_aqui';
const PROJECT_ID = 'prj_wwrl6rRVZr1U49EwADwkrbLgc8Wd';
const GITHUB_REPO = 'fabianoschmits/ConfiLar';
const GITHUB_BRANCH = 'master';

// Função para fazer requisições à API da Vercel
function makeVercelRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Função para verificar se o projeto existe
async function checkProject() {
  console.log('🔍 Verificando projeto na Vercel...');
  
  try {
    const response = await makeVercelRequest(`/v9/projects/${PROJECT_ID}`);
    
    if (response.status === 200) {
      console.log('✅ Projeto encontrado:', response.data.name);
      return response.data;
    } else {
      console.log('❌ Projeto não encontrado ou erro:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar projeto:', error.message);
    return null;
  }
}

// Função para conectar repositório GitHub
async function connectGitHubRepo() {
  console.log('🔗 Conectando repositório GitHub...');
  
  const data = {
    type: 'github',
    repo: GITHUB_REPO,
    repoId: GITHUB_REPO,
    productionBranch: GITHUB_BRANCH
  };

  try {
    const response = await makeVercelRequest(`/v9/projects/${PROJECT_ID}/link`, 'POST', data);
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Repositório conectado com sucesso!');
      return response.data;
    } else {
      console.log('❌ Erro ao conectar repositório:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao conectar repositório:', error.message);
    return null;
  }
}

// Função para configurar variáveis de ambiente
async function setupEnvironmentVariables() {
  console.log('🔧 Configurando variáveis de ambiente...');
  
  const envVars = [
    {
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      value: process.env.NEXT_PUBLIC_SUPABASE_URL || 'sua_url_supabase',
      type: 'encrypted',
      target: ['production', 'preview']
    },
    {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sua_chave_anon',
      type: 'encrypted',
      target: ['production', 'preview']
    }
  ];

  for (const envVar of envVars) {
    try {
      const response = await makeVercelRequest(
        `/v9/projects/${PROJECT_ID}/env`,
        'POST',
        envVar
      );
      
      if (response.status === 200 || response.status === 201) {
        console.log(`✅ Variável ${envVar.key} configurada`);
      } else {
        console.log(`❌ Erro ao configurar ${envVar.key}:`, response.data);
      }
    } catch (error) {
      console.error(`❌ Erro ao configurar ${envVar.key}:`, error.message);
    }
  }
}

// Função para criar deploy
async function createDeploy() {
  console.log('🚀 Criando deploy...');
  
  try {
    const response = await makeVercelRequest(`/v13/deployments`, 'POST', {
      name: 'ConfiLar',
      project: PROJECT_ID,
      gitSource: {
        type: 'github',
        repo: GITHUB_REPO,
        ref: GITHUB_BRANCH
      },
      target: 'production'
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Deploy criado com sucesso!');
      console.log('🌐 URL do deploy:', response.data.url);
      return response.data;
    } else {
      console.log('❌ Erro ao criar deploy:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao criar deploy:', error.message);
    return null;
  }
}

// Função para configurar webhook de deploy
async function setupDeployWebhook() {
  console.log('🔗 Configurando webhook de deploy...');
  
  try {
    const response = await makeVercelRequest(`/v1/integrations/deploy-hooks`, 'POST', {
      name: 'ConfiLar Auto Deploy',
      url: `https://api.vercel.com/v1/integrations/deploy/${PROJECT_ID}`,
      projectId: PROJECT_ID
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Webhook configurado!');
      console.log('🔗 URL do webhook:', response.data.url);
      return response.data;
    } else {
      console.log('❌ Erro ao configurar webhook:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao configurar webhook:', error.message);
    return null;
  }
}

// Função principal
async function main() {
  console.log('🚀 Configurando deploy automático na Vercel...');
  console.log(`📁 Projeto ID: ${PROJECT_ID}`);
  console.log(`🔗 Repositório: ${GITHUB_REPO}`);
  console.log(`🌿 Branch: ${GITHUB_BRANCH}`);
  console.log('');

  // Verificar se o token está configurado
  if (VERCEL_API_TOKEN === 'seu_token_aqui') {
    console.log('❌ Configure o token da Vercel:');
    console.log('   export VERCEL_TOKEN=seu_token_aqui');
    console.log('');
    console.log('   Ou crie um arquivo .env com:');
    console.log('   VERCEL_TOKEN=seu_token_aqui');
    return;
  }

  try {
    // 1. Verificar projeto
    const project = await checkProject();
    if (!project) {
      console.log('❌ Não foi possível verificar o projeto');
      return;
    }

    // 2. Conectar repositório
    const repoConnection = await connectGitHubRepo();
    if (!repoConnection) {
      console.log('❌ Não foi possível conectar o repositório');
      return;
    }

    // 3. Configurar variáveis de ambiente
    await setupEnvironmentVariables();

    // 4. Criar deploy
    const deploy = await createDeploy();
    if (!deploy) {
      console.log('❌ Não foi possível criar o deploy');
      return;
    }

    // 5. Configurar webhook
    const webhook = await setupDeployWebhook();

    console.log('');
    console.log('🎉 Configuração concluída!');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('1. Configure as variáveis de ambiente no painel da Vercel');
    console.log('2. Faça push para o branch master para deploy automático');
    console.log('3. Acesse o painel da Vercel para monitorar os deploys');
    console.log('');
    console.log('🔗 Links úteis:');
    console.log(`   - Projeto: https://vercel.com/dashboard/project/${PROJECT_ID}`);
    console.log(`   - Deploy: ${deploy.url || 'Verificar no painel'}`);
    if (webhook) {
      console.log(`   - Webhook: ${webhook.url}`);
    }

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  checkProject,
  connectGitHubRepo,
  setupEnvironmentVariables,
  createDeploy,
  setupDeployWebhook
};
