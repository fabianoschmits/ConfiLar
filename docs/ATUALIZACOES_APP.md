# 🔄 Como Fazer Atualizações no App

## 🎯 Visão Geral

Como o ConfiLar é um **PWA (Progressive Web App)** empacotado como app nativo, existem **DOIS tipos de atualizações**:

1. **Atualizações Automáticas** (sem enviar para loja) ⚡
2. **Atualizações da Loja** (requer upload novo) 📦

---

## ⚡ Tipo 1: Atualizações Automáticas (RECOMENDADO)

### **Como Funciona:**

O app nativo é apenas um "container" que carrega seu site. Quando você atualiza o site, **o app atualiza automaticamente**!

```
Site atualizado → App atualiza sozinho (em segundos!)
```

### **O que Atualiza Automaticamente:**

✅ **SIM - Atualiza Sozinho:**
- Conteúdo das páginas
- Textos e imagens
- Funcionalidades novas
- Correções de bugs
- Estilos (CSS)
- Lógica de negócio (JavaScript)
- APIs e integrações
- Dados do banco (Supabase)

❌ **NÃO - Precisa Atualizar na Loja:**
- Nome do app
- Ícone do app
- Cores do tema (splash screen)
- Permissões novas (câmera, localização, etc)
- Deep links novos
- Push notifications (configuração)

### **Processo de Atualização Automática:**

```bash
# 1. Fazer alterações no código
git add .
git commit -m "feat: Nova funcionalidade X"
git push

# 2. Deploy em produção (Vercel, Netlify, etc)
# O site atualiza automaticamente

# 3. Service Worker detecta mudanças
# App atualiza sozinho na próxima vez que abrir!
```

### **Exemplo Prático:**

```javascript
// Você adiciona uma nova funcionalidade no site:
// src/app/novafuncao/page.tsx

export default function NovaFuncao() {
  return <div>Nova Funcionalidade Incrível!</div>
}

// Após deploy:
// 1. Usuários abrem o app
// 2. Service Worker detecta atualização
// 3. Download automático do novo conteúdo
// 4. Usuário vê a nova funcionalidade!
```

### **Forçar Atualização Imediata:**

No seu Service Worker (`public/sw.js`), já temos:

```javascript
// Atualização automática do Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting() // Ativa nova versão imediatamente
})

self.addEventListener('activate', (event) => {
  return self.clients.claim() // Assume controle imediato
})
```

### **Notificar Usuário Sobre Atualização:**

Você pode adicionar um toast/banner no app:

```typescript
// src/components/PWAUpdateNotification.tsx (já existe!)
// Mostra: "Nova versão disponível! Recarregar?"
```

---

## 📦 Tipo 2: Atualização na Loja (Quando Necessário)

### **Quando Precisa Atualizar na Loja:**

1. **Mudança de Ícone**
   - Novo logo/ícone do app
   - Cores do tema alteradas

2. **Novas Permissões**
   - Adicionar acesso à câmera
   - Adicionar geolocalização
   - Adicionar notificações

3. **Mudança de Nome**
   - "ConfiLar" → "ConfiLar Pro"

4. **Deep Links Novos**
   - Adicionar novos paths no assetlinks.json

5. **Correção Crítica no Container Nativo**
   - Bugs específicos do TWA (raro)

---

## 🔄 Processo de Atualização na Loja

### **Passo 1: Incrementar Versão**

#### **Para Android:**

No PWABuilder, ao gerar novo pacote:

```
Version Code: 2 (era 1, agora 2, 3, 4...)
Version Name: 1.1.0 (era 1.0.0)
```

**Regras de versionamento:**
```
1.0.0 → Lançamento inicial
1.1.0 → Funcionalidade nova
1.0.1 → Correção de bug
2.0.0 → Mudança grande
```

#### **Para iOS:**

No Xcode:

```
Version: 1.1.0
Build: 2
```

### **Passo 2: Gerar Novo Pacote**

#### **Android (PWABuilder):**

1. Acessar https://www.pwabuilder.com
2. Inserir URL do site: `https://confilar.com.br`
3. Clicar em "Package for Stores" → Android
4. **IMPORTANTE: Usar as MESMAS configurações:**
   - Package ID: `com.confilar.app` (NÃO MUDAR!)
   - App Name: `ConfiLar` (pode mudar)
   - **Version Code: 2** (incrementar)
   - **Version Name: 1.1.0** (incrementar)
5. **Usar a MESMA KEYSTORE** (ou não funcionará!)
6. Download do novo `.aab`

#### **iOS (Xcode):**

1. Abrir projeto gerado pelo PWABuilder
2. Product → Archive
3. Distribuir para App Store

### **Passo 3: Upload na Loja**

#### **Google Play Store:**

1. Acessar https://play.google.com/console
2. Selecionar app "ConfiLar"
3. **Produção** → **Criar nova versão**
4. Upload do novo arquivo `.aab`
5. **O que mudou (Release Notes):**

```
Novidades na versão 1.1.0:
- Nova funcionalidade de agendamento
- Melhorias no chat
- Correções de bugs
```

6. Enviar para revisão
7. Aguardar aprovação (1-7 dias)

#### **Apple App Store:**

1. App Store Connect
2. Meu App → + Versão
3. Adicionar build do Xcode
4. Release notes
5. Enviar para revisão
6. Aguardar (24-48 horas)

---

## 🚀 Estratégia Recomendada

### **90% das Atualizações: AUTOMÁTICAS**

```
Site atualizado → Usuários recebem atualização automaticamente
Sem precisar ir na loja!
```

**Vantagens:**
- ⚡ Instantâneo (sem aprovação da loja)
- 🎯 100% dos usuários atualizam
- 💰 Sem custos adicionais
- 🔄 Pode atualizar várias vezes por dia

### **10% das Atualizações: LOJA**

```
Mudança no ícone/permissões → Gerar novo pacote → Enviar para loja
```

**Quando usar:**
- Mudança visual grande (ícone, cores)
- Novas permissões do sistema
- Correções críticas do container nativo

---

## 📋 Checklist de Atualização

### **Atualização Automática (Site):**

```bash
# 1. Desenvolvimento
- [ ] Fazer alterações no código
- [ ] Testar localmente
- [ ] Commit e push

# 2. Deploy
- [ ] Deploy em produção (Vercel/Netlify)
- [ ] Aguardar deploy completar
- [ ] Verificar se site está atualizado

# 3. Verificação
- [ ] Abrir app no celular
- [ ] Fechar e reabrir (força atualização)
- [ ] Verificar nova funcionalidade
```

### **Atualização na Loja (Raro):**

```bash
# 1. Preparação
- [ ] Incrementar versão (1.0.0 → 1.1.0)
- [ ] Atualizar changelog/release notes
- [ ] Ter keystore salva (Android)

# 2. Build
- [ ] Gerar novo pacote no PWABuilder
- [ ] Usar mesma keystore
- [ ] Download do .aab/.ipa

# 3. Loja
- [ ] Upload na Google Play/App Store
- [ ] Preencher "O que mudou"
- [ ] Enviar para revisão

# 4. Aguardar
- [ ] Aprovação Google (1-7 dias)
- [ ] Aprovação Apple (1-2 dias)
- [ ] Publicação automática
```

---

## ⚡ Exemplos Práticos

### **Exemplo 1: Adicionar Nova Funcionalidade**

```bash
# Você adiciona um sistema de agendamento

# 1. Desenvolver localmente
git checkout -b feature/agendamento
# ... código ...
git commit -m "feat: Sistema de agendamento"
git push

# 2. Deploy em produção
git checkout master
git merge feature/agendamento
git push origin master
# Vercel/Netlify faz deploy automaticamente

# 3. Usuários recebem atualização
# Sem fazer NADA na loja! 🎉
```

### **Exemplo 2: Mudar Ícone do App**

```bash
# Você quer trocar o logo

# 1. Criar novos ícones
# - Gerar em todos os tamanhos
# - Substituir em public/

# 2. Atualizar manifest.json (se necessário)

# 3. Deploy do site (atualização automática)

# 4. Gerar NOVO PACOTE no PWABuilder
# - Version Code: 2
# - Version Name: 1.1.0
# - Mesma keystore!

# 5. Upload na Google Play
# - Nova versão com ícone atualizado
# - Aguardar aprovação
```

### **Exemplo 3: Adicionar Câmera (Nova Permissão)**

```bash
# Você quer permitir upload de fotos da câmera

# 1. Adicionar permissão no código (se já não tiver)
# Android: Já tem no manifest padrão
# iOS: Adicionar no Info.plist

# 2. Implementar funcionalidade no site
# ... código de upload ...

# 3. Deploy do site (funcionalidade já funciona!)

# 4. Se quiser mostrar na loja que tem câmera:
# - Gerar novo pacote (versão 1.1.0)
# - Upload na loja
# - Mencionar nas release notes
```

---

## 🔔 Notificações de Atualização

### **Avisar Usuários no App:**

```typescript
// src/components/pwa/PWAUpdateNotification.tsx
// (já implementado!)

"Nova versão disponível! 
Recarregue para ver as novidades."

[Atualizar Agora] [Depois]
```

### **Push Notification:**

```typescript
// Enviar push quando atualizar
await NotificationService.sendPushNotification({
  title: "ConfiLar Atualizado! 🎉",
  message: "Nova funcionalidade: Sistema de Agendamento",
  url: "/novidades"
})
```

---

## 📊 Monitoramento de Atualizações

### **Analytics:**

```javascript
// Rastrear versão que usuário está usando
gtag('event', 'app_version', {
  'version': '1.1.0',
  'build': '2'
})

// Rastrear atualizações
gtag('event', 'app_updated', {
  'old_version': '1.0.0',
  'new_version': '1.1.0'
})
```

### **Google Play Console:**

- Ver % de usuários em cada versão
- Forçar atualização (se crítico)
- Staged rollout (liberar aos poucos)

---

## 🛡️ Boas Práticas

### ✅ **FAZER:**

1. **Versionar tudo**
   ```
   git tag v1.1.0
   git push --tags
   ```

2. **Changelog detalhado**
   ```markdown
   # v1.1.0 (2025-01-15)
   - Nova funcionalidade X
   - Correção bug Y
   - Melhorias performance
   ```

3. **Testar antes de publicar**
   ```bash
   # Testar em staging
   # Testar no app (APK)
   # Testar em diferentes dispositivos
   ```

4. **Staged rollout (Google Play)**
   ```
   Liberar para 10% → 25% → 50% → 100%
   ```

### ❌ **NÃO FAZER:**

1. **Mudar Package ID**
   ```
   com.confilar.app → NUNCA MUDAR!
   ```

2. **Perder a keystore (Android)**
   ```
   Sem keystore = não pode atualizar app!
   Backup em local seguro!
   ```

3. **Pular versionamento**
   ```
   Sempre incrementar Version Code/Number
   ```

4. **Atualizar sem testar**
   ```
   Sempre testar antes de enviar
   ```

---

## 🚨 Troubleshooting

### **Problema: Usuários não recebem atualização**

**Solução:**
```javascript
// Forçar atualização do Service Worker
// public/sw.js - incrementar CACHE_NAME
const CACHE_NAME = 'confilar-pwa-v1.2.0' // era v1.1.0
```

### **Problema: "Erro ao instalar atualização" (Loja)**

**Solução:**
- Verificar se Version Code foi incrementado
- Confirmar que usou mesma keystore
- Verificar se Package ID está correto

### **Problema: App não abre após atualização**

**Solução:**
- Rollback para versão anterior (Google Play)
- Corrigir bug e enviar nova versão
- Comunicar usuários

---

## 📱 Frequência Recomendada

### **Atualizações Automáticas (Site):**
```
Pequenas melhorias: Diariamente ✅
Correções: Imediatamente ✅
Novas funcionalidades: Semanalmente ✅
```

### **Atualizações na Loja:**
```
Manutenção: Mensalmente 📦
Grandes features: A cada 2-3 meses 📦
Mudanças visuais: Conforme necessário 📦
```

---

## 🎯 Resumo Ultra-Rápido

### **Para 90% dos Casos:**

```bash
# Fazer alteração no site
git commit -m "feat: Nova funcionalidade"
git push

# Deploy automático
# Usuários recebem atualização sozinhos!
# FIM! 🎉
```

### **Para Mudanças Grandes:**

```bash
# 1. Atualizar site + deploy
# 2. PWABuilder → Novo pacote (v1.1.0)
# 3. Google Play → Upload
# 4. Aguardar aprovação (1-7 dias)
```

---

## 📞 Recursos Adicionais

- **PWABuilder**: https://www.pwabuilder.com
- **Google Play Console**: https://play.google.com/console
- **Versionamento Semântico**: https://semver.org

---

**Última Atualização**: Janeiro 2025  
**A melhor parte do PWA: Atualiza automaticamente! ⚡**


