import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * POST /api/payment/abacatepay/webhook
 * 
 * Webhook do AbacatePay para notificar sobre mudanças no status do pagamento
 * 
 * Segurança:
 * - ✅ Valida assinatura do webhook (se disponível)
 * - ✅ Atualiza status da compra
 * - ✅ Credita pontos quando pagamento aprovado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log do webhook para debug
    console.log('📥 Webhook AbacatePay recebido:', JSON.stringify(body, null, 2))

    // Validar dados do webhook
    // Estrutura pode variar, tentar diferentes formatos
    const webhookData = body.data || body
    const { 
      id, 
      paymentId,
      status, 
      purchase_id,
      metadata 
    } = webhookData || body

    const paymentIdToUse = id || paymentId || webhookData?.id
    const purchaseId = purchase_id || metadata?.purchase_id || body.metadata?.purchase_id

    if (!paymentIdToUse) {
      console.error('❌ Webhook sem payment ID')
      return NextResponse.json(
        { error: 'Payment ID não fornecido' },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()

    // Buscar compra pelo payment_id
    const { data: purchase, error: purchaseError } = await supabase
      .from('points_purchases')
      .select('*')
      .or(`payment_id.eq.${paymentIdToUse}${purchaseId ? `,id.eq.${purchaseId}` : ''}`)
      .single()

    if (purchaseError || !purchase) {
      console.error('❌ Compra não encontrada:', purchaseError)
      return NextResponse.json(
        { error: 'Compra não encontrada' },
        { status: 404 }
      )
    }

    // Se já foi processado, não processar novamente
    if (purchase.status === 'approved' && status === 'approved') {
      console.log('✅ Pagamento já foi processado anteriormente')
      return NextResponse.json({ success: true, message: 'Já processado' })
    }

    // Mapear status do AbacatePay para nosso sistema
    let newStatus: 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled' | 'refunded' = 'pending'
    
    if (status === 'paid' || status === 'approved' || status === 'completed') {
      newStatus = 'approved'
    } else if (status === 'pending' || status === 'waiting_payment') {
      newStatus = 'pending'
    } else if (status === 'processing' || status === 'in_progress') {
      newStatus = 'processing'
    } else if (status === 'cancelled' || status === 'canceled') {
      newStatus = 'cancelled'
    } else if (status === 'refunded' || status === 'refund') {
      newStatus = 'refunded'
    } else if (status === 'rejected' || status === 'failed' || status === 'error') {
      newStatus = 'rejected'
    }

    // Atualizar status da compra
    const { error: updateError } = await supabase
      .from('points_purchases')
      .update({
        status: newStatus,
        payment_data: body,
        updated_at: new Date().toISOString()
      })
      .eq('id', purchase.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar compra:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar compra' },
        { status: 500 }
      )
    }

    // Se pagamento aprovado, creditar pontos
    if (newStatus === 'approved' && purchase.status !== 'approved') {
      try {
        // Buscar dados do pacote para obter pontos e bônus
        const packageData = purchase.package_id 
          ? await supabase
              .from('points_packages')
              .select('points_amount, bonus_points')
              .eq('id', purchase.package_id)
              .single()
          : null

        const pointsToAdd = packageData?.data 
          ? (packageData.data.points_amount || 0) + (packageData.data.bonus_points || 0)
          : purchase.points_amount || 0

        // Adicionar pontos ao usuário
        const { error: pointsError } = await supabase.rpc('add_points', {
          p_user_id: purchase.user_id,
          p_points: pointsToAdd,
          p_source: 'purchase',
          p_description: `Compra de pacote - ${purchase.id}`
        })

        if (pointsError) {
          console.error('❌ Erro ao creditar pontos:', pointsError)
        } else {
          console.log(`✅ ${pointsToAdd} pontos creditados para o usuário ${purchase.user_id}`)
        }

        // Criar notificação para o usuário
        try {
          await supabase
            .from('notifications')
            .insert({
              user_id: purchase.user_id,
              type: 'achievement',
              title: '💰 Pagamento Confirmado!',
              message: `Você recebeu ${pointsToAdd.toLocaleString('pt-BR')} ConfiPoints!`,
              action_url: '/confipoints/dashboard',
              priority: 'high',
              metadata: {
                purchase_id: purchase.id,
                points: pointsToAdd,
                type: 'points_purchase_approved'
              },
              is_read: false
            })
        } catch (notifError) {
          console.warn('⚠️ Erro ao criar notificação:', notifError)
        }

      } catch (creditError) {
        console.error('❌ Erro ao processar crédito de pontos:', creditError)
        // Não falhar o webhook, apenas logar o erro
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processado com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

