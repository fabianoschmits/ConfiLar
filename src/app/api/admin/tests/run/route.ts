import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { testType, suiteId } = await request.json()

    let command = ''
    
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
}
