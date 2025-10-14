import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('id')
    const format = searchParams.get('format') || 'json'

    if (!testId) {
      return NextResponse.json({ error: 'ID do teste é obrigatório' }, { status: 400 })
    }

    // Buscar dados do teste
    const { data: test, error } = await supabase
      .from('test_history')
      .select('*')
      .eq('id', testId)
      .single()

    if (error) {
      throw error
    }

    if (!test) {
      return NextResponse.json({ error: 'Teste não encontrado' }, { status: 404 })
    }

    // Gerar relatório baseado no formato
    if (format === 'pdf') {
      // Para PDF, retornar dados estruturados que podem ser convertidos
      const reportData = {
        test: test,
        generated_at: new Date().toISOString(),
        summary: {
          total_tests: test.total_tests,
          passed: test.passed_tests,
          failed: test.failed_tests,
          skipped: test.skipped_tests,
          coverage: test.coverage_percentage,
          duration: test.duration
        }
      }
      
      return NextResponse.json(reportData)
    }

    // Formato JSON padrão
    return NextResponse.json({
      test,
      generated_at: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}
