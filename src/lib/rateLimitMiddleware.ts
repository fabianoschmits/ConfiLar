/**
 * Middleware de Rate Limiting para API Routes
 * Uso: import { withRateLimit } from '@/lib/rateLimitMiddleware'
 */

import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getRateLimitKey,
  RateLimitConfigs,
} from "./rateLimitBackend";

type RateLimitType = keyof typeof RateLimitConfigs;

/**
 * HOF para adicionar rate limiting a uma API route
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limitType: RateLimitType = "API_DEFAULT",
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Obter IP do usuário
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0] ||
        req.headers.get("x-real-ip") ||
        req.headers.get("x-client-ip") ||
        "unknown";

      // Obter userId se disponível (do token ou session)
      const authHeader = req.headers.get("authorization");
      let userId: string | undefined;

      // Extrair user_id do token se disponível (simplificado)
      if (authHeader?.startsWith("Bearer ")) {
        try {
          // Em produção, validar o token JWT aqui
          userId = undefined; // Por enquanto, usar apenas IP
        } catch {
          userId = undefined;
        }
      }

      // Gerar chave de rate limit
      const route = req.nextUrl.pathname;
      const key = getRateLimitKey(ip, route, userId);

      // Verificar rate limit
      const config = RateLimitConfigs[limitType];
      const result = await checkRateLimit(key, config);

      // Se bloqueado, retornar erro 429
      if (!result.allowed) {
        const retryAfter = result.blockedUntil
          ? Math.ceil((result.blockedUntil - Date.now()) / 1000)
          : Math.ceil((result.resetTime - Date.now()) / 1000);

        return NextResponse.json(
          {
            error: "Too Many Requests",
            message: result.message || "Limite de requisições excedido",
            retryAfter,
            limit: result.limit,
            remaining: 0,
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": result.limit.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": result.resetTime.toString(),
              "Retry-After": retryAfter.toString(),
            },
          },
        );
      }

      // Se permitido, adicionar headers informativos e executar handler
      const response = await handler(req);

      // Adicionar headers de rate limit
      response.headers.set("X-RateLimit-Limit", result.limit.toString());
      response.headers.set(
        "X-RateLimit-Remaining",
        result.remaining.toString(),
      );
      response.headers.set("X-RateLimit-Reset", result.resetTime.toString());

      return response;
    } catch (error) {
      console.error("Erro no rate limiting:", error);
      // Em caso de erro, permitir a requisição (fail open)
      return handler(req);
    }
  };
}

/**
 * Helper para criar resposta de erro de rate limit
 */
export function rateLimitResponse(
  message: string,
  retryAfter: number,
  limit: number,
): NextResponse {
  return NextResponse.json(
    {
      error: "Too Many Requests",
      message,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": "0",
        "Retry-After": retryAfter.toString(),
      },
    },
  );
}
