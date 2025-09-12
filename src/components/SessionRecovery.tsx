'use client'

import { useEffect, useRef } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export function SessionRecovery() {
  const { user, loading, signOut } = useAuthContext()
  const stuckDetectionRef = useRef<NodeJS.Timeout | null>(null)
  const lastUserStateRef = useRef<string | null>(null)

  useEffect(() => {
    // Detectar se o usuário está "preso" em loading
    const detectStuckSession = () => {
      // Se está carregando há mais de 10 segundos, pode estar preso
      if (loading) {
        console.log('⚠️ Loading há mais de 10 segundos - possível sessão presa')
        
        // Tentar recuperar a sessão
        const recoverSession = async () => {
          try {
            console.log('🔄 Tentando recuperar sessão...')
            
            // 1. Verificar se há usuário válido no Supabase
            const { data: { user: currentUser }, error } = await supabase.auth.getUser()
            
            if (error) {
              console.log('❌ Erro ao verificar usuário:', error)
              await forceCleanup()
              return
            }
            
            if (!currentUser) {
              console.log('🚪 Nenhum usuário válido encontrado')
              await forceCleanup()
              return
            }
            
            console.log('✅ Usuário válido encontrado, mas usuário preso em loading')
            
            // 2. Forçar refresh da página para sair do estado preso
            console.log('🔄 Forçando refresh da página...')
            window.location.reload()
            
          } catch (error) {
            console.error('❌ Erro na recuperação de sessão:', error)
            await forceCleanup()
          }
        }
        
        // Aguardar mais 5 segundos antes de tentar recuperar
        setTimeout(recoverSession, 5000)
      }
    }

    // Função para limpeza forçada
    const forceCleanup = async () => {
      console.log('🧹 Executando limpeza forçada...')
      
      try {
        // Limpar todos os dados
        if (typeof window !== 'undefined') {
          // Limpar localStorage
          localStorage.clear()
          
          // Limpar sessionStorage
          sessionStorage.clear()
          
          // Limpar caches
          if ('caches' in window) {
            const cacheNames = await caches.keys()
            await Promise.all(cacheNames.map(name => caches.delete(name)))
          }
          
          // Desregistrar Service Workers
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations()
            await Promise.all(registrations.map(reg => reg.unregister()))
          }
          
          // Limpar IndexedDB
          if ('indexedDB' in window) {
            try {
              const databases = await indexedDB.databases()
              await Promise.all(databases.map(db => {
                return new Promise<void>((resolve, reject) => {
                  const deleteReq = indexedDB.deleteDatabase(db.name!)
                  deleteReq.onsuccess = () => resolve()
                  deleteReq.onerror = () => reject(deleteReq.error)
                })
              }))
            } catch (error) {
              console.warn('⚠️ Erro ao limpar IndexedDB:', error)
            }
          }
        }
        
        // Fazer logout do Supabase
        await supabase.auth.signOut()
        
        console.log('✅ Limpeza forçada concluída')
        
        // Redirecionar para página inicial
        setTimeout(() => {
          window.location.replace('/')
        }, 1000)
        
      } catch (error) {
        console.error('❌ Erro na limpeza forçada:', error)
        // Mesmo com erro, tentar redirecionar
        setTimeout(() => {
          window.location.replace('/')
        }, 2000)
      }
    }

    // Detectar mudanças no estado do usuário
    const currentUserState = user ? user.id : 'null'
    if (currentUserState !== lastUserStateRef.current) {
      lastUserStateRef.current = currentUserState
      console.log('👤 Estado do usuário mudou:', currentUserState)
    }

    // Configurar detecção de sessão presa
    if (loading) {
      stuckDetectionRef.current = setTimeout(detectStuckSession, 10000) // 10 segundos
    } else {
      // Se não está mais carregando, cancelar detecção
      if (stuckDetectionRef.current) {
        clearTimeout(stuckDetectionRef.current)
        stuckDetectionRef.current = null
      }
    }

    // Cleanup
    return () => {
      if (stuckDetectionRef.current) {
        clearTimeout(stuckDetectionRef.current)
      }
    }
  }, [loading, user, signOut])

  // Detectar se a página está carregando há muito tempo
  useEffect(() => {
    const pageLoadStart = Date.now()
    
    const checkPageLoad = () => {
      const loadTime = Date.now() - pageLoadStart
      
      // Se a página está carregando há mais de 30 segundos
      if (loadTime > 30000) {
        console.log('⚠️ Página carregando há mais de 30 segundos - possível problema')
        
        // Mostrar botão de recuperação para o usuário
        const recoveryButton = document.createElement('button')
        recoveryButton.innerHTML = '🔄 Recuperar Sessão'
        recoveryButton.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
          background: #ef4444;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `
        
        recoveryButton.onclick = async () => {
          console.log('🔄 Usuário clicou em recuperar sessão')
          
          // Remover botão
          recoveryButton.remove()
          
          // Executar limpeza forçada
          try {
            localStorage.clear()
            sessionStorage.clear()
            
            if ('caches' in window) {
              const cacheNames = await caches.keys()
              await Promise.all(cacheNames.map(name => caches.delete(name)))
            }
            
            if ('serviceWorker' in navigator) {
              const registrations = await navigator.serviceWorker.getRegistrations()
              await Promise.all(registrations.map(reg => reg.unregister()))
            }
            
            await supabase.auth.signOut()
            
            window.location.replace('/')
          } catch (error) {
            console.error('❌ Erro na recuperação:', error)
            window.location.replace('/')
          }
        }
        
        document.body.appendChild(recoveryButton)
        
        // Remover botão após 10 segundos se não clicado
        setTimeout(() => {
          if (recoveryButton.parentNode) {
            recoveryButton.remove()
          }
        }, 10000)
      }
    }
    
    const checkInterval = setInterval(checkPageLoad, 5000) // Verificar a cada 5 segundos
    
    return () => {
      clearInterval(checkInterval)
    }
  }, [])

  return null
}
