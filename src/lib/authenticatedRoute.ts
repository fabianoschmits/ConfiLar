import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

/**
 * Helper para proteger rotas de API com autenticação
 *
 * Uso:
 * ```typescript
 * export const GET = withAuth(async (req, supabase, user) => {
 *   const { data } = await supabase
 *     .from('table')
 *     .select('*')
 *     .eq('user_id', user.id)
 *
 *   return NextResponse.json({ data })
 * })
 * ```
 */
export function withAuth(
  handler: (
    request: NextRequest,
    supabase: SupabaseClient,
    user: User,
  ) => Promise<NextResponse>,
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // No Next.js 15, cookies() precisa ser await antes de usar
      const cookieStore = await cookies();

      // Debug: verificar quais cookies estão disponíveis
      const allCookies = cookieStore.getAll();
      const authCookies = allCookies.filter(
        (c) =>
          c.name.includes("sb-") ||
          c.name.includes("auth") ||
          c.name.includes("supabase"),
      );

      // Criar cliente Supabase com contexto de autenticação usando @supabase/ssr
      // Compatível com Next.js 15 e aguarda cookies corretamente
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => {
                  cookieStore.set(name, value, options);
                });
              } catch (error) {
                // Ignorar erros ao definir cookies em API routes (read-only em alguns contextos)
              }
            },
          },
        },
      );

      // Verificar autenticação
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("❌ [withAuth] Erro ao verificar autenticação:", {
          message: authError.message,
          status: authError.status,
          url: request.url,
        });
        return NextResponse.json(
          { error: "Não autenticado", details: authError.message },
          { status: 401 },
        );
      }

      if (!user) {
        console.warn(
          "⚠️ [withAuth] Tentativa de acesso sem autenticação:",
          request.url,
        );
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
      }

      // Executar handler com usuário autenticado
      return await handler(request, supabase, user);
    } catch (error) {
      console.error("❌ [withAuth] Erro interno:", error);
      return NextResponse.json(
        {
          error: "Erro interno do servidor",
          details: error instanceof Error ? error.message : "Erro desconhecido",
        },
        { status: 500 },
      );
    }
  };
}

/**
 * Valida se o userId fornecido corresponde ao usuário autenticado
 * Útil quando você precisa aceitar userId opcional mas validar segurança
 */
export function validateUserId(
  userId: string | null,
  authenticatedUserId: string,
): boolean {
  // Se não forneceu userId, aceita (usa authenticatedUserId)
  if (!userId) return true;

  // Se forneceu, deve corresponder ao autenticado
  return userId === authenticatedUserId;
}

/** Defense in depth for dynamic admin handlers that also receive route params. */
export async function requireAdmin(
  request: NextRequest,
): Promise<NextResponse | null> {
  const response = await withAdminAuth(async () =>
    NextResponse.json({ authorized: true }),
  )(request);
  return response.ok ? null : response;
}

/**
 * Helper para proteger rotas administrativas
 *
 * Verifica se o usuário está autenticado E é administrador ativo
 *
 * Uso:
 * ```typescript
 * export const GET = withAdminAuth(async (req, supabase, user) => {
 *   // Apenas admins podem acessar
 *   // ...
 * })
 * ```
 */
export function withAdminAuth(
  handler: (
    request: NextRequest,
    supabase: SupabaseClient,
    user: User,
  ) => Promise<NextResponse>,
) {
  return withAuth(async (request, supabase, user): Promise<NextResponse> => {
    try {
      // Verificar se o usuário é administrador
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("id, role, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      // Se não encontrou admin ou erro (exceto "não encontrado" ou erros 406/403 esperados)
      if (adminError) {
        // Tratar erros 406/403 como "não é admin" - silenciar esses erros esperados
        const isExpectedError =
          adminError.code === "PGRST116" ||
          adminError.code === "PGRST301" ||
          adminError.message?.includes("406") ||
          adminError.message?.includes("403") ||
          adminError.message?.includes("Not Acceptable") ||
          adminError.message?.includes("Forbidden") ||
          adminError.message?.includes("relation") ||
          adminError.message?.includes("does not exist");

        if (isExpectedError) {
          // Usuário não é admin - silenciar erro esperado
          return NextResponse.json(
            {
              error:
                "Acesso negado. Apenas administradores podem acessar esta rota.",
            },
            { status: 403 },
          );
        }
        // Outro erro
        console.error("Erro ao verificar admin:", adminError);
        return NextResponse.json(
          { error: "Erro ao verificar permissões" },
          { status: 500 },
        );
      }

      // Se não encontrou admin ativo
      if (!adminData || !adminData.is_active) {
        return NextResponse.json(
          {
            error:
              "Acesso negado. Apenas administradores podem acessar esta rota.",
          },
          { status: 403 },
        );
      }

      // Usuário é admin ativo, executar handler
      return await handler(request, supabase, user);
    } catch (error) {
      console.error("Erro em withAdminAuth:", error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 },
      );
    }
  });
}
