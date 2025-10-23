/**
 * Tipos e interfaces para o Sistema de Sons de Notificações
 * ConfiLar - Sistema de Sons
 */

export type NotificationSoundType =
  | 'message'
  | 'review'
  | 'booking'
  | 'verification'
  | 'achievement'
  | 'system'
  | 'chat'
  | 'evaluation'
  | 'recommendation'
  | 'favorite'
  | 'follow'
  | 'profile_view'
  | 'post_like'
  | 'post_comment'
  | 'availability'
  | 'portfolio'
  | 'reputation'
  | 'admin'
  | 'security'
  | 'maintenance'
  | 'update'
  | 'reminder'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'referral_signup'
  | 'referral_profile_complete'
  | 'referral_first_post'
  | 'referral_first_review'
  | 'referral_30_days'
  | 'referral_tier_change'
  | 'referral_badge'
  | 'referral_complete'
  | 'referral_welcome'

export type SoundPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface SoundFile {
  id: string
  name: string
  path: string
  duration: number // em milissegundos
  category: 'notification' | 'achievement' | 'alert' | 'success' | 'info'
  description: string
}

export interface NotificationSound {
  type: NotificationSoundType
  soundFile: string // path to sound file
  enabled: boolean
  volume: number // 0-1
  priority: SoundPriority
}

export interface SoundPreferences {
  enabled: boolean // Master switch
  volume: number // Master volume 0-1
  respectQuietHours: boolean
  respectSystemVolume: boolean
  customSounds: Record<NotificationSoundType, string> // Custom sound paths
}

export interface SoundConfig {
  type: NotificationSoundType
  label: string
  emoji: string
  defaultSound: string
  category: 'notification' | 'achievement' | 'alert' | 'success' | 'info'
  priority: SoundPriority
  description: string
}

// Configurações padrão de sons por tipo de notificação
export const NOTIFICATION_SOUND_CONFIG: Record<NotificationSoundType, SoundConfig> = {
  // Mensagens e Chat
  message: {
    type: 'message',
    label: 'Mensagem de Chat',
    emoji: '💬',
    defaultSound: '/sounds/message.mp3',
    category: 'notification',
    priority: 'high',
    description: 'Som para novas mensagens de chat'
  },
  chat: {
    type: 'chat',
    label: 'Chat',
    emoji: '💬',
    defaultSound: '/sounds/chat.mp3',
    category: 'notification',
    priority: 'high',
    description: 'Som para notificações de chat'
  },

  // Avaliações e Reviews
  review: {
    type: 'review',
    label: 'Avaliação',
    emoji: '⭐',
    defaultSound: '/sounds/review.mp3',
    category: 'achievement',
    priority: 'normal',
    description: 'Som quando você recebe uma avaliação'
  },
  evaluation: {
    type: 'evaluation',
    label: 'Avaliação Recebida',
    emoji: '⭐',
    defaultSound: '/sounds/evaluation.mp3',
    category: 'achievement',
    priority: 'normal',
    description: 'Som para avaliações recebidas'
  },

  // Agendamentos
  booking: {
    type: 'booking',
    label: 'Agendamento',
    emoji: '📅',
    defaultSound: '/sounds/booking.mp3',
    category: 'notification',
    priority: 'high',
    description: 'Som para novos agendamentos'
  },

  // Verificação e Segurança
  verification: {
    type: 'verification',
    label: 'Verificação',
    emoji: '✅',
    defaultSound: '/sounds/verification.mp3',
    category: 'success',
    priority: 'normal',
    description: 'Som para verificações concluídas'
  },
  security: {
    type: 'security',
    label: 'Segurança',
    emoji: '🔒',
    defaultSound: '/sounds/security.mp3',
    category: 'alert',
    priority: 'urgent',
    description: 'Som para alertas de segurança'
  },

  // Conquistas
  achievement: {
    type: 'achievement',
    label: 'Conquista',
    emoji: '🏆',
    defaultSound: '/sounds/achievement.mp3',
    category: 'achievement',
    priority: 'normal',
    description: 'Som para conquistas e marcos'
  },

  // Interações Sociais
  favorite: {
    type: 'favorite',
    label: 'Favorito',
    emoji: '❤️',
    defaultSound: '/sounds/favorite.mp3',
    category: 'notification',
    priority: 'low',
    description: 'Som quando alguém favorita você'
  },
  follow: {
    type: 'follow',
    label: 'Seguidor',
    emoji: '👥',
    defaultSound: '/sounds/follow.mp3',
    category: 'notification',
    priority: 'low',
    description: 'Som para novos seguidores'
  },
  profile_view: {
    type: 'profile_view',
    label: 'Visualização de Perfil',
    emoji: '👁️',
    defaultSound: '/sounds/profile-view.mp3',
    category: 'info',
    priority: 'low',
    description: 'Som quando alguém visualiza seu perfil'
  },
  post_like: {
    type: 'post_like',
    label: 'Curtida em Post',
    emoji: '👍',
    defaultSound: '/sounds/like.mp3',
    category: 'notification',
    priority: 'low',
    description: 'Som para curtidas em posts'
  },
  post_comment: {
    type: 'post_comment',
    label: 'Comentário em Post',
    emoji: '💭',
    defaultSound: '/sounds/comment.mp3',
    category: 'notification',
    priority: 'normal',
    description: 'Som para comentários em posts'
  },

  // Recomendações e Portfolio
  recommendation: {
    type: 'recommendation',
    label: 'Recomendação',
    emoji: '👍',
    defaultSound: '/sounds/recommendation.mp3',
    category: 'achievement',
    priority: 'normal',
    description: 'Som para novas recomendações'
  },
  portfolio: {
    type: 'portfolio',
    label: 'Portfolio',
    emoji: '🎨',
    defaultSound: '/sounds/portfolio.mp3',
    category: 'info',
    priority: 'normal',
    description: 'Som para atualizações de portfolio'
  },
  reputation: {
    type: 'reputation',
    label: 'Reputação',
    emoji: '⭐',
    defaultSound: '/sounds/reputation.mp3',
    category: 'achievement',
    priority: 'normal',
    description: 'Som para mudanças de reputação'
  },

  // Sistema
  system: {
    type: 'system',
    label: 'Sistema',
    emoji: '⚙️',
    defaultSound: '/sounds/system.mp3',
    category: 'info',
    priority: 'low',
    description: 'Som para notificações do sistema'
  },
  admin: {
    type: 'admin',
    label: 'Admin',
    emoji: '👨‍💼',
    defaultSound: '/sounds/admin.mp3',
    category: 'alert',
    priority: 'high',
    description: 'Som para notificações administrativas'
  },
  maintenance: {
    type: 'maintenance',
    label: 'Manutenção',
    emoji: '🔧',
    defaultSound: '/sounds/maintenance.mp3',
    category: 'info',
    priority: 'normal',
    description: 'Som para avisos de manutenção'
  },
  update: {
    type: 'update',
    label: 'Atualização',
    emoji: '🔄',
    defaultSound: '/sounds/update.mp3',
    category: 'info',
    priority: 'low',
    description: 'Som para atualizações disponíveis'
  },
  reminder: {
    type: 'reminder',
    label: 'Lembrete',
    emoji: '⏰',
    defaultSound: '/sounds/reminder.mp3',
    category: 'notification',
    priority: 'normal',
    description: 'Som para lembretes'
  },
  availability: {
    type: 'availability',
    label: 'Disponibilidade',
    emoji: '📅',
    defaultSound: '/sounds/availability.mp3',
    category: 'info',
    priority: 'low',
    description: 'Som para mudanças de disponibilidade'
  },

  // Status e Alertas
  success: {
    type: 'success',
    label: 'Sucesso',
    emoji: '✅',
    defaultSound: '/sounds/success.mp3',
    category: 'success',
    priority: 'normal',
    description: 'Som para ações bem-sucedidas'
  },
  warning: {
    type: 'warning',
    label: 'Aviso',
    emoji: '⚠️',
    defaultSound: '/sounds/warning.mp3',
    category: 'alert',
    priority: 'high',
    description: 'Som para avisos importantes'
  },
  error: {
    type: 'error',
    label: 'Erro',
    emoji: '❌',
    defaultSound: '/sounds/error.mp3',
    category: 'alert',
    priority: 'urgent',
    description: 'Som para erros'
  },
  info: {
    type: 'info',
    label: 'Informação',
    emoji: 'ℹ️',
    defaultSound: '/sounds/info.mp3',
    category: 'info',
    priority: 'low',
    description: 'Som para informações gerais'
  },

  // Sistema de Referral (Indicações)
  referral_signup: {
    type: 'referral_signup',
    label: 'Nova Indicação - Cadastro',
    emoji: '🎉',
    defaultSound: '/sounds/referral-signup.mp3',
    category: 'achievement',
    priority: 'high',
    description: 'Som quando alguém usa seu código e se cadastra'
  },
  referral_profile_complete: {
    type: 'referral_profile_complete',
    label: 'Perfil Completado',
    emoji: '✅',
    defaultSound: '/sounds/referral-profile.mp3',
    category: 'achievement',
    priority: 'high',
    description: 'Som quando indicação completa o perfil'
  },
  referral_first_post: {
    type: 'referral_first_post',
    label: 'Primeiro Post',
    emoji: '📝',
    defaultSound: '/sounds/referral-post.mp3',
    category: 'achievement',
    priority: 'high',
    description: 'Som quando indicação faz primeiro post'
  },
  referral_first_review: {
    type: 'referral_first_review',
    label: 'Primeira Avaliação',
    emoji: '⭐',
    defaultSound: '/sounds/referral-review.mp3',
    category: 'achievement',
    priority: 'high',
    description: 'Som quando indicação faz primeira avaliação'
  },
  referral_30_days: {
    type: 'referral_30_days',
    label: '30 Dias Ativo',
    emoji: '🔥',
    defaultSound: '/sounds/referral-30days.mp3',
    category: 'achievement',
    priority: 'high',
    description: 'Som quando indicação completa 30 dias ativo'
  },
  referral_tier_change: {
    type: 'referral_tier_change',
    label: 'Mudança de Tier',
    emoji: '🏆',
    defaultSound: '/sounds/referral-tier.mp3',
    category: 'achievement',
    priority: 'urgent',
    description: 'Som quando você sobe de nível no programa'
  },
  referral_badge: {
    type: 'referral_badge',
    label: 'Novo Badge',
    emoji: '🥇',
    defaultSound: '/sounds/referral-badge.mp3',
    category: 'achievement',
    priority: 'urgent',
    description: 'Som quando você ganha um novo badge'
  },
  referral_complete: {
    type: 'referral_complete',
    label: 'Indicação Completada',
    emoji: '🎉',
    defaultSound: '/sounds/referral-complete.mp3',
    category: 'achievement',
    priority: 'normal',
    description: 'Som quando indicação completa todos os marcos'
  },
  referral_welcome: {
    type: 'referral_welcome',
    label: 'Boas-vindas Indicação',
    emoji: '🎁',
    defaultSound: '/sounds/referral-welcome.mp3',
    category: 'info',
    priority: 'normal',
    description: 'Som de boas-vindas para quem foi indicado'
  }
}

// Lista de arquivos de som disponíveis
export const AVAILABLE_SOUNDS: SoundFile[] = [
  {
    id: 'notification-1',
    name: 'Notificação Suave',
    path: '/sounds/notification-soft.mp3',
    duration: 500,
    category: 'notification',
    description: 'Som suave e discreto para notificações gerais'
  },
  {
    id: 'notification-2',
    name: 'Notificação Moderna',
    path: '/sounds/notification-modern.mp3',
    duration: 700,
    category: 'notification',
    description: 'Som moderno para notificações'
  },
  {
    id: 'achievement-1',
    name: 'Conquista Épica',
    path: '/sounds/achievement-epic.mp3',
    duration: 1500,
    category: 'achievement',
    description: 'Som épico para grandes conquistas'
  },
  {
    id: 'achievement-2',
    name: 'Conquista Vitória',
    path: '/sounds/achievement-victory.mp3',
    duration: 1200,
    category: 'achievement',
    description: 'Som de vitória para conquistas'
  },
  {
    id: 'success-1',
    name: 'Sucesso Feliz',
    path: '/sounds/success-happy.mp3',
    duration: 800,
    category: 'success',
    description: 'Som alegre para ações bem-sucedidas'
  },
  {
    id: 'success-2',
    name: 'Sucesso Confirmação',
    path: '/sounds/success-confirm.mp3',
    duration: 600,
    category: 'success',
    description: 'Som de confirmação de sucesso'
  },
  {
    id: 'alert-1',
    name: 'Alerta Importante',
    path: '/sounds/alert-important.mp3',
    duration: 1000,
    category: 'alert',
    description: 'Som de alerta para avisos importantes'
  },
  {
    id: 'alert-2',
    name: 'Alerta Urgente',
    path: '/sounds/alert-urgent.mp3',
    duration: 1200,
    category: 'alert',
    description: 'Som urgente para alertas críticos'
  },
  {
    id: 'info-1',
    name: 'Informação Simples',
    path: '/sounds/info-simple.mp3',
    duration: 400,
    category: 'info',
    description: 'Som simples para informações gerais'
  }
]

