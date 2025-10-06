import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    // Usar o cliente supabase já configurado
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 })
    }

    // Verificar senha antes de deletar
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password
    })

    if (signInError) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
    }

    // Iniciar transação de exclusão
    const deleteOperations = [
      // 1. Deletar mensagens
      supabase.from('messages').delete().or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
      
      // 2. Deletar conversas
      supabase.from('conversations').delete().or(`client_id.eq.${user.id},professional_id.eq.${user.id}`),
      
      // 3. Deletar avaliações
      supabase.from('reviews').delete().or(`reviewer_id.eq.${user.id},reviewed_id.eq.${user.id}`),
      
      // 4. Deletar favoritos
      supabase.from('favorites').delete().eq('user_id', user.id),
      
      // 5. Deletar classificados
      supabase.from('classified_ads').delete().eq('user_id', user.id),
      
      // 6. Deletar notificações
      supabase.from('notifications').delete().eq('user_id', user.id),
      
      // 7. Deletar posts do feed
      supabase.from('feed_posts').delete().eq('user_id', user.id),
      
      // 8. Deletar push subscriptions
      supabase.from('push_subscriptions').delete().eq('user_id', user.id),
      
      // 9. Deletar perfil (por último)
      supabase.from('profiles').delete().eq('id', user.id)
    ]

    // Executar todas as operações de exclusão
    const results = await Promise.allSettled(deleteOperations)
    
    // Verificar se alguma operação falhou
    const failures = results.filter(result => result.status === 'rejected')
    
    if (failures.length > 0) {
      console.error('Falhas na exclusão:', failures)
      return NextResponse.json(
        { error: 'Erro ao excluir alguns dados. Tente novamente.' }, 
        { status: 500 }
      )
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
}
