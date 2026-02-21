// Interface para horários de disponibilidade
interface AvailabilitySchedule {
  monday?: { morning: boolean; afternoon: boolean; evening: boolean };
  tuesday?: { morning: boolean; afternoon: boolean; evening: boolean };
  wednesday?: { morning: boolean; afternoon: boolean; evening: boolean };
  thursday?: { morning: boolean; afternoon: boolean; evening: boolean };
  friday?: { morning: boolean; afternoon: boolean; evening: boolean };
  saturday?: { morning: boolean; afternoon: boolean; evening: boolean };
  sunday?: { morning: boolean; afternoon: boolean; evening: boolean };
}

// Tipo JSON genérico seguro
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // =====================================================
      // TABELAS PRINCIPAIS (Sempre Usadas)
      // =====================================================

      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          user_type: "client" | "professional";
          phone: string | null;
          bio: string | null;
          location_state: string | null;
          location_city: string | null;
          address: string | null;
          address_number: string | null;
          zip_code: string | null;
          cpf_cnpj: string | null;
          is_verified: boolean;
          verification_status:
            | "not_started"
            | "pending"
            | "approved"
            | "rejected";
          badge: "bronze" | "silver" | "gold";
          rating: number;
          total_reviews: number;
          is_available: boolean;
          birth_date?: string | null;
          gender?: "male" | "female" | "other" | null;
          neighborhood?: string | null;
          profile_completed?: boolean;
          profile_completion_score?: number | null;
          professional_services?: string[] | null;
          client_verification_document?: string | null;
          professional_experience_years?: number | null;
          professional_certifications?: string[] | null;
          professional_portfolio_url?: string | null;
          idade?: number | null;
          allow_ai_indexing?: boolean;
          hide_ai_announcement?: boolean;
          is_approved: boolean;
          is_active: boolean;
          is_pro: boolean;
          pro_expires_at: string | null;
          font_size_preference: number;
          escolaridade?:
            | "ensino_fundamental_incompleto"
            | "ensino_fundamental_completo"
            | "ensino_medio_incompleto"
            | "ensino_medio_completo"
            | "ensino_superior_incompleto"
            | "ensino_superior_completo"
            | "pos_graduacao"
            | "mestrado"
            | "doutorado"
            | null;
          filhos?: number | null;
          estado_civil?:
            | "solteiro"
            | "casado"
            | "divorciado"
            | "viuvo"
            | "uniao_estavel"
            | "outro"
            | null;
          referencia_profissional?: string | null;
          turno_trabalho?:
            | "manha"
            | "tarde"
            | "noite"
            | "integral"
            | "flexivel"
            | null;
          country?: string | null;
          locale?: string | null;
          credits_ad_premium_1d?: number;
          credits_ad_premium_7d?: number;
          instagram_url?: string | null;
          facebook_url?: string | null;
          linkedin_url?: string | null;
          twitter_url?: string | null;
          youtube_url?: string | null;
          tiktok_url?: string | null;
          whatsapp_number?: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          user_type?: "client" | "professional";
          phone?: string | null;
          bio?: string | null;
          location_state?: string | null;
          location_city?: string | null;
          address?: string | null;
          address_number?: string | null;
          zip_code?: string | null;
          cpf_cnpj?: string | null;
          is_verified?: boolean;
          badge?: "bronze" | "silver" | "gold";
          rating?: number;
          total_reviews?: number;
          is_available?: boolean;
          birth_date?: string | null;
          gender?: "male" | "female" | "other" | null;
          neighborhood?: string | null;
          profile_completed?: boolean;
          profile_completion_score?: number | null;
          professional_services?: string[] | null;
          client_verification_document?: string | null;
          professional_experience_years?: number | null;
          professional_certifications?: string[] | null;
          professional_portfolio_url?: string | null;
          idade?: number | null;
          is_approved?: boolean;
          is_active?: boolean;
          font_size_preference?: number;
          escolaridade?:
            | "ensino_fundamental_incompleto"
            | "ensino_fundamental_completo"
            | "ensino_medio_incompleto"
            | "ensino_medio_completo"
            | "ensino_superior_incompleto"
            | "ensino_superior_completo"
            | "pos_graduacao"
            | "mestrado"
            | "doutorado"
            | null;
          filhos?: number | null;
          estado_civil?:
            | "solteiro"
            | "casado"
            | "divorciado"
            | "viuvo"
            | "uniao_estavel"
            | "outro"
            | null;
          is_pro?: boolean;
          pro_expires_at?: string | null;
          referencia_profissional?: string | null;
          turno_trabalho?:
            | "manha"
            | "tarde"
            | "noite"
            | "integral"
            | "flexivel"
            | null;
          country?: string | null;
          locale?: string | null;
          instagram_url?: string | null;
          facebook_url?: string | null;
          linkedin_url?: string | null;
          twitter_url?: string | null;
          youtube_url?: string | null;
          tiktok_url?: string | null;
          whatsapp_number?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          user_type?: "client" | "professional";
          phone?: string | null;
          bio?: string | null;
          location_state?: string | null;
          location_city?: string | null;
          address?: string | null;
          address_number?: string | null;
          zip_code?: string | null;
          cpf_cnpj?: string | null;
          is_verified?: boolean;
          is_pro?: boolean;
          pro_expires_at?: string | null;
          badge?: "bronze" | "silver" | "gold";
          rating?: number;
          total_reviews?: number;
          is_available?: boolean;
          birth_date?: string | null;
          gender?: "male" | "female" | "other" | null;
          neighborhood?: string | null;
          profile_completed?: boolean;
          profile_completion_score?: number | null;
          professional_services?: string[] | null;
          client_verification_document?: string | null;
          professional_experience_years?: number | null;
          professional_certifications?: string[] | null;
          professional_portfolio_url?: string | null;
          idade?: number | null;
          is_approved?: boolean;
          is_active?: boolean;
          font_size_preference?: number;
          escolaridade?:
            | "ensino_fundamental_incompleto"
            | "ensino_fundamental_completo"
            | "ensino_medio_incompleto"
            | "ensino_medio_completo"
            | "ensino_superior_incompleto"
            | "ensino_superior_completo"
            | "pos_graduacao"
            | "mestrado"
            | "doutorado"
            | null;
          filhos?: number | null;
          estado_civil?:
            | "solteiro"
            | "casado"
            | "divorciado"
            | "viuvo"
            | "uniao_estavel"
            | "outro"
            | null;
          referencia_profissional?: string | null;
          turno_trabalho?:
            | "manha"
            | "tarde"
            | "noite"
            | "integral"
            | "flexivel"
            | null;
          country?: string | null;
          locale?: string | null;
          instagram_url?: string | null;
          facebook_url?: string | null;
          linkedin_url?: string | null;
          twitter_url?: string | null;
          youtube_url?: string | null;
          tiktok_url?: string | null;
          whatsapp_number?: string | null;
        };
      };

      // =====================================================
      // SISTEMA DE CHAT
      // =====================================================

      conversations: {
        Row: {
          id: string;
          client_id: string;
          professional_id: string;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          professional_id: string;
          last_message_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          professional_id?: string;
          last_message_at?: string;
          created_at?: string;
        };
      };

      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };

      // =====================================================
      // SISTEMA DE AVALIAÇÕES
      // =====================================================

      reviews: {
        Row: {
          id: string;
          reviewer_id: string;
          reviewed_id: string;
          ad_id: string | null;
          review_type: string | null;
          rating_person: number;
          rating_work: number | null;
          punctuality: number | null;
          quality: number | null;
          comment: string | null;
          title: string | null;
          pros: string[] | null;
          cons: string[] | null;
          is_recommended: boolean | null;
          service_date: string | null;
          response_text: string | null;
          response_date: string | null;
          is_verified: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          positive_points: string[] | null;
          negative_points: string[] | null;
        };
        Insert: {
          id?: string;
          reviewer_id: string;
          reviewed_id: string;
          ad_id?: string | null;
          review_type?: string | null;
          rating_person: number;
          rating_work?: number | null;
          punctuality?: number | null;
          quality?: number | null;
          comment?: string | null;
          title?: string | null;
          pros?: string[] | null;
          cons?: string[] | null;
          is_recommended?: boolean | null;
          service_date?: string | null;
          response_text?: string | null;
          response_date?: string | null;
          is_verified?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          positive_points?: string[] | null;
          negative_points?: string[] | null;
        };
        Update: {
          id?: string;
          reviewer_id?: string;
          reviewed_id?: string;
          ad_id?: string | null;
          review_type?: string | null;
          rating_person?: number;
          rating_work?: number | null;
          punctuality?: number | null;
          quality?: number | null;
          comment?: string | null;
          title?: string | null;
          pros?: string[] | null;
          cons?: string[] | null;
          is_recommended?: boolean | null;
          service_date?: string | null;
          response_text?: string | null;
          response_date?: string | null;
          is_verified?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          positive_points?: string[] | null;
          negative_points?: string[] | null;
        };
      };

      // =====================================================
      // SISTEMA DE ANÚNCIOS CLASSIFICADOS
      // =====================================================

      classified_ads: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          location_state: string;
          location_city: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          views_count: number;
          likes_count: number;
          user_name: string;
          user_type: string;
          views: number;
          ad_type: string;
          has_scheduled_service: boolean;
          scheduled_date: string | null;
          scheduled_time: string | null;
          service_duration_minutes: number | null;
          service_price: number | null;
          available_dates: string[] | null;
          available_times: string[] | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          location_state: string;
          location_city: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          views_count?: number;
          likes_count?: number;
          user_name: string;
          user_type: string;
          views?: number;
          ad_type: string;
          has_scheduled_service?: boolean;
          scheduled_date?: string | null;
          scheduled_time?: string | null;
          service_duration_minutes?: number | null;
          service_price?: number | null;
          available_dates?: string[] | null;
          available_times?: string[] | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          category?: string;
          location_state?: string;
          location_city?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          views_count?: number;
          likes_count?: number;
          user_name?: string;
          user_type?: string;
          views?: number;
          ad_type?: string;
          has_scheduled_service?: boolean;
          scheduled_date?: string | null;
          scheduled_time?: string | null;
          service_duration_minutes?: number | null;
          service_price?: number | null;
          available_dates?: string[] | null;
          available_times?: string[] | null;
        };
      };

      // =====================================================
      // SISTEMA DE FEED SOCIAL
      // =====================================================

      feed_posts: {
        Row: {
          id: string;
          professional_id: string;
          title: string;
          description: string | null;
          images: string[] | null;
          service_category_id: string | null;
          location_state: string | null;
          location_city: string | null;
          likes_count: number;
          comments_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          user_id: string;
          content: string;
          is_public: boolean;
          is_featured: boolean;
          tags: string[] | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          professional_id: string;
          title: string;
          description?: string | null;
          images?: string[] | null;
          service_category_id?: string | null;
          location_state?: string | null;
          location_city?: string | null;
          likes_count?: number;
          comments_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          content: string;
          is_public?: boolean;
          is_featured?: boolean;
          tags?: string[] | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          professional_id?: string;
          title?: string;
          description?: string | null;
          images?: string[] | null;
          service_category_id?: string | null;
          location_state?: string | null;
          location_city?: string | null;
          likes_count?: number;
          comments_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          content?: string;
          is_public?: boolean;
          is_featured?: boolean;
          tags?: string[] | null;
          metadata?: Json | null;
        };
      };

      // =====================================================
      // SISTEMA DE NOTIFICAÇÕES
      // =====================================================

      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          created_at: string;
          action_url: string | null;
          priority: "low" | "normal" | "high" | "urgent";
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read?: boolean;
          created_at?: string;
          action_url?: string | null;
          priority?: "low" | "normal" | "high" | "urgent";
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          created_at?: string;
          action_url?: string | null;
          priority?: "low" | "normal" | "high" | "urgent";
        };
      };

      // =====================================================
      // SISTEMA DE FAVORITOS
      // =====================================================

      favorites: {
        Row: {
          id: string;
          user_id: string;
          professional_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          professional_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          professional_id?: string;
          created_at?: string;
        };
      };

      // =====================================================
      // SISTEMA DE SOLICITAÇÕES DE AVALIAÇÃO
      // =====================================================

      evaluation_requests: {
        Row: {
          id: string;
          requester_id: string;
          target_id: string;
          status: "pending" | "accepted" | "rejected" | "completed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          target_id: string;
          status?: "pending" | "accepted" | "rejected" | "completed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          target_id?: string;
          status?: "pending" | "accepted" | "rejected" | "completed";
          created_at?: string;
          updated_at?: string;
        };
      };

      // =====================================================
      // SISTEMA DE PORTFÓLIO
      // =====================================================

      portfolio_projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          category: string | null;
          tags: string[] | null;
          views_count: number;
          rating: number;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          category?: string | null;
          tags?: string[] | null;
          views_count?: number;
          rating?: number;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          category?: string | null;
          tags?: string[] | null;
          views_count?: number;
          rating?: number;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // =====================================================
      // SISTEMA DE VISUALIZAÇÕES DE PERFIL
      // =====================================================

      profile_views: {
        Row: {
          id: string;
          viewer_id: string | null;
          viewed_profile_id: string;
          viewed_at: string;
          ip_address: string | null;
          user_agent: string | null;
          referrer: string | null;
        };
        Insert: {
          id?: string;
          viewer_id?: string | null;
          viewed_profile_id: string;
          viewed_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
        };
        Update: {
          id?: string;
          viewer_id?: string | null;
          viewed_profile_id?: string;
          viewed_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
        };
      };

      // =====================================================
      // SISTEMA DE BANIMENTOS
      // =====================================================

      user_bans: {
        Row: {
          id: string;
          user_id: string;
          banned_by: string;
          reason: string;
          ban_type: "temporary" | "permanent";
          duration_days: number | null;
          expires_at: string | null;
          is_active: boolean;
          admin_notes: string | null;
          related_report_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          banned_by: string;
          reason: string;
          ban_type: "temporary" | "permanent";
          duration_days?: number | null;
          expires_at?: string | null;
          is_active?: boolean;
          admin_notes?: string | null;
          related_report_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          banned_by?: string;
          reason?: string;
          ban_type?: "temporary" | "permanent";
          duration_days?: number | null;
          expires_at?: string | null;
          is_active?: boolean;
          admin_notes?: string | null;
          related_report_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // =====================================================
      // SISTEMA DE DENÚNCIAS
      // =====================================================

      reports: {
        Row: {
          id: string;
          report_type: string;
          reason: string;
          description: string;
          status: string;
          priority: string;
          reporter_id: string;
          reported_user_id: string | null;
          reported_post_id: string | null;
          reported_message_id: string | null;
          reported_classified_id: string | null;
          admin_notes: string | null;
          resolution: string | null;
          created_at: string;
          updated_at: string;
          type: string;
        };
        Insert: {
          id?: string;
          report_type: string;
          reason: string;
          description: string;
          status?: string;
          priority?: string;
          reporter_id: string;
          reported_user_id?: string | null;
          reported_post_id?: string | null;
          reported_message_id?: string | null;
          reported_classified_id?: string | null;
          admin_notes?: string | null;
          resolution?: string | null;
          created_at?: string;
          updated_at?: string;
          type?: string;
        };
        Update: {
          id?: string;
          report_type?: string;
          reason?: string;
          description?: string;
          status?: string;
          priority?: string;
          reporter_id?: string;
          reported_user_id?: string | null;
          reported_post_id?: string | null;
          reported_message_id?: string | null;
          reported_classified_id?: string | null;
          admin_notes?: string | null;
          resolution?: string | null;
          created_at?: string;
          updated_at?: string;
          type?: string;
        };
      };

      // =====================================================
      // SISTEMA DE ADMINISTRADORES
      // =====================================================

      admins: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_type: "client" | "professional";
      badge_type: "bronze" | "silver" | "gold";
      verification_status: "not_started" | "pending" | "approved" | "rejected";
    };
  };
}

// Tipos exportados para uso nos componentes
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  user_type: "client" | "professional";
  phone: string;
  bio: string | null;
  location_state: string;
  location_city: string;
  address: string;
  address_number: string | null;
  zip_code: string | null;
  cpf_cnpj: string;
  is_verified: boolean;
  is_pro?: boolean;
  pro_expires_at?: string | null;
  verification_status: "not_started" | "pending" | "approved" | "rejected";
  badge: BadgeType;
  rating: number;
  total_reviews: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  // Novos campos para cadastro completo
  birth_date: string | null;
  neighborhood: string | null;
  profile_completed: boolean;
  profile_completion_score?: number | null;
  // Campos específicos para clientes
  client_verification_document?: string | null;
  // Campos específicos para profissionais
  professional_services?: string[];
  professional_experience_years?: number;
  professional_certifications?: string[];
  professional_portfolio_url?: string | null;
  // Campos de internacionalização
  country?: string | null;
  locale?: string | null;
  credits_ad_premium_1d?: number;
  credits_ad_premium_7d?: number;
  // Redes Sociais
  instagram_url?: string | null;
  facebook_url?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
  whatsapp_number?: string | null;
  allow_ai_indexing?: boolean;
  hide_ai_announcement?: boolean;
  is_approved: boolean;
  is_active: boolean;
  // Font size preference (75-150, default 100 = 100%)
  font_size_preference?: number;
}

export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type FeedPost = Database["public"]["Tables"]["feed_posts"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type ClassifiedAd =
  Database["public"]["Tables"]["classified_ads"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type EvaluationRequest =
  Database["public"]["Tables"]["evaluation_requests"]["Row"];
export type PortfolioProject =
  Database["public"]["Tables"]["portfolio_projects"]["Row"];
export type ProfileView = Database["public"]["Tables"]["profile_views"]["Row"];
export type UserBan = Database["public"]["Tables"]["user_bans"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type Admin = Database["public"]["Tables"]["admins"]["Row"];

export type UserType = Database["public"]["Enums"]["user_type"];
export type BadgeType = Database["public"]["Enums"]["badge_type"];
export type VerificationStatus =
  Database["public"]["Enums"]["verification_status"];
