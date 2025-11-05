# 🌟 IMPLEMENTAÇÃO: CLASSIFICADOS PREMIUM

## 📋 RESUMO

Implementado sistema completo de classificados premium, similar aos posts premium, permitindo que usuários destaquem seus anúncios usando ConfiPoints.

---

## ✅ O QUE FOI IMPLEMENTADO

### 1. **Banco de Dados** ✅
- Script SQL para adicionar colunas premium na tabela `classified_ads`
- Colunas adicionadas:
  - `is_premium` (BOOLEAN) - Indica se é premium
  - `is_featured` (BOOLEAN) - Indica se deve aparecer destacado
  - `premium_points_spent` (INTEGER) - Pontos gastos
  - `premium_expires_at` (TIMESTAMP) - Data de expiração
  - `premium_highlight_color` (VARCHAR) - Cor de destaque
  - `images` (TEXT[]) - Array de URLs de imagens
  - `price_range` (VARCHAR) - Faixa de preço
  - `contact_phone` (VARCHAR) - Telefone de contato
  - `contact_email` (VARCHAR) - Email de contato
- Índices para performance
- Função PostgreSQL para desativar classificados premium expirados

### 2. **Hook usePremiumAd** ✅
- Atualizado para usar tabela `classified_ads` (não `classifieds`)
- Validação de saldo de pontos
- Criação de anúncio premium com todos os campos necessários
- Dedução automática de pontos
- Expiração automática após 30 dias

### 3. **Hook useClassifiedSearch** ✅
- Atualizado para incluir todos os campos premium
- Ordenação: Premium primeiro, depois Featured, depois por data
- Verificação automática de expiração
- Filtragem de classificados premium expirados

### 4. **Página de Classificados** ✅
- Exibição de classificados premium usando `PremiumAdCard`
- Classificados premium aparecem primeiro na lista
- Estilo visual diferenciado (borda dourada, gradiente)
- Suporte completo para imagens, preço, contato

### 5. **Formulário Premium** ✅
- `PremiumAdForm` já existia e foi atualizado
- Validação de campos obrigatórios
- Suporte para imagens (até 15 fotos)
- Integração completa com sistema de pontos

### 6. **CRON Job** ✅
- Rota API: `/api/cron/expired-premium-classifieds`
- Desativa automaticamente classificados premium expirados
- Configuração Vercel Cron (executa a cada hora)
- Suporte para autenticação via secret header

---

## 🗄️ PRÓXIMOS PASSOS - APLICAR NO BANCO DE DADOS

### PASSO 1: Executar Script SQL

Execute o script `scripts/add-premium-columns-classified-ads.sql` no Supabase Dashboard:

1. Acesse: https://supabase.com/dashboard/project/oolqodaehouaidxuowtw
2. Vá em: **SQL Editor**
3. Cole o conteúdo do arquivo `scripts/add-premium-columns-classified-ads.sql`
4. Execute o script

**Arquivo:** `scripts/add-premium-columns-classified-ads.sql`

### PASSO 2: Configurar CRON (Opcional)

O CRON job está configurado no `vercel.json`. Para funcionar, você pode:

**Opção A: Vercel Cron** (recomendado se usar Vercel)
- Já configurado no `vercel.json`
- Executa automaticamente a cada hora
- Adicione `CRON_SECRET` nas variáveis de ambiente do Vercel

**Opção B: Serviço Externo**
- Configure um serviço como:
  - GitHub Actions
  - EasyCron
  - Cron-job.org
- Faça uma requisição GET/POST para:
  ```
  https://seu-dominio.com/api/cron/expired-premium-classifieds
  ```
- Configure para executar a cada hora (0 * * * *)

---

## 🧪 TESTAR O SISTEMA

### 1. Testar Criação de Classificado Premium

```bash
# 1. Faça login no sistema
# 2. Vá para /classificados
# 3. Clique em "Anúncio Premium"
# 4. Preencha o formulário
# 5. Verifique se os pontos foram debitados
# 6. Verifique se o anúncio aparece com estilo premium
```

### 2. Testar CRON Job Manualmente

```bash
# Teste local (desenvolvimento)
curl http://localhost:3000/api/cron/expired-premium-classifieds

# Teste em produção (com secret, se configurado)
curl -H "Authorization: Bearer SEU_SECRET" \
  https://seu-dominio.com/api/cron/expired-premium-classifieds
```

### 3. Verificar Banco de Dados

```sql
-- Verificar classificados premium ativos
SELECT 
  id,
  title,
  is_premium,
  is_featured,
  premium_points_spent,
  premium_expires_at,
  is_active
FROM classified_ads
WHERE is_premium = true
ORDER BY premium_expires_at DESC;

-- Verificar classificados premium expirados (devem estar desativados)
SELECT 
  id,
  title,
  is_premium,
  is_active,
  premium_expires_at,
  updated_at
FROM classified_ads
WHERE is_premium = true
  AND premium_expires_at < NOW();
```

---

## 📊 ESTRUTURA DE DADOS

### Classificado Premium
- **Custo:** 5.000 pontos (R$ 50,00)
- **Duração:** 30 dias
- **Destaque:** Aparece no topo da lista
- **Visual:** Borda dourada, gradiente amarelo
- **Features:**
  - Prioridade no feed
  - Alcance ampliado (5x maior visibilidade)
  - Badge premium
  - Duração estendida (30 dias vs 7 dias normal)

### Classificado Normal
- **Custo:** Grátis
- **Duração:** Indefinida (até desativado)
- **Posição:** Ordenado por data

---

## 🔧 ARQUIVOS MODIFICADOS/CRIADOS

### Arquivos Criados
- ✅ `scripts/add-premium-columns-classified-ads.sql` - Script SQL
- ✅ `scripts/verificar-classified-ads-structure.js` - Script de verificação
- ✅ `src/app/api/cron/expired-premium-classifieds/route.ts` - CRON job
- ✅ `vercel.json` - Configuração de CRON (se usar Vercel)

### Arquivos Modificados
- ✅ `src/hooks/usePremiumAd.ts` - Corrigido para usar `classified_ads`
- ✅ `src/hooks/useClassifiedSearch.ts` - Adicionado suporte premium
- ✅ `src/app/classificados/page.tsx` - Exibição de premium primeiro
- ✅ `src/components/classifieds/PremiumAdForm.tsx` - Validação melhorada

---

## 🎨 DESIGN E UX

### Visual Premium
- Borda dourada com gradiente
- Fundo com gradiente amarelo sutil
- Badge premium com ícone de coroa
- Título com gradiente dourado
- Sombra especial para destacar

### Componente PremiumAdCard
- Já existia e está funcionando
- Exibe imagens, preço, contato
- Integração com chat
- Suporte para reportar

---

## ⚠️ IMPORTANTE

1. **Execute o script SQL primeiro** antes de testar o sistema
2. **Verifique as colunas** no banco de dados após executar o script
3. **Configure o CRON** para desativar automaticamente os expirados
4. **Teste com Service Role Key** se necessário para verificar o banco

---

## 📝 NOTAS TÉCNICAS

- O sistema segue o mesmo padrão dos posts premium
- Expiração automática após 30 dias
- Classificados premium aparecem primeiro na lista
- CRON job desativa automaticamente os expirados (não deleta)
- Compatível com sistema de pontos existente

---

## ✅ CHECKLIST FINAL

- [x] Script SQL criado
- [x] Hook usePremiumAd atualizado
- [x] Hook useClassifiedSearch atualizado
- [x] Página de classificados atualizada
- [x] CRON job criado
- [x] Build passou com sucesso
- [ ] **Executar script SQL no Supabase** ⚠️
- [ ] **Configurar CRON job** ⚠️
- [ ] **Testar criação de classificado premium** ⚠️
- [ ] **Testar expiração automática** ⚠️

---

**Status:** ✅ Código completo e pronto para teste após executar o script SQL!




