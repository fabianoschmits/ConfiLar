'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { Logger } from '@/lib/logger'

// ===================================
// TIPOS
// ===================================

interface BackupConfig {
  tables: string[]
  includeAuth: boolean
  includeStorage: boolean
  compression: boolean
  encryption: boolean
  retentionDays: number
}

interface BackupResult {
  success: boolean
  backupId: string
  timestamp: string
  size: number
  tables: string[]
  error?: string
}

// ===================================
// CONFIGURAÇÃO PADRÃO
// ===================================

const DEFAULT_BACKUP_CONFIG: BackupConfig = {
  tables: [
    'profiles',
    'classified_ads',
    'reviews',
    'conversations',
    'messages',
    'contact_agreements',
    'notifications',
    'portfolio_projects'
  ],
  includeAuth: false, // Auth é gerenciado pelo Supabase
  includeStorage: true,
  compression: true,
  encryption: false, // Implementar se necessário
  retentionDays: 30
}

// ===================================
// FUNÇÕES DE BACKUP
// ===================================

export async function createDatabaseBackup(
  config: Partial<BackupConfig> = {}
): Promise<BackupResult> {
  const backupConfig = { ...DEFAULT_BACKUP_CONFIG, ...config }
  const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const timestamp = new Date().toISOString()
  
  try {
    Logger.info('backup', `Starting database backup: ${backupId}`)
    
    const supabase = createServerSupabaseClient()
    const backupData: Record<string, any[]> = {}
    let totalSize = 0

    // Backup das tabelas
    for (const table of backupConfig.tables) {
      try {
        Logger.debug('backup', `Backing up table: ${table}`)
        
        const { data, error } = await supabase
          .from(table)
          .select('*')
        
        if (error) {
          Logger.error('backup', error, { table, backupId })
          continue
        }
        
        backupData[table] = data || []
        totalSize += JSON.stringify(data).length
        
        Logger.info('backup', `Table ${table} backed up: ${data?.length || 0} records`)
        
      } catch (error) {
        Logger.error('backup', error as Error, { table, backupId })
      }
    }

    // Backup de storage (se habilitado)
    if (backupConfig.includeStorage) {
      try {
        Logger.debug('backup', 'Backing up storage metadata')
        
        const { data: buckets } = await supabase.storage.listBuckets()
        
        if (buckets) {
          backupData.storage_buckets = buckets
          
          // Listar arquivos de cada bucket
          for (const bucket of buckets) {
            const { data: files } = await supabase.storage
              .from(bucket.name)
              .list()
            
            if (files) {
              backupData[`storage_${bucket.name}`] = files
            }
          }
        }
        
      } catch (error) {
        Logger.error('backup', error as Error, { context: 'storage', backupId })
      }
    }

    // Compressão (simulada - implementar com biblioteca se necessário)
    let finalData = backupData
    if (backupConfig.compression) {
      // Implementar compressão real se necessário
      Logger.debug('backup', 'Compression would be applied here')
    }

    // Salvar backup no storage do Supabase
    const backupJson = JSON.stringify(finalData, null, 2)
    const backupFileName = `${backupId}.json`
    
    const { error: uploadError } = await supabase.storage
      .from('backups')
      .upload(backupFileName, new Blob([backupJson], { type: 'application/json' }))

    if (uploadError) {
      throw new Error(`Failed to upload backup: ${uploadError.message}`)
    }

    // Registrar backup na tabela de controle
    await supabase.from('backup_logs').insert({
      backup_id: backupId,
      timestamp,
      tables: backupConfig.tables,
      size: backupJson.length,
      config: backupConfig,
      status: 'completed'
    })

    Logger.info('backup', `Backup completed successfully: ${backupId}`, {
      size: backupJson.length,
      tables: backupConfig.tables.length
    })

    return {
      success: true,
      backupId,
      timestamp,
      size: backupJson.length,
      tables: backupConfig.tables
    }

  } catch (error) {
    Logger.error('backup', error as Error, { backupId })
    
    // Registrar falha no backup
    const supabase = createServerSupabaseClient()
    await supabase.from('backup_logs').insert({
      backup_id: backupId,
      timestamp,
      tables: backupConfig.tables,
      size: 0,
      config: backupConfig,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return {
      success: false,
      backupId,
      timestamp,
      size: 0,
      tables: backupConfig.tables,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ===================================
// RESTAURAÇÃO DE BACKUP
// ===================================

export async function restoreFromBackup(
  backupId: string,
  options: {
    tables?: string[]
    confirmRestore: boolean
  }
): Promise<{ success: boolean; message: string }> {
  
  if (!options.confirmRestore) {
    return {
      success: false,
      message: 'Restore confirmation required'
    }
  }

  try {
    Logger.warn('backup', `Starting restore from backup: ${backupId}`)
    
    const supabase = createServerSupabaseClient()

    // Baixar backup
    const { data: backupFile, error: downloadError } = await supabase.storage
      .from('backups')
      .download(`${backupId}.json`)

    if (downloadError || !backupFile) {
      throw new Error(`Failed to download backup: ${downloadError?.message}`)
    }

    const backupText = await backupFile.text()
    const backupData = JSON.parse(backupText)

    const tablesToRestore = options.tables || Object.keys(backupData).filter(key => 
      !key.startsWith('storage_') && key !== 'storage_buckets'
    )

    // ATENÇÃO: Isso vai substituir dados existentes!
    for (const table of tablesToRestore) {
      if (backupData[table] && Array.isArray(backupData[table])) {
        Logger.warn('backup', `Restoring table: ${table}`)
        
        // Primeiro, limpar a tabela (CUIDADO!)
        await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
        
        // Inserir dados do backup
        const { error: insertError } = await supabase
          .from(table)
          .insert(backupData[table])
        
        if (insertError) {
          Logger.error('backup', insertError, { table, backupId })
        } else {
          Logger.info('backup', `Table ${table} restored: ${backupData[table].length} records`)
        }
      }
    }

    Logger.info('backup', `Restore completed from backup: ${backupId}`)

    return {
      success: true,
      message: `Successfully restored from backup ${backupId}`
    }

  } catch (error) {
    Logger.error('backup', error as Error, { backupId })
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during restore'
    }
  }
}

// ===================================
// LIMPEZA DE BACKUPS ANTIGOS
// ===================================

export async function cleanupOldBackups(retentionDays: number = 30): Promise<void> {
  try {
    Logger.info('backup', `Cleaning up backups older than ${retentionDays} days`)
    
    const supabase = createServerSupabaseClient()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    // Buscar backups antigos
    const { data: oldBackups, error } = await supabase
      .from('backup_logs')
      .select('backup_id')
      .lt('timestamp', cutoffDate.toISOString())

    if (error) {
      throw error
    }

    if (oldBackups && oldBackups.length > 0) {
      // Remover arquivos do storage
      for (const backup of oldBackups) {
        await supabase.storage
          .from('backups')
          .remove([`${backup.backup_id}.json`])
      }

      // Remover registros dos logs
      await supabase
        .from('backup_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())

      Logger.info('backup', `Cleaned up ${oldBackups.length} old backups`)
    }

  } catch (error) {
    Logger.error('backup', error as Error, { retentionDays })
  }
}

// ===================================
// LISTAR BACKUPS DISPONÍVEIS
// ===================================

export async function listAvailableBackups(): Promise<{
  success: boolean
  backups: Array<{
    backup_id: string
    timestamp: string
    size: number
    tables: string[]
    status: string
  }>
}> {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('backup_logs')
      .select('*')
      .eq('status', 'completed')
      .order('timestamp', { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    return {
      success: true,
      backups: data || []
    }

  } catch (error) {
    Logger.error('backup', error as Error)
    
    return {
      success: false,
      backups: []
    }
  }
}

// ===================================
// BACKUP AUTOMÁTICO AGENDADO
// ===================================

export async function scheduleAutomaticBackup(): Promise<void> {
  // Esta função seria chamada por um cron job ou similar
  
  Logger.info('backup', 'Starting scheduled automatic backup')
  
  const result = await createDatabaseBackup({
    ...DEFAULT_BACKUP_CONFIG,
    // Backup automático com configuração padrão
  })

  if (result.success) {
    Logger.info('backup', `Automatic backup completed: ${result.backupId}`)
    
    // Limpeza automática
    await cleanupOldBackups(30)
  } else {
    Logger.error('backup', new Error('Automatic backup failed'), result)
  }
}

