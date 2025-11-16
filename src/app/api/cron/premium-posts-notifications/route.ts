import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/authenticatedRoute'

/**
 * API para notificações e manutenção de posts premium
 * 
 * ⚠️ NOTA: Esta rota pode ser chamada manualmente por administradores
 * ou por um serviço externo (Cron job, GitHub Actions, etc.)
 * 
 * Funções executadas:
 * - Cria notificações para posts premium expirando em 24h
 * - Remove status premium e featured de posts que expiraram
 * - Cria notificações para posts premium que acabaram de expirar
 * - Converte posts premium expirados para posts normais
 * 
 * Segurança: 
 * - Requer autenticação de administrador (se chamado do frontend)
 * - Ou usa CRON_SECRET (se chamado por serviço externo)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const serviceRoleKeyHeader = request.headers.get('x-service-role-key')
    const cronSecret = process.env.CRON_SECRET
    
    // Verificar se Service Role Key foi fornecida via header (do frontend)
    let serviceRoleKeyToUse: string | undefined = undefined
    
    if (serviceRoleKeyHeader === 'true' && authHeader?.startsWith('Bearer ')) {
      // Service Role Key fornecida pelo frontend
      serviceRoleKeyToUse = authHeader.replace('Bearer ', '')
      console.log('🔑 Service Role Key fornecida via header (frontend)')
    } else if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      // CRON_SECRET configurado (serviço externo)
      serviceRoleKeyToUse = process.env.SUPABASE_SERVICE_ROLE_KEY
      console.log('🔑 Usando CRON_SECRET (serviço externo)')
    }
    
    // Se Service Role Key foi fornecida, usar ela diretamente
    if (serviceRoleKeyToUse) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      
      if (!supabaseUrl) {
        return NextResponse.json(
          { error: 'Supabase URL não configurada' },
          { status: 500 }
        )
      }
      
      // Criar cliente Supabase com a key fornecida
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, serviceRoleKeyToUse, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      // Usar função do banco que cria todas as notificações
      const { data: result, error: rpcError } = await supabase
        .rpc('maintain_premium_posts_notifications')

      if (rpcError) {
        console.error('❌ Erro ao executar notificações de posts premium:', rpcError)
        return NextResponse.json(
          { error: 'Erro ao executar notificações', details: rpcError.message },
          { status: 500 }
        )
      }

      const deactivatedCount = result?.deactivated_count || 0
      const deactivatedIds = result?.deactivated_ids || []
      const expiringNotifications = result?.expiring_notifications || 0
      const expiredNotifications = result?.expired_notifications || 0

      console.log(`✅ Manutenção de posts premium concluída (via Service Role Key):`)
      console.log(`   - ${deactivatedCount} posts premium foram convertidos para posts normais`)
      console.log(`   - ${expiringNotifications} notificações de expiração criadas`)
      console.log(`   - ${expiredNotifications} notificações de expirados criadas`)

      return NextResponse.json({
        success: true,
        message: 'Posts premium expirados foram convertidos para posts normais e notificações criadas',
        deactivated_count: deactivatedCount,
        deactivated_ids: deactivatedIds,
        expiring_notifications: expiringNotifications,
        expired_notifications: expiredNotifications,
        expiring_post_ids: result?.expiring_post_ids || [],
        expired_post_ids: result?.expired_post_ids || [],
        timestamp: result?.timestamp
      })
    }

    // Se não houver Service Role Key, verificar se é admin (execução manual sem key)
    return withAdminAuth(async (req, supabase, user) => {
      // Usar Service Role para bypassar RLS ao executar a função
      const adminSupabase = createAdminSupabaseClient()
      
      // Usar função do banco que cria todas as notificações
      const { data: result, error: rpcError } = await adminSupabase
        .rpc('maintain_premium_posts_notifications')

      if (rpcError) {
        console.error('❌ Erro ao executar notificações de posts premium:', rpcError)
        return NextResponse.json(
          { error: 'Erro ao executar notificações', details: rpcError.message },
          { status: 500 }
        )
      }

      const deactivatedCount = result?.deactivated_count || 0
      const deactivatedIds = result?.deactivated_ids || []
      const expiringNotifications = result?.expiring_notifications || 0
      const expiredNotifications = result?.expired_notifications || 0

      console.log(`✅ Manutenção de posts premium executada por admin ${user.id}:`)
      console.log(`   - ${deactivatedCount} posts premium foram convertidos para posts normais`)
      console.log(`   - ${expiringNotifications} notificações de expiração criadas`)
      console.log(`   - ${expiredNotifications} notificações de expirados criadas`)

      return NextResponse.json({
        success: true,
        message: 'Posts premium expirados foram convertidos para posts normais e notificações criadas',
        deactivated_count: deactivatedCount,
        deactivated_ids: deactivatedIds,
        expiring_notifications: expiringNotifications,
        expired_notifications: expiredNotifications,
        expiring_post_ids: result?.expiring_post_ids || [],
        expired_post_ids: result?.expired_post_ids || [],
        timestamp: result?.timestamp
      })
    })(request)
  } catch (error: any) {
    console.error('❌ Erro inesperado no CRON job de posts premium:', error)
    return NextResponse.json(
      { error: 'Erro inesperado', details: error.message },
      { status: 500 }
    )
  }
}

// Permitir POST também (alguns serviços de CRON usam POST)
export const POST = GET
