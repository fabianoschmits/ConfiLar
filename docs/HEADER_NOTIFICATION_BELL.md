# 🔔 HEADER NOTIFICATION BELL - CONFILAR

## 📍 **VISÃO GERAL**

O `HeaderNotificationBell` é um componente completo para exibir notificações no header do ConfiLar, com contador em tempo real, menu dropdown e integração com o sistema de notificações push.

## 🎯 **FUNCIONALIDADES**

### **✅ Contador de Notificações**
- Badge vermelho com número de notificações não lidas
- Atualização em tempo real
- Suporte a números grandes (99+)

### **✅ Ícone Dinâmico**
- Ícone muda baseado no tipo da notificação mais recente
- Cores específicas para cada tipo
- Visual intuitivo e informativo

### **✅ Menu Dropdown**
- Status do sistema (push, permissão, inscrição)
- Ações rápidas (marcar todas, limpar todas)
- Controles de push notifications
- Link para página de teste

### **✅ Sheet Lateral**
- Visualização completa das notificações
- Integração com NotificationCenter
- Interface responsiva

## 🎨 **VARIANTES DISPONÍVEIS**

### **1. HeaderNotificationBell (Padrão)**
```tsx
<HeaderNotificationBell />
```
- Sino com contador
- Sem label
- Menu dropdown
- Sheet lateral

### **2. SimpleHeaderNotificationBell (Minimal)**
```tsx
<SimpleHeaderNotificationBell />
```
- Versão compacta
- Ideal para headers
- Funcionalidades essenciais

### **3. DetailedHeaderNotificationBell (Detalhado)**
```tsx
<DetailedHeaderNotificationBell />
```
- Com label "Notificações"
- Mais informações visíveis
- Ideal para páginas específicas

## 🔧 **PROPS E CONFIGURAÇÃO**

### **HeaderNotificationBell Props**
```typescript
interface HeaderNotificationBellProps {
  className?: string        // Classes CSS adicionais
  showLabel?: boolean      // Mostrar label "Notificações"
  variant?: 'default' | 'minimal' | 'detailed'  // Variante do componente
}
```

### **Exemplo de Uso**
```tsx
// Básico
<HeaderNotificationBell />

// Com customizações
<HeaderNotificationBell 
  className="custom-class"
  showLabel={true}
  variant="detailed"
/>
```

## 🎯 **TIPOS DE NOTIFICAÇÃO SUPORTADOS**

### **1. Mensagem de Chat**
- **Ícone**: MessageCircle
- **Cor**: Azul (bg-blue-500)
- **Uso**: Novas mensagens no chat

### **2. Avaliação**
- **Ícone**: Star
- **Cor**: Amarelo (bg-yellow-500)
- **Uso**: Novas avaliações recebidas

### **3. Agendamento**
- **Ícone**: Calendar
- **Cor**: Verde (bg-green-500)
- **Uso**: Confirmações de agendamento

### **4. Sistema**
- **Ícone**: Settings
- **Cor**: Cinza (bg-gray-500)
- **Uso**: Notificações do sistema

### **5. Conquista**
- **Ícone**: Trophy
- **Cor**: Roxo (bg-purple-500)
- **Uso**: Novas conquistas desbloqueadas

### **6. Verificação**
- **Ícone**: Shield
- **Cor**: Índigo (bg-indigo-500)
- **Uso**: Verificações de perfil

### **7. Sucesso**
- **Ícone**: CheckCircle
- **Cor**: Verde esmeralda (bg-emerald-500)
- **Uso**: Ações bem-sucedidas

### **8. Aviso**
- **Ícone**: AlertCircle
- **Cor**: Laranja (bg-orange-500)
- **Uso**: Avisos importantes

### **9. Erro**
- **Ícone**: AlertCircle
- **Cor**: Vermelho (bg-red-500)
- **Uso**: Erros do sistema

### **10. Header (Novo!)**
- **Ícone**: Bell
- **Cor**: Ciano (bg-cyan-500)
- **Uso**: Notificações específicas do header

## 🚀 **INTEGRAÇÃO NO HEADER**

### **1. No Componente Navigation**
```tsx
import { HeaderNotificationBell } from '@/components/notifications/HeaderNotificationBell'

// No JSX
<div className="flex items-center space-x-4">
  <HeaderNotificationBell />
  <Button variant="ghost" size="sm">Perfil</Button>
  <Button variant="outline" size="sm">Sair</Button>
</div>
```

### **2. Em Layouts Personalizados**
```tsx
// Header customizado
<header className="bg-white shadow-sm">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      <div className="text-xl font-bold">ConfiLar</div>
      <div className="flex items-center space-x-4">
        <HeaderNotificationBell />
        {/* Outros botões */}
      </div>
    </div>
  </div>
</header>
```

## 📱 **RESPONSIVIDADE**

### **Desktop**
- Layout horizontal
- Menu dropdown completo
- Sheet lateral amplo
- Todas as funcionalidades visíveis

### **Mobile**
- Layout compacto
- Touch-friendly
- Sheet em tela cheia
- Performance otimizada

## 🔄 **FLUXO DE FUNCIONAMENTO**

### **1. Inicialização**
```typescript
// Verifica suporte a push notifications
const isSupported = 'Notification' in window && 'serviceWorker' in navigator

// Verifica permissão
const permission = await Notification.requestPermission()

// Carrega notificações existentes
const notifications = await loadNotifications()
```

### **2. Atualização em Tempo Real**
```typescript
// Listener para novas notificações
useEffect(() => {
  const channel = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    }, (payload) => {
      // Atualiza contador
      setUnreadCount(prev => prev + 1)
      // Adiciona notificação à lista
      setNotifications(prev => [payload.new, ...prev])
    })
    .subscribe()
}, [user])
```

### **3. Ações do Usuário**
```typescript
// Marcar como lida
const markAsRead = (notificationId) => {
  updateNotification(notificationId, { is_read: true })
  setUnreadCount(prev => Math.max(0, prev - 1))
}

// Limpar todas
const clearAll = () => {
  deleteAllNotifications()
  setNotifications([])
  setUnreadCount(0)
}
```

## 🎯 **CASOS DE USO**

### **1. Notificação de Nova Mensagem**
```typescript
// Quando usuário recebe mensagem
addNotification({
  type: 'message',
  title: 'Nova mensagem de João',
  message: 'Olá! Como está o projeto?',
  priority: 'normal',
  action_url: '/chat'
})
```

### **2. Notificação de Avaliação**
```typescript
// Quando usuário recebe avaliação
addNotification({
  type: 'review',
  title: 'Nova avaliação recebida',
  message: 'Maria avaliou seu serviço com 5 estrelas',
  priority: 'high',
  action_url: '/avaliacoes'
})
```

### **3. Notificação do Header**
```typescript
// Notificação específica do header
addNotification({
  type: 'header',
  title: 'Sistema atualizado',
  message: 'Nova versão disponível com melhorias',
  priority: 'normal',
  action_url: '/atualizacoes'
})
```

## 🔧 **CUSTOMIZAÇÃO**

### **1. Cores Personalizadas**
```typescript
const CUSTOM_COLORS = {
  message: 'bg-blue-600',
  review: 'bg-yellow-600',
  // ... outras cores
}
```

### **2. Ícones Personalizados**
```typescript
const CUSTOM_ICONS = {
  message: CustomMessageIcon,
  review: CustomStarIcon,
  // ... outros ícones
}
```

### **3. Comportamento Personalizado**
```typescript
const customActions = {
  onNotificationClick: (notification) => {
    // Ação personalizada ao clicar
  },
  onMarkAsRead: (notification) => {
    // Ação personalizada ao marcar como lida
  }
}
```

## 📊 **MÉTRICAS E DEBUGGING**

### **Console Logs**
```typescript
// Status do sistema
console.log('Push supported:', isSupported)
console.log('Permission:', isGranted)
console.log('Subscribed:', isSubscribed)

// Ações do usuário
console.log('Notification clicked:', notification)
console.log('Marked as read:', notificationId)
```

### **Indicadores Visuais**
- Badge de contador
- Ícone dinâmico
- Estados de loading
- Mensagens de erro

## 🎉 **RESULTADO FINAL**

### **✅ COMPONENTE COMPLETO**
- ✅ Contador em tempo real
- ✅ Ícone dinâmico
- ✅ Menu dropdown funcional
- ✅ Sheet lateral responsivo
- ✅ Integração com push notifications
- ✅ 3 variações disponíveis
- ✅ 10 tipos de notificação
- ✅ Design moderno e intuitivo

### **🚀 PRONTO PARA PRODUÇÃO**
O componente está **100% funcional** e integrado ao sistema de notificações do ConfiLar!

**📍 Localização**: `src/components/notifications/HeaderNotificationBell.tsx`
**🧪 Teste**: `/teste-notificacoes` (seção "Demonstração do Header")
**📖 Documentação**: `docs/HEADER_NOTIFICATION_BELL.md`
