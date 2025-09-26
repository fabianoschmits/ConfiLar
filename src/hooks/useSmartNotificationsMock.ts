import { useQuery } from '@tanstack/react-query'

// Dados mock para notificações inteligentes
const mockNotifications = [
  {
    id: 'notif1',
    user_id: 'current-user',
    title: 'Você recebeu uma nova recomendação!',
    message: 'Maria Silva recomendou você como profissional confiável',
    type: 'recommendation',
    is_read: false,
    action_url: '/perfil',
    action_label: 'Ver perfil',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'notif2',
    user_id: 'current-user',
    title: 'Seu post está em alta!',
    message: 'Seu post sobre reforma de cozinha tem 24 curtidas',
    type: 'engagement',
    is_read: false,
    action_url: '/feed',
    action_label: 'Ver post',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'notif3',
    user_id: 'current-user',
    title: 'Novo profissional na sua região',
    message: '3 novos profissionais de limpeza se cadastraram na sua cidade',
    type: 'trending',
    is_read: true,
    action_url: '/buscar?categoria=limpeza',
    action_label: 'Ver profissionais',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'notif4',
    user_id: 'current-user',
    title: 'Parabéns! Você alcançou 100 curtidas',
    message: 'Seus posts estão sendo muito bem recebidos pela comunidade',
    type: 'achievement',
    is_read: true,
    action_url: '/reputacao',
    action_label: 'Ver reputação',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  }
]

export function useSmartNotificationsMock() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['smart-notifications-mock'],
    queryFn: async () => {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 400))
      return mockNotifications
    },
    staleTime: 1000 * 60 * 1, // 1 minuto
    gcTime: 1000 * 60 * 5, // 5 minutos
  })

  const notifications = data || []
  const unreadCount = notifications.filter(n => !n.is_read).length

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
  }
}
