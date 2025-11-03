import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { withAdminAuth } from '@/lib/authenticatedRoute'

/**
 * GET /api/admin/tests/status
 * 
 * Retorna status dos testes (apenas para administradores).
 * 
 * Segurança:
 * - ✅ Requer autenticação admin (withAdminAuth)
 */
export const GET = withAdminAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('type') || 'all'

    // Verificar se existem arquivos de resultado de teste
    const testResults = {
      unit: await getTestResults('unit'),
      integration: await getTestResults('integration'),
      e2e: await getTestResults('e2e'),
      coverage: await getCoverageResults()
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      results: testResults
    })

  } catch (error: any) {
    console.error('Erro ao obter status dos testes:', error)
    
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
})

async function getTestResults(type: string) {
  try {
    const resultPath = join(process.cwd(), 'test-results', `${type}-results.json`)
    const stats = await stat(resultPath)
    
    if (stats.isFile()) {
      const content = await readFile(resultPath, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    // Arquivo não existe ou erro de leitura
  }

  // Retornar dados mock se não houver arquivos reais
  return {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    lastRun: null
  }
}

async function getCoverageResults() {
  try {
    const coveragePath = join(process.cwd(), 'coverage', 'coverage-summary.json')
    const stats = await stat(coveragePath)
    
    if (stats.isFile()) {
      const content = await readFile(coveragePath, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    // Arquivo não existe ou erro de leitura
  }

  return {
    total: {
      lines: { pct: 0 },
      functions: { pct: 0 },
      branches: { pct: 0 },
      statements: { pct: 0 }
    }
  }
}
