import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createAdminSupabaseClient()

    // Total de denúncias
    const { count: totalReports } = await adminSupabase
      .from('reports')
      .select('*', { count: 'exact' })

    // Denúncias pendentes
    const { count: pendingReports } = await adminSupabase
      .from('reports')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')

    // Denúncias resolvidas
    const { count: resolvedReports } = await adminSupabase
      .from('reports')
      .select('*', { count: 'exact' })
      .eq('status', 'resolved')

    // Denúncias dispensadas
    const { count: dismissedReports } = await adminSupabase
      .from('reports')
      .select('*', { count: 'exact' })
      .eq('status', 'dismissed')

    // Denúncias das últimas 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: reportsLast24h } = await adminSupabase
      .from('reports')
      .select('*', { count: 'exact' })
      .gte('created_at', yesterday)

    // Denúncias por tipo
    const { data: reportsByType } = await adminSupabase
      .from('reports')
      .select('report_type')

    const typeStats = reportsByType?.reduce((acc: any, report: any) => {
      acc[report.report_type] = (acc[report.report_type] || 0) + 1
      return acc
    }, {}) || {}

    // Denúncias por prioridade
    const { data: reportsByPriority } = await adminSupabase
      .from('reports')
      .select('priority')

    const priorityStats = reportsByPriority?.reduce((acc: any, report: any) => {
      acc[report.priority] = (acc[report.priority] || 0) + 1
      return acc
    }, {}) || {}

    const stats = {
      total: totalReports || 0,
      pending: pendingReports || 0,
      resolved: resolvedReports || 0,
      dismissed: dismissedReports || 0,
      last24h: reportsLast24h || 0,
      byType: typeStats,
      byPriority: priorityStats
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
