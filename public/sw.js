// Service Worker completamente desabilitado
console.log('Service Worker: Completamente desabilitado')

// Não fazer nada - apenas um placeholder vazio
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalação ignorada')
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativação ignorada')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Não interceptar nenhuma requisição
  return
})

