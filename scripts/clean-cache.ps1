# =====================================================
# SCRIPT DE LIMPEZA DE CACHE - CONFILAR
# Remove caches corrompidos do Next.js
# =====================================================

Write-Host "🧹 Limpando cache do ConfiLar..." -ForegroundColor Cyan

# Parar processos Node.js
Write-Host "⏸️  Parando processos Node.js..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null

# Limpar pasta .next
Write-Host "🗑️  Removendo pasta .next..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Pasta .next removida" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Pasta .next não existe" -ForegroundColor Gray
}

# Limpar cache do Next.js
Write-Host "🗑️  Limpando cache do Next.js..." -ForegroundColor Yellow
if (Test-Path .next/cache) {
    Remove-Item -Recurse -Force .next/cache
    Write-Host "✅ Cache do Next.js removido" -ForegroundColor Green
}

# Opcional: Limpar node_modules/.cache
Write-Host "🗑️  Limpando node_modules/.cache..." -ForegroundColor Yellow
if (Test-Path node_modules/.cache) {
    Remove-Item -Recurse -Force node_modules/.cache
    Write-Host "✅ Cache do node_modules removido" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Limpeza concluída com sucesso!" -ForegroundColor Green
Write-Host "🚀 Execute 'npm run dev' para reiniciar o servidor" -ForegroundColor Cyan

