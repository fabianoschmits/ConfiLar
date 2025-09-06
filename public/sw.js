// Service Worker vazio para sobrescrever cache antigo
// Este arquivo substitui qualquer Service Worker antigo que possa estar causando problemas

console.log('🧹 Service Worker vazio carregado - apenas para limpeza de cache')

// Não fazer nada - apenas existir para sobrescrever o antigo
// O ServiceWorkerCleaner vai desregistrar este imediatamente

self.addEventListener('install', (event) => {
  console.log('📦 Service Worker vazio instalado')
  // Não fazer cache de nada
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker vazio ativado')
  // Limpar todos os caches antigos
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('🗑️ Removendo cache antigo:', cacheName)
          return caches.delete(cacheName)
        })
      )
    })
  )
})

// Não interceptar nenhuma requisição
// Deixar tudo passar direto para o servidor
