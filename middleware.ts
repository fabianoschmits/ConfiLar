import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Verificar sessão atual
  const { data: { session } } = await supabase.auth.getSession()

  // Rotas que requerem autenticação
  const protectedRoutes = [
    '/dashboard',
    '/perfil',
    '/mensagens',
    '/agenda',
    '/feed',
    '/buscar',
    '/classificados',
    '/avaliacoes',
    '/reputacao',
    '/portfolio',
    '/configuracoes'
  ]

  // Rotas de autenticação (redirecionar se já logado)
  const authRoutes = ['/auth', '/login', '/register', '/recuperar-senha', '/nova-senha']

  const { pathname } = request.nextUrl

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Verificar se é uma rota de auth
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Se não há sessão e tentando acessar rota protegida
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se há sessão e tentando acessar rota de auth, redirecionar para dashboard
  if (session && isAuthRoute) {
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
