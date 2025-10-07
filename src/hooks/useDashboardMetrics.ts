'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { useProfileViews } from '@/hooks/useProfileViews'

export interface DashboardMetrics {
  // Métricas gerais
  totalViews: number
  totalContacts: number
  totalReviews: number
  averageRating: number
  
  // Métricas de crescimento
  viewsGrowth: number
  contactsGrowth: number
  reviewsGrowth: number
  
  // Métricas específicas por tipo de usuário
  professionalMetrics?: {
    totalServices: number
  }
  
  clientMetrics?: {
    favoriteProfessionals: number
  }
  
  // Atividade recente
  recentActivity: Array<{
    id: string
    type: 'message' | 'review' | 'agreement' | 'view'
    title: string
    description: string
    timestamp: string
    icon: string
  }>
  
  // Gráficos de dados
  chartData: {
    viewsOverTime: Array<{ date: string; views: number }>
    contactsOverTime: Array<{ date: string; contacts: number }>
    ratingsOverTime: Array<{ date: string; rating: number }>
  }
}

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user, profile } = useAuthContext()
  const { getViewStats } = useProfileViews()

  const calculateGrowth = async (userId: string, type: 'views' | 'contacts' | 'reviews') => {
    try {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      let currentCount = 0
      let previousCount = 0

      if (type === 'views') {
        // Buscar visualizações dos últimos 30 dias
        const { data: recentViews } = await supabase
          .from('profile_views')
          .select('id')
          .eq('viewed_id', userId)
          .gte('created_at', thirtyDaysAgo.toISOString())

        // Buscar visualizações dos 30 dias anteriores
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        const { data: previousViews } = await supabase
          .from('profile_views')
          .select('id')
          .eq('viewed_id', userId)
          .gte('created_at', sixtyDaysAgo.toISOString())
          .lt('created_at', thirtyDaysAgo.toISOString())

        currentCount = recentViews?.length || 0
        previousCount = previousViews?.length || 0
      } else if (type === 'contacts') {
        // Buscar mensagens dos últimos 30 dias
        const { data: recentMessages } = await supabase
          .from('messages')
          .select('id')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .gte('created_at', thirtyDaysAgo.toISOString())

        // Buscar mensagens dos 30 dias anteriores
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        const { data: previousMessages } = await supabase
          .from('messages')
          .select('id')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .gte('created_at', sixtyDaysAgo.toISOString())
          .lt('created_at', thirtyDaysAgo.toISOString())

        currentCount = recentMessages?.length || 0
        previousCount = previousMessages?.length || 0
      } else if (type === 'reviews') {
        // Buscar avaliações dos últimos 30 dias
        const { data: recentReviews } = await supabase
          .from('reviews')
          .select('id')
          .eq('reviewed_id', userId)
          .gte('created_at', thirtyDaysAgo.toISOString())

        // Buscar avaliações dos 30 dias anteriores
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        const { data: previousReviews } = await supabase
          .from('reviews')
          .select('id')
          .eq('reviewed_id', userId)
          .gte('created_at', sixtyDaysAgo.toISOString())
          .lt('created_at', thirtyDaysAgo.toISOString())

        currentCount = recentReviews?.length || 0
        previousCount = previousReviews?.length || 0
      }

      // Calcular porcentagem de crescimento
      if (previousCount === 0) {
        return currentCount > 0 ? 100 : 0
      }
      
      return Math.round(((currentCount - previousCount) / previousCount) * 100)
    } catch (error) {
      console.error('Erro ao calcular crescimento:', error)
      return 0
    }
  }

  const fetchMetrics = useCallback(async () => {
    if (!user?.id || !profile) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Buscar métricas básicas do perfil (otimizado)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('rating, total_reviews, is_verified, badge')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        console.error('Erro ao buscar dados do perfil:', profileError)
      }

      // Buscar visualizações reais do perfil
      const viewStats = await getViewStats(user.id)
      const viewsCount = viewStats?.total_views || 0
      
      // Buscar contatos/mensagens (otimizado)
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

      const contactsCount = messagesData?.length || 0

      // Buscar avaliações (otimizado)
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, rating_person')
        .eq('reviewed_id', user.id)

      const reviewsCount = reviewsData?.length || 0
      const averageRating = reviewsData?.length > 0 
        ? reviewsData.reduce((sum, review) => sum + review.rating_person, 0) / reviewsData.length 
        : 0

      // Calcular crescimento baseado em dados reais (últimos 30 dias)
      const viewsGrowth = await calculateGrowth(user.id, 'views')
      const contactsGrowth = await calculateGrowth(user.id, 'contacts')
      const reviewsGrowth = await calculateGrowth(user.id, 'reviews')

      // Métricas específicas por tipo de usuário
      let professionalMetrics = undefined
      let clientMetrics = undefined

      if (profile.user_type === 'professional') {
        // Buscar serviços oferecidos
        const servicesCount = profile.professional_services?.length || 0
        
        professionalMetrics = {
          totalServices: servicesCount
        }
      } else {
        // Métricas para clientes - buscar profissionais favoritos
        const { data: favoritesData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)

        clientMetrics = {
          favoriteProfessionals: favoritesData?.length || 0
        }
      }

      // Buscar atividade recente
      const recentActivity = await fetchRecentActivity(user.id)

      // Gerar dados para gráficos (últimos 30 dias)
      const chartData = generateChartData()

      const dashboardMetrics: DashboardMetrics = {
        totalViews: viewsCount,
        totalContacts: contactsCount,
        totalReviews: reviewsCount,
        averageRating: Math.round(averageRating * 10) / 10, // Arredondar para 1 casa decimal
        viewsGrowth,
        contactsGrowth,
        reviewsGrowth,
        professionalMetrics,
        clientMetrics,
        recentActivity,
        chartData
      }

      setMetrics(dashboardMetrics)
    } catch (err) {
      console.error('Erro ao buscar métricas do dashboard:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [user?.id, profile])

  const fetchRecentActivity = async (userId: string) => {
    const activities = []

    try {
      // Buscar mensagens recentes (otimizado)
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('id, content, created_at')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(3) // Reduzir para 3 mensagens

      recentMessages?.forEach(message => {
        activities.push({
          id: `message-${message.id}`,
          type: 'message' as const,
          title: 'Nova mensagem',
          description: message.content?.substring(0, 50) + '...' || 'Mensagem recebida',
          timestamp: message.created_at,
          icon: '💬'
        })
      })

      // Buscar avaliações recentes (otimizado)
      const { data: recentReviews } = await supabase
        .from('reviews')
        .select('id, rating_person, comment, created_at')
        .eq('reviewed_id', userId)
        .order('created_at', { ascending: false })
        .limit(2) // Reduzir para 2 avaliações

      recentReviews?.forEach(review => {
        activities.push({
          id: `review-${review.id}`,
          type: 'review' as const,
          title: 'Nova avaliação',
          description: `${review.rating_person} estrelas - ${review.comment?.substring(0, 30) || 'Sem comentário'}...`,
          timestamp: review.created_at,
          icon: '⭐'
        })
      })

      // Buscar visualizações recentes (otimizado)
      const { data: recentViews } = await supabase
        .from('profile_views')
        .select('id, created_at')
        .eq('viewed_id', userId)
        .order('created_at', { ascending: false })
        .limit(2) // Reduzir para 2 visualizações

      recentViews?.forEach(view => {
        activities.push({
          id: `view-${view.id}`,
          type: 'view' as const,
          title: 'Nova visualização',
          description: 'Seu perfil foi visualizado',
          timestamp: view.created_at,
          icon: '👁️'
        })
      })

      // Ordenar por timestamp e limitar a 10 atividades
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)

    } catch (error) {
      console.error('Erro ao buscar atividade recente:', error)
      return []
    }
  }

  const generateChartData = () => {
    const days = 30
    const viewsOverTime = []
    const contactsOverTime = []
    const ratingsOverTime = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      viewsOverTime.push({
        date: dateStr,
        views: Math.floor(Math.random() * 50) + 10
      })

      contactsOverTime.push({
        date: dateStr,
        contacts: Math.floor(Math.random() * 10) + 1
      })

      ratingsOverTime.push({
        date: dateStr,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10 // Entre 3.0 e 5.0
      })
    }

    return {
      viewsOverTime,
      contactsOverTime,
      ratingsOverTime
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const refreshMetrics = useCallback(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return {
    metrics,
    loading,
    error,
    refreshMetrics
  }
}
