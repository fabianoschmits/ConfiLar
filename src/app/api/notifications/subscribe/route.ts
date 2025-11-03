import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authenticatedRoute'
import { createAdminSupabaseClient } from '@/lib/supabase'
import webpush from 'web-push'

// Configurar VAPID keys
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
}

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:no-reply@appconfilar.com.br',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
}

/**
 * POST /api/notifications/subscribe
 * 
 * Registra uma subscription de notificações push para o usuário autenticado.
 * 
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Usa sempre user.id autenticado (ignora userId do body)
 * - ✅ Previne que usuários criem subscriptions para outros usuários
 */
export const POST = withAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const { subscription } = await request.json()

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Subscription válida é obrigatória' },
        { status: 400 }
      )
    }

    // ✅ Sempre usar o ID do usuário autenticado (ignorar userId do body)
    const authenticatedUserId = user.id

    // Usar admin client apenas após validar autenticação
    const adminSupabase = createAdminSupabaseClient()

    // Salvar subscription no banco usando ID autenticado
    const { data, error } = await adminSupabase
      .from('push_subscriptions')
      .upsert({
        user_id: authenticatedUserId, // 🔒 Sempre ID autenticado
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar subscription:', error)
      return NextResponse.json({ error: 'Erro ao salvar subscription' }, { status: 500 })
    }

    console.log('✅ Push subscription salva para usuário:', authenticatedUserId)

    return NextResponse.json({ success: true, subscription: data })
  } catch (error) {
    console.error('Erro na API de subscription:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 })
  }
})





















