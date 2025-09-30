# 🚀 Deploy Rápido na Vercel

## ⚡ Configuração em 3 Passos

### 1. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

### 2. **Fazer Login**
```bash
vercel login
```

### 3. **Deploy Automático**
```bash
# Deploy de produção
vercel --prod

# Ou usar o script PowerShell
.\scripts\deploy-vercel.ps1
```

## 🔧 Configuração Avançada

### **Via API (Automático)**
```bash
# Configurar token
export VERCEL_TOKEN=seu_token_aqui

# Executar configuração
node scripts/setup-vercel-api.js
```

### **Via Painel Web**
1. Acesse: https://vercel.com/dashboard
2. Clique em "New Project"
3. Conecte: `fabianoschmits/ConfiLar`
4. Configure variáveis de ambiente
5. Ative deploy automático

## 📋 Variáveis de Ambiente Necessárias

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

## 🎯 Resultado

Após a configuração:
- ✅ **Deploy automático** a cada push no master
- ✅ **URL automática** do deploy
- ✅ **Monitoramento** no painel da Vercel
- ✅ **Logs** de deploy em tempo real

## 🔗 Links Úteis

- **Painel Vercel**: https://vercel.com/dashboard
- **Projeto**: https://vercel.com/dashboard/project/prj_wwrl6rRVZr1U49EwADwkrbLgc8Wd
- **Documentação**: https://vercel.com/docs
