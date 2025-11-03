import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { withAdminAuth } from '@/lib/authenticatedRoute'

const execAsync = promisify(exec)

/**
 * POST /api/admin/tests/run
 * 
 * Executa testes automatizados (apenas para administradores).
 * 
 * Segurança:
 * - ✅ Requer autenticação admin (withAdminAuth)
 * - ✅ Comandos limitados a tipos de teste específicos
 */
export const POST = withAdminAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const { testType, suiteId } = await request.json()

    // Validar tipo de teste (limitar comandos permitidos para prevenir command injection)
    const allowedTestTypes = ['unit', 'integration', 'e2e', 'all']
    if (!testType || !allowedTestTypes.includes(testType)) {
      return NextResponse.json({ error: 'Tipo de teste inválido' }, { status: 400 })
    }

    let command = ''
    
    // Comandos permitidos apenas (whitelist)
    switch (testType) {
      case 'unit':
        command = 'npm run test:ci'
        break
      case 'integration':
        command = 'npm run test:integration'
        break
      case 'e2e':
        command = 'npx playwright test'
        break
      case 'all':
        command = 'npm run test:ci && npx playwright test'
        break
      default:
        return NextResponse.json({ error: 'Tipo de teste inválido' }, { status: 400 })
    }

    // Executar testes
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      timeout: 300000, // 5 minutos
    })

    // Parsear resultados (simplificado)
    const results = {
      success: !stderr,
      output: stdout,
      error: stderr,
      timestamp: new Date().toISOString(),
      testType,
      suiteId
    }

    return NextResponse.json(results)

  } catch (error: any) {
    console.error('Erro ao executar testes:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      output: error.stdout || '',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
})
