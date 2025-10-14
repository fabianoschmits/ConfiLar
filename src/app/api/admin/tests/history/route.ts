import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Exportar config de runtime para garantir execução dinâmica
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Usar service role para operações administrativas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Buscar histórico de testes
    const { data: tests, error } = await supabaseAdmin
      .from('test_history')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Erro ao buscar histórico:', error)
      throw error
    }

    // Buscar total de registros
    const { count } = await supabaseAdmin
      .from('test_history')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      tests: tests || [],
      total: count || 0,
      limit,
      offset
    })

  } catch (error: any) {
    console.error('Erro ao buscar histórico de testes:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const testData = await request.json()

    // Salvar resultado do teste
    const { data, error } = await supabaseAdmin
      .from('test_history')
      .insert({
        test_type: testData.testType,
        suite_name: testData.suiteName,
        test_name: testData.testName,
        status: testData.status,
        duration: testData.duration,
        error_message: testData.errorMessage,
        coverage_percentage: testData.coveragePercentage,
        total_tests: testData.totalTests,
        passed_tests: testData.passedTests,
        failed_tests: testData.failedTests,
        skipped_tests: testData.skippedTests,
        browser: testData.browser,
        environment: testData.environment,
        output: testData.output,
        screenshots: testData.screenshots,
        videos: testData.videos,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('Erro ao salvar teste:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
