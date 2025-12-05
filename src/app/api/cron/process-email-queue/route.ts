import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * CRON Job para processar a fila de emails de notificações
 * 
 * Esta rota pode ser chamada manualmente ou por um serviço externo
 * (Vercel Cron, GitHub Actions, etc.) para processar emails pendentes.
 * 
 * Processa até 50 emails por execução para evitar timeout
 * 
 * Segurança: Usa Service Role Key para bypassar RLS
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar se é uma requisição autorizada (opcional: adicionar secret header)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminSupabaseClient()

    // Buscar todas as notificações pendentes (sem limite para agrupar)
    const { data: emailQueue, error: queueError } = await supabase
      .from('notification_email_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (queueError) {
      console.error('❌ Erro ao buscar fila de emails:', queueError)
      return NextResponse.json(
        { error: 'Erro ao buscar fila de emails', details: queueError.message },
        { status: 500 }
      )
    }

    if (!emailQueue || emailQueue.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum email pendente na fila',
        processed: 0,
        failed: 0,
        grouped: 0
      })
    }

    // Agrupar notificações por usuário e tipo
    interface GroupedNotifications {
      [key: string]: {
        user_id: string
        user_email: string
        notifications: typeof emailQueue
        groupedByType: {
          [type: string]: typeof emailQueue
        }
      }
    }

    const grouped: GroupedNotifications = {}

    for (const emailItem of emailQueue) {
      const key = `${emailItem.user_id}`
      
      if (!grouped[key]) {
        grouped[key] = {
          user_id: emailItem.user_id,
          user_email: emailItem.user_email,
          notifications: [],
          groupedByType: {}
        }
      }

      grouped[key].notifications.push(emailItem)

      // Agrupar por tipo de notificação
      const notificationType = emailItem.data?.type || emailItem.template || 'other'
      if (!grouped[key].groupedByType[notificationType]) {
        grouped[key].groupedByType[notificationType] = []
      }
      grouped[key].groupedByType[notificationType].push(emailItem)
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-notification-email`

    let processed = 0
    let failed = 0
    let groupedEmails = 0
    const errors: string[] = []

    // Processar cada grupo de usuário
    for (const userId in grouped) {
      const userGroup = grouped[userId]
      
      try {
        // Marcar todas as notificações do usuário como processando
        const notificationIds = userGroup.notifications.map(n => n.id)
        
        // Atualizar cada notificação individualmente para incrementar attempts
        for (const notificationId of notificationIds) {
          const notification = userGroup.notifications.find(n => n.id === notificationId)
          if (notification) {
            await supabase
              .from('notification_email_queue')
              .update({ 
                status: 'processing',
                attempts: (notification.attempts || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', notificationId)
          }
        }

        // Criar email consolidado
        const consolidatedEmail = createConsolidatedEmail(userGroup)

        // Chamar Edge Function para enviar email consolidado
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            to: userGroup.user_email,
            subject: consolidatedEmail.subject,
            template: 'consolidated',
            data: consolidatedEmail.data
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        // Marcar todas como enviadas
        await supabase
          .from('notification_email_queue')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .in('id', notificationIds)

        processed += userGroup.notifications.length
        groupedEmails++
        console.log(`✅ Email consolidado enviado para ${userGroup.user_email}: ${userGroup.notifications.length} notificações agrupadas`)

      } catch (error: any) {
        failed += userGroup.notifications.length
        const errorMessage = error.message || 'Erro desconhecido'
        errors.push(`${userGroup.user_email}: ${errorMessage}`)

        // Verificar tentativas e marcar como falhou ou voltar para pending
        const notificationIds = userGroup.notifications.map(n => n.id)
        const maxAttempts = Math.max(...userGroup.notifications.map(n => n.attempts || 0))
        
        if (maxAttempts >= 3) {
          await supabase
            .from('notification_email_queue')
            .update({ 
              status: 'failed',
              last_error: errorMessage,
              updated_at: new Date().toISOString()
            })
            .in('id', notificationIds)
        } else {
          await supabase
            .from('notification_email_queue')
            .update({ 
              status: 'pending',
              last_error: errorMessage,
              updated_at: new Date().toISOString()
            })
            .in('id', notificationIds)
        }

        console.error(`❌ Erro ao enviar email consolidado para ${userGroup.user_email}:`, errorMessage)
      }
    }

    console.log(`✅ Processamento da fila concluído: ${processed} notificações processadas em ${groupedEmails} emails agrupados, ${failed} falharam`)

    return NextResponse.json({
      success: true,
      message: `Processados ${processed} notificações em ${groupedEmails} emails agrupados, ${failed} falharam`,
      processed,
      failed,
      grouped: groupedEmails,
      total: emailQueue.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : []
    })
  } catch (error: any) {
    console.error('❌ Erro inesperado no CRON job de emails:', error)
    return NextResponse.json(
      { error: 'Erro inesperado', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Criar email consolidado agrupando notificações por tipo
 */
function createConsolidatedEmail(userGroup: {
  user_id: string
  user_email: string
  notifications: any[]
  groupedByType: { [type: string]: any[] }
}) {
  const { groupedByType, notifications } = userGroup
  
  // Contar notificações por tipo
  const summary: { [type: string]: number } = {}
  const details: { [type: string]: any[] } = {}
  
  for (const type in groupedByType) {
    const typeNotifications = groupedByType[type]
    summary[type] = typeNotifications.length
    details[type] = typeNotifications.map(n => ({
      title: n.subject || n.data?.title || 'Notificação',
      message: n.data?.message || '',
      created_at: n.created_at,
      metadata: n.data
    }))
  }

  // Criar assunto do email
  const totalNotifications = notifications.length
  let subject = ''
  
  if (summary.like || summary.premium_like_received || summary.premium_like_story_received) {
    const totalLikes = (summary.like || 0) + (summary.premium_like_received || 0) + (summary.premium_like_story_received || 0)
    subject = `❤️ Você recebeu ${totalLikes} curtida${totalLikes > 1 ? 's' : ''} no ConfiLar!`
  } else if (summary.comment) {
    subject = `💬 Você recebeu ${summary.comment} comentário${summary.comment > 1 ? 's' : ''} no ConfiLar!`
  } else if (summary.message) {
    subject = `💌 Você tem ${summary.message} mensagem${summary.message > 1 ? 'ns' : ''} não lida${summary.message > 1 ? 's' : ''} no ConfiLar!`
  } else if (summary.achievement) {
    subject = `🎉 Você tem ${summary.achievement} nova${summary.achievement > 1 ? 's' : ''} conquista${summary.achievement > 1 ? 's' : ''} no ConfiLar!`
  } else {
    subject = `🔔 Você tem ${totalNotifications} nova${totalNotifications > 1 ? 's' : ''} notificação${totalNotifications > 1 ? 'ões' : ''} no ConfiLar!`
  }

  return {
    subject,
    data: {
      user_id: userGroup.user_id,
      user_email: userGroup.user_email,
      total_notifications: totalNotifications,
      summary,
      details,
      grouped_by_type: groupedByType
    }
  }
}

// Permitir POST também (alguns serviços de CRON usam POST)
export const POST = GET

