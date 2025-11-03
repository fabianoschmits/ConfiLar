import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * CRON Job para desativar classificados premium expirados
 * 
 * Esta rota deve ser chamada periodicamente (ex: a cada hora) por um serviço externo
 * como Vercel Cron, GitHub Actions, ou similar.
 * 
 * Segurança: Usa Service Role Key para bypassar RLS
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar se é uma requisição autorizada (opcional: adicionar secret header)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminSupabaseClient()

    // Buscar classificados premium expirados
    const now = new Date().toISOString()
    
    const { data: expiredAds, error: fetchError } = await supabase
      .from('classified_ads')
      .select('id, title, premium_expires_at')
      .eq('is_premium', true)
      .eq('is_active', true)
      .lt('premium_expires_at', now)

    if (fetchError) {
      console.error('❌ Erro ao buscar classificados expirados:', fetchError)
      return NextResponse.json(
        { error: 'Erro ao buscar classificados expirados', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!expiredAds || expiredAds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum classificado premium expirado encontrado',
        deactivated: 0
      })
    }

    // Desativar classificados premium expirados
    const { data: updated, error: updateError } = await supabase
      .from('classified_ads')
      .update({
        is_active: false,
        is_premium: false,
        is_featured: false,
        updated_at: new Date().toISOString()
      })
      .eq('is_premium', true)
      .eq('is_active', true)
      .lt('premium_expires_at', now)
      .select('id')

    if (updateError) {
      console.error('❌ Erro ao desativar classificados expirados:', updateError)
      return NextResponse.json(
        { error: 'Erro ao desativar classificados expirados', details: updateError.message },
        { status: 500 }
      )
    }

    const deactivatedCount = updated?.length || 0

    console.log(`✅ ${deactivatedCount} classificados premium expirados foram desativados`)

    return NextResponse.json({
      success: true,
      message: `${deactivatedCount} classificados premium expirados foram desativados`,
      deactivated: deactivatedCount,
      expiredAds: expiredAds.map(ad => ({
        id: ad.id,
        title: ad.title
      }))
    })
  } catch (error: any) {
    console.error('❌ Erro inesperado no CRON job:', error)
    return NextResponse.json(
      { error: 'Erro inesperado', details: error.message },
      { status: 500 }
    )
  }
}

// Permitir POST também (alguns serviços de CRON usam POST)
export const POST = GET

