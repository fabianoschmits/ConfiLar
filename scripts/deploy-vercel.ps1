# Script PowerShell para deploy automático na Vercel
# Execute: .\scripts\deploy-vercel.ps1

Write-Host "🚀 Iniciando deploy automático na Vercel..." -ForegroundColor Green

# Verificar se o Node.js está instalado
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o npm está instalado
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm não encontrado. Instale o npm primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o Vercel CLI está instalado
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Verificar se está logado na Vercel
Write-Host "🔍 Verificando login na Vercel..." -ForegroundColor Yellow
$vercelWhoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔐 Faça login na Vercel:" -ForegroundColor Yellow
    vercel login
}

# Verificar se o projeto existe
Write-Host "🔍 Verificando projeto..." -ForegroundColor Yellow
$PROJECT_ID = "prj_wwrl6rRVZr1U49EwADwkrbLgc8Wd"

# Fazer build local primeiro
Write-Host "🔨 Fazendo build local..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build local. Corrija os erros antes de fazer deploy." -ForegroundColor Red
    exit 1
}

# Fazer deploy
Write-Host "🚀 Fazendo deploy..." -ForegroundColor Yellow
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "🌐 Acesse o painel da Vercel para ver o status:" -ForegroundColor Cyan
    Write-Host "   https://vercel.com/dashboard/project/$PROJECT_ID" -ForegroundColor Blue
    
    Write-Host ""
    Write-Host "📋 Para configurar deploy automático:" -ForegroundColor Yellow
    Write-Host "1. Conecte o repositório GitHub no painel da Vercel" -ForegroundColor White
    Write-Host "2. Configure as variáveis de ambiente" -ForegroundColor White
    Write-Host "3. Ative o deploy automático para o branch master" -ForegroundColor White
    
    Write-Host ""
    Write-Host "🔗 Links úteis:" -ForegroundColor Yellow
    Write-Host "   - Painel Vercel: https://vercel.com/dashboard" -ForegroundColor Blue
    Write-Host "   - Projeto: https://vercel.com/dashboard/project/$PROJECT_ID" -ForegroundColor Blue
} else {
    Write-Host "❌ Erro no deploy. Verifique os logs acima." -ForegroundColor Red
    exit 1
}
