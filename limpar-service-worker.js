// =====================================================
// LIMPEZA DO SERVICE WORKER - EXECUTAR NO CONSOLE DO NAVEGADOR
// =====================================================
// Execute este código no console do navegador (F12) para limpar o Service Worker

console.log('🧹 Iniciando limpeza do Service Worker...')

// 1. DESREGISTRAR SERVICE WORKER EXISTENTE
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('📋 Service Workers encontrados:', registrations.length)
    
    for(let registration of registrations) {
      console.log('🗑️ Desregistrando Service Worker:', registration.scope)
      registration.unregister()
    }
  })
}

// 2. LIMPAR CACHE DO SERVICE WORKER
if ('caches' in window) {
  caches.keys().then(function(names) {
    console.log('🗂️ Caches encontrados:', names.length)
    
    for (let name of names) {
      console.log('🗑️ Removendo cache:', name)
      caches.delete(name)
    }
  })
}

// 3. LIMPAR INDEXEDDB (se existir)
if ('indexedDB' in window) {
  indexedDB.databases().then(function(databases) {
    console.log('💾 Databases IndexedDB encontrados:', databases.length)
    
    databases.forEach(function(db) {
      console.log('🗑️ Removendo database:', db.name)
      indexedDB.deleteDatabase(db.name)
    })
  })
}

// 4. LIMPAR LOCAL STORAGE
console.log('🗑️ Limpando localStorage...')
localStorage.clear()

// 5. LIMPAR SESSION STORAGE
console.log('🗑️ Limpando sessionStorage...')
sessionStorage.clear()

// 6. RECARREGAR A PÁGINA
console.log('🔄 Recarregando página em 3 segundos...')
setTimeout(function() {
  window.location.reload(true) // true = force reload from server
}, 3000)

console.log('✅ Limpeza concluída! A página será recarregada automaticamente.')
