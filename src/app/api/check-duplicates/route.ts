import { NextRequest, NextResponse } from 'next/server'
import { checkEmailExists, checkCpfExists } from '@/lib/checkDuplicates'
import { withRateLimit } from '@/lib/rateLimitMiddleware'

/**
 * API para verificar duplicatas de email e CPF
 * 
 * POST /api/check-duplicates
 * Body: { email?: string, cpf?: string }
 * 
 * Retorna: { emailExists: boolean, cpfExists: boolean }
 * 
 * Segurança:
 * - ✅ Rate limiting (previne enumeration attacks)
 * - ⚠️ Rota pública necessária para cadastro
 */
const handlerPOST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, cpf } = body

    // Validar entrada
    if (!email && !cpf) {
      return NextResponse.json(
        { error: 'Email ou CPF deve ser fornecido' },
        { status: 400 }
      )
    }

    // Verificar duplicatas em paralelo
    const [emailExists, cpfExists] = await Promise.all([
      email ? checkEmailExists(email) : Promise.resolve(false),
      cpf ? checkCpfExists(cpf) : Promise.resolve(false)
    ])

    return NextResponse.json({
      emailExists,
      cpfExists,
      hasDuplicates: emailExists || cpfExists
    })

  } catch (error) {
    console.error('Erro ao verificar duplicatas (POST):', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET para verificar apenas email
 * 
 * GET /api/check-duplicates?email=test@example.com
 * 
 * Segurança:
 * - ✅ Rate limiting (previne enumeration attacks)
 */
const handlerGET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const cpf = searchParams.get('cpf')

    if (!email && !cpf) {
      return NextResponse.json(
        { error: 'Parâmetro email ou cpf é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar duplicatas em paralelo
    const [emailExists, cpfExists] = await Promise.all([
      email ? checkEmailExists(email) : Promise.resolve(false),
      cpf ? checkCpfExists(cpf) : Promise.resolve(false)
    ])

    return NextResponse.json({
      emailExists,
      cpfExists,
      hasDuplicates: emailExists || cpfExists
    })

  } catch (error) {
    console.error('Erro ao verificar duplicatas (GET):', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const POST = withRateLimit(handlerPOST, 'API_DEFAULT')
export const GET = withRateLimit(handlerGET, 'API_DEFAULT')
