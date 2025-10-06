import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Token de autorização necessário' }, { status: 401 })
    }

    // Usar o cliente supabase já configurado
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    // Coletar todos os dados do usuário
    const userData = {
      // Dados básicos do perfil
      profile: await getProfileData(supabase, user.id),
      
      // Mensagens
      messages: await getMessagesData(supabase, user.id),
      
      // Conversas
      conversations: await getConversationsData(supabase, user.id),
      
      // Avaliações
      reviews: await getReviewsData(supabase, user.id),
      
      // Favoritos
      favorites: await getFavoritesData(supabase, user.id),
      
      // Classificados
      classifieds: await getClassifiedsData(supabase, user.id),
      
      // Notificações
      notifications: await getNotificationsData(supabase, user.id),
      
      // Posts do feed
      feedPosts: await getFeedPostsData(supabase, user.id),
      
      // Metadados
      metadata: {
        exportDate: new Date().toISOString(),
        userId: user.id,
        dataVersion: '1.0',
        totalRecords: 0 // Será calculado
      }
    }

    // Calcular total de registros
    userData.metadata.totalRecords = Object.values(userData)
      .filter(item => Array.isArray(item))
      .reduce((total, array) => total + array.length, 0)

    // Gerar arquivo JSON
    const jsonData = JSON.stringify(userData, null, 2)
    
    // Criar resposta com download
    const response = new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="confilar-dados-${user.id}-${new Date().toISOString().split('T')[0]}.json"`,
        'Content-Length': Buffer.byteLength(jsonData).toString()
      }
    })

    return response

  } catch (error) {
    console.error('Erro ao exportar dados:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}

// Funções auxiliares para coletar dados
async function getProfileData(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return error ? [] : [data]
}

async function getMessagesData(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  
  return error ? [] : data || []
}

async function getConversationsData(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`client_id.eq.${userId},professional_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  
  return error ? [] : data || []
}

async function getReviewsData(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .or(`reviewer_id.eq.${userId},reviewed_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  
  return error ? [] : data || []
}

async function getFavoritesData(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return error ? [] : data || []
}

async function getClassifiedsData(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('classified_ads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return error ? [] : data || []
}

async function getNotificationsData(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return error ? [] : data || []
}

async function getFeedPostsData(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('feed_posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return error ? [] : data || []
}
