import { useInfiniteQuery } from '@tanstack/react-query'
import { UnifiedTimelineItem } from '@/types/timeline'

const ITEMS_PER_PAGE = 10

// Dados mock para demonstração
const mockData = {
  posts: [
    {
      id: '1',
      type: 'post' as const,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
      user_id: 'user1',
      user_name: 'Maria Silva',
      user_avatar: '/placeholder-avatar.jpg',
      user_type: 'professional' as const,
      title: 'Reforma de Cozinha Moderna',
      description: 'Acabei de finalizar uma linda reforma de cozinha com design moderno. Materiais de primeira qualidade e acabamento impecável! 🏠✨',
      images: ['/placeholder-kitchen1.jpg', '/placeholder-kitchen2.jpg'],
      location_state: 'SP',
      location_city: 'São Paulo',
      likes_count: 24,
      comments_count: 8,
      is_liked: false
    },
    {
      id: '2',
      type: 'post' as const,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h atrás
      user_id: 'user2',
      user_name: 'João Santos',
      user_avatar: '/placeholder-avatar.jpg',
      user_type: 'professional' as const,
      title: 'Serviço de Limpeza Profissional',
      description: 'Oferecendo serviços de limpeza residencial e comercial. Experiência de 5 anos, referências disponíveis. #limpeza #profissional',
      images: ['/placeholder-cleaning.jpg'],
      location_state: 'RJ',
      location_city: 'Rio de Janeiro',
      likes_count: 15,
      comments_count: 3,
      is_liked: true
    },
    {
      id: '3',
      type: 'post' as const,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h atrás
      user_id: 'user3',
      user_name: 'Ana Costa',
      user_avatar: '/placeholder-avatar.jpg',
      user_type: 'client' as const,
      title: 'Recomendação de Diarista',
      description: 'Preciso de uma diarista confiável para limpeza semanal. Alguém tem indicação? Moro na Zona Sul.',
      images: [],
      location_state: 'SP',
      location_city: 'São Paulo',
      likes_count: 7,
      comments_count: 12,
      is_liked: false
    },
    {
      id: '4',
      type: 'post' as const,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6h atrás
      user_id: 'user4',
      user_name: 'Pedro Oliveira',
      user_avatar: '/placeholder-avatar.jpg',
      user_type: 'professional' as const,
      title: 'Instalação Elétrica Residencial',
      description: 'Serviços de instalação elétrica com garantia. Profissional certificado, orçamento gratuito. #eletricista #segurança',
      images: ['/placeholder-electrical.jpg'],
      location_state: 'MG',
      location_city: 'Belo Horizonte',
      likes_count: 18,
      comments_count: 5,
      is_liked: false
    },
    {
      id: '5',
      type: 'post' as const,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8h atrás
      user_id: 'user5',
      user_name: 'Carla Mendes',
      user_avatar: '/placeholder-avatar.jpg',
      user_type: 'client' as const,
      title: 'Avaliação de Serviço',
      description: 'Contratei o João para limpeza e fiquei muito satisfeita! Profissional, pontual e caprichoso. Recomendo! ⭐⭐⭐⭐⭐',
      images: [],
      location_state: 'RJ',
      location_city: 'Rio de Janeiro',
      likes_count: 12,
      comments_count: 2,
      is_liked: true
    }
  ],
  activities: [
    {
      id: 'act1',
      type: 'activity' as const,
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min atrás
      user_id: 'user6',
      user_name: 'Carlos Oliveira',
      user_avatar: '/placeholder-avatar.jpg',
      user_type: 'professional' as const,
      activity_type: 'user_joined' as const,
      title: 'Carlos Oliveira entrou para o ConfiLar',
      description: 'Carlos Oliveira entrou para o ConfiLar',
      metadata: { category: 'Construção e Reforma' },
      icon: 'user-plus',
      color: 'blue'
    },
    {
      id: 'act2',
      type: 'activity' as const,
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min atrás
      user_id: 'user7',
      user_name: 'Lucia Ferreira',
      user_avatar: '/placeholder-avatar.jpg',
      user_type: 'client' as const,
      activity_type: 'recommendation' as const,
      title: 'Lucia recomendou Pedro como eletricista confiável',
      description: 'Lucia recomendou Pedro como eletricista confiável',
      metadata: { recommended_user: 'Pedro', service: 'Elétrica' },
      icon: 'thumbs-up',
      color: 'green'
    },
    {
      id: 'act3',
      type: 'activity' as const,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3h atrás
      user_id: 'user8',
      user_name: 'Roberto Silva',
      user_avatar: '/placeholder-avatar.jpg',
      user_type: 'professional' as const,
      activity_type: 'review' as const,
      title: 'Roberto avaliou Maria com 5 estrelas',
      description: 'Roberto avaliou Maria com 5 estrelas',
      metadata: { reviewed_user: 'Maria', rating: 5, service: 'Reforma' },
      icon: 'star',
      color: 'yellow'
    }
  ],
  notifications: [
    {
      id: 'notif1',
      type: 'notification' as const,
      created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 min atrás
      user_id: 'system',
      user_name: 'ConfiLar',
      user_avatar: '/logo-confilar.png',
      user_type: 'professional' as const,
      title: 'Novo profissional na sua região',
      message: '3 novos profissionais de limpeza se cadastraram na sua cidade',
      notification_type: 'info',
      category: 'community',
      is_read: false,
      action_url: '/buscar?categoria=limpeza',
      action_label: 'Ver profissionais'
    },
    {
      id: 'notif2',
      type: 'notification' as const,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), // 1h atrás
      user_id: 'system',
      user_name: 'ConfiLar',
      user_avatar: '/logo-confilar.png',
      user_type: 'professional' as const,
      title: 'Parabéns! Você está em alta',
      message: 'Seu post sobre reforma de cozinha está sendo muito curtido!',
      notification_type: 'success',
      category: 'achievement',
      is_read: true,
      action_url: '/feed',
      action_label: 'Ver post'
    }
  ]
}

export function useUnifiedTimelineMock(filters: any = {}) {
  const queryKey = ['timeline-mock', filters]

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const page = pageParam as number
      const startIndex = page * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      
      // Combinar todos os dados mock
      const allItems = [
        ...mockData.posts,
        ...mockData.activities,
        ...mockData.notifications
      ]
      
      // Simular paginação
      const pageItems = allItems.slice(startIndex, endIndex)
      
      return pageItems
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ITEMS_PER_PAGE ? allPages.length : undefined
    },
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos
    gcTime: 1000 * 60 * 5, // Manter no cache por 5 minutos
  })

  const items = data?.pages.flat() || []
  const hasNextPageValue = hasNextPage || false

  const loadMore = () => {
    if (hasNextPageValue && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const likePost = (postId: string) => {
    console.log('Curtir post:', postId)
    // Simular like
  }

  const addPost = (newPost: any) => {
    console.log('Adicionar post:', newPost)
    // Simular adição de post
  }

  return {
    items,
    isLoading,
    error,
    loadMore,
    hasNextPage: hasNextPageValue,
    isFetchingNextPage,
    refetch,
    likePost,
    addPost
  }
}
