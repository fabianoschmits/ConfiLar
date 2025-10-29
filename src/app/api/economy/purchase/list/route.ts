import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar compras do usuário (sem joins)
    const { data: purchases, error: purchasesError } = await supabase
      .from('points_purchases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (purchasesError) {
      console.error('Erro ao buscar compras:', purchasesError)
      return NextResponse.json({ error: 'Erro ao buscar compras' }, { status: 500 })
    }

    // Buscar informações dos pacotes separadamente
    const packageIds = purchases?.map(purchase => purchase.package_id).filter(Boolean) || []
    
    let packagesMap = new Map()
    if (packageIds.length > 0) {
      const { data: packages, error: packagesError } = await supabase
        .from('points_packages')
        .select('*')
        .in('id', packageIds)

      if (packagesError) {
        console.error('Erro ao buscar pacotes:', packagesError)
        // Continuar mesmo com erro nos pacotes
      } else {
        packagesMap = new Map(packages?.map(pkg => [pkg.id, pkg]) || [])
      }
    }

    // Combinar os dados
    const purchasesWithPackages = purchases?.map(purchase => ({
      ...purchase,
      package: purchase.package_id ? packagesMap.get(purchase.package_id) : null
    })) || []

    return NextResponse.json({ purchases: purchasesWithPackages })
  } catch (error) {
    console.error('Erro na API de listar compras:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
