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
    const { userId, title, body, data, icon, badge } = await request.json()

    if (!userId || !title) {
      return NextResponse.json({ error: 'userId e title são obrigatórios' }, { status: 400 })
    }

    const adminSupabase = createAdminSupabaseClient()

    // Buscar subscription do usuário
    const { data: subscription, error: subError } = await adminSupabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Subscription não encontrada' }, { status: 404 })
    }

    // Preparar payload da notificação
    const payload = JSON.stringify({
      title,
      body: body || '',
      icon: icon || '/icon-192x192.png',
      badge: badge || '/icon-96x96.png',
      data: data || {},
      tag: 'confilar-notification',
      requireInteraction: false,
      silent: false
    })

    // Enviar notificação
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    }

    await webpush.sendNotification(pushSubscription, payload)

    console.log('✅ Notificação push enviada para usuário:', userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao enviar notificação push:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 })
  }
}




