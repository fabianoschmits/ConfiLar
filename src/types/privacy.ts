// Tipos para configurações de privacidade
export interface PrivacySettings {
  // Visibilidade do perfil
  showEmail?: boolean
  showPhone?: boolean
  showLocation?: boolean
  showServices?: boolean
  showPortfolio?: boolean
  allowDirectMessages?: boolean
  showOnlineStatus?: boolean

  // Notificações
  emailNotifications?: boolean
  pushNotifications?: boolean
  messageNotifications?: boolean
  reviewNotifications?: boolean
  favoriteNotifications?: boolean
  marketingEmails?: boolean
  systemUpdates?: boolean
  weeklyDigest?: boolean

  // Localização
  shareExactLocation?: boolean
  shareCity?: boolean
  shareState?: boolean
  allowLocationTracking?: boolean
  showOnMap?: boolean
  allowNearbySearch?: boolean
  shareServiceArea?: boolean
}

// Extensão do tipo Profile para incluir configurações de privacidade
export interface ExtendedProfile {
  id: string
  email: string
  full_name?: string | null
  user_type?: string | null
  location_city?: string | null
  location_state?: string | null
  created_at?: string | null
  updated_at?: string | null
  
  // Configurações de privacidade
  show_email?: boolean
  show_phone?: boolean
  show_location?: boolean
  show_services?: boolean
  show_portfolio?: boolean
  allow_direct_messages?: boolean
  show_online_status?: boolean
  
  email_notifications?: boolean
  push_notifications?: boolean
  message_notifications?: boolean
  review_notifications?: boolean
  favorite_notifications?: boolean
  marketing_emails?: boolean
  system_updates?: boolean
  weekly_digest?: boolean
  
  share_exact_location?: boolean
  share_city?: boolean
  share_state?: boolean
  allow_location_tracking?: boolean
  show_on_map?: boolean
  allow_nearby_search?: boolean
  share_service_area?: boolean
}
