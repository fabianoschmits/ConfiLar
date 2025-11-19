import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authenticatedRoute'

/**
 * GET /api/payment/abacatepay/check
 * 
 * Verifica o status de um pagamento PIX via AbacatePay
 * 
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Verifica se o pagamento pertence ao usuário autenticado
 */
export const GET = withAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('id')
    const purchaseId = searchParams.get('purchase_id')

    if (!paymentId && !purchaseId) {
      return NextResponse.json(
        { error: 'ID do pagamento ou compra é obrigatório' },
        { status: 400 }
      )
    }

    // Obter chave API do AbacatePay
    const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY || 'abc_dev_RMYeHNQksWPBDEChZKZQY2xs'
    const ABACATEPAY_API_URL = process.env.ABACATEPAY_API_URL || 'https://api.abacatepay.com/v1'

    // Se tiver purchase_id, buscar o payment_id do banco
    let qrCodeId = paymentId
    if (purchaseId && !paymentId) {
      const { data: purchase, error: purchaseError } = await supabaseAuth
        .from('points_purchases')
        .select('payment_id, user_id')
        .eq('id', purchaseId)
        .eq('user_id', user.id) // Garantir que é do usuário autenticado
        .single()

      if (purchaseError || !purchase) {
        return NextResponse.json(
          { error: 'Compra não encontrada' },
          { status: 404 }
        )
      }

      qrCodeId = purchase.payment_id
    }

    if (!qrCodeId) {
      return NextResponse.json(
        { error: 'ID do QR Code não encontrado' },
        { status: 400 }
      )
    }

    // Chamar API do AbacatePay para verificar status
    // Endpoint: GET /pixQrCode/check?id=<id>
    const abacateResponse = await fetch(`${ABACATEPAY_API_URL}/pixQrCode/check?id=${qrCodeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_API_KEY}`
      }
    })

    const abacateData = await abacateResponse.json()

    if (!abacateResponse.ok) {
      console.error('❌ Erro ao verificar status:', abacateData)
      return NextResponse.json(
        { error: abacateData.error || 'Erro ao verificar status do pagamento' },
        { status: abacateResponse.status || 500 }
      )
    }

    // Estrutura da resposta conforme documentação
    // Response: { data: { status, expiresAt }, error: null }
    if (abacateData.error) {
      console.error('❌ Erro na resposta AbacatePay:', abacateData.error)
      return NextResponse.json(
        { error: abacateData.error || 'Erro ao verificar status' },
        { status: 400 }
      )
    }

    const responseData = abacateData.data
    
    if (!responseData) {
      console.error('❌ Resposta sem data:', abacateData)
      return NextResponse.json(
        { error: 'Resposta inválida da API' },
        { status: 500 }
      )
    }

    const status = responseData.status // PENDING, PAID, etc.
    const expiresAt = responseData.expiresAt

    // Mapear status do AbacatePay para nosso sistema
    // Status possíveis: PENDING, PAID, EXPIRED, CANCELLED
    let mappedStatus: 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled' | 'refunded' = 'pending'
    
    if (status === 'PAID' || status === 'paid') {
      mappedStatus = 'approved'
    } else if (status === 'PENDING' || status === 'pending') {
      mappedStatus = 'pending'
    } else if (status === 'EXPIRED' || status === 'expired') {
      mappedStatus = 'cancelled'
    } else if (status === 'CANCELLED' || status === 'cancelled' || status === 'canceled') {
      mappedStatus = 'cancelled'
    } else if (status === 'REJECTED' || status === 'rejected' || status === 'failed' || status === 'error') {
      mappedStatus = 'rejected'
    }

    // Se tiver purchase_id, atualizar status no banco
    if (purchaseId) {
      await supabaseAuth
        .from('points_purchases')
        .update({
          status: mappedStatus,
          payment_data: abacateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      success: true,
      status: mappedStatus,
      paymentStatus: status,
      expiresAt: expiresAt,
      data: responseData,
      paymentId: qrCodeId
    })

  } catch (error) {
    console.error('❌ Erro ao verificar status do pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
})

