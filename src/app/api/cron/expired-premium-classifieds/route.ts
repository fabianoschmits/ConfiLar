import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * CRON Job para manter classificados premium: remove status premium quando expira
 * 
 * ⚠️ NOTA: Os cron jobs do pg_cron foram removidos do projeto.
 * Esta rota pode ser chamada manualmente ou por um serviço externo
 * (Vercel Cron, GitHub Actions, etc.) para executar a manutenção.
 * 
 * Funções executadas:
 * - Cria notificações para anúncios expirando em breve (24h)
 * - Remove status premium e featured de anúncios que expiraram
 * - Cria notificações para anúncios que acabaram de expirar
 * - Converte anúncios premium expirados para anúncios normais
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

    // Usar função do banco que faz tudo: desativa expirados e cria notificações
    const { data: result, error: rpcError } = await supabase
      .rpc('maintain_premium_classifieds')

    if (rpcError) {
      console.error('❌ Erro ao executar manutenção de classificados premium:', rpcError)
      return NextResponse.json(
        { error: 'Erro ao executar manutenção', details: rpcError.message },
        { status: 500 }
      )
    }

    const deactivatedCount = result?.deactivated_count || 0
    const expiringNotifications = result?.expiring_notifications || 0
    const expiredNotifications = result?.expired_notifications || 0

    console.log(`✅ Manutenção concluída:`)
    console.log(`   - ${deactivatedCount} classificados premium foram convertidos para normais`)
    console.log(`   - ${expiringNotifications} notificações de expiração criadas`)
    console.log(`   - ${expiredNotifications} notificações de expirados criadas`)

    return NextResponse.json({
      success: true,
      message: 'Classificados premium expirados foram convertidos para normais e notificações criadas',
      deactivated: deactivatedCount,
      expiring_notifications: expiringNotifications,
      expired_notifications: expiredNotifications,
      timestamp: result?.timestamp
    })
  } catch (error: any) {
    console.error('❌ Erro inesperado no CRON job:', error)
    return NextResponse.json(
      { error: 'Erro inesperado', details: error.message },
      { status: 500 }
    )
  }
}

// Permitir POST também (alguns serviços de CRON usam POST)
export const POST = GET

