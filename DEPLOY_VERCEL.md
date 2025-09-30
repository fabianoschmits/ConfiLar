# 🚀 Deploy Automático na Vercel

## 📋 Configuração do Deploy Automático

### 1. **Configurar Token da Vercel**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Ou usar token de API
export VERCEL_TOKEN=seu_token_aqui
```

### 2. **Conectar Repositório GitHub**

1. Acesse: https://vercel.com/dashboard
2. Clique em "New Project"
3. Conecte o repositório: `fabianoschmits/ConfiLar`
4. Configure o projeto ID: `prj_wwrl6rRVZr1U49EwADwkrbLgc8Wd`

### 3. **Configurar Variáveis de Ambiente**

No painel da Vercel, adicione as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### 4. **Ativar Deploy Automático**

1. No painel do projeto, vá em "Settings"
2. Em "Git", configure:
   - **Production Branch**: `master`
   - **Auto Deploy**: ✅ Ativado
   - **Preview Deployments**: ✅ Ativado

### 5. **Scripts de Deploy**

#### Deploy Manual:
```bash
# Deploy de produção
vercel --prod

# Deploy de preview
vercel
```

#### Deploy Automático via Script:
```bash
# Tornar executável
chmod +x scripts/deploy-vercel.sh

# Executar deploy
./scripts/deploy-vercel.sh
```

#### Deploy via API:
```bash
# Configurar token
export VERCEL_TOKEN=seu_token_aqui

# Executar script Node.js
node scripts/setup-vercel-deploy.js
```

### 6. **Configuração do GitHub Actions (Opcional)**

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: prj_wwrl6rRVZr1U49EwADwkrbLgc8Wd
          working-directory: ./
```

### 7. **Monitoramento**

- **Dashboard**: https://vercel.com/dashboard/project/prj_wwrl6rRVZr1U49EwADwkrbLgc8Wd
- **Logs**: Acesse o projeto > Deployments > [deploy específico]
- **Domínio**: Configurado automaticamente pela Vercel

### 8. **Troubleshooting**

#### Erro de Build:
```bash
# Verificar logs
vercel logs [deployment-url]

# Fazer build local
npm run build
```

#### Erro de Variáveis:
1. Verificar se todas as variáveis estão configuradas
2. Verificar se os valores estão corretos
3. Fazer redeploy após alterar variáveis

#### Erro de Deploy:
```bash
# Verificar status
vercel ls

# Fazer deploy forçado
vercel --prod --force
```

### 9. **Comandos Úteis**

```bash
# Status do projeto
vercel ls

# Logs do deploy
vercel logs [deployment-url]

# Remover deploy
vercel remove [deployment-url]

# Configurar domínio
vercel domains add confilar.com
```

### 10. **Configuração Avançada**

#### Deploy Hooks:
```bash
# Criar webhook
curl -X POST "https://api.vercel.com/v1/integrations/deploy-hooks" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -d '{"name": "ConfiLar Deploy", "url": "https://api.vercel.com/v1/integrations/deploy/prj_wwrl6rRVZr1U49EwADwkrbLgc8Wd"}'
```

#### Configuração de Domínio:
```bash
# Adicionar domínio personalizado
vercel domains add confilar.com
vercel domains add www.confilar.com
```

## 🎯 Resultado Final

Após a configuração, cada push para o branch `master` irá:

1. ✅ **Trigger automático** do deploy
2. ✅ **Build automático** do projeto
3. ✅ **Deploy automático** para produção
4. ✅ **Notificação** de status do deploy
5. ✅ **URL automática** do deploy

## 📞 Suporte

- **Documentação Vercel**: https://vercel.com/docs
- **API Vercel**: https://vercel.com/docs/rest-api
- **GitHub Actions**: https://docs.github.com/en/actions
