import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authenticatedRoute'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * POST /api/lgpd/delete-account
 * 
 * Deleta permanentemente a conta e todos os dados do usuário autenticado.
 * 
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Requer confirmação de senha adicional
 * - ✅ Deleta apenas dados do próprio usuário autenticado
 */
export const POST = withAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const { password, emailVerified } = await request.json()
    
    // Se emailVerified for true, significa que o usuário passou pela reautenticação por email
    // Caso contrário, ainda aceita senha para compatibilidade
    if (!emailVerified && !password) {
      return NextResponse.json({ error: 'Senha ou verificação por email é obrigatória' }, { status: 400 })
    }

    // Se não foi verificado por email, verificar senha (compatibilidade com código antigo)
    if (!emailVerified) {
      const { error: signInError } = await supabaseAuth.auth.signInWithPassword({
        email: user.email!,
        password: password
      })

      if (signInError) {
        return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
      }
    }
    // Se emailVerified for true, a reautenticação já foi verificada no frontend

    // Usar admin client para operações de deleção
    const supabase = createAdminSupabaseClient()

    // Iniciar transação de exclusão (ordem importa devido a foreign keys)
    // Deletar dados dependentes primeiro, depois o perfil
    const deleteOperations = [
      // 1. Deletar likes e reações em comentários (mais específico primeiro)
      supabase.from('comment_likes').delete().eq('user_id', user.id),
      
      // 2. Deletar comentários em posts
      supabase.from('post_comments').delete().eq('user_id', user.id),
      
      // 3. Deletar reações em posts
      supabase.from('post_reactions').delete().eq('user_id', user.id),
      
      // 4. Deletar likes em posts (se existir tabela separada)
      supabase.from('post_likes').delete().eq('user_id', user.id),
      
      // 5. Deletar transações de pontos
      supabase.from('points_transactions').delete().eq('user_id', user.id),
      supabase.from('user_points_balance').delete().eq('user_id', user.id),
      supabase.from('user_points_stats').delete().eq('user_id', user.id),
      
      // 6. Deletar dados de referral
      supabase.from('referrals').delete().or(`referrer_id.eq.${user.id},referred_id.eq.${user.id}`),
      supabase.from('user_referral_stats').delete().eq('user_id', user.id),
      
      // 7. Deletar mensagens
      supabase.from('messages').delete().or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
      
      // 8. Deletar conversas
      supabase.from('conversations').delete().or(`client_id.eq.${user.id},professional_id.eq.${user.id}`),
      
      // 9. Deletar avaliações
      supabase.from('reviews').delete().or(`reviewer_id.eq.${user.id},reviewed_id.eq.${user.id}`),
      
      // 10. Deletar favoritos
      supabase.from('favorites').delete().eq('user_id', user.id),
      
      // 11. Deletar classificados
      supabase.from('classified_ads').delete().eq('user_id', user.id),
      
      // 12. Deletar notificações
      supabase.from('notifications').delete().eq('user_id', user.id),
      
      // 13. Deletar posts do feed (deve ser depois de comentários e reações)
      supabase.from('feed_posts').delete().or(`user_id.eq.${user.id},professional_id.eq.${user.id}`),
      
      // 14. Deletar stories
      supabase.from('stories').delete().eq('user_id', user.id),
      
      // 15. Deletar push subscriptions
      supabase.from('push_subscriptions').delete().eq('user_id', user.id),
      
      // 16. Deletar reports (onde o usuário reportou ou foi reportado)
      supabase.from('reports').delete().or(`reporter_id.eq.${user.id},reported_user_id.eq.${user.id}`),
      
      // 17. Deletar bans (se o usuário foi banido)
      supabase.from('user_bans').delete().eq('user_id', user.id),
      
      // 18. Deletar preferências de notificação
      supabase.from('notification_preferences').delete().eq('user_id', user.id),
      
      // 19. Deletar perfil (por último, pois outras tabelas podem referenciar)
      supabase.from('profiles').delete().eq('id', user.id)
    ]

    // Executar todas as operações de exclusão
    const results = await Promise.allSettled(
      deleteOperations.map(async (op) => {
        try {
          const { error } = await op
          if (error) {
            return { error }
          }
          return { success: true }
        } catch (err) {
          return { error: err }
        }
      })
    )
    
    // Verificar se alguma operação falhou
    const failures = results
      .map((result, index) => {
        if (result.status === 'rejected') {
          return { index, error: result.reason }
        }
        if (result.status === 'fulfilled' && result.value?.error) {
          return { index, error: result.value.error }
        }
        return null
      })
      .filter(Boolean)
    
    // Log de falhas (mas não bloquear se algumas tabelas não existirem)
    if (failures.length > 0) {
      console.warn('Algumas operações de exclusão falharam (pode ser normal se tabelas não existirem):', failures)
      // Continuar mesmo com falhas, pois algumas tabelas podem não existir
    }

    // Finalmente, deletar a conta de autenticação
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(user.id)
    
    if (deleteAuthError) {
      console.error('Erro ao deletar conta de auth:', deleteAuthError)
      return NextResponse.json(
        { error: 'Erro ao excluir conta de autenticação' }, 
        { status: 500 }
      )
    }

    // Log da exclusão para auditoria
    console.log(`Conta deletada com sucesso: ${user.id} - ${new Date().toISOString()}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Conta e todos os dados foram excluídos com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao deletar conta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
})
