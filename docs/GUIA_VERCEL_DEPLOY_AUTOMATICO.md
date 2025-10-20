# 🚀 GUIA COMPLETO: Como Arrumar Deploy Automático na Vercel

## 📋 **PASSO A PASSO DETALHADO**

### **PASSO 1: Acessar o Vercel Dashboard**
1. Abra o navegador e vá para: [vercel.com/dashboard](https://vercel.com/dashboard)
2. Faça login com sua conta (mesma conta do GitHub)
3. Procure pelo projeto **"ConfiLar"** na lista de projetos

---

### **PASSO 2: Verificar se o Projeto Existe**
- ✅ **Se o projeto existe:** Continue para o Passo 3
- ❌ **Se o projeto NÃO existe:** Vá para o Passo 7 (Criar Novo Projeto)

---

### **PASSO 3: Verificar Configuração do Git**
1. Clique no projeto **ConfiLar**
2. Vá na aba **"Settings"** (Configurações)
3. Clique em **"Git"** no menu lateral
4. Verifique se está conectado ao repositório correto:
   - **Repository:** `fabianoschmits/ConfiLar`
   - **Branch:** `master`
   - **Root Directory:** `/` (ou deixe vazio)

---

### **PASSO 4: Verificar Deployments (Deploys)**
1. Vá na aba **"Deployments"** (Deploys)
2. Verifique se há um deploy recente (de hoje)
3. **Se NÃO há deploy recente:**
   - Clique em **"Redeploy"** no último deploy
   - Ou clique em **"Deploy"** para fazer um novo deploy
4. **Se há deploy recente mas falhou:**
   - Clique no deploy que falhou
   - Veja os **logs de erro** na aba "Build Logs"

---

### **PASSO 5: Verificar Variáveis de Ambiente**
1. Vá em **Settings** → **Environment Variables**
2. Verifique se todas as variáveis do seu `.env` estão configuradas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Qualquer outra variável que você usa

---

### **PASSO 6: Reconfigurar Webhook (Se Necessário)**
1. Vá em **Settings** → **Git**
2. Clique em **"Disconnect"** (Desconectar)
3. Clique em **"Connect Git Repository"** (Conectar Repositório Git)
4. Selecione **"fabianoschmits/ConfiLar"**
5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `/` (deixe vazio)
   - **Build Command:** `npm run build` (deve aparecer automaticamente)
   - **Output Directory:** `.next` (deve aparecer automaticamente)
6. Clique em **"Deploy"**

---

### **PASSO 7: Criar Novo Projeto (Se Não Existe)**
1. Clique em **"Add New..."** → **"Project"**
2. Clique em **"Import Git Repository"**
3. Selecione **"fabianoschmits/ConfiLar"**
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `/` (deixe vazio)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. Clique em **"Deploy"**

---

### **PASSO 8: Verificar Build Logs**
1. Após fazer deploy, clique no deploy em andamento
2. Vá na aba **"Build Logs"**
3. Procure por erros como:
   - ❌ `Module not found`
   - ❌ `Environment variable missing`
   - ❌ `Build failed`
   - ❌ `TypeScript errors`

---

### **PASSO 9: Resolver Problemas Comuns**

#### **Problema 1: Variáveis de Ambiente Faltando**
```
Solução: Vá em Settings → Environment Variables e adicione todas as variáveis
```

#### **Problema 2: Build Falhando**
```
Solução: Verifique os logs de build e corrija os erros mostrados
```

#### **Problema 3: Webhook Não Funciona**
```
Solução: Desconecte e reconecte o repositório (Passo 6)
```

#### **Problema 4: Branch Errado**
```
Solução: Vá em Settings → Git e mude o branch para "master"
```

---

### **PASSO 10: Testar Deploy Automático**
1. Faça uma pequena alteração no código
2. Faça commit e push:
   ```bash
   git add .
   git commit -m "test: Teste deploy automático"
   git push origin master
   ```
3. Volte para a Vercel e verifique se um novo deploy foi iniciado automaticamente

---

## 🔧 **COMANDOS ÚTEIS PARA DEBUG**

### **Verificar Status do Git:**
```bash
git status
git log --oneline -3
git remote -v
```

### **Fazer Push Forçado (se necessário):**
```bash
git push origin master --force
```

### **Verificar se o Push Funcionou:**
```bash
git push origin master --dry-run
```

---

## 📞 **SE AINDA NÃO FUNCIONAR**

### **Opção 1: Deploy Manual**
1. Na Vercel, vá em **Deployments**
2. Clique em **"Deploy"**
3. Selecione o branch **"master"**
4. Clique em **"Deploy"**

### **Opção 2: Verificar GitHub Webhooks**
1. Vá para: [github.com/fabianoschmits/ConfiLar/settings/hooks](https://github.com/fabianoschmits/ConfiLar/settings/hooks)
2. Verifique se há webhook da Vercel
3. Se não houver, reconecte o repositório na Vercel

### **Opção 3: Contatar Suporte Vercel**
1. Vá em **Help** → **Support**
2. Descreva o problema
3. Inclua logs de erro se houver

---

## ✅ **CHECKLIST FINAL**

- [ ] Projeto existe na Vercel
- [ ] Repositório conectado corretamente
- [ ] Branch "master" configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Build funcionando localmente
- [ ] Deploy manual funcionando
- [ ] Webhook configurado no GitHub
- [ ] Deploy automático funcionando

---

## 🎯 **RESULTADO ESPERADO**

Após seguir todos os passos, você deve ter:
- ✅ Deploy automático funcionando
- ✅ Cada push para `master` gera um novo deploy
- ✅ Site atualizado automaticamente
- ✅ Logs de build funcionando

**Siga os passos na ordem e me informe em qual passo você está!** 🚀
