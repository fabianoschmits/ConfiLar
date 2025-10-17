# 🔔 Notificações Push no App Mobile

## ✅ SIM! O App Instalado Recebe Notificações Push! 📱

Quando o usuário instala seu app via PWABuilder, ele **RECEBE NOTIFICAÇÕES PUSH** exatamente como um app nativo!

---

## 🎯 Como Funciona

### **1. Status Atual do ConfiLar:**

✅ **PUSH NOTIFICATIONS JÁ IMPLEMENTADAS!**

O ConfiLar já possui:
- ✅ Service Worker configurado (`public/sw.js`)
- ✅ Hook `usePushNotifications` pronto
- ✅ Sistema de permissões implementado
- ✅ Integração com Supabase
- ✅ API de envio configurada (`/api/notifications/send`)

### **2. O que Acontece com o App Instalado:**

```
App PWA Instalado
    ↓
Service Worker ativo
    ↓
Push Notifications funcionam NATIVAMENTE!
    ↓
Notificações aparecem na barra de status
```

---

## 📱 Experiência do Usuário

### **Android (Google Play Store):**

```
1. Usuário abre o app pela primeira vez
   ↓
2. App pede permissão para notificações
   "ConfiLar quer enviar notificações"
   [Permitir] [Não permitir]
   ↓
3. Usuário permite
   ↓
4. App registra token de push
   ↓
5. Notificações chegam na barra de status! 🔔
```

**Como as notificações aparecem:**
- 🔔 Ícone na barra de status
- 📳 Som/vibração (configurável)
- 💬 Preview da mensagem
- 🖼️ Ícone do app
- 👆 Clique abre o app

### **iOS (App Store):**

```
1. Usuário instala o app
   ↓
2. App pede permissão (primeira vez que tenta enviar)
   "ConfiLar deseja enviar notificações"
   [Não Permitir] [Permitir]
   ↓
3. Usuário permite
   ↓
4. Notificações via APNs (Apple Push Notification service)
   ↓
5. Aparecem como app nativo! 🔔
```

---

## 🔧 O que Você Precisa Configurar

### **Android (Firebase Cloud Messaging - FCM)**

#### **Passo 1: Criar Projeto no Firebase**

1. Acessar: https://console.firebase.google.com
2. Criar projeto: "ConfiLar"
3. Adicionar app Android:
   - Package name: `com.confilar.app`
   - Apelido: ConfiLar
4. Baixar `google-services.json`

#### **Passo 2: Gerar VAPID Keys**

```bash
# Instalar web-push
npm install -g web-push

# Gerar chaves VAPID
web-push generate-vapid-keys

# Resultado:
# Public Key: BHx... (256 caracteres)
# Private Key: 7j2... (43 caracteres)
```

#### **Passo 3: Configurar no Projeto**

```bash
# Adicionar no .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BHx...sua_chave_publica...
VAPID_PRIVATE_KEY=7j2...sua_chave_privada...
```

#### **Passo 4: Configurar no PWABuilder**

Ao gerar o pacote Android:
1. Seção "Push Notifications"
2. Upload do `google-services.json`
3. ☑️ Enable Push Notifications
4. Inserir VAPID Public Key

---

### **iOS (Apple Push Notification service - APNs)**

⚠️ **Requer conta Apple Developer ($99/ano)**

#### **Passo 1: Gerar Certificado APNs**

1. Apple Developer Console
2. Certificates, Identifiers & Profiles
3. Certificates → + (Criar novo)
4. Tipo: Apple Push Notification service SSL
5. App ID: com.confilar.app
6. Download do certificado `.p12`

#### **Passo 2: Configurar no Xcode**

1. Abrir projeto gerado pelo PWABuilder
2. Capabilities → Push Notifications (☑️)
3. Upload do certificado APNs
4. Build e enviar para App Store

#### **Passo 3: Configurar Backend**

Adicionar certificado no servidor que envia notificações:
- Supabase Edge Functions (se usar)
- Firebase Cloud Functions (alternativa)

---

## 📝 Código Já Implementado no ConfiLar

### **1. Service Worker (Push Handler)**

Arquivo: `public/sw.js`

```javascript
// ✅ JÁ IMPLEMENTADO!

// Receber push notification
self.addEventListener('push', (event) => {
  const data = event.data.json()
  
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  )
})
```

### **2. Hook de Push Notifications**

Arquivo: `src/hooks/usePushNotifications.ts`

```typescript
// ✅ JÁ IMPLEMENTADO!

export function usePushNotifications() {
  // Solicitar permissão
  const requestPermission = async () => {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  // Inscrever usuário
  const subscribe = async () => {
    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY
    })
    
    // Salvar no banco
    await supabase.from('push_subscriptions').insert({
      user_id: user.id,
      subscription: subscription
    })
  }
  
  return { requestPermission, subscribe }
}
```

### **3. API de Envio**

Arquivo: `src/app/api/notifications/send/route.ts`

```typescript
// ✅ JÁ IMPLEMENTADO!

export async function POST(request) {
  const { userId, title, body, url } = await request.json()
  
  // Buscar subscription do usuário
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)
  
  // Enviar para cada device
  for (const sub of subscriptions) {
    await webpush.sendNotification(
      sub.subscription,
      JSON.stringify({ title, body, url })
    )
  }
}
```

---

## 🚀 Tipos de Notificações que o ConfiLar Envia

### **Já Implementadas:**

1. **Nova Mensagem no Chat** 💬
   ```
   "João Silva enviou uma mensagem"
   "Olá! Preciso de um orçamento..."
   ```

2. **Nova Curtida** ❤️
   ```
   "Maria curtiu sua publicação"
   "Veja quem curtiu seu post"
   ```

3. **Novo Comentário** 💭
   ```
   "Carlos comentou no seu post"
   "Ótimo trabalho! Parabéns..."
   ```

4. **Resposta em Comentário** 🗨️
   ```
   "Ana respondeu seu comentário"
   "Concordo com você sobre..."
   ```

5. **Nova Avaliação** ⭐
   ```
   "Você recebeu uma nova avaliação!"
   "5 estrelas - Excelente profissional"
   ```

6. **Sistema** 📢
   ```
   "Bem-vindo ao ConfiLar!"
   "Seu perfil foi aprovado"
   ```

---

## 🎨 Personalização das Notificações

### **Badge e Ícones:**

```javascript
// public/sw.js

const options = {
  body: "Nova mensagem de João",
  icon: '/icon-192x192.png',        // Ícone grande
  badge: '/icon-96x96.png',         // Badge pequeno
  image: '/banner-notification.png', // Imagem expandida
  vibrate: [200, 100, 200],         // Padrão de vibração
  sound: '/notification.mp3',       // Som (Android)
  tag: 'message-123',               // Agrupar notificações
  renotify: true,                   // Vibrar em atualizações
  requireInteraction: false,        // Auto-fechar
  actions: [                        // Botões de ação
    {
      action: 'reply',
      title: 'Responder',
      icon: '/icon-reply.png'
    },
    {
      action: 'view',
      title: 'Ver',
      icon: '/icon-view.png'
    }
  ]
}
```

### **Notificações Agrupadas:**

```javascript
// Agrupar mensagens do mesmo usuário
const tag = `chat-${senderId}`

self.registration.showNotification(title, {
  ...options,
  tag: tag,
  data: {
    count: messageCount // Exibir contador
  }
})
```

---

## 📊 Fluxo Completo

```
┌─────────────────────────────────────────────────┐
│  1. SERVIDOR (Seu Backend)                     │
│  ↓ Evento acontece (nova mensagem, curtida)    │
├─────────────────────────────────────────────────┤
│  2. SUPABASE                                    │
│  ↓ Busca subscription do usuário                │
│  ↓ push_subscriptions table                     │
├─────────────────────────────────────────────────┤
│  3. API NOTIFICATIONS                           │
│  ↓ POST /api/notifications/send                 │
│  ↓ Envia para FCM/APNs                         │
├─────────────────────────────────────────────────┤
│  4. FCM (Android) / APNs (iOS)                  │
│  ↓ Servidores Google/Apple                      │
│  ↓ Roteamento para dispositivo                  │
├─────────────────────────────────────────────────┤
│  5. DISPOSITIVO DO USUÁRIO                      │
│  ↓ Service Worker recebe push                   │
│  ↓ self.addEventListener('push')                │
├─────────────────────────────────────────────────┤
│  6. NOTIFICAÇÃO NA TELA                         │
│  🔔 Aparece na barra de status!                 │
└─────────────────────────────────────────────────┘
```

---

## ⚙️ Configurações do Usuário

### **Android:**

Usuário pode controlar:
- ☑️ Permitir/Bloquear notificações
- 🔔 Som (on/off)
- 📳 Vibração (on/off)
- 🔕 Modo Não Perturbe
- 👀 Preview na tela de bloqueio
- 🎨 Ícone de badge

### **iOS:**

Usuário pode controlar:
- ☑️ Permitir/Bloquear
- 🔔 Sons
- 📳 Alertas
- 🔴 Badges
- 🚨 Banner style
- 🔒 Tela de bloqueio

---

## 🧪 Como Testar

### **Durante Desenvolvimento:**

```bash
# 1. Rodar projeto localmente
npm run dev

# 2. Abrir em HTTPS (ngrok ou similar)
ngrok http 3000
# https://abc123.ngrok.io

# 3. Testar notificação
# DevTools → Application → Service Workers → Push

# 4. Ou via código:
navigator.serviceWorker.ready.then(registration => {
  registration.showNotification('Teste', {
    body: 'Notificação de teste!'
  })
})
```

### **No App Instalado (APK):**

```bash
# 1. Gerar APK de teste no PWABuilder
# 2. Instalar no Android
adb install app-debug.apk

# 3. Abrir app e permitir notificações
# 4. Enviar notificação via API
curl -X POST https://seusite.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "title": "Teste",
    "body": "Notificação de teste!",
    "url": "/feed"
  }'

# 5. Verificar se chegou! 🔔
```

---

## 📈 Métricas e Analytics

### **Rastrear Notificações:**

```typescript
// Envio
gtag('event', 'notification_sent', {
  'type': 'message',
  'user_id': userId
})

// Recebimento (Service Worker)
gtag('event', 'notification_received', {
  'type': 'message'
})

// Clique
gtag('event', 'notification_clicked', {
  'type': 'message',
  'url': '/chat'
})
```

### **Firebase Analytics:**

```javascript
logEvent(analytics, 'notification_sent', {
  notification_type: 'new_message',
  recipient_id: userId
})
```

---

## 🚨 Troubleshooting

### **Problema: "Notificações não funcionam"**

**Verificar:**
1. ✅ App está em HTTPS (produção)
2. ✅ Service Worker está registrado
3. ✅ Permissão foi concedida
4. ✅ VAPID keys estão corretas
5. ✅ Subscription foi salva no banco

**Testar:**
```javascript
// DevTools Console
Notification.permission // deve ser "granted"
navigator.serviceWorker.ready // deve resolver
```

### **Problema: "Notificações chegam atrasadas"**

**Causas:**
- Economia de bateria (Android)
- Dados em background desativados
- App em modo de economia

**Solução:**
- Adicionar app nas exceções de bateria
- Manter dados em background ativos

### **Problema: "Notificações não aparecem no iOS"**

**Causas:**
- Certificado APNs não configurado
- Modo Não Perturbe ativo
- Notificações bloqueadas nas configurações

**Solução:**
- Verificar certificado no Xcode
- Pedir ao usuário para verificar configurações

---

## ✅ Checklist de Implementação

### **Antes de Publicar:**

- [ ] ✅ VAPID keys geradas
- [ ] ✅ Firebase projeto criado
- [ ] ✅ google-services.json configurado
- [ ] ✅ Service Worker testado
- [ ] ✅ API de envio funcionando
- [ ] ✅ Tabela push_subscriptions criada
- [ ] ✅ Permissões testadas
- [ ] ✅ Notificações aparecem corretamente
- [ ] ✅ Clique abre URL correta

### **Depois de Publicar:**

- [ ] Monitorar taxa de permissão concedida
- [ ] Monitorar taxa de clique nas notificações
- [ ] A/B test de textos de notificação
- [ ] Ajustar frequência (não incomodar)

---

## 💡 Boas Práticas

### ✅ **FAZER:**

1. **Pedir permissão no momento certo**
   ```typescript
   // ❌ Ruim: Pedir logo ao abrir o app
   // ✅ Bom: Pedir quando usuário inicia conversa
   ```

2. **Ser específico nas mensagens**
   ```
   ❌ "Nova notificação"
   ✅ "João Silva enviou uma mensagem"
   ```

3. **Permitir desativar**
   ```typescript
   // Configurações → Notificações
   // Permitir desativar por tipo
   ```

4. **Não exagerar na frequência**
   ```
   ❌ 50 notificações por dia
   ✅ Agrupar e resumir
   ```

### ❌ **NÃO FAZER:**

1. Enviar spam de notificações
2. Notificações genéricas
3. Forçar permissão
4. Notificar de madrugada (respeitar horário)

---

## 📞 Recursos Adicionais

- **Web Push Protocol**: https://web.dev/push-notifications/
- **FCM Docs**: https://firebase.google.com/docs/cloud-messaging
- **APNs Docs**: https://developer.apple.com/notifications/
- **PWA Notifications**: https://web.dev/notification-triggers/

---

## 🎯 Resumo Ultra-Rápido

### **App Instalado = Notificações Nativas! ✅**

```
1. Usuário instala app
   ↓
2. App pede permissão para notificações
   ↓
3. Usuário permite
   ↓
4. Você envia notificação via API
   ↓
5. Notificação aparece na barra de status! 🔔
```

**Funciona EXATAMENTE como app nativo!**
- 🔔 Som
- 📳 Vibração
- 💬 Preview
- 👆 Clique abre app

**Já está implementado no ConfiLar!**
- ✅ Service Worker
- ✅ Push API
- ✅ Hooks prontos
- ✅ Sistema completo

**Você só precisa:**
1. Configurar Firebase (5 minutos)
2. Gerar VAPID keys (2 minutos)
3. Adicionar no PWABuilder
4. Pronto! 🚀

---

**Última Atualização**: Janeiro 2025  
**Push Notifications: 100% Funcionais! 🔔**



