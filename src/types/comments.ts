export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_comment_id?: string
  content: string
  mentions: string[]
  hashtags: string[]
  created_at: string
  updated_at: string
  is_deleted: boolean
  user: {
    id: string
    full_name: string
    avatar_url?: string
    user_type: 'client' | 'professional'
  }
  replies?: Comment[]
  likes_count: number
  is_liked: boolean
}

export interface CommentFormData {
  content: string
  parent_comment_id?: string
}

export interface CommentFilters {
  post_id: string
  parent_comment_id?: string
  limit?: number
  offset?: number
}
