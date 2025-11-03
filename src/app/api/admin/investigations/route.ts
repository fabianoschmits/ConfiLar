import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/authenticatedRoute'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * GET /api/admin/investigations
 * 
 * Lista investigações agrupadas por usuário.
 * 
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem visualizar investigações
 */
export const GET = withAdminAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const adminSupabase = createAdminSupabaseClient()
    
    // Buscar usuários que têm denúncias pendentes ou em revisão
    const { data: investigations, error } = await adminSupabase
      .from('reports')
      .select(`
        reported_user_id,
        report_type,
        reason,
        description,
        status,
        priority,
        created_at
      `)
      .not('reported_user_id', 'is', null)
      .in('status', ['pending', 'reviewing'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar investigações:', error)
      return NextResponse.json({ error: 'Erro ao buscar investigações' }, { status: 500 })
    }

    // Agrupar por usuário e buscar informações dos usuários
    const groupedInvestigations = investigations?.reduce((acc: any, investigation: any) => {
      const userId = investigation.reported_user_id
      if (!acc[userId]) {
        acc[userId] = {
          user: null, // Será preenchido depois
          reports: [],
          total_reports: 0,
          pending_reports: 0,
          reviewing_reports: 0,
          last_report_date: investigation.created_at
        }
      }
      
      acc[userId].reports.push(investigation)
      acc[userId].total_reports++
      
      if (investigation.status === 'pending') {
        acc[userId].pending_reports++
      } else if (investigation.status === 'reviewing') {
        acc[userId].reviewing_reports++
      }
      
      if (new Date(investigation.created_at) > new Date(acc[userId].last_report_date)) {
        acc[userId].last_report_date = investigation.created_at
      }
      
      return acc
    }, {})

    // Buscar informações dos usuários
    const investigationsList = await Promise.all(
      Object.entries(groupedInvestigations || {}).map(async ([userId, investigation]: [string, any]) => {
        // Buscar informações do usuário
        const { data: userData } = await adminSupabase
          .from('profiles')
          .select('id, full_name, email, user_type, avatar_url')
          .eq('id', userId)
          .single()

        return {
          ...investigation,
          user: userData
        }
      })
    )

    return NextResponse.json({ investigations: investigationsList })
  } catch (error) {
    console.error('Erro na API de investigações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})
