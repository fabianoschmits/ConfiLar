#!/bin/bash

# Script para deploy automático na Vercel
# Execute: chmod +x scripts/deploy-vercel.sh && ./scripts/deploy-vercel.sh

echo "🚀 Iniciando deploy automático na Vercel..."

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Verificar se está logado na Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Faça login na Vercel:"
    vercel login
fi

# Verificar se o projeto existe
echo "🔍 Verificando projeto..."
PROJECT_ID="prj_wwrl6rRVZr1U49EwADwkrbLgc8Wd"

# Fazer deploy
echo "🚀 Fazendo deploy..."
vercel --prod --yes

# Verificar status do deploy
echo "✅ Deploy concluído!"
echo "🌐 Acesse o painel da Vercel para ver o status:"
echo "   https://vercel.com/dashboard/project/$PROJECT_ID"

echo ""
echo "📋 Para configurar deploy automático:"
echo "1. Conecte o repositório GitHub no painel da Vercel"
echo "2. Configure as variáveis de ambiente"
echo "3. Ative o deploy automático para o branch master"
echo ""
echo "🔗 Links úteis:"
echo "   - Painel Vercel: https://vercel.com/dashboard"
echo "   - Projeto: https://vercel.com/dashboard/project/$PROJECT_ID"
