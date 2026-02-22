export interface TimelineItem {
  id: string;
  type: "post" | "activity" | "notification";
  created_at: string;
  user_id?: string;
  user_name?: string;
  user_avatar?: string;
  user_type?: "client" | "professional";
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type: "client" | "professional";
    is_available?: boolean;
    is_verified?: boolean;
  };
}

export interface TimelinePost extends TimelineItem {
  type: "post";
  title: string;
  description: string;
  content?: string;
  images: string[];
  service_category_id?: string;
  location_state?: string;
  location_city?: string;
  location_country?: string;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  is_featured?: boolean;
  is_premium?: boolean;
  tags?: string[];
  premium_points_spent?: number;
  premium_expires_at?: string;
  premium_highlight_color?: string;
  metadata?: {
    type?: string;
    user?: string;
    favorited?: string;
    from_user?: string;
    to_user?: string;
    reviewer?: string;
    reviewed?: string;
    user_type?: string;
    location_city?: string;
    location_state?: string;
    bio?: string;
    avatar_url?: string;
    points_spent?: number;
    expires_at?: string;
    created_at?: string;
  };
}

export interface TimelineActivity extends TimelineItem {
  type: "activity";
  activity_type:
    | "user_joined"
    | "recommendation"
    | "review"
    | "agreement"
    | "classified_posted";
  title: string;
  description: string;
  metadata?: {
    target_user_id?: string;
    target_user_name?: string;
    rating?: number;
    service_description?: string;
    category?: string;
  };
  icon: string;
  color: string;
}

export interface TimelineNotification extends TimelineItem {
  type: "notification";
  title: string;
  message: string;
  notification_type: string;
  category: string;
  is_read: boolean;
  action_url?: string;
  action_label?: string;
}

export type UnifiedTimelineItem =
  | TimelinePost
  | TimelineActivity
  | TimelineNotification;

export interface TimelineFilters {
  category?: string;
  location?: string;
  search?: string;
  activity_types?: string[];
  location_filter?: {
    type: "local" | "state" | "country" | "all" | "custom";
    city?: string;
    state?: string;
    country?: string;
  };
  pinPostId?: string;
  /** When true, only fetches real user posts (excludes welcome/favorite/recommendation auto-posts) */
  onlyRealPosts?: boolean;
}

export interface TimelineStats {
  total_posts: number;
  total_activities: number;
  total_notifications: number;
  engagement_rate: number;
}
