import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/authenticatedRoute'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * DELETE /api/admin/posts/[id]
 * 
 * Deleta um post (apenas administradores)
 * 
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem deletar posts
 * - ✅ Usa Service Role Key para bypassar RLS
 * - ✅ Loga ação de deleção
 */
export const DELETE = withAdminAuth(async (
  request: NextRequest,
  supabaseAuth,
  user
) => {
  try {
    // Extrair ID da URL (ex: /api/admin/posts/123)
    const urlParts = request.url.split('/')
    const postId = urlParts[urlParts.length - 1]

    if (!postId) {
      return NextResponse.json(
        { error: 'ID do post é obrigatório' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminSupabaseClient()

    // Buscar informações do post antes de deletar (para log)
    const { data: postData, error: fetchError } = await adminSupabase
      .from('feed_posts')
      .select('id, title, user_id, professional_id, created_at')
      .eq('id', postId)
      .single()

    if (fetchError || !postData) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Deletar o post (e seus relacionamentos via CASCADE se configurado no banco)
    const { error: deleteError } = await adminSupabase
      .from('feed_posts')
      .delete()
      .eq('id', postId)

    if (deleteError) {
      console.error('❌ Erro ao deletar post:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar post', details: deleteError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Post ${postId} deletado por admin ${user.id} (${user.email})`)
    console.log(`📋 Post deletado: ${postData.title || 'Sem título'} | Criado por: ${postData.user_id || postData.professional_id}`)

    return NextResponse.json({
      success: true,
      message: 'Post deletado com sucesso',
      deletedPost: {
        id: postData.id,
        title: postData.title
      }
    })

  } catch (error: any) {
    console.error('❌ Erro inesperado ao deletar post:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
})

