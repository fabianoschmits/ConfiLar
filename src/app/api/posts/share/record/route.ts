import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/authenticatedRoute'
import { createAdminSupabaseClient } from '@/lib/supabase'

/**
 * POST /api/posts/share/record
 * 
 * Registra um compartilhamento de post (link, WhatsApp, Messenger)
 * 
 * Segurança:
 * - ✅ Requer autenticação (withAuth)
 * - ✅ Usa sempre user.id autenticado
 * - ✅ Previne duplicação (1 compartilhamento por tipo por usuário)
 */
export const POST = withAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const body = await request.json()
    const { postId, shareType } = body

    const authenticatedUserId = user.id

    console.log('📤 API: Registrando compartilhamento:', { postId, shareType, authenticatedUserId })

    // Validar dados de entrada
    if (!postId) {
      return NextResponse.json(
        { error: 'postId é obrigatório' },
        { status: 400 }
      )
    }

    if (!shareType || !['link', 'whatsapp', 'messenger'].includes(shareType)) {
      return NextResponse.json(
        { error: 'shareType deve ser: link, whatsapp ou messenger' },
        { status: 400 }
      )
    }

    // Usar admin client apenas após validar autenticação
    const adminSupabase = createAdminSupabaseClient()

    // Verificar se o post existe
    const { data: postData, error: postError } = await adminSupabase
      .from('feed_posts')
      .select('id')
      .eq('id', postId)
      .single()

    if (postError || !postData) {
      console.error('❌ API: Post não encontrado:', postError)
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário já compartilhou este post com este tipo
    const { data: existingShare, error: checkError } = await adminSupabase
      .from('post_shares')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', authenticatedUserId)
      .eq('share_type', shareType)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      // Se for erro de permissão ou tabela não existir, simular sucesso
      if (checkError.code === 'PGRST205' || checkError.code === '42501' || 
          checkError.message?.includes('403') || checkError.message?.includes('permission denied')) {
        console.log('⚠️ API: Tabela post_shares não existe ou sem permissão, simulando sucesso')
        return NextResponse.json({
          success: true,
          message: 'Compartilhamento registrado (simulado)',
          isNew: true
        })
      }
      throw checkError
    }

    // Se já existe, retornar sucesso mas indicar que não é novo
    if (existingShare) {
      console.log(`ℹ️ API: Usuário já compartilhou este post via ${shareType}`)
      return NextResponse.json({
        success: true,
        message: 'Compartilhamento já registrado',
        isNew: false
      })
    }

    // Registrar novo compartilhamento
    const { data, error } = await adminSupabase
      .from('post_shares')
      .insert({
        post_id: postId,
        user_id: authenticatedUserId,
        share_type: shareType,
        shared_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      // Se for erro de permissão (403) ou tabela não existir, simular sucesso
      if (error.code === 'PGRST205' || error.code === '42501' || 
          error.message?.includes('403') || error.message?.includes('permission denied')) {
        console.log('⚠️ API: Tabela post_shares não existe ou sem permissão, simulando sucesso')
        return NextResponse.json({
          success: true,
          message: 'Compartilhamento registrado (simulado)',
          isNew: true
        })
      }
      // Se for erro de duplicata, retornar sucesso
      if (error.code === '23505') {
        console.log('ℹ️ API: Compartilhamento já registrado')
        return NextResponse.json({
          success: true,
          message: 'Compartilhamento já registrado',
          isNew: false
        })
      }
      throw error
    }

    console.log('✅ API: Compartilhamento registrado com sucesso:', data.id)

    return NextResponse.json({
      success: true,
      message: 'Compartilhamento registrado',
      isNew: true
    })
  } catch (error) {
    console.error('❌ API: Erro geral ao registrar compartilhamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
})

