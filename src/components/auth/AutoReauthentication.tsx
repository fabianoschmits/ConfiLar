"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useReauthentication } from "@/hooks/useReauthentication";

interface AutoReauthenticationProps {
  children: React.ReactNode;
}

export function AutoReauthentication({ children }: AutoReauthenticationProps) {
  const { user } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkReauthentication = async () => {
      // Se não há usuário logado, não precisa verificar
      if (!user) {
        return;
      }

      // Páginas que devem ser ignoradas (como login, registro, etc.)
      const ignoredPages = [
        "/auth",
        "/registro",
        "/recuperar-senha",
        "/verificacao",
        "/logout",
        "/reautenticacao",
      ];
      if (ignoredPages.includes(pathname)) {
        return;
      }

      // Páginas que requerem reautenticação
      const protectedPages = {
        "/nova-senha": "password",
        "/alterar-email": "email",
      } as const;

      const requiredAction =
        protectedPages[pathname as keyof typeof protectedPages];

      if (!requiredAction) {
        return;
      }

      setIsChecking(true);

      try {
        // Verificação simples baseada em sessionStorage
        const reauthSession = sessionStorage.getItem("reauth_session");
        const needsReauth = !reauthSession;

        if (needsReauth) {
          console.log(`⚠️ Reautenticação necessária para ${pathname}`);
          router.push(`/reautenticacao?action=${requiredAction}`);
        }
      } catch (error) {
        console.error("❌ Erro ao verificar reautenticação:", error);
        // Em caso de erro, assumir que reautenticação é necessária
        router.push(`/reautenticacao?action=${requiredAction}`);
      } finally {
        setIsChecking(false);
      }
    };

    // Adicionar um pequeno delay para evitar interferência no login
    const timeoutId = setTimeout(checkReauthentication, 100);

    return () => clearTimeout(timeoutId);
  }, [user, pathname, router]);

  // Mostrar loading enquanto verifica
  if (isChecking) {
    return (
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-yellow-400 mx-auto mb-6"></div>
          <h1 className="text-xl font-black text-black uppercase mb-4">
            VERIFICANDO SEGURANÇA...
          </h1>
          <p className="text-black font-bold">
            AGUARDE ENQUANTO VERIFICAMOS SUA AUTENTICAÇÃO.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook para verificar reautenticação em qualquer lugar
export function useAutoReauthentication() {
  const { checkReauthenticationRequired } = useReauthentication();
  const router = useRouter();

  const checkAndRedirect = async (
    action: "password" | "email" | "general",
    redirectPath?: string,
  ) => {
    try {
      // Verificação simples baseada em sessionStorage
      const reauthSession = sessionStorage.getItem("reauth_session");
      const needsReauth = !reauthSession;

      if (needsReauth) {
        console.log(`⚠️ Reautenticação necessária para ${action}`);
        router.push(`/reautenticacao?action=${action}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Erro ao verificar reautenticação:", error);
      router.push(`/reautenticacao?action=${action}`);
      return true;
    }
  };

  return { checkAndRedirect };
}
