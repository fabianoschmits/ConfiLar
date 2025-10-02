import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import webpush from 'web-push'

// Configurar VAPID keys
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
}

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:contato@confilar.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
}

export async function POST(request: NextRequest) {
  try {
    const { subscription, userId } = await request.json()

    if (!subscription || !userId) {
      return NextResponse.json({ error: 'Subscription e userId são obrigatórios' }, { status: 400 })
    }

    const adminSupabase = createAdminSupabaseClient()

    // Salvar subscription no banco
    const { data, error } = await adminSupabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
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

    console.log('✅ Push subscription salva para usuário:', userId)

    return NextResponse.json({ success: true, subscription: data })
  } catch (error) {
    console.error('Erro na API de subscription:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 })
  }
}




