'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'

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
    totalEarnings: number
    activeBookings: number
    completedJobs: number
    earningsGrowth: number
  }
  
  clientMetrics?: {
    totalBookings: number
    totalSpent: number
    favoriteProfessionals: number
    bookingsGrowth: number
  }
  
  // Atividade recente
  recentActivity: Array<{
    id: string
    type: 'view' | 'contact' | 'review' | 'booking' | 'message'
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
  // Usar o client Supabase configurado

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
        .single()

      if (profileError) {
        console.error('Erro ao buscar dados do perfil:', profileError)
      }

      // Buscar visualizações do perfil (simulado - você pode implementar uma tabela de views)
      const viewsCount = Math.floor(Math.random() * 1000) + 100
      
      // Buscar contatos/mensagens
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, created_at')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

      const contactsCount = messagesData?.length || 0

      // Buscar avaliações
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, rating, created_at')
        .eq('reviewee_id', user.id)

      const reviewsCount = reviewsData?.length || 0
      const averageRating = reviewsData?.length > 0 
        ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length 
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
        
        // Simular ganhos (você pode implementar uma tabela de transações)
        const totalEarnings = Math.floor(Math.random() * 5000) + 500
        
        // Buscar agendamentos ativos
        const { data: bookingsData } = await supabase
          .from('appointments')
          .select('id, status')
          .eq('professional_id', user.id)
          .eq('status', 'confirmed')

        const activeBookings = bookingsData?.length || 0
        
        // Buscar trabalhos completados
        const { data: completedJobsData } = await supabase
          .from('appointments')
          .select('id')
          .eq('professional_id', user.id)
          .eq('status', 'completed')

        const completedJobs = completedJobsData?.length || 0
        
        professionalMetrics = {
          totalServices: servicesCount,
          totalEarnings,
          activeBookings,
          completedJobs,
          earningsGrowth: Math.floor(Math.random() * 40) - 5 // -5% a +35%
        }
      } else {
        // Métricas para clientes
        const { data: clientBookingsData } = await supabase
          .from('appointments')
          .select('id, professional_id, status')
          .eq('client_id', user.id)

        const totalBookings = clientBookingsData?.length || 0
        
        // Simular gastos totais
        const totalSpent = Math.floor(Math.random() * 2000) + 200
        
        // Contar profissionais únicos
        const uniqueProfessionals = new Set(
          clientBookingsData?.map(booking => booking.professional_id) || []
        ).size

        clientMetrics = {
          totalBookings,
          totalSpent,
          favoriteProfessionals: uniqueProfessionals,
          bookingsGrowth: Math.floor(Math.random() * 25) - 5 // -5% a +20%
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
  }, [user?.id, profile, supabase])

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
        .select('id, rating, comment, created_at')
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false })
        .limit(3)

      recentReviews?.forEach(review => {
        activities.push({
          id: `review-${review.id}`,
          type: 'review' as const,
          title: 'Nova avaliação',
          description: `${review.rating} estrelas - ${review.comment?.substring(0, 30) || 'Sem comentário'}...`,
          timestamp: review.created_at,
          icon: '⭐'
        })
      })

      // Buscar agendamentos recentes
      const { data: recentAppointments } = await supabase
        .from('appointments')
        .select('id, status, appointment_date, created_at')
        .or(`client_id.eq.${userId},professional_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(3)

      recentAppointments?.forEach(appointment => {
        activities.push({
          id: `appointment-${appointment.id}`,
          type: 'booking' as const,
          title: 'Novo agendamento',
          description: `Agendamento ${appointment.status} para ${new Date(appointment.appointment_date).toLocaleDateString()}`,
          timestamp: appointment.created_at,
          icon: '📅'
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
