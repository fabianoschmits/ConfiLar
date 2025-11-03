import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/authenticatedRoute'
import { createAdminSupabaseClient } from '@/lib/supabase'

// Exportar config de runtime para garantir execução dinâmica
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/tests/history
 * 
 * Lista histórico de testes executados.
 * 
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem visualizar histórico de testes
 */
export const GET = withAdminAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Usar admin client (após validar que é admin)
    const supabaseAdmin = createAdminSupabaseClient()

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
})

/**
 * POST /api/admin/tests/history
 * 
 * Salva resultado de teste no histórico.
 * 
 * Segurança:
 * - ✅ Requer autenticação de admin (withAdminAuth)
 * - ✅ Apenas administradores podem salvar testes
 */
export const POST = withAdminAuth(async (request: NextRequest, supabaseAuth, user) => {
  try {
    const testData = await request.json()

    // Usar admin client (após validar que é admin)
    const supabaseAdmin = createAdminSupabaseClient()

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
})
