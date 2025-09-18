// Interface para horários de disponibilidade
interface AvailabilitySchedule {
  monday?: { morning: boolean; afternoon: boolean; evening: boolean }
  tuesday?: { morning: boolean; afternoon: boolean; evening: boolean }
  wednesday?: { morning: boolean; afternoon: boolean; evening: boolean }
  thursday?: { morning: boolean; afternoon: boolean; evening: boolean }
  friday?: { morning: boolean; afternoon: boolean; evening: boolean }
  saturday?: { morning: boolean; afternoon: boolean; evening: boolean }
  sunday?: { morning: boolean; afternoon: boolean; evening: boolean }
}

// Tipo JSON genérico seguro
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          user_type: 'client' | 'professional'
          phone: string | null
          bio: string | null
          location_state: string | null
          location_city: string | null
          address: string | null
          cpf_cnpj: string | null
          is_verified: boolean
          badge: 'bronze' | 'silver' | 'gold'
          rating: number
          total_reviews: number
          is_available: boolean
          birth_date?: string | null
          neighborhood?: string | null
          profile_completed?: boolean
          profile_completion_score?: number | null
          professional_services?: string[] | null
          client_verification_document?: string | null
          professional_experience_years?: number | null
          professional_certifications?: string[] | null
          professional_portfolio_url?: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          user_type?: 'client' | 'professional'
          phone?: string | null
          bio?: string | null
          location_state?: string | null
          location_city?: string | null
          address?: string | null
          cpf_cnpj?: string | null
          is_verified?: boolean
          badge?: 'bronze' | 'silver' | 'gold'
          rating?: number
          total_reviews?: number
          is_available?: boolean
          birth_date?: string | null
          neighborhood?: string | null
          profile_completed?: boolean
          profile_completion_score?: number | null
          professional_services?: string[] | null
          client_verification_document?: string | null
          professional_experience_years?: number | null
          professional_certifications?: string[] | null
          professional_portfolio_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          user_type?: 'client' | 'professional'
          phone?: string | null
          bio?: string | null
          location_state?: string | null
          location_city?: string | null
          address?: string | null
          cpf_cnpj?: string | null
          is_verified?: boolean
          badge?: 'bronze' | 'silver' | 'gold'
          rating?: number
          total_reviews?: number
          is_available?: boolean
          birth_date?: string | null
          neighborhood?: string | null
          profile_completed?: boolean
          profile_completion_score?: number | null
          professional_services?: string[] | null
          client_verification_document?: string | null
          professional_experience_years?: number | null
          professional_certifications?: string[] | null
          professional_portfolio_url?: string | null
        }
      }
      service_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      professional_services: {
        Row: {
          id: string
          professional_id: string
          category_id: string
          title: string
          description: string | null
          price_min: number | null
          price_max: number | null
          is_active: boolean
          created_at: string
          updated_at: string
          service_type?: 'hourly' | 'fixed' | 'negotiable'
          availability_schedule?: AvailabilitySchedule | null
          service_area?: string[] | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          certifications?: string[] | null
          insurance_coverage?: boolean
          emergency_service?: boolean
        }
        Insert: {
          id?: string
          professional_id: string
          category_id: string
          title: string
          description?: string | null
          price_min?: number | null
          price_max?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          service_type?: 'hourly' | 'fixed' | 'negotiable'
          availability_schedule?: AvailabilitySchedule | null
          service_area?: string[] | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          certifications?: string[] | null
          insurance_coverage?: boolean
          emergency_service?: boolean
        }
        Update: {
          id?: string
          professional_id?: string
          category_id?: string
          title?: string
          description?: string | null
          price_min?: number | null
          price_max?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          service_type?: 'hourly' | 'fixed' | 'negotiable'
          availability_schedule?: AvailabilitySchedule | null
          service_area?: string[] | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          certifications?: string[] | null
          insurance_coverage?: boolean
          emergency_service?: boolean
        }
      }
      service_listings: {
        Row: {
          id: string
          professional_id: string
          service_category_id: string
          title: string
          description: string
          service_type: 'hourly' | 'fixed' | 'negotiable'
          price_range: string | null
          location_state: string
          location_city: string
          neighborhood: string | null
          service_areas: string[] | null
          availability_schedule: AvailabilitySchedule | null
          experience_years: number | null
          certifications: string[] | null
          portfolio_images: string[] | null
          is_featured: boolean
          is_active: boolean
          views_count: number
          contact_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          service_category_id: string
          title: string
          description: string
          service_type?: 'hourly' | 'fixed' | 'negotiable'
          price_range?: string | null
          location_state: string
          location_city: string
          neighborhood?: string | null
          service_areas?: string[] | null
          availability_schedule?: AvailabilitySchedule | null
          experience_years?: number | null
          certifications?: string[] | null
          portfolio_images?: string[] | null
          is_featured?: boolean
          is_active?: boolean
          views_count?: number
          contact_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          service_category_id?: string
          title?: string
          description?: string
          service_type?: 'hourly' | 'fixed' | 'negotiable'
          price_range?: string | null
          location_state?: string
          location_city?: string
          neighborhood?: string | null
          service_areas?: string[] | null
          availability_schedule?: AvailabilitySchedule | null
          experience_years?: number | null
          certifications?: string[] | null
          portfolio_images?: string[] | null
          is_featured?: boolean
          is_active?: boolean
          views_count?: number
          contact_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      service_requests: {
        Row: {
          id: string
          client_id: string
          service_category_id: string
          title: string
          description: string
          service_type: 'hourly' | 'fixed' | 'negotiable'
          budget_range: string | null
          urgency: 'low' | 'normal' | 'high' | 'urgent'
          location_state: string
          location_city: string
          neighborhood: string | null
          preferred_date: string | null
          preferred_time: string | null
          contact_preference: 'chat' | 'phone' | 'email'
          is_active: boolean
          responses_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          service_category_id: string
          title: string
          description: string
          service_type?: 'hourly' | 'fixed' | 'negotiable'
          budget_range?: string | null
          urgency?: 'low' | 'normal' | 'high' | 'urgent'
          location_state: string
          location_city: string
          neighborhood?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          contact_preference?: 'chat' | 'phone' | 'email'
          is_active?: boolean
          responses_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          service_category_id?: string
          title?: string
          description?: string
          service_type?: 'hourly' | 'fixed' | 'negotiable'
          budget_range?: string | null
          urgency?: 'low' | 'normal' | 'high' | 'urgent'
          location_state?: string
          location_city?: string
          neighborhood?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          contact_preference?: 'chat' | 'phone' | 'email'
          is_active?: boolean
          responses_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      service_proposals: {
        Row: {
          id: string
          request_id: string
          professional_id: string
          proposal_text: string
          proposed_price: string | null
          estimated_duration: string | null
          availability: string | null
          is_accepted: boolean
          is_rejected: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_id: string
          professional_id: string
          proposal_text: string
          proposed_price?: string | null
          estimated_duration?: string | null
          availability?: string | null
          is_accepted?: boolean
          is_rejected?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          professional_id?: string
          proposal_text?: string
          proposed_price?: string | null
          estimated_duration?: string | null
          availability?: string | null
          is_accepted?: boolean
          is_rejected?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      service_reviews: {
        Row: {
          id: string
          client_id: string
          professional_id: string
          service_listing_id: string | null
          rating_overall: number
          rating_quality: number | null
          rating_punctuality: number | null
          rating_communication: number | null
          rating_value: number | null
          review_text: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          professional_id: string
          service_listing_id?: string | null
          rating_overall: number
          rating_quality?: number | null
          rating_punctuality?: number | null
          rating_communication?: number | null
          rating_value?: number | null
          review_text?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          professional_id?: string
          service_listing_id?: string | null
          rating_overall?: number
          rating_quality?: number | null
          rating_punctuality?: number | null
          rating_communication?: number | null
          rating_value?: number | null
          review_text?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      service_favorites: {
        Row: {
          id: string
          user_id: string
          service_listing_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_listing_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_listing_id?: string
          created_at?: string
        }
      }
      service_history: {
        Row: {
          id: string
          client_id: string
          professional_id: string
          service_listing_id: string | null
          service_request_id: string | null
          service_date: string
          service_duration: string | null
          service_description: string | null
          final_price: string | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          professional_id: string
          service_listing_id?: string | null
          service_request_id?: string | null
          service_date: string
          service_duration?: string | null
          service_description?: string | null
          final_price?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          professional_id?: string
          service_listing_id?: string | null
          service_request_id?: string | null
          service_date?: string
          service_duration?: string | null
          service_description?: string | null
          final_price?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_notifications: {
        Row: {
          id: string
          user_id: string
          notification_type: string
          title: string
          message: string
          related_id: string | null
          is_read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notification_type: string
          title: string
          message: string
          related_id?: string | null
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notification_type?: string
          title?: string
          message?: string
          related_id?: string | null
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          professional_id: string
          service_id: string | null
          title: string
          description: string | null
          appointment_date: string
          appointment_time: string
          duration_minutes: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          address: string | null
          price: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          professional_id: string
          service_id?: string | null
          title: string
          description?: string | null
          appointment_date: string
          appointment_time: string
          duration_minutes?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          address?: string | null
          price?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          professional_id?: string
          service_id?: string | null
          title?: string
          description?: string | null
          appointment_date?: string
          appointment_time?: string
          duration_minutes?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          address?: string | null
          price?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          professional_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          professional_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          professional_id?: string
          created_at?: string
        }
      }
      portfolio_projects: {
        Row: {
          id: string
          professional_id: string
          title: string
          description: string | null
          category: string | null
          location: string | null
          budget_range: string | null
          images: string[] | null
          is_featured: boolean
          rating: number
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          title: string
          description?: string | null
          category?: string | null
          location?: string | null
          budget_range?: string | null
          images?: string[] | null
          is_featured?: boolean
          rating?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          title?: string
          description?: string | null
          category?: string | null
          location?: string | null
          budget_range?: string | null
          images?: string[] | null
          is_featured?: boolean
          rating?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_files: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_url: string
          file_type: string
          file_size: number | null
          category: string
          is_public: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_url: string
          file_type: string
          file_size?: number | null
          category: string
          is_public?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_url?: string
          file_type?: string
          file_size?: number | null
          category?: string
          is_public?: boolean
          metadata?: Json | null
          created_at?: string
        }
      }
      user_activity_log: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          description: string | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          description?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          description?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          email_notifications: boolean
          push_notifications: boolean
          sms_notifications: boolean
          privacy_level: 'public' | 'standard' | 'private'
          language: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          email_notifications?: boolean
          push_notifications?: boolean
          sms_notifications?: boolean
          privacy_level?: 'public' | 'standard' | 'private'
          language?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          email_notifications?: boolean
          push_notifications?: boolean
          sms_notifications?: boolean
          privacy_level?: 'public' | 'standard' | 'private'
          language?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_statistics: {
        Row: {
          user_id: string
          total_appointments: number
          completed_appointments: number
          cancelled_appointments: number
          total_earnings: number
          total_spent: number
          average_rating: number
          last_activity: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          total_appointments?: number
          completed_appointments?: number
          cancelled_appointments?: number
          total_earnings?: number
          total_spent?: number
          average_rating?: number
          last_activity?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_appointments?: number
          completed_appointments?: number
          cancelled_appointments?: number
          total_earnings?: number
          total_spent?: number
          average_rating?: number
          last_activity?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string
          subject: string
          description: string
          category: string
          priority: 'low' | 'normal' | 'high' | 'urgent'
          status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed'
          assigned_to: string | null
          resolution: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          description: string
          category: string
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed'
          assigned_to?: string | null
          resolution?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          description?: string
          category?: string
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed'
          assigned_to?: string | null
          resolution?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
      support_messages: {
        Row: {
          id: string
          ticket_id: string
          sender_id: string
          message: string
          is_internal: boolean
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_id: string
          message: string
          is_internal?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          sender_id?: string
          message?: string
          is_internal?: boolean
          created_at?: string
        }
      }
      feed_posts: {
        Row: {
          id: string
          professional_id: string
          title: string
          description: string | null
          images: string[] | null
          service_category_id: string | null
          location_state: string | null
          location_city: string | null
          likes_count: number
          comments_count: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          title: string
          description?: string | null
          images?: string[] | null
          service_category_id?: string | null
          location_state?: string | null
          location_city?: string | null
          likes_count?: number
          comments_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          title?: string
          description?: string | null
          images?: string[] | null
          service_category_id?: string | null
          location_state?: string | null
          location_city?: string | null
          likes_count?: number
          comments_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          parent_comment_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          parent_comment_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          parent_comment_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          client_id: string
          professional_id: string
          last_message_at: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          professional_id: string
          last_message_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          professional_id?: string
          last_message_at?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          reviewed_id: string
          ad_id: string | null
          review_type: string | null
          rating_person: number
          rating_work: number | null
          punctuality: number | null
          quality: number | null
          comment: string | null
          title: string | null
          pros: string[] | null
          cons: string[] | null
          is_recommended: boolean | null
          service_date: string | null
          response_text: string | null
          response_date: string | null
          is_verified: boolean | null
          created_at: string | null
          updated_at: string | null
          positive_points: string[] | null
          negative_points: string[] | null
        }
        Insert: {
          id?: string
          reviewer_id: string
          reviewed_id: string
          ad_id?: string | null
          review_type?: string | null
          rating_person: number
          rating_work?: number | null
          punctuality?: number | null
          quality?: number | null
          comment?: string | null
          title?: string | null
          pros?: string[] | null
          cons?: string[] | null
          is_recommended?: boolean | null
          service_date?: string | null
          response_text?: string | null
          response_date?: string | null
          is_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          positive_points?: string[] | null
          negative_points?: string[] | null
        }
        Update: {
          id?: string
          reviewer_id?: string
          reviewed_id?: string
          ad_id?: string | null
          review_type?: string | null
          rating_person?: number
          rating_work?: number | null
          punctuality?: number | null
          quality?: number | null
          comment?: string | null
          title?: string | null
          pros?: string[] | null
          cons?: string[] | null
          is_recommended?: boolean | null
          service_date?: string | null
          response_text?: string | null
          response_date?: string | null
          is_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          positive_points?: string[] | null
          negative_points?: string[] | null
        }
      }
      verification_documents: {
        Row: {
          id: string
          professional_id: string
          document_type: string
          document_url: string
          status: 'pending' | 'approved' | 'rejected'
          admin_notes: string | null
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          professional_id: string
          document_type: string
          document_url: string
          status?: 'pending' | 'approved' | 'rejected'
          admin_notes?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          professional_id?: string
          document_type?: string
          document_url?: string
          status?: 'pending' | 'approved' | 'rejected'
          admin_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          created_at: string
          action_url: string | null
          priority: 'low' | 'normal' | 'high' | 'urgent'
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          created_at?: string
          action_url?: string | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          created_at?: string
          action_url?: string | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
        }
      }
      search_history: {
        Row: {
          id: string
          user_id: string
          search_query: string
          location_state: string | null
          location_city: string | null
          category_id: string | null
          filters: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          search_query: string
          location_state?: string | null
          location_city?: string | null
          category_id?: string | null
          filters?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          search_query?: string
          location_state?: string | null
          location_city?: string | null
          category_id?: string | null
          filters?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: 'client' | 'professional'
      badge_type: 'bronze' | 'silver' | 'gold'
      verification_status: 'pending' | 'approved' | 'rejected'
    }
  }
}

// Tipos exportados para uso nos componentes
export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  user_type: 'client' | 'professional'
  phone: string
  bio: string | null
  location_state: string
  location_city: string
  address: string
  cpf_cnpj: string
  is_verified: boolean
  badge: BadgeType
  rating: number
  total_reviews: number
  is_available: boolean
  created_at: string
  updated_at: string
  // Novos campos para cadastro completo
  birth_date: string | null
  neighborhood: string | null
  profile_completed: boolean
  profile_completion_score?: number | null
  // Campos específicos para clientes
  client_verification_document?: string | null
  // Campos específicos para profissionais
  professional_services?: string[]
  professional_experience_years?: number
  professional_certifications?: string[]
  professional_portfolio_url?: string | null
}

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
export type ProfessionalService = Database['public']['Tables']['professional_services']['Row']
export type FeedPost = Database['public']['Tables']['feed_posts']['Row']
export type SearchHistory = Database['public']['Tables']['search_history']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']

export type UserType = Database['public']['Enums']['user_type']
export type BadgeType = Database['public']['Enums']['badge_type']
export type VerificationStatus = Database['public']['Enums']['verification_status']
