/**
 * EXEMPLO de como usar Rate Limiting em uma API Route
 * 
 * Para usar em suas APIs, basta importar e usar o withRateLimit
 */

import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rateLimitMiddleware'

// Função handler normal
async function handler(req: NextRequest) {
  // Sua lógica aqui
  return NextResponse.json({
    message: 'API funcionando com rate limiting!',
    timestamp: new Date().toISOString()
  })
}

// Exportar com rate limiting aplicado
// Opções: 'LOGIN', 'SIGNUP', 'PASSWORD_RESET', 'API_DEFAULT', 'ADMIN', 'DATA_EXPORT', 'NOTIFICATIONS'
export const GET = withRateLimit(handler, 'API_DEFAULT')
export const POST = withRateLimit(handler, 'API_DEFAULT')

