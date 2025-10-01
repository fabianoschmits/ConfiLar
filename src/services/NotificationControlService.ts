import { supabase } from '@/lib/supabase'

/**
 * Serviço para controlar duplicação de notificações
 */
export class NotificationControlService {
  private static processedNotifications = new Set<string>()

  /**
   * Gera uma chave única para a notificação baseada no tipo, usuário e dados específicos
   */
  private static generateNotificationKey(
    type: string,
    userId: string,
    relatedData: any
  ): string {
    const dataHash = JSON.stringify(relatedData)
    return `${type}_${userId}_${dataHash}`
  }

  /**
   * Verifica se uma notificação já foi processada
   */
  static async isNotificationProcessed(
    type: string,
    userId: string,
    relatedData: any
  ): Promise<boolean> {
    const key = this.generateNotificationKey(type, userId, relatedData)
    
    // Verificar no cache local
    if (this.processedNotifications.has(key)) {
      console.log('⏭️ Notificação já processada (cache local):', key)
      return true
    }

    // Verificar no banco de dados (últimas 2 horas - mais restritivo)
    const { data: existingNotification } = await supabase
      .from('notifications')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('type', type)
      .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (existingNotification && existingNotification.length > 0) {
      console.log('⏭️ Notificação já processada (banco de dados):', key)
      // Adicionar ao cache local para evitar futuras consultas
      this.processedNotifications.add(key)
      return true
    }

    return false
  }

  /**
   * Marca uma notificação como processada
   */
  static markAsProcessed(
    type: string,
    userId: string,
    relatedData: any
  ): void {
    const key = this.generateNotificationKey(type, userId, relatedData)
    this.processedNotifications.add(key)
  }

  /**
   * Limpa o cache de notificações processadas (chamado periodicamente)
   */
  static clearProcessedCache(): void {
    this.processedNotifications.clear()
  }

  /**
   * Verifica se um usuário já recebeu notificação de boas-vindas
   */
  static async hasUserReceivedWelcome(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'system')
      .ilike('title', '%Bem-vindo%')
      .limit(1)

    return data && data.length > 0
  }

  /**
   * Verifica se um usuário já recebeu notificação de primeiro acesso
   */
  static async hasUserReceivedFirstAccess(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'system')
      .ilike('title', '%Primeiro acesso%')
      .limit(1)

    return data && data.length > 0
  }
}
