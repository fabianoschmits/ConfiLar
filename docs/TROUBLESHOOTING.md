# 🔧 TROUBLESHOOTING - CONFILAR

Guia de solução de problemas comuns do ConfiLar.

---

## 🐛 **ERRO: Cannot find module './XXXX.js'**

### **Sintomas:**
```
⨯ Error: Cannot find module './4985.js'
GET /_next/static/css/app/layout.css 404 (loop infinito)
NotificationProviderSimple: Renderizando múltiplas vezes
```

### **Causa:**
Cache corrompido do Next.js na pasta `.next`

### **Solução Rápida:**
```bash
# Opção 1: Script automático (RECOMENDADO)
npm run clean

# Opção 2: Manual
# 1. Parar o servidor (Ctrl+C)
# 2. Deletar pasta .next
Remove-Item -Recurse -Force .next

# 3. Reiniciar
npm run dev
```

### **Solução Completa (se a rápida não funcionar):**
```bash
# Limpar tudo e reinstalar
npm run clean:hard

# OU manualmente:
taskkill /F /IM node.exe
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache
npm install
npm run dev
```

---

## 🔄 **ERRO: Loop Infinito de Renderização**

### **Sintomas:**
```
🔔 NotificationProviderSimple: Renderizando com user: null (x100+)
Component rendering too many times
```

### **Causa:**
1. useEffect sem dependencies corretas
2. setState em loop
3. Cache corrompido

### **Solução:**
```bash
# 1. Verificar console logs
# 2. Limpar cache
npm run clean

# 3. Se persistir, verificar código:
# - useEffect dependencies
# - setState dentro de render
# - Infinite loops em hooks
```

---

## 📦 **ERRO: Module not found**

### **Sintomas:**
```
Module not found: Can't resolve '@/components/...'
```

### **Causa:**
1. Arquivo não existe
2. Typo no import
3. Cache do TypeScript

### **Solução:**
```bash
# 1. Verificar se arquivo existe
# 2. Verificar path no import
# 3. Reiniciar TypeScript Server (VSCode)
Ctrl+Shift+P -> "TypeScript: Restart TS Server"

# 4. Limpar cache
npm run clean
```

---

## 🎨 **ERRO: CSS não carrega (404)**

### **Sintomas:**
```
GET /_next/static/css/app/layout.css 404
Página sem estilização
```

### **Causa:**
Build incompleto ou cache corrompido

### **Solução:**
```bash
# Limpar e rebuild
npm run clean
npm run dev

# Se em produção:
npm run build
npm start
```

---

## 🔐 **ERRO: Supabase Auth**

### **Sintomas:**
```
Invalid JWT
Session expired
User not authenticated
```

### **Causa:**
1. Token expirado
2. Environment variables incorretas
3. RLS policies

### **Solução:**
```bash
# 1. Verificar .env
cat .env | Select-String SUPABASE

# 2. Fazer logout e login novamente
# 3. Verificar RLS policies no Supabase Dashboard
```

---

## 💾 **ERRO: Build Failed**

### **Sintomas:**
```
Error: Build failed
Type errors
Compilation errors
```

### **Solução:**
```bash
# 1. Verificar erros de tipo
npm run type-check

# 2. Limpar e rebuild
npm run clean
npm run build

# 3. Se persistir, verificar:
# - Imports incorretos
# - Tipos TypeScript
# - Dependências faltando
```

---

## 🌐 **ERRO: Port already in use**

### **Sintomas:**
```
Error: Port 3000 is already in use
```

### **Solução:**
```bash
# Opção 1: Matar processo na porta 3000
taskkill /F /PID $(Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Opção 2: Usar porta diferente
npm run dev:3001

# Opção 3: Matar todos os processos Node
taskkill /F /IM node.exe
```

---

## 📱 **ERRO: PWA não instala**

### **Sintomas:**
- Botão de instalação não aparece
- Prompt não mostra

### **Causa:**
1. HTTPS necessário (exceto localhost)
2. manifest.json inválido
3. Service Worker não registrado

### **Solução:**
```bash
# 1. Verificar console do navegador (F12)
# 2. Verificar Service Worker em Application > Service Workers
# 3. Verificar manifest.json em Application > Manifest

# 4. Forçar registro do SW:
# No console do navegador:
navigator.serviceWorker.register('/sw.js')
```

---

## 🔔 **ERRO: Push Notifications não funcionam**

### **Sintomas:**
- Permissão negada
- Subscription falha

### **Causa:**
1. VAPID key não configurada
2. Permissão negada pelo usuário
3. HTTPS necessário

### **Solução:**
```bash
# 1. Verificar VAPID key
echo $env:NEXT_PUBLIC_VAPID_PUBLIC_KEY

# 2. Limpar permissões do navegador:
# Chrome: Settings > Privacy > Site Settings > Notifications
# Edge: Settings > Cookies and site permissions > Notifications

# 3. Testar em localhost (sempre funciona)
```

---

## 🗃️ **ERRO: Supabase Connection**

### **Sintomas:**
```
Failed to fetch
Network error
```

### **Causa:**
1. URL ou key incorretas
2. Sem internet
3. Supabase fora do ar

### **Solução:**
```bash
# 1. Verificar environment variables
cat .env | Select-String SUPABASE

# 2. Testar conexão
curl https://oolqodaehouaidxuowtw.supabase.co

# 3. Verificar status do Supabase
# https://status.supabase.com
```

---

## 🧹 **COMANDOS ÚTEIS DE LIMPEZA**

```bash
# Limpeza leve (cache Next.js)
npm run clean

# Limpeza pesada (cache + reinstalar)
npm run clean:hard

# Limpeza manual completa
taskkill /F /IM node.exe
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .turbo
npm install
```

---

## 🔍 **DEBUG AVANÇADO**

### **Logs do Next.js:**
```bash
# Modo debug
$env:NODE_OPTIONS="--inspect"
npm run dev

# Abrir Chrome DevTools
chrome://inspect
```

### **Logs do Supabase:**
```typescript
// Em qualquer arquivo
import { supabase } from '@/lib/supabase'

// Ativar logs detalhados
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event)
  console.log('Session:', session)
})
```

### **Performance:**
```bash
# Analisar bundle
npm run analyze

# Abrir relatório no navegador
# .next/analyze/client.html
```

---

## 📞 **QUANDO PEDIR AJUDA**

Se nenhuma solução acima funcionar:

1. **Coletar informações:**
   - Mensagem de erro completa
   - Stack trace
   - Console do navegador (F12)
   - Versão do Node: `node -v`
   - Versão do npm: `npm -v`

2. **Verificar:**
   - Último commit funcional: `git log`
   - Mudanças recentes: `git diff`

3. **Reverter temporariamente:**
   ```bash
   git stash
   npm run dev
   # Se funcionar, problema está nas mudanças recentes
   ```

---

## ✅ **CHECKLIST DE SAÚDE DO PROJETO**

```bash
# ✅ Node.js e npm instalados
node -v  # v18.x ou superior
npm -v   # v9.x ou superior

# ✅ Environment variables configuradas
cat .env | Select-String "NEXT_PUBLIC"

# ✅ Dependencies instaladas
Test-Path node_modules  # Should return True

# ✅ Build funciona
npm run build

# ✅ Tipos corretos
npm run type-check

# ✅ Dev server inicia
npm run dev
```

---

## 🎯 **PREVENÇÃO DE ERROS**

### **Boas Práticas:**

1. **Sempre usar TypeScript corretamente**
2. **Limpar cache regularmente** (`npm run clean`)
3. **Fazer commits pequenos e frequentes**
4. **Testar antes de commit** (`npm run build`)
5. **Manter dependencies atualizadas** (`npm outdated`)

### **Git Workflow:**
```bash
# Antes de fazer mudanças grandes:
git checkout -b feature/nova-funcionalidade

# Testar:
npm run build
npm run type-check

# Se funcionar:
git add .
git commit -m "feat: nova funcionalidade"

# Se quebrar:
git reset --hard
```

---

**Atualizado em:** 14/10/2025  
**Versão do Guia:** 1.0.0

