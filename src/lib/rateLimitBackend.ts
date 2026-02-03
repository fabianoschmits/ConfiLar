/**
 * Rate Limiting para Backend (API Routes)
 * Sistema de controle de taxa de requisições no servidor
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

// Armazenamento em memória (em produção, usar Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

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
 * Verificar rate limit para uma chave específica
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  let entry = rateLimitStore.get(key);

  // Verificar se está bloqueado
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: entry.resetTime,
      blockedUntil: entry.blockedUntil,
      message: config.message || "Requisições bloqueadas temporariamente",
    };
  }

  // Se não existe entrada ou passou do tempo de reset, criar nova
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
    };
  }

  // Incrementar contador
  entry.count++;

  // Se excedeu o limite, bloquear
  if (entry.count > config.maxRequests) {
    entry.blockedUntil = now + config.blockDurationMs;
    rateLimitStore.set(key, entry);

    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: entry.resetTime,
      blockedUntil: entry.blockedUntil,
      message: config.message || "Limite de requisições excedido",
    };
  }

  // Atualizar entrada
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
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
 * Limpar entradas expiradas (cleanup automático)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  rateLimitStore.forEach((entry, key) => {
    // Remover se passou do tempo de reset e não está bloqueado
    if (
      entry.resetTime < now &&
      (!entry.blockedUntil || entry.blockedUntil < now)
    ) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => rateLimitStore.delete(key));
}

// Executar limpeza a cada 5 minutos
if (typeof window === "undefined") {
  // Apenas no servidor
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}

/**
 * Resetar rate limit para uma chave específica (útil para testes)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Obter informações de rate limit sem incrementar contador
 */
export function getRateLimitInfo(key: string): RateLimitEntry | null {
  return rateLimitStore.get(key) || null;
}
