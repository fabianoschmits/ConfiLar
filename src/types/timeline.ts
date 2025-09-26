export interface TimelineItem {
  id: string
  type: 'post' | 'activity' | 'notification'
  created_at: string
  user_id?: string
  user_name?: string
  user_avatar?: string
  user_type?: 'client' | 'professional'
}

export interface TimelinePost extends TimelineItem {
  type: 'post'
  title: string
  description: string
  images: string[]
  location_state?: string
  location_city?: string
  likes_count: number
  comments_count: number
  is_liked?: boolean
}

export interface TimelineActivity extends TimelineItem {
  type: 'activity'
  activity_type: 'user_joined' | 'recommendation' | 'review' | 'agreement' | 'classified_posted'
  title: string
  description: string
  metadata?: {
    target_user_id?: string
    target_user_name?: string
    rating?: number
    service_description?: string
    category?: string
  }
  icon: string
  color: string
}

export interface TimelineNotification extends TimelineItem {
  type: 'notification'
  title: string
  message: string
  notification_type: string
  category: string
  is_read: boolean
  action_url?: string
  action_label?: string
}

export type UnifiedTimelineItem = TimelinePost | TimelineActivity | TimelineNotification

export interface TimelineFilters {
  category?: string
  location?: string
  user_type?: 'client' | 'professional' | 'all'
  activity_types?: string[]
}

export interface TimelineStats {
  total_posts: number
  total_activities: number
  total_notifications: number
  engagement_rate: number
}
