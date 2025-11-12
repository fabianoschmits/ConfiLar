import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authenticatedRoute'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * POST /api/posts/share
 * 
 * Compartilha um post com uma lista de usuários, criando notificações.
 * 
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Usa sempre user.id autenticado (ignora fromUserId do body)
 * - ✅ Busca nome real do usuário do banco de dados
 * - ✅ Previne impersonação e spam
 */
export const POST = withAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const body = await request.json()
    const { postId, userIds, message } = body

    // ✅ IGNORAR fromUserId e fromUserName do body - sempre usar dados autenticados
    const authenticatedUserId = user.id

    console.log('📤 API: Compartilhando post:', { postId, userIds: userIds?.length, authenticatedUserId })

    // Validar dados de entrada
    if (!postId) {
      return NextResponse.json(
        { error: 'postId é obrigatório' },
        { status: 400 }
      )
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds deve ser um array não vazio' },
        { status: 400 }
      )
    }

    // Validar que todos os userIds são UUIDs válidos
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    for (const userId of userIds) {
      if (!uuidRegex.test(userId)) {
        return NextResponse.json(
          { error: `userId inválido: ${userId}` },
          { status: 400 }
        )
      }
    }

    // Usar admin client apenas após validar autenticação
    const adminSupabase = createAdminSupabaseClient()

    // Buscar informações do post
    const { data: postData, error: postError } = await adminSupabase
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

    // ✅ Buscar nome real do usuário autenticado do banco de dados
    const { data: profileData, error: profileError } = await supabaseAuth
      .from('profiles')
      .select('full_name')
      .eq('id', authenticatedUserId)
      .single()

    if (profileError || !profileData) {
      console.error('❌ API: Erro ao buscar perfil:', profileError)
      return NextResponse.json(
        { error: 'Erro ao buscar informações do usuário' },
        { status: 500 }
      )
    }

    const fromUserName = profileData.full_name || 'Usuário'

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
        from_user_id: authenticatedUserId, // 🔒 Sempre ID autenticado
        message: message || null,
        type: 'shared_post'
      },
      is_read: false
    }))

    const { data, error } = await adminSupabase
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

    // Registrar compartilhamento na tabela post_shares (tipo 'user')
    try {
      // Verificar se o usuário já compartilhou este post com outros usuários antes
      const { data: existingShare } = await adminSupabase
        .from('post_shares')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', authenticatedUserId)
        .eq('share_type', 'user')
        .maybeSingle()

      // Se não existe, registrar o compartilhamento
      if (!existingShare) {
        await adminSupabase
          .from('post_shares')
          .insert({
            post_id: postId,
            user_id: authenticatedUserId,
            share_type: 'user',
            shared_at: new Date().toISOString()
          })
        
        console.log('✅ API: Compartilhamento registrado na tabela post_shares')
      } else {
        console.log('ℹ️ API: Usuário já havia compartilhado este post anteriormente')
      }
    } catch (shareError: any) {
      // Se a tabela não existir ou houver erro de permissão, apenas logar e continuar
      if (shareError.code === 'PGRST205' || shareError.code === '42501' || 
          shareError.message?.includes('403') || shareError.message?.includes('permission denied') ||
          shareError.message?.includes('post_shares')) {
        console.log('⚠️ API: Não foi possível registrar compartilhamento (tabela pode não existir)')
      } else {
        console.error('❌ API: Erro ao registrar compartilhamento:', shareError)
      }
    }

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
})

