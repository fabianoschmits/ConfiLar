import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * CRON Job para manter classificados premium: cria notificações (NÃO desativa mais)
 * 
 * ⚠️ NOTA: Os cron jobs do pg_cron foram removidos do projeto.
 * Esta rota pode ser chamada manualmente ou por um serviço externo
 * (Vercel Cron, GitHub Actions, etc.) para executar a manutenção.
 * 
 * ⚠️ IMPORTANTE: As funções foram modificadas para NÃO desativar posts/anúncios.
 * 
 * Funções executadas:
 * - Cria notificações para anúncios expirando em breve (24h)
 * - Cria notificações para anúncios que acabaram de expirar
 * - NÃO desativa mais anúncios premium expirados
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

    const deactivatedCount = 0 // Sempre 0 agora, pois não desativa mais
    const expiringNotifications = result?.expiring_notifications || 0
    const expiredNotifications = result?.expired_notifications || 0

    console.log(`✅ Manutenção concluída (apenas notificações):`)
    console.log(`   - ${expiringNotifications} notificações de expiração criadas`)
    console.log(`   - ${expiredNotifications} notificações de expirados criadas`)
    console.log(`   - ⚠️ Nenhum anúncio foi desativado`)

    return NextResponse.json({
      success: true,
      message: 'Notificações de classificados premium criadas (nenhum anúncio foi desativado)',
      deactivated: deactivatedCount, // Sempre 0
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

