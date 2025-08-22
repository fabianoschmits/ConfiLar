const CACHE_NAME = 'confilar-v1.0.0'
const STATIC_CACHE_NAME = 'confilar-static-v1.0.0'
const DYNAMIC_CACHE_NAME = 'confilar-dynamic-v1.0.0'

// Arquivos essenciais para cache
const STATIC_FILES = [
  '/',
  '/auth',
  '/buscar',
  '/classificados',
  '/perfil',
  '/mensagens',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
]

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('Service Worker: Arquivos em cache')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Erro no cache', error)
      })
  )
})

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Remove caches antigos
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Removendo cache antigo', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Ativado')
        return self.clients.claim()
      })
  )
})

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return
  }

  // Estratégia Network First para páginas HTML
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Se a resposta for válida, atualiza o cache
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // Se falhar, tenta buscar no cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse
              }
              // Fallback para página offline
              return caches.match('/')
            })
        })
    )
    return
  }

  // Estratégia Cache First para outros recursos
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request)
          .then((response) => {
            // Se a resposta for válida e o método for GET, adiciona ao cache dinâmico
            if (response.status === 200 && request.method === 'GET') {
              const responseClone = response.clone()
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone)
                })
            }
            return response
          })
      })
  )
})

// Detectar atualizações
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Pulando espera para atualização')
    self.skipWaiting()
  }
})

// Notificar cliente sobre atualizações
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    event.ports[0].postMessage({
      type: 'UPDATE_AVAILABLE',
      payload: true
    })
  }
})

