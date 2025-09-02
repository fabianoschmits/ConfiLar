const CACHE_NAME = 'confilar-v1.0.0'
const STATIC_CACHE_NAME = 'confilar-static-v1.0.0'
const DYNAMIC_CACHE_NAME = 'confilar-dynamic-v1.0.0'

// Arquivos essenciais para cache (apenas arquivos que sempre existem)
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.ico'
]

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto')
        // Adicionar arquivos um por um para evitar falhas
        return Promise.allSettled(
          STATIC_FILES.map(url => 
            cache.add(url).catch(error => {
              console.warn(`Service Worker: Falha ao cachear ${url}:`, error)
              return null
            })
          )
        )
      })
      .then(() => {
        console.log('Service Worker: Instalação concluída')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Erro na instalação', error)
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

  // Ignorar requisições de extensões do navegador
  if (request.url.includes('chrome-extension') || 
      request.url.includes('moz-extension') || 
      request.url.includes('evmAsk.js')) {
    return
  }

  // Ignorar requisições de API
  if (request.url.includes('/api/')) {
    return
  }

  // Estratégia Network First para páginas HTML
  if (request.headers.get('accept')?.includes('text/html')) {
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
              .catch(error => {
                console.warn('Service Worker: Erro ao cachear resposta dinâmica:', error)
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
                .catch(error => {
                  console.warn('Service Worker: Erro ao cachear recurso:', error)
                })
            }
            return response
          })
          .catch(error => {
            console.warn('Service Worker: Falha na requisição:', error)
            // Retornar uma resposta vazia em vez de erro 500
            return new Response('', { status: 404 })
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

