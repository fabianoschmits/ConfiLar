/**
 * Utilitário IndexedDB para armazenamento de dados estruturados
 * Permite cache local de dados da aplicação para funcionamento offline
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb'

// Schema do banco de dados IndexedDB
interface ConfiLarDB extends DBSchema {
  profiles: {
    key: string // user_id
    value: {
      id: string
      data: any // Dados do perfil completo
      timestamp: number
      expiresAt: number
    }
    indexes: { 'by-timestamp': number }
  }
  posts: {
    key: string // post_id
    value: {
      id: string
      data: any // Dados do post
      timestamp: number
      expiresAt: number
    }
    indexes: { 'by-timestamp': number }
  }
  transactions: {
    key: string // transaction_id
    value: {
      id: string
      data: any // Dados da transação
      timestamp: number
      expiresAt: number
    }
    indexes: { 'by-timestamp': number, 'by-user': string }
  }
  offlineActions: {
    key: number // Auto-increment
    value: {
      id?: number
      type: 'create_post' | 'like' | 'comment' | 'transfer_points' | 'update_profile'
      payload: any
      timestamp: number
      retries: number
      status: 'pending' | 'syncing' | 'completed' | 'failed'
    }
    indexes: { 'by-status': string, 'by-timestamp': number }
  }
  cache: {
    key: string // cache_key
    value: {
      key: string
      data: any
      timestamp: number
      expiresAt: number
    }
    indexes: { 'by-timestamp': number }
  }
}

const DB_NAME = 'confilar-offline-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<ConfiLarDB> | null = null

/**
 * Abre conexão com IndexedDB
 */
export async function getDB(): Promise<IDBPDatabase<ConfiLarDB>> {
  if (dbInstance) {
    return dbInstance
  }

  dbInstance = await openDB<ConfiLarDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store de perfis
      if (!db.objectStoreNames.contains('profiles')) {
        const profileStore = db.createObjectStore('profiles', { keyPath: 'id' })
        profileStore.createIndex('by-timestamp', 'timestamp')
      }

      // Store de posts
      if (!db.objectStoreNames.contains('posts')) {
        const postStore = db.createObjectStore('posts', { keyPath: 'id' })
        postStore.createIndex('by-timestamp', 'timestamp')
      }

      // Store de transações
      if (!db.objectStoreNames.contains('transactions')) {
        const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' })
        transactionStore.createIndex('by-timestamp', 'timestamp')
        transactionStore.createIndex('by-user', 'data.user_id')
      }

      // Store de ações offline
      if (!db.objectStoreNames.contains('offlineActions')) {
        const actionStore = db.createObjectStore('offlineActions', {
          keyPath: 'id',
          autoIncrement: true
        })
        actionStore.createIndex('by-status', 'status')
        actionStore.createIndex('by-timestamp', 'timestamp')
      }

      // Store de cache genérico
      if (!db.objectStoreNames.contains('cache')) {
        const cacheStore = db.createObjectStore('cache', { keyPath: 'key' })
        cacheStore.createIndex('by-timestamp', 'timestamp')
      }

      console.log('✅ IndexedDB criado/atualizado com sucesso')
    }
  })

  return dbInstance
}

/**
 * Armazena dados no IndexedDB
 */
export async function setStorageData<T>(
  store: 'profiles' | 'posts' | 'transactions' | 'cache',
  key: string,
  data: T,
  ttl: number = 24 * 60 * 60 * 1000 // 24 horas por padrão
): Promise<void> {
  try {
    const db = await getDB()
    const now = Date.now()
    
    await db.put(store, {
      id: key,
      data,
      timestamp: now,
      expiresAt: now + ttl
    } as any)
  } catch (error) {
    console.error(`❌ Erro ao salvar em ${store}:`, error)
  }
}

/**
 * Recupera dados do IndexedDB
 */
export async function getStorageData<T>(
  store: 'profiles' | 'posts' | 'transactions' | 'cache',
  key: string
): Promise<T | null> {
  try {
    const db = await getDB()
    const stored = await db.get(store, key) as any
    
    if (!stored) return null
    
    // Verificar se expirou
    if (stored.expiresAt < Date.now()) {
      await db.delete(store, key)
      return null
    }
    
    return stored.data as T
  } catch (error) {
    console.error(`❌ Erro ao ler de ${store}:`, error)
    return null
  }
}

/**
 * Remove dados do IndexedDB
 */
export async function removeStorageData(
  store: 'profiles' | 'posts' | 'transactions' | 'cache',
  key: string
): Promise<void> {
  try {
    const db = await getDB()
    await db.delete(store, key)
  } catch (error) {
    console.error(`❌ Erro ao remover de ${store}:`, error)
  }
}

/**
 * Limpa dados expirados do IndexedDB
 */
export async function cleanupExpiredData(): Promise<void> {
  try {
    const db = await getDB()
    const now = Date.now()
    
    // Limpar perfis expirados
    const profiles = await db.getAll('profiles')
    for (const profile of profiles) {
      if (profile.expiresAt < now) {
        await db.delete('profiles', profile.id)
      }
    }
    
    // Limpar posts expirados
    const posts = await db.getAll('posts')
    for (const post of posts) {
      if (post.expiresAt < now) {
        await db.delete('posts', post.id)
      }
    }
    
    // Limpar transações expiradas
    const transactions = await db.getAll('transactions')
    for (const transaction of transactions) {
      if (transaction.expiresAt < now) {
        await db.delete('transactions', transaction.id)
      }
    }
    
    // Limpar cache expirado
    const cache = await db.getAll('cache')
    for (const item of cache) {
      if (item.expiresAt < now) {
        await db.delete('cache', item.key)
      }
    }
    
    console.log('🧹 Limpeza de dados expirados concluída')
  } catch (error) {
    console.error('❌ Erro ao limpar dados expirados:', error)
  }
}

/**
 * Salva ação offline para sincronização posterior
 */
export async function saveOfflineAction(
  type: 'create_post' | 'like' | 'comment' | 'transfer_points' | 'update_profile',
  payload: any
): Promise<number> {
  try {
    const db = await getDB()
    const action = {
      type,
      payload,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending' as const
    }
    
    const id = await db.add('offlineActions', action as any)
    console.log(`💾 Ação offline salva: ${type} (ID: ${id})`)
    return id as number
  } catch (error) {
    console.error('❌ Erro ao salvar ação offline:', error)
    throw error
  }
}

/**
 * Obtém ações offline pendentes
 */
export async function getPendingOfflineActions(): Promise<any[]> {
  try {
    const db = await getDB()
    const index = db.transaction('offlineActions').store.index('by-status')
    const actions = await index.getAll('pending')
    return actions as any[]
  } catch (error) {
    console.error('❌ Erro ao buscar ações offline:', error)
    return []
  }
}

/**
 * Marca ação como sincronizada
 */
export async function markActionAsCompleted(actionId: number): Promise<void> {
  try {
    const db = await getDB()
    const action = await db.get('offlineActions', actionId)
    if (action) {
      await db.put('offlineActions', {
        ...action,
        status: 'completed'
      } as any)
    }
  } catch (error) {
    console.error('❌ Erro ao marcar ação como completa:', error)
  }
}

/**
 * Incrementa tentativas de uma ação
 */
export async function incrementActionRetries(actionId: number): Promise<void> {
  try {
    const db = await getDB()
    const action = await db.get('offlineActions', actionId)
    if (action) {
      await db.put('offlineActions', {
        ...action,
        retries: (action.retries || 0) + 1,
        status: action.retries >= 5 ? 'failed' : 'pending'
      } as any)
    }
  } catch (error) {
    console.error('❌ Erro ao incrementar tentativas:', error)
  }
}

/**
 * Limpa ações completadas antigas (mais de 7 dias)
 */
export async function cleanupCompletedActions(): Promise<void> {
  try {
    const db = await getDB()
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    
    const allActions = await db.getAll('offlineActions')
    for (const action of allActions) {
      if (action.status === 'completed' && action.timestamp < sevenDaysAgo) {
        await db.delete('offlineActions', action.id!)
      }
    }
  } catch (error) {
    console.error('❌ Erro ao limpar ações completadas:', error)
  }
}


