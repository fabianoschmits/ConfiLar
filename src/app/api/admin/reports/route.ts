import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/authenticatedRoute'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * GET /api/admin/reports
 * 
 * Lista todas as denúncias do sistema.
 * 
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem visualizar denúncias
 */
export const GET = withAdminAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const adminSupabase = createAdminSupabaseClient()
    
    // Buscar denúncias
    const { data: reports, error } = await adminSupabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar denúncias:', error)
      return NextResponse.json({ error: 'Erro ao buscar denúncias' }, { status: 500 })
    }

    // Enriquecer com informações dos usuários e contexto
    const enrichedReports = await Promise.all(
      (reports || []).map(async (report) => {
        let reporter = null
        let reportedUser = null
        let reportedPost = null
        let classifiedAd = null
        let conversationMessages = null
        let reviewDetails = null

        // Buscar informações do denunciante
        if (report.reporter_id) {
          const { data: reporterData } = await adminSupabase
            .from('profiles')
            .select('id, full_name, email, user_type, avatar_url')
            .eq('id', report.reporter_id)
            .single()
          reporter = reporterData
        }

        // Buscar informações do usuário denunciado
        if (report.reported_user_id) {
          const { data: reportedUserData } = await adminSupabase
            .from('profiles')
            .select('id, full_name, email, user_type, avatar_url')
            .eq('id', report.reported_user_id)
            .single()
          reportedUser = reportedUserData
        }

        // Buscar informações do post denunciado
        if (report.reported_post_id) {
          const { data: reportedPostData } = await adminSupabase
            .from('feed_posts')
            .select('id, title, content, professional_id')
            .eq('id', report.reported_post_id)
            .single()
          reportedPost = reportedPostData
        }

        // Buscar informações do anúncio classificado denunciado
        if (report.reported_classified_id) {
          const { data: classifiedAdData } = await adminSupabase
            .from('classified_ads')
            .select('id, title, description, user_name, user_id')
            .eq('id', report.reported_classified_id)
            .single()
          classifiedAd = classifiedAdData
        }

        // Para denúncias de conversa, buscar mensagens
        if (report.type === 'other' && report.description.includes('conversa')) {
          // Buscar conversa entre os usuários
          const { data: messagesData } = await adminSupabase
            .from('messages')
            .select(`
              id,
              content,
              created_at,
              updated_at,
              sender_id,
              conversation_id,
              profiles!messages_sender_id_fkey(full_name, avatar_url)
            `)
            .or(`sender_id.eq.${report.reporter_id},sender_id.eq.${report.reported_user_id}`)
            .order('created_at', { ascending: true })
            .limit(50) // Últimas 50 mensagens

          conversationMessages = messagesData
        }

        // Para denúncias de avaliação, buscar detalhes da avaliação
        if (report.type === 'review') {
          const { data: reviewData } = await adminSupabase
            .from('reviews')
            .select(`
              id,
              rating_person,
              comment,
              created_at,
              reviewer_id,
              reviewed_id,
              profiles!reviews_reviewer_id_fkey(full_name, avatar_url)
            `)
            .eq('id', report.reported_message_id)
            .single()

          reviewDetails = reviewData
        }

        return {
          ...report,
          reporter,
          reported_user: reportedUser,
          reported_post: reportedPost,
          classified_ad: classifiedAd,
          conversation_messages: conversationMessages,
          review_details: reviewDetails
        }
      })
    )

    return NextResponse.json({ reports: enrichedReports })
  } catch (error) {
    console.error('Erro na API de denúncias:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

/**
 * PUT /api/admin/reports
 * 
 * Atualiza o status de uma denúncia.
 * 
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem atualizar denúncias
 */
export const PUT = withAdminAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const { reportId, status, notes, resolution } = await request.json()
    const adminSupabase = createAdminSupabaseClient()

    const updateData: any = { status }
    if (notes) updateData.admin_notes = notes
    if (resolution) updateData.resolution = resolution

    const { error } = await adminSupabase
      .from('reports')
      .update(updateData)
      .eq('id', reportId)

    if (error) {
      console.error('Erro ao atualizar denúncia:', error)
      return NextResponse.json({ error: 'Erro ao atualizar denúncia' }, { status: 500 })
    }

    console.log(`✅ Denúncia ${reportId} atualizada por admin ${user.id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na API de atualização:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

/**
 * DELETE /api/admin/reports
 * 
 * Deleta uma denúncia.
 * 
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem deletar denúncias
 */
export const DELETE = withAdminAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')

    if (!reportId) {
      return NextResponse.json({ error: 'ID da denúncia é obrigatório' }, { status: 400 })
    }

    const adminSupabase = createAdminSupabaseClient()

    const { error } = await adminSupabase
      .from('reports')
      .delete()
      .eq('id', reportId)

    if (error) {
      console.error('Erro ao deletar denúncia:', error)
      return NextResponse.json({ error: 'Erro ao deletar denúncia' }, { status: 500 })
    }

    console.log(`✅ Denúncia ${reportId} deletada por admin ${user.id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na API de exclusão:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})
