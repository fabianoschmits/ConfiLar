import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/authenticatedRoute'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * GET /api/gestao-confi/logs/supabase
 * 
 * Busca logs diretamente do Supabase
 * 
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem visualizar logs
 * 
 * Nota: Logs do Supabase são buscados da tabela system_logs do banco
 * Para logs da Management API do Supabase, seria necessário acesso adicional
 */
export const GET = withAdminAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service') || 'api'
    const projectId = searchParams.get('projectId')
    const timeRange = searchParams.get('timeRange') || '24h'

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID é obrigatório' },
        { status: 400 }
      )
    }

    // Validar serviço
    const validServices = ['all', 'api', 'auth', 'storage', 'realtime', 'postgres', 'edge-function', 'posts', 'classifieds', 'users', 'points', 'referrals', 'system', 'admin']
    const serviceLower = service.toLowerCase()

    if (!validServices.includes(serviceLower)) {
      return NextResponse.json(
        { error: 'Serviço inválido' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminSupabaseClient()

    // Buscar logs da tabela system_logs do banco
    const categoryMap: Record<string, string> = {
      'api': 'api',
      'auth': 'auth',
      'storage': 'storage',
      'realtime': 'realtime',
      'postgres': 'postgres',
      'edge-function': 'edge-function',
      'posts': 'posts',
      'classifieds': 'classifieds',
      'users': 'users',
      'points': 'points',
      'referrals': 'referrals',
      'system': 'system',
      'admin': 'admin'
    }

    // Calcular data de início baseada no timeRange
    let startDate: Date | null = new Date()
    switch (timeRange) {
      case '1h':
        startDate.setHours(startDate.getHours() - 1)
        break
      case '24h':
        startDate.setDate(startDate.getDate() - 1)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case 'all':
        startDate = null
        break
      default:
        startDate.setDate(startDate.getDate() - 1) // 24h as fallback
    }

    let query = adminSupabase
      .from('system_logs')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1000)

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    if (serviceLower !== 'all') {
      const category = categoryMap[serviceLower] || serviceLower
      query = query.ilike('category', category)
    }

    const { data: systemLogs, error: logsError } = await query

    if (logsError) {
      console.error('Erro ao buscar logs:', logsError)
      // Se a tabela não existir, retornar array vazio
      if (logsError.code === 'PGRST116' || logsError.message?.includes('does not exist')) {
        return NextResponse.json({
          logs: [],
          message: 'Tabela system_logs não encontrada. Logs serão exibidos quando disponíveis.',
          projectId,
          service
        })
      }
      throw logsError
    }

    // Converter system_logs para formato SupabaseLog
    const logs = (systemLogs || []).map((log: any) => ({
      id: log.id,
      timestamp: log.created_at,
      level: log.level || 'INFO',
      message: log.message || log.action || '',
      metadata: {
        ...log.details,
        category: log.category,
        action: log.action,
        endpoint: log.endpoint,
        status_code: log.status_code,
        user_id: log.user_id,
        user_name: log.profiles?.full_name,
        user_avatar: log.profiles?.avatar_url
      },
      service: (log.category?.toLowerCase() || 'api') as any
    }))

    return NextResponse.json({
      logs,
      projectId,
      service,
      total: logs.length
    })

  } catch (error: any) {
    console.error('❌ Erro ao buscar logs do Supabase:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar logs', details: error.message },
      { status: 500 }
    )
  }
})

