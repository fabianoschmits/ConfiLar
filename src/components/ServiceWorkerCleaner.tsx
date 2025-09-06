"use client"

import { useEffect } from "react"

export function ServiceWorkerCleaner() {
  // 🧹 LIMPEZA AUTOMÁTICA DO SERVICE WORKER ANTIGO
  // Desregistra todos os Service Workers antigos e limpa cache quando o usuário acessa o site
  useEffect(() => {
    const performCleanup = async () => {
      console.log("🧹 Iniciando limpeza completa do Service Worker...")
      
      try {
        // 1. DESREGISTRAR TODOS OS SERVICE WORKERS
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          console.log(`📋 Encontrados ${registrations.length} Service Workers`)
          
          for (const registration of registrations) {
            console.log("🗑️ Desregistrando Service Worker:", registration.scope)
            await registration.unregister()
          }
        }

        // 2. LIMPAR TODOS OS CACHES
        if ("caches" in window) {
          const cacheNames = await caches.keys()
          console.log(`🗂️ Encontrados ${cacheNames.length} caches`)
          
          for (const cacheName of cacheNames) {
            console.log("🗑️ Removendo cache:", cacheName)
            await caches.delete(cacheName)
          }
        }

        // 3. LIMPAR INDEXEDDB
        if ("indexedDB" in window) {
          try {
            const databases = await indexedDB.databases()
            console.log(`💾 Encontrados ${databases.length} databases IndexedDB`)
            
            for (const db of databases) {
              console.log("🗑️ Removendo database:", db.name)
              await new Promise<void>((resolve, reject) => {
                const deleteReq = indexedDB.deleteDatabase(db.name!)
                deleteReq.onsuccess = () => resolve()
                deleteReq.onerror = () => reject(deleteReq.error)
              })
            }
          } catch (error) {
            console.warn("⚠️ Erro ao limpar IndexedDB:", error)
          }
        }

        // 4. LIMPAR DADOS ESPECÍFICOS DO APP
        if (typeof window !== 'undefined') {
          const keysToRemove = [
            'mockUser', 'mockProfile', 'supabase.auth.token', 'auth-token',
            'user-session', 'user-profile', 'user-preferences', 'chat-history',
            'notification-preferences', 'search-history', 'recent-searches',
            'temp-data', 'cached-responses', 'sw-cache', 'pwa-cache'
          ]
          
          keysToRemove.forEach(key => {
            localStorage.removeItem(key)
            console.log(`🗑️ Removido do localStorage: ${key}`)
          })
          
          sessionStorage.clear()
          console.log("🗑️ sessionStorage limpo")
        }

        console.log("✅ Limpeza completa do Service Worker concluída!")
        
      } catch (error) {
        console.error("❌ Erro durante limpeza do Service Worker:", error)
      }
    }

    performCleanup()
  }, []);

  return null
}
