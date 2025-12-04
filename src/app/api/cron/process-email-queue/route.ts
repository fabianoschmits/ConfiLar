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

    // Buscar emails pendentes (máximo 50 por vez)
    const { data: emailQueue, error: queueError } = await supabase
      .from('notification_email_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50)

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
        failed: 0
      })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-notification-email`

    let processed = 0
    let failed = 0
    const errors: string[] = []

    // Processar cada email
    for (const emailItem of emailQueue) {
      try {
        // Marcar como processando
        await supabase
          .from('notification_email_queue')
          .update({ 
            status: 'processing',
            attempts: (emailItem.attempts || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', emailItem.id)

        // Chamar Edge Function para enviar email
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            to: emailItem.user_email,
            subject: emailItem.subject,
            template: emailItem.template || 'message',
            data: emailItem.data || {}
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        const result = await response.json()

        // Marcar como enviado
        await supabase
          .from('notification_email_queue')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', emailItem.id)

        processed++
        console.log(`✅ Email enviado para ${emailItem.user_email}: ${emailItem.subject}`)

      } catch (error: any) {
        failed++
        const errorMessage = error.message || 'Erro desconhecido'
        errors.push(`${emailItem.user_email}: ${errorMessage}`)

        // Marcar como falhou (apenas após 3 tentativas)
        if ((emailItem.attempts || 0) >= 3) {
          await supabase
            .from('notification_email_queue')
            .update({ 
              status: 'failed',
              last_error: errorMessage,
              updated_at: new Date().toISOString()
            })
            .eq('id', emailItem.id)
        } else {
          // Voltar para pending para tentar novamente
          await supabase
            .from('notification_email_queue')
            .update({ 
              status: 'pending',
              last_error: errorMessage,
              updated_at: new Date().toISOString()
            })
            .eq('id', emailItem.id)
        }

        console.error(`❌ Erro ao enviar email para ${emailItem.user_email}:`, errorMessage)
      }
    }

    console.log(`✅ Processamento da fila concluído: ${processed} enviados, ${failed} falharam`)

    return NextResponse.json({
      success: true,
      message: `Processados ${processed} emails, ${failed} falharam`,
      processed,
      failed,
      total: emailQueue.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : [] // Limitar erros retornados
    })

  } catch (error: any) {
    console.error('❌ Erro inesperado no CRON job de emails:', error)
    return NextResponse.json(
      { error: 'Erro inesperado', details: error.message },
      { status: 500 }
    )
  }
}

// Permitir POST também (alguns serviços de CRON usam POST)
export const POST = GET

