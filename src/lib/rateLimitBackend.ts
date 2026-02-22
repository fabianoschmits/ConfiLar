import { createClient } from "@supabase/supabase-js";

// Inicializar cliente admin interno para rate limit
// Nota: Em produção, estas envs devem estar configuradas no Vercel
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "", // Requer service role para bypass de RLS se necessário
);

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
  message?: string;
}

// Configurações de rate limit por tipo
export const RateLimitConfigs = {
  // APIs de Autenticação
  LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    blockDurationMs: 30 * 60 * 1000, // 30 minutos
    message: "Muitas tentativas de login. Tente novamente mais tarde.",
  },
  SIGNUP: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 horas
    message: "Muitas tentativas de cadastro. Tente novamente mais tarde.",
  },
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 horas
    message: "Muitas tentativas de recuperação de senha.",
  },

  // APIs Gerais
  API_DEFAULT: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minuto
    blockDurationMs: 5 * 60 * 1000, // 5 minutos
    message: "Muitas requisições. Aguarde um momento.",
  },

  // APIs Sensíveis
  ADMIN: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minuto
    blockDurationMs: 10 * 60 * 1000, // 10 minutos
    message: "Limite de requisições administrativas excedido.",
  },

  // APIs de Dados
  DATA_EXPORT: {
    maxRequests: 2,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 horas
    message: "Limite de exportação de dados excedido.",
  },

  // APIs de Notificações
  NOTIFICATIONS: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minuto
    blockDurationMs: 5 * 60 * 1000, // 5 minutos
    message: "Muitas requisições de notificações.",
  },
} as const;

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  blockedUntil?: number;
  message?: string;
}

/**
 * Verificar rate limit para uma chave específica usando persistência no banco (Serverless Ready)
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  try {
    const { data, error } = await supabaseAdmin.rpc(
      "check_rate_limit_persistent",
      {
        p_key: key,
        p_max_requests: config.maxRequests,
        p_window_ms: config.windowMs,
        p_block_ms: config.blockDurationMs,
      },
    );

    if (error) {
      console.error("❌ Erro no Rate Limit Persistent:", error);
      // Fallback: permitir em caso de erro no banco para não bloquear o serviço
      return {
        allowed: true,
        limit: config.maxRequests,
        remaining: 1,
        resetTime: Date.now() + config.windowMs,
      };
    }

    if (data.allowed) {
      return {
        allowed: true,
        limit: config.maxRequests,
        remaining: data.remaining,
        resetTime: data.reset_time * 1000,
      };
    }

    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: Date.now() + (data.retry_after || 0) * 1000,
      blockedUntil: Date.now() + (data.retry_after || 0) * 1000,
      message: config.message || "Limite de requisições excedido",
    };
  } catch (err) {
    console.error("❌ Erro fatal no Rate Limit:", err);
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: 1,
      resetTime: Date.now() + config.windowMs,
    };
  }
}

/**
 * Gerar chave de rate limit baseada em IP e rota
 */
export function getRateLimitKey(
  ip: string | null,
  route: string,
  userId?: string,
): string {
  const identifier = userId || ip || "unknown";
  return `ratelimit:${route}:${identifier}`;
}

/**
 * Resetar rate limit para uma chave específica (útil para testes)
 */
export async function resetRateLimit(key: string): Promise<void> {
  await supabaseAdmin.from("rate_limits").delete().eq("key", key);
}
