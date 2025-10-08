import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name')

    console.log('🔍 API: Buscando usuário:', name)

    if (!name) {
      return NextResponse.json(
        { error: 'Nome do usuário não fornecido', userId: null },
        { status: 400 }
      )
    }

    // Buscar usuário pelo nome completo (case insensitive)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .ilike('full_name', name)
      .limit(1)
      .single()

    if (error || !data) {
      console.error('❌ API: Erro ao buscar usuário:', error)
      console.log('🔍 API: Tentando busca parcial...')
      
      // Tentar busca parcial se não encontrar exato
      const { data: partialData, error: partialError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', `%${name}%`)
        .limit(1)
        .single()
      
      if (partialError || !partialData) {
        console.error('❌ API: Usuário não encontrado:', name)
        return NextResponse.json(
          { error: 'Usuário não encontrado', userId: null },
          { status: 404 }
        )
      }
      
      console.log('✅ API: Usuário encontrado (busca parcial):', partialData.full_name, '→', partialData.id)
      return NextResponse.json({ userId: partialData.id })
    }

    console.log('✅ API: Usuário encontrado:', data.full_name, '→', data.id)
    return NextResponse.json({ userId: data.id })
  } catch (error) {
    console.error('❌ API: Erro geral:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', userId: null },
      { status: 500 }
    )
  }
}

