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
    activeAgreements: number
    completedAgreements: number
    totalAgreements: number
  }
  
  clientMetrics?: {
    totalAgreements: number
    activeAgreements: number
    completedAgreements: number
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

  const fetchMetrics = useCallback(async () => {
    if (!user?.id || !profile) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Buscar métricas básicas do perfil
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
      
      // Buscar contatos/mensagens
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, created_at')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

      const contactsCount = messagesData?.length || 0

      // Buscar avaliações
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, rating_person, created_at')
        .eq('reviewed_id', user.id)

      const reviewsCount = reviewsData?.length || 0
      const averageRating = reviewsData?.length > 0 
        ? reviewsData.reduce((sum, review) => sum + review.rating_person, 0) / reviewsData.length 
        : 0

      // Calcular crescimento (simulado)
      const viewsGrowth = Math.floor(Math.random() * 50) - 10 // -10% a +40%
      const contactsGrowth = Math.floor(Math.random() * 30) - 5 // -5% a +25%
      const reviewsGrowth = Math.floor(Math.random() * 20) - 5 // -5% a +15%

      // Métricas específicas por tipo de usuário
      let professionalMetrics = undefined
      let clientMetrics = undefined

      if (profile.user_type === 'professional') {
        // Buscar serviços oferecidos
        const servicesCount = profile.professional_services?.length || 0
        
        // Buscar acordos
        const { data: agreementsData } = await supabase
          .from('contact_agreements')
          .select('id, status')
          .eq('professional_id', user.id)

        const totalAgreements = agreementsData?.length || 0
        const activeAgreements = agreementsData?.filter(a => a.status === 'accepted').length || 0
        const completedAgreements = agreementsData?.filter(a => a.status === 'completed').length || 0
        
        professionalMetrics = {
          totalServices: servicesCount,
          totalAgreements,
          activeAgreements,
          completedAgreements
        }
      } else {
        // Métricas para clientes
        const { data: agreementsData } = await supabase
          .from('contact_agreements')
          .select('id, status, professional_id')
          .eq('client_id', user.id)

        const totalAgreements = agreementsData?.length || 0
        const activeAgreements = agreementsData?.filter(a => a.status === 'accepted').length || 0
        const completedAgreements = agreementsData?.filter(a => a.status === 'completed').length || 0
        
        // Contar profissionais únicos
        const uniqueProfessionals = new Set(
          agreementsData?.map(agreement => agreement.professional_id) || []
        ).size

        clientMetrics = {
          totalAgreements,
          activeAgreements,
          completedAgreements,
          favoriteProfessionals: uniqueProfessionals
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
      // Buscar mensagens recentes
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('id, content, created_at, sender_id, receiver_id')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(5)

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

      // Buscar avaliações recentes
      const { data: recentReviews } = await supabase
        .from('reviews')
        .select('id, rating_person, comment, created_at')
        .eq('reviewed_id', userId)
        .order('created_at', { ascending: false })
        .limit(3)

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

      // Buscar acordos recentes
      const { data: recentAgreements } = await supabase
        .from('contact_agreements')
        .select('id, status, service_description, created_at')
        .or(`client_id.eq.${userId},professional_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(3)

      recentAgreements?.forEach(agreement => {
        activities.push({
          id: `agreement-${agreement.id}`,
          type: 'agreement' as const,
          title: 'Novo acordo',
          description: `Acordo ${agreement.status} - ${agreement.service_description?.substring(0, 30) || 'Serviço'}...`,
          timestamp: agreement.created_at,
          icon: '🤝'
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
