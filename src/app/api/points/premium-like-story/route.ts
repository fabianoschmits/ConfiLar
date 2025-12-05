import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authenticatedRoute'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * POST /api/points/premium-like-story
 * 
 * Cria uma curtida premium em um story, deduzindo pontos do usuário autenticado
 * e adicionando pontos ao criador do story.
 * 
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Usa sempre user.id autenticado (ignora userId do body)
 * - ✅ Previne fraude financeira e manipulação de identidade
 */
export const POST = withAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    console.log('🔍 [Premium Like Story API] Iniciando requisição...')
    
    // Parse do body
    const body = await request.json()
    const { storyId } = body
    
    // ✅ IGNORAR userId do body - sempre usar user.id autenticado
    const authenticatedUserId = user.id
    
    console.log('🔍 [Premium Like Story API] Body recebido:', { storyId, authenticatedUserId })
    
    // Validar dados
    if (!storyId) {
      return NextResponse.json({ error: 'storyId é obrigatório' }, { status: 400 })
    }

    // Usar cliente admin para bypass RLS (após validar autenticação)
    const supabase = createAdminSupabaseClient()
    
    // Buscar informações do story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('user_id')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story não encontrado' }, { status: 404 })
    }

    const storyOwnerId = story.user_id

    if (!storyOwnerId) {
      return NextResponse.json({ error: 'Criador do story não identificado' }, { status: 400 })
    }

    // Não permitir curtir próprio story
    if (authenticatedUserId === storyOwnerId) {
      return NextResponse.json({ error: 'Você não pode curtir seu próprio story' }, { status: 400 })
    }

    // Verificar saldo do usuário autenticado
    const { data: balance, error: balanceError } = await supabase
      .from('user_points_balance')
      .select('balance')
      .eq('user_id', authenticatedUserId) // 🔒 Sempre ID autenticado
      .single()

    if (balanceError) {
      return NextResponse.json({ error: 'Erro ao verificar saldo' }, { status: 500 })
    }

    const pointsCost = 5 // Custo de uma curtida premium

    if (!balance || balance.balance < pointsCost) {
      return NextResponse.json({ 
        error: `Saldo insuficiente. Necessário: ${pointsCost} pontos`,
        balance: balance?.balance || 0 
      }, { status: 400 })
    }

    // SEMPRE criar novo like premium (permite múltiplos likes)
    console.log('🆕 [Premium Like Story API] Criando novo like premium...')
    
    const { data: premiumLike, error: likeError } = await supabase
      .from('story_likes')
      .insert({
        story_id: storyId,
        user_id: authenticatedUserId, // 🔒 Sempre ID autenticado
        is_premium: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (likeError) {
      console.error('❌ [Premium Like Story API] Erro ao criar premium like:', {
        error: likeError,
        code: likeError.code,
        message: likeError.message,
        details: likeError.details,
        hint: likeError.hint,
        storyId,
        userId: authenticatedUserId
      })
      return NextResponse.json({ 
        error: 'Erro ao criar like premium',
        details: likeError.message 
      }, { status: 500 })
    }
    
    console.log('✅ [Premium Like Story API] Like premium criado com sucesso:', premiumLike?.id)

    // 2. Deduzir pontos do usuário autenticado que curtiu
    const { error: deductError } = await supabase
      .rpc('add_points', {
        p_user_id: authenticatedUserId, // 🔒 Sempre ID autenticado
        p_points: -pointsCost,
        p_source: 'premium_like_story',
        p_description: 'Curtida premium em story',
        p_metadata: {
          story_id: storyId,
          owner_id: storyOwnerId
        }
      })

    if (deductError) {
      console.error('Erro ao deduzir pontos:', deductError)
      // Rollback: remover like
      await supabase
        .from('story_likes')
        .delete()
        .eq('id', premiumLike.id)
      return NextResponse.json({ error: 'Erro ao processar pontos' }, { status: 500 })
    }

    // 3. Adicionar pontos ao criador do story
    const { error: rewardError } = await supabase
      .rpc('add_points', {
        p_user_id: storyOwnerId,
        p_points: pointsCost,
        p_source: 'receive_premium_like_story',
        p_description: 'Recebeu curtida premium em story',
        p_metadata: {
          story_id: storyId,
          from_user_id: authenticatedUserId // 🔒 Sempre ID autenticado
        }
      })

    if (rewardError) {
      console.error('⚠️ [Premium Like Story API] Erro ao recompensar criador:', rewardError)
      // Não fazer rollback aqui pois o usuário já pagou
    }

    // 4. Criar notificação para o criador do story
    try {
      // Buscar nome do usuário autenticado que deu premium like
      const { data: likerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', authenticatedUserId) // 🔒 Sempre ID autenticado
        .single()

      const likerName = likerProfile?.full_name || 'Usuário'

      // Criar notificação para o criador do story
      await supabase
        .from('notifications')
        .insert({
          user_id: storyOwnerId,
          type: 'achievement',
          title: '💰 Curtida Premium no Story!',
          message: `${likerName} deu uma curtida premium no seu story (+${pointsCost} pontos)`,
          action_url: `/stories`,
          priority: 'high',
          metadata: {
            story_id: storyId,
            from_user_id: authenticatedUserId, // 🔒 Sempre ID autenticado
            from_user_name: likerName,
            points_received: pointsCost,
            type: 'premium_like_story_received'
          },
          is_read: false
        })

      // Enviar push notification
      try {
        const { NotificationService } = await import('@/services/NotificationService')
        await NotificationService.sendPushNotification(
          storyOwnerId,
          '💰 Curtida Premium no Story!',
          `${likerName} deu uma curtida premium no seu story (+${pointsCost} pontos)`
        )
      } catch (pushError) {
        console.warn('⚠️ [Premium Like Story API] Erro ao enviar push notification:', pushError)
      }
      
      console.log('✅ [Premium Like Story API] Notificação criada para criador do story')
    } catch (notifError) {
      console.error('⚠️ [Premium Like Story API] Erro ao criar notificação:', notifError)
      // Não fazer rollback pois o usuário já pagou
    }

    console.log('✅ [Premium Like Story API] Premium like concluído com sucesso!')

    return NextResponse.json({ 
      success: true,
      like: premiumLike,
      pointsSpent: pointsCost,
      pointsRewarded: pointsCost
    })

  } catch (error) {
    console.error('Erro ao processar premium like story:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
})

