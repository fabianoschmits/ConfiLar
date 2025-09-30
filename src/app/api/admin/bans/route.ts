import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createAdminSupabaseClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    
    let query = adminSupabase
      .from('user_bans')
      .select('*')
      .order('created_at', { ascending: false })

    if (status !== 'all') {
      if (status === 'active') {
        query = query.eq('is_active', true)
      } else if (status === 'revoked') {
        query = query.eq('is_active', false)
      }
    }

    const { data: bans, error } = await query

    if (error) {
      console.error('Erro ao buscar banimentos:', error)
      return NextResponse.json({ error: 'Erro ao buscar banimentos' }, { status: 500 })
    }

    // Enriquecer com informações dos usuários
    const enrichedBans = await Promise.all(
      (bans || []).map(async (ban) => {
        let profile = null

        // Buscar informações do usuário banido
        if (ban.user_id) {
          const { data: profileData } = await adminSupabase
            .from('profiles')
            .select('id, full_name, email, user_type, avatar_url')
            .eq('id', ban.user_id)
            .single()
          profile = profileData
        }

        return {
          ...ban,
          profiles: profile
        }
      })
    )

    return NextResponse.json({ bans: enrichedBans })
  } catch (error) {
    console.error('Erro na API de banimentos:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, reason, banType, durationDays, adminNotes } = await request.json()
    const adminSupabase = createAdminSupabaseClient()

    const banData = {
      user_id: userId,
      reason,
      ban_type: banType,
      duration_days: banType === 'temporary' ? durationDays : null,
      admin_notes: adminNotes,
      status: 'active',
      created_at: new Date().toISOString()
    }

    const { data, error } = await adminSupabase
      .from('user_bans')
      .insert(banData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar banimento:', error)
      return NextResponse.json({ error: 'Erro ao criar banimento' }, { status: 500 })
    }

    return NextResponse.json({ ban: data })
  } catch (error) {
    console.error('Erro na API de criação de banimento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { banId, status, adminNotes } = await request.json()
    const adminSupabase = createAdminSupabaseClient()

    const updateData: any = { 
      updated_at: new Date().toISOString()
    }
    
    // Mapear status para is_active
    if (status === 'revoked') {
      updateData.is_active = false
    } else if (status === 'active') {
      updateData.is_active = true
    }
    
    if (adminNotes) {
      updateData.admin_notes = adminNotes
    }

    const { error } = await adminSupabase
      .from('user_bans')
      .update(updateData)
      .eq('id', banId)

    if (error) {
      console.error('Erro ao atualizar banimento:', error)
      return NextResponse.json({ error: 'Erro ao atualizar banimento' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na API de atualização de banimento:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    }, { status: 500 })
  }
}
