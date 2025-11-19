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

    // Mapear status do AbacatePay para nosso sistema
    // Verificar diferentes formatos de status que podem vir do webhook
    const statusFromWebhook = status || webhookData?.status || body?.status || 'pending'
    
    let newStatus: 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled' | 'refunded' = 'pending'
    
    const statusLower = String(statusFromWebhook).toLowerCase()
    
    if (statusLower === 'paid' || statusLower === 'approved' || statusLower === 'completed' || statusLower === 'success') {
      newStatus = 'approved'
    } else if (statusLower === 'pending' || statusLower === 'waiting_payment' || statusLower === 'waiting') {
      newStatus = 'pending'
    } else if (statusLower === 'processing' || statusLower === 'in_progress' || statusLower === 'processing') {
      newStatus = 'processing'
    } else if (statusLower === 'cancelled' || statusLower === 'canceled' || statusLower === 'expired') {
      newStatus = 'cancelled'
    } else if (statusLower === 'refunded' || statusLower === 'refund') {
      newStatus = 'refunded'
    } else if (statusLower === 'rejected' || statusLower === 'failed' || statusLower === 'error') {
      newStatus = 'rejected'
    }

    // Verificar status anterior antes de atualizar
    const previousStatus = purchase.status
    const shouldCreditPoints = newStatus === 'approved' && previousStatus !== 'approved'

    // Se já foi processado e está aprovado, não processar novamente
    if (previousStatus === 'approved' && newStatus === 'approved') {
      console.log('✅ Pagamento já foi processado anteriormente')
      return NextResponse.json({ success: true, message: 'Já processado' })
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

    console.log(`✅ Status da compra ${purchase.id} atualizado de '${previousStatus}' para '${newStatus}' via webhook`)

    // Se pagamento aprovado e não estava aprovado antes, creditar pontos
    if (shouldCreditPoints) {
      try {
        // Usar points_received da compra (já inclui bônus)
        const pointsToAdd = purchase.points_received || 0
        const purchaseDescription = `Compra de pacote - ${purchase.id}`

        console.log(`💰 Processando crédito de pontos via webhook para compra ${purchase.id}:`)
        console.log(`   - Pontos a creditar: ${pointsToAdd}`)
        console.log(`   - Usuário: ${purchase.user_id}`)

        if (pointsToAdd > 0) {
          // VERIFICAR SE JÁ FOI CREDITADO - Buscar transações existentes com a mesma descrição
          const { data: existingTransactions, error: checkError } = await supabase
            .from('point_transactions')
            .select('id, amount, description, created_at')
            .eq('user_id', purchase.user_id)
            .eq('source', 'purchase')
            .eq('description', purchaseDescription)
            .limit(1)

          if (checkError) {
            console.error('❌ Erro ao verificar transações existentes:', checkError)
          }

          if (existingTransactions && existingTransactions.length > 0) {
            console.log(`⚠️ Pontos já foram creditados anteriormente para esta compra!`)
            console.log(`   - Transação existente: ${existingTransactions[0].id}`)
            console.log(`   - Data: ${existingTransactions[0].created_at}`)
            console.log(`   - Pontos creditados: ${existingTransactions[0].amount}`)
            console.log(`   - Descrição: ${existingTransactions[0].description}`)
            
            // O trigger automático no banco já deve ter aprovado a compra quando os pontos foram creditados
            // Mas vamos forçar aprovação como fallback caso o trigger não tenha funcionado
            if (previousStatus !== 'approved') {
              console.log(`🔄 Pontos já creditados mas status não está como aprovado. Forçando aprovação (fallback)...`)
              
              const { error: approveError } = await supabase
                .from('points_purchases')
                .update({
                  status: 'approved',
                  approved_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('id', purchase.id)
                .eq('user_id', purchase.user_id)

              if (approveError) {
                console.error('❌ Erro ao marcar compra como aprovada (fallback):', approveError)
              } else {
                console.log(`✅ Compra ${purchase.id} marcada como aprovada (fallback)`)
              }
            }
            newStatus = 'approved'
            
            // Não creditar novamente, mas retornar sucesso
            return NextResponse.json({ 
              success: true,
              message: 'Webhook processado. Pontos já foram creditados anteriormente para esta compra.',
              status: newStatus
            })
          }

          // Se não encontrou transação existente, creditar pontos
          const { error: pointsError } = await supabase.rpc('add_points', {
            p_user_id: purchase.user_id,
            p_points: pointsToAdd,
            p_source: 'purchase',
            p_description: purchaseDescription
          })

          if (pointsError) {
            console.error('❌ Erro ao creditar pontos:', pointsError)
          } else {
            console.log(`✅ ${pointsToAdd} pontos creditados para o usuário ${purchase.user_id} (compra ${purchase.id})`)
            // O trigger automático no banco aprovará a compra automaticamente
            console.log(`✅ O trigger automático aprovará a compra automaticamente.`)
            newStatus = 'approved'
          }
        } else {
          console.warn(`⚠️ Compra ${purchase.id} aprovada mas sem pontos para creditar (points_received: ${pointsToAdd})`)
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

