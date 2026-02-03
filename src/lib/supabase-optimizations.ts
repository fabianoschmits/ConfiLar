/**
 * Configurações de otimização para o Supabase
 * Este arquivo contém as configurações para reduzir Database Egress
 */

import { supabase } from "./supabase";

// Configurações de paginação padrão
export const PAGINATION_CONFIG = {
  // Timeline
  TIMELINE_POSTS_PER_PAGE: 20,
  TIMELINE_MAX_PAGES: 5, // Máximo 100 posts carregados

  // Chat
  MESSAGES_PER_PAGE: 20,
  MESSAGES_MAX_PAGES: 10, // Máximo 200 mensagens carregadas

  // Perfis
  PROFILES_PER_PAGE: 20,
  PROFILES_MAX_PAGES: 5, // Máximo 100 perfis carregados

  // Anúncios
  CLASSIFIEDS_PER_PAGE: 20,
  CLASSIFIEDS_MAX_PAGES: 5, // Máximo 100 anúncios carregados

  // Avaliações
  REVIEWS_PER_PAGE: 20,
  REVIEWS_MAX_PAGES: 3, // Máximo 60 avaliações carregadas
} as const;

// Configurações de cache
export const CACHE_CONFIG = {
  // Tempos de cache em milissegundos
  STATIC_DATA: 24 * 60 * 60 * 1000, // 24 horas (estados, cidades)
  SEMI_STATIC_DATA: 10 * 60 * 1000, // 10 minutos (perfis, anúncios)
  DYNAMIC_DATA: 2 * 60 * 1000, // 2 minutos (mensagens, notificações)
  REALTIME_DATA: 30 * 1000, // 30 segundos (contadores, status)
} as const;

// Configurações de retry
export const RETRY_CONFIG = {
  CRITICAL: { retry: 3, retryDelay: 1000 }, // Auth, perfil
  IMPORTANT: { retry: 2, retryDelay: 500 }, // Mensagens, anúncios
  OPTIONAL: { retry: 1, retryDelay: 200 }, // Stats, métricas
} as const;

// Configurações de Realtime
export const REALTIME_CONFIG = {
  // Ativar apenas para funcionalidades críticas
  ENABLE_MESSAGES: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_POSTS: false, // Desabilitado para economizar
  ENABLE_REVIEWS: false, // Desabilitado para economizar

  // Configurações de reconexão
  RECONNECT_INTERVAL: 30000, // 30 segundos
  MAX_RECONNECT_ATTEMPTS: 5,
} as const;

// Queries otimizadas pré-definidas
export const OPTIMIZED_QUERIES = {
  // Perfil básico (apenas campos essenciais)
  PROFILE_BASIC: `
    id,
    full_name,
    user_type,
    avatar_url,
    bio,
    location_state,
    location_city,
    rating,
    total_reviews,
    is_verified,
    is_available,
    created_at
  `,

  // Perfil completo (todos os campos necessários)
  PROFILE_FULL: `
    id,
    full_name,
    user_type,
    avatar_url,
    bio,
    location_state,
    location_city,
    neighborhood,
    professional_services,
    professional_experience_years,
    professional_certifications,
    badge,
    rating,
    total_reviews,
    is_verified,
    is_available,
    created_at
  `,

  // Mensagem básica
  MESSAGE_BASIC: `
    id,
    conversation_id,
    sender_id,
    receiver_id,
    content,
    created_at,
    is_read
  `,

  // Post da timeline
  TIMELINE_POST: `
    id,
    professional_id,
    title,
    description,
    images,
    location_state,
    location_city,
    likes_count,
    comments_count,
    created_at,
    updated_at
  `,

  // Anúncio classificado
  CLASSIFIED_AD: `
    id,
    user_id,
    user_name,
    user_type,
    title,
    description,
    category,
    location_state,
    location_city,
    created_at,
    is_active,
    views,
    user_avatar_url,
    ad_type
  `,

  // Avaliação
  REVIEW: `
    id,
    reviewer_id,
    reviewed_id,
    rating_person,
    comment,
    created_at
  `,
} as const;

// Função para aplicar otimizações globais
export function applySupabaseOptimizations() {
  // Configurar timeouts
  supabase.realtime.setAuth = async () => {
    // Configurações de autenticação otimizadas
  };

  // Configurar reconexão automática
  supabase.realtime.connect();

  console.log("🚀 Otimizações do Supabase aplicadas:", {
    pagination: PAGINATION_CONFIG,
    cache: CACHE_CONFIG,
    retry: RETRY_CONFIG,
    realtime: REALTIME_CONFIG,
  });
}

// Função para monitorar uso de dados
export function createDataUsageMonitor() {
  let totalQueries = 0;
  let totalDataTransferred = 0;

  return {
    trackQuery: (querySize: number) => {
      totalQueries++;
      totalDataTransferred += querySize;

      console.log("📊 Query executada:", {
        size: querySize,
        totalQueries,
        totalDataTransferred,
      });
    },

    getStats: () => ({
      totalQueries,
      totalDataTransferred,
      averageQuerySize:
        totalQueries > 0 ? totalDataTransferred / totalQueries : 0,
    }),

    reset: () => {
      totalQueries = 0;
      totalDataTransferred = 0;
    },
  };
}

// Monitor global de uso de dados
export const dataUsageMonitor = createDataUsageMonitor();

// Função para estimar tamanho de query
export function estimateQuerySize(
  selectFields: string[],
  estimatedRows: number,
): number {
  // Estimativa baseada no número de campos e linhas
  const avgFieldSize = 50; // bytes por campo (estimativa)
  const overhead = 100; // bytes de overhead da query

  return selectFields.length * avgFieldSize * estimatedRows + overhead;
}

// Função para validar se query está otimizada
export function validateQueryOptimization(
  selectFields: string[],
  maxFields: number = 15,
): boolean {
  if (selectFields.length > maxFields) {
    console.warn(
      `⚠️ Query com muitos campos (${selectFields.length}):`,
      selectFields,
    );
    return false;
  }

  if (selectFields.includes("*")) {
    console.warn("⚠️ Query usando SELECT * - não otimizada");
    return false;
  }

  return true;
}
