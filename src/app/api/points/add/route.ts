import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authenticatedRoute'
import { AddPointsRequest } from '@/types/points'

/**
 * POST /api/points/add
 * 
 * Adiciona pontos ao usuário autenticado baseado em uma ação.
 * 
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Sempre adiciona pontos ao usuário autenticado (user.id)
 */
export const POST = withAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    // Parse do body
    const body: AddPointsRequest = await request.json()
    
    // Validar dados
    if (!body.action_type) {
      return NextResponse.json({ error: 'Tipo de ação é obrigatório' }, { status: 400 })
    }

    // Buscar valor de pontos da configuração
    const { data: config, error: configError } = await supabaseAuth
      .from('points_config')
      .select('points_value')
      .eq('action_key', body.action_type)
      .eq('is_active', true)
      .single()
    
    if (configError || !config) {
      return NextResponse.json({ error: 'Configuração de pontos não encontrada' }, { status: 400 })
    }
    
    const points = config.points_value
    
    // Montar metadata com informações extras
    const metadata = {
      ...body.metadata,
      referral_id: body.referral_id,
      post_id: body.post_id,
      related_user_id: body.related_user_id
    }
    
    // Adicionar pontos ao usuário autenticado
    const { data, error } = await supabaseAuth
      .rpc('add_points', {
        p_user_id: user.id, // 🔒 Sempre ID autenticado
        p_points: points,
        p_source: body.action_type,
        p_description: body.description,
        p_metadata: metadata
      })

    if (error) {
      console.error('Erro ao adicionar pontos:', error)
      return NextResponse.json({ error: 'Erro ao adicionar pontos' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      points_added: data,
      message: 'Pontos adicionados com sucesso'
    })
  } catch (error) {
    console.error('Erro na API de adicionar pontos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})
