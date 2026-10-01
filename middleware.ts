import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { safeRedirectPath } from "./src/lib/safe-redirect";

// Middleware do next-intl
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
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
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Verificar usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Locale middleware must not bypass authentication or rewrite API endpoints.
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    const localized = intlMiddleware(request);
    response.cookies
      .getAll()
      .forEach((cookie) => localized.cookies.set(cookie));
    response = localized;
  }
  const redirect = (url: URL) => {
    const target = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
    return target;
  };

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
  const specialRoutes = ["/verificacao", "/reautenticacao"];

  const originalPath = request.nextUrl.pathname;
  const pathname = originalPath.replace(/^\/(?:pt-BR|en)(?=\/|$)/, "") || "/";

  // Se for uma rota de API, apenas sincronizar cookies e retornar (sem redirecionamentos)
  // REMOVIDO: Agora tratamos rotas de API protegidas mais abaixo
  // if (pathname.startsWith('/api')) {
  //   return response
  // }

  // Permitir acesso à rota de logout sem interferência
  if (
    pathname === "/logout" ||
    pathname === "/auth/callback" ||
    pathname === "/api/payment/paghiper/webhook"
  ) {
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

    // Se for rota de gestão, verificar se é admin
    if (pathname.startsWith("/api/gestao-confi")) {
      const { data: admin } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (!admin) {
        return NextResponse.json(
          {
            error: "Forbidden",
            message: "Acesso restrito a administradores",
          },
          { status: 403 },
        );
      }
    }
  }

  // Proteger páginas de gestão
  if (
    pathname.startsWith("/gestao-confi") &&
    !pathname.startsWith("/gestao-confi/login")
  ) {
    if (!user) {
      return redirect(new URL("/auth", request.url));
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!admin) {
      return redirect(new URL("/home", request.url));
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
    redirectUrl.searchParams.set(
      "redirect",
      originalPath + request.nextUrl.search,
    );
    return redirect(redirectUrl);
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
    return redirect(
      new URL(
        safeRedirectPath(request.nextUrl.searchParams.get("redirect")),
        request.url,
      ),
    );
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)",
  ],
};
