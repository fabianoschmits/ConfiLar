import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, userIds, message, fromUserId, fromUserName } = body

    console.log('📤 API: Compartilhando post:', { postId, userIds: userIds.length, fromUserId })

    if (!postId || !userIds || !Array.isArray(userIds) || userIds.length === 0 || !fromUserId) {
      return NextResponse.json(
        { error: 'Dados inválidos. postId, userIds (array) e fromUserId são obrigatórios.' },
        { status: 400 }
      )
    }

    // Buscar informações do post
    const { data: postData, error: postError } = await supabase
      .from('feed_posts')
      .select('title, id')
      .eq('id', postId)
      .single()

    if (postError || !postData) {
      console.error('❌ API: Post não encontrado:', postError)
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Criar notificações para cada usuário
    const notifications = userIds.map((userId: string) => ({
      user_id: userId,
      type: 'info',
      title: 'Post compartilhado',
      message: message || `${fromUserName} compartilhou um post com você`,
      action_url: `/feed?post=${postId}`,
      priority: 'normal',
      metadata: {
        post_id: postId,
        post_title: postData.title,
        shared_by: fromUserName,
        from_user_id: fromUserId,
        message: message || null,
        type: 'shared_post'
      },
      is_read: false
    }))

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select()

    if (error) {
      console.error('❌ API: Erro ao criar notificações:', error)
      return NextResponse.json(
        { error: 'Erro ao compartilhar post', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ API: Post compartilhado com sucesso:', data?.length, 'notificações criadas')

    return NextResponse.json({
      success: true,
      message: `Post compartilhado com ${userIds.length} usuário(s)`,
      notificationsCreated: data?.length || 0
    })
  } catch (error) {
    console.error('❌ API: Erro geral ao compartilhar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

