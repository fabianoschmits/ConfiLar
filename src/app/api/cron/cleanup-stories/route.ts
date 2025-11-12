import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/authenticatedRoute'

/**
 * API para limpeza de stories antigos
 * 
 * ⚠️ NOTA: Esta rota pode ser chamada manualmente por administradores
 * ou por um serviço externo (Cron job, GitHub Actions, etc.)
 * 
 * Função executada:
 * - Deleta stories que já passaram de 24 horas (expiraram)
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
      
      // Usar função do banco que deleta stories expirados
      const { data: result, error: rpcError } = await supabase
        .rpc('cleanup_expired_stories_report')

      if (rpcError) {
        console.error('❌ Erro ao limpar stories expirados:', rpcError)
        return NextResponse.json(
          { error: 'Erro ao limpar stories', details: rpcError.message },
          { status: 500 }
        )
      }

      const storiesDeleted = result?.stories_deleted || 0

      console.log(`✅ Limpeza de stories concluída (via Service Role Key):`)
      console.log(`   - ${storiesDeleted} stories deletados`)

      return NextResponse.json({
        success: true,
        message: 'Stories expirados deletados com sucesso',
        stories_deleted: storiesDeleted,
        story_ids: result?.story_ids || [],
        timestamp: result?.timestamp
      })
    }

    // Se não houver Service Role Key, verificar se é admin (execução manual sem key)
    return withAdminAuth(async (req, supabase, user) => {
      // Usar Service Role para bypassar RLS ao executar a função
      const adminSupabase = createAdminSupabaseClient()
      
      // Usar função do banco que deleta stories expirados
      const { data: result, error: rpcError } = await adminSupabase
        .rpc('cleanup_expired_stories_report')

      if (rpcError) {
        console.error('❌ Erro ao limpar stories expirados:', rpcError)
        return NextResponse.json(
          { error: 'Erro ao limpar stories', details: rpcError.message },
          { status: 500 }
        )
      }

      const storiesDeleted = result?.stories_deleted || 0

      console.log(`✅ Limpeza de stories executada por admin ${user.id}:`)
      console.log(`   - ${storiesDeleted} stories deletados`)

      return NextResponse.json({
        success: true,
        message: 'Stories expirados deletados com sucesso',
        stories_deleted: storiesDeleted,
        story_ids: result?.story_ids || [],
        timestamp: result?.timestamp
      })
    })(request)
  } catch (error: any) {
    console.error('❌ Erro inesperado na limpeza de stories:', error)
    return NextResponse.json(
      { error: 'Erro inesperado', details: error.message },
      { status: 500 }
    )
  }
}

// Permitir POST também (alguns serviços de CRON usam POST)
export const POST = GET

