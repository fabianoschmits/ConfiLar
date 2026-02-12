import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

// Middleware do next-intl
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Primeiro, aplicar middleware do next-intl
  const intlResponse = intlMiddleware(request);

  // Se o next-intl redirecionou, usar essa resposta
  if (intlResponse) {
    // Ainda precisamos configurar o Supabase para cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            intlResponse.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            intlResponse.cookies.set({
              name,
              value: "",
              ...options,
            });
          },
        },
      },
    );
    await supabase.auth.getUser();
    return intlResponse;
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  // Verificar usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rotas que requerem autenticação
  // Nota: /perfil/[id] é pública, mas /perfil (sem ID) requer autenticação
  const protectedRoutes = [
    "/mensagens",
    "/feed",
    "/buscar",
    "/avaliacoes",
    "/reputacao",
    "/portfolio",
    "/configuracoes",
  ];

  // Rotas de perfil que requerem autenticação (perfil próprio)
  const protectedProfileRoutes = [
    "/perfil", // Apenas /perfil sem ID (próprio perfil)
  ];

  // Removido: Rotas de teste não são mais necessárias

  // Rotas de autenticação (redirecionar se já logado)
  // NOTA: /nova-senha não deve ser redirecionada automaticamente pois pode ter tokens no hash
  const authRoutes = ["/auth", "/login", "/register", "/recuperar-senha"];

  // Rotas que não devem ser redirecionadas automaticamente
  const specialRoutes = [
    "/onboarding",
    "/teste-onboarding-modal",
    "/verificacao",
    "/reautenticacao",
  ];

  const { pathname } = request.nextUrl;

  // Se for uma rota de API, apenas sincronizar cookies e retornar (sem redirecionamentos)
  // REMOVIDO: Agora tratamos rotas de API protegidas mais abaixo
  // if (pathname.startsWith('/api')) {
  //   return response
  // }

  // Permitir acesso à rota de logout sem interferência
  if (pathname === "/logout") {
    return response;
  }

  // Verificar se é uma rota especial (não redirecionar automaticamente)
  const isSpecialRoute = specialRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Rotas de API que exigem autenticação (Proteção no Middleware)
  const protectedApiRoutes = [
    "/api/gestao-confi",
    "/api/notifications",
    "/api/payment",
    "/api/economy",
    "/api/users",
    "/api/referrals",
  ];

  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Proteger rotas de API
  if (isProtectedApiRoute) {
    // Se não tiver usuário, retornar 401 Unauthorized
    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Você precisa estar logado para acessar este recurso",
        },
        { status: 401 },
      );
    }
  }

  // Permitir acesso às rotas especiais sem redirecionamento automático
  if (isSpecialRoute) {
    return response;
  }

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Verificar se é rota de perfil próprio (requer autenticação)
  // /perfil sem ID = próprio perfil (protegido)
  // /perfil/[id] = perfil de outro usuário (público)
  const isOwnProfileRoute = pathname === "/perfil" || pathname === "/perfil/";
  const isPublicProfileRoute = pathname.match(/^\/perfil\/[^/]+$/); // /perfil/[id] é público

  // Verificar se é uma rota de auth
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Se não há usuário e tentando acessar rota protegida ou próprio perfil
  if (!user && (isProtectedRoute || isOwnProfileRoute)) {
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Permitir acesso público a /perfil/[id]
  if (isPublicProfileRoute) {
    return response;
  }

  // Se há usuário e tentando acessar rota de auth, redirecionar para feed social
  // Mas apenas se não for um redirecionamento interno
  // Exceção: /nova-senha pode ter tokens no hash, então não redirecionar automaticamente
  if (
    user &&
    isAuthRoute &&
    !request.headers.get("x-middleware-redirect") &&
    pathname !== "/nova-senha"
  ) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     *
     * NOTA: Incluímos rotas /api para que o middleware sincronize cookies de autenticação
     * mas as rotas de API não serão redirecionadas pelo middleware, apenas terão cookies sincronizados
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
