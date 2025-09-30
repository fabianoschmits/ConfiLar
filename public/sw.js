// =====================================================
// CONFILAR PWA - SERVICE WORKER COMPLETO
// Cache estratégico, offline functionality, push notifications
// =====================================================

const CACHE_NAME = 'confilar-pwa-v1.0.0'
const STATIC_CACHE = 'confilar-static-v1.0.0'
const DYNAMIC_CACHE = 'confilar-dynamic-v1.0.0'
const API_CACHE = 'confilar-api-v1.0.0'

// =====================================================
// ESTRATÉGIAS DE CACHE
// =====================================================

const CACHE_STRATEGIES = {
  // Cache-first: Assets estáticos (CSS, JS, imagens)
  CACHE_FIRST: [
    '/static/',
    '/_next/static/',
    '/icons/',
    '/images/',
    '.css',
    '.js',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.ico',
    '.woff',
    '.woff2',
    '.ttf'
  ],
  
  // Network-first: Dados dinâmicos (APIs, dados do usuário)
  NETWORK_FIRST: [
    '/api/',
    '/auth/',
    '/supabase/',
    '/admin/'
  ],
  
  // Cache-only: Páginas offline
  CACHE_ONLY: [
    '/offline',
    '/error'
  ]
}

// Páginas essenciais para funcionamento offline
const OFFLINE_PAGES = [
  '/',
  '/auth',
  '/perfil',
  '/chat',
  '/favoritos',
  '/buscar',
  '/classificados'
]

// =====================================================
// INSTALAÇÃO DO SERVICE WORKER
// =====================================================

self.addEventListener('install', (event) => {
  console.log('🚀 ConfiLar PWA: Service Worker instalando...')
  
  event.waitUntil(
    Promise.all([
      // Cache de assets estáticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Cacheando assets estáticos...')
        return cache.addAll([
          '/',
          '/manifest.json',
          '/favicon.ico',
          '/favicon.svg',
          '/icon-192x192.png',
          '/icon-512x512.png',
          '/icon-192x192-maskable.png',
          '/icon-512x512-maskable.png'
        ])
      }),
      
      // Cache de páginas offline
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('📱 Cacheando páginas offline...')
        return cache.addAll(OFFLINE_PAGES)
      })
    ]).then(() => {
      console.log('✅ ConfiLar PWA: Cache inicial criado com sucesso!')
      return self.skipWaiting()
    })
  )
})

// =====================================================
// ATIVAÇÃO DO SERVICE WORKER
// =====================================================

self.addEventListener('activate', (event) => {
  console.log('🔄 ConfiLar PWA: Service Worker ativando...')
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Removendo cache antigo:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Assumir controle de todas as abas
      self.clients.claim()
    ]).then(() => {
      console.log('✅ ConfiLar PWA: Service Worker ativado com sucesso!')
    })
  )
})

// =====================================================
// INTERCEPTAÇÃO DE REQUISIÇÕES
// =====================================================

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return
  }
  
  // Ignorar requisições do Supabase Realtime
  if (url.hostname.includes('supabase.co') && url.pathname.includes('realtime')) {
    return
  }
  
  event.respondWith(handleRequest(request))
})

// =====================================================
// ESTRATÉGIAS DE CACHE
// =====================================================

async function handleRequest(request) {
  const url = new URL(request.url)
  const requestUrl = request.url
  
  try {
    // 1. CACHE-FIRST: Assets estáticos
    if (isCacheFirst(requestUrl)) {
      return await cacheFirst(request)
    }
    
    // 2. NETWORK-FIRST: Dados dinâmicos
    if (isNetworkFirst(requestUrl)) {
      return await networkFirst(request)
    }
    
    // 3. CACHE-ONLY: Páginas offline
    if (isCacheOnly(requestUrl)) {
      return await cacheOnly(request)
    }
    
    // 4. ESTRATÉGIA PADRÃO: Network com fallback
    return await networkWithFallback(request)
    
  } catch (error) {
    console.error('❌ Erro no Service Worker:', error)
    return await getOfflineFallback(request)
  }
}

// =====================================================
// ESTRATÉGIAS IMPLEMENTADAS
// =====================================================

// Cache-First: Para assets estáticos
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)
  
  if (cached) {
    console.log('📦 Cache hit (static):', request.url)
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.log('❌ Erro ao buscar asset:', request.url)
    return new Response('Asset não disponível offline', { status: 503 })
  }
}

// Network-First: Para dados dinâmicos
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.log('🌐 Tentando cache (network-first):', request.url)
    const cache = await caches.open(DYNAMIC_CACHE)
    const cached = await cache.match(request)
    
    if (cached) {
      return cached
    }
    
    return await getOfflineFallback(request)
  }
}

// Cache-Only: Para páginas offline
async function cacheOnly(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  return await getOfflineFallback(request)
}

// Network com fallback: Estratégia padrão
async function networkWithFallback(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      // Cachear respostas bem-sucedidas
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.log('🌐 Tentando cache (fallback):', request.url)
    const cache = await caches.open(DYNAMIC_CACHE)
    const cached = await cache.match(request)
    
    if (cached) {
      return cached
    }
    
    return await getOfflineFallback(request)
  }
}

// =====================================================
// FALLBACK OFFLINE
// =====================================================

async function getOfflineFallback(request) {
  const url = new URL(request.url)
  
  // Se for uma página HTML, mostrar página offline
  if (request.headers.get('accept')?.includes('text/html')) {
    const cache = await caches.open(DYNAMIC_CACHE)
    const offlinePage = await cache.match('/offline')
    
    if (offlinePage) {
      return offlinePage
    }
    
    // Página offline simples
    return new Response(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ConfiLar - Offline</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f5f5f5;
          }
          .offline-container {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .offline-icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
          .offline-title {
            font-size: 24px;
            margin-bottom: 10px;
            color: #333;
          }
          .offline-message {
            color: #666;
            margin-bottom: 30px;
          }
          .retry-button {
            background: #000;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          .retry-button:hover {
            background: #333;
          }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">📱</div>
          <h1 class="offline-title">ConfiLar Offline</h1>
          <p class="offline-message">
            Você está offline. Algumas funcionalidades podem não estar disponíveis.
          </p>
          <button class="retry-button" onclick="window.location.reload()">
            Tentar Novamente
          </button>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
  
  // Para outros tipos de requisição, retornar erro
  return new Response('Recurso não disponível offline', { status: 503 })
}

// =====================================================
// VERIFICAÇÃO DE ESTRATÉGIAS
// =====================================================

function isCacheFirst(url) {
  return CACHE_STRATEGIES.CACHE_FIRST.some(pattern => url.includes(pattern))
}

function isNetworkFirst(url) {
  return CACHE_STRATEGIES.NETWORK_FIRST.some(pattern => url.includes(pattern))
}

function isCacheOnly(url) {
  return CACHE_STRATEGIES.CACHE_ONLY.some(pattern => url.includes(pattern))
}

// =====================================================
// NOTIFICAÇÕES PUSH
// =====================================================

self.addEventListener('push', (event) => {
  console.log('🔔 ConfiLar PWA: Notificação push recebida')
  
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body || 'Nova notificação do ConfiLar',
      icon: '/icon-192x192.png',
      badge: '/icon-96x96.png',
      tag: data.tag || 'confilar-notification',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'ConfiLar', options)
    )
  }
})

// =====================================================
// CLIQUE EM NOTIFICAÇÕES
// =====================================================

self.addEventListener('notificationclick', (event) => {
  console.log('👆 ConfiLar PWA: Notificação clicada')
  
  event.notification.close()
  
  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Se já existe uma aba aberta, focar nela
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Senão, abrir nova aba
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// =====================================================
// SINCRONIZAÇÃO EM BACKGROUND
// =====================================================

self.addEventListener('sync', (event) => {
  console.log('🔄 ConfiLar PWA: Background sync -', event.tag)
  
  if (event.tag === 'confilar-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    console.log('🔄 Executando sincronização em background...')
    
    // Aqui você pode implementar lógica de sincronização
    // Por exemplo: sincronizar mensagens, favoritos, etc.
    
    console.log('✅ Sincronização em background concluída')
  } catch (error) {
    console.error('❌ Erro na sincronização em background:', error)
  }
}

// =====================================================
// MENSAGENS DO CLIENTE
// =====================================================

self.addEventListener('message', (event) => {
  console.log('💬 ConfiLar PWA: Mensagem recebida:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(cacheUrls(event.data.urls))
  }
})

async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE)
  await cache.addAll(urls)
  console.log('📦 URLs cacheadas:', urls)
}

// =====================================================
// LOGS DE DEBUG
// =====================================================

console.log('🚀 ConfiLar PWA Service Worker carregado!')
console.log('📱 Versão:', CACHE_NAME)
console.log('🎯 Estratégias configuradas:', Object.keys(CACHE_STRATEGIES))
console.log('📦 Páginas offline:', OFFLINE_PAGES)