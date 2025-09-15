import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Verificar usuário atual (mais seguro que getSession)
  const { data: { user } } = await supabase.auth.getUser()

  // Rotas que requerem autenticação
  const protectedRoutes = [
    '/dashboard',
    '/perfil',
    '/mensagens',
    '/feed',
    '/buscar',
    '/classificados', // Apenas a página principal de classificados
    '/avaliacoes',
    '/reputacao',
    '/portfolio',
    '/configuracoes'
  ]

  // Rotas de teste que não requerem autenticação
  const testRoutes = [
    '/classificados-novo',
    '/classificados-v1',
    '/classificados-v2',
    '/classificados-v3',
    '/classificados-v4',
    '/classificados-v5',
    '/classificados-v6',
    '/classificados-v7',
    '/classificados-v8',
    '/classificados-v9',
    '/classificados-v10',
    '/classificados-v11',
    '/classificados-v12',
    '/classificados-v13',
    '/classificados-v14',
    '/classificados-v15'
  ]

  // Rotas de autenticação (redirecionar se já logado)
  const authRoutes = ['/auth', '/login', '/register', '/recuperar-senha', '/nova-senha']

  const { pathname } = request.nextUrl

  // Verificar se é uma rota de teste (não requer autenticação)
  const isTestRoute = testRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Permitir acesso à rota de logout sem interferência
  if (pathname === '/logout') {
    return res
  }

  // Permitir acesso às rotas de teste sem verificação de autenticação
  if (isTestRoute) {
    return res
  }

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Verificar se é uma rota de auth
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Se não há usuário e tentando acessar rota protegida
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se há usuário e tentando acessar rota de auth, redirecionar para dashboard
  // Mas apenas se não for um redirecionamento interno
  if (user && isAuthRoute && !request.headers.get('x-middleware-redirect')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
