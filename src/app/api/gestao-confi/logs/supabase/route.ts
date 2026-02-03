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

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID é obrigatório' },
        { status: 400 }
      )
    }

    // Validar serviço
    const validServices = ['api', 'auth', 'storage', 'realtime', 'postgres', 'edge-function']
    if (!validServices.includes(service)) {
      return NextResponse.json(
        { error: 'Serviço inválido' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminSupabaseClient()

    // Buscar logs da tabela system_logs do banco
    // Filtrar por categoria que corresponde ao serviço
    const categoryMap: Record<string, string> = {
      'api': 'API',
      'auth': 'AUTH',
      'storage': 'STORAGE',
      'realtime': 'REALTIME',
      'postgres': 'DATABASE',
      'edge-function': 'EDGE_FUNCTION'
    }

    const category = categoryMap[service] || 'API'

    // Buscar logs das últimas 24 horas
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: systemLogs, error: logsError } = await adminSupabase
      .from('system_logs')
      .select('*')
      .eq('category', category)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(500)

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
        user_id: log.user_id
      },
      service: service as 'api' | 'auth' | 'storage' | 'realtime' | 'postgres' | 'edge-function'
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

