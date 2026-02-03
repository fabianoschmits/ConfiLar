"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";

interface ReauthenticationGuardProps {
  children: React.ReactNode;
  requiredAction?: "password" | "email" | "general";
}

export function ReauthenticationGuard({
  children,
  requiredAction,
}: ReauthenticationGuardProps) {
  const { user } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkReauthentication = () => {
      // Se não há usuário logado, não precisa verificar reautenticação
      if (!user) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Se não há ação específica requerida, autorizar
      if (!requiredAction) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Verificar sessão de reautenticação
      const reauthSession = sessionStorage.getItem("reauth_session");

      if (!reauthSession) {
        console.log(`⚠️ Reautenticação necessária para ${requiredAction}`);
        router.push(`/reautenticacao?action=${requiredAction}`);
        return;
      }

      try {
        // Verificar se a sessão ainda é válida (1 hora)
        const reauthData = JSON.parse(reauthSession);
        const reauthTime = new Date(reauthData.timestamp);
        const now = new Date();
        const hoursSinceReauth =
          (now.getTime() - reauthTime.getTime()) / (1000 * 60 * 60);

        if (hoursSinceReauth > 1) {
          console.log("⚠️ Sessão de reautenticação expirada");
          sessionStorage.removeItem("reauth_session");
          router.push(`/reautenticacao?action=${requiredAction}`);
          return;
        }

        // Verificar se a ação corresponde
        if (
          reauthData.action !== requiredAction &&
          requiredAction !== "general"
        ) {
          console.log(
            `⚠️ Ação de reautenticação não corresponde: ${reauthData.action} vs ${requiredAction}`,
          );
          router.push(`/reautenticacao?action=${requiredAction}`);
          return;
        }

        console.log("✅ Reautenticação válida");
        setIsAuthorized(true);
      } catch (error) {
        console.error("❌ Erro ao verificar sessão de reautenticação:", error);
        sessionStorage.removeItem("reauth_session");
        router.push(`/reautenticacao?action=${requiredAction}`);
        return;
      }

      setIsChecking(false);
    };

    checkReauthentication();
  }, [user, requiredAction, router, pathname]);

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

  // Se não está autorizado, não renderizar nada (o redirecionamento já foi feito)
  if (!isAuthorized) {
    return null;
  }

  // Renderizar conteúdo se autorizado
  return <>{children}</>;
}

// Hook para verificar se reautenticação é necessária
export function useReauthenticationCheck() {
  const { user } = useAuthContext();
  const router = useRouter();

  const checkReauthenticationRequired = async (
    action: "password" | "email" | "general",
  ): Promise<boolean> => {
    if (!user) {
      return false;
    }

    const reauthSession = sessionStorage.getItem("reauth_session");

    if (!reauthSession) {
      return true;
    }

    try {
      const reauthData = JSON.parse(reauthSession);
      const reauthTime = new Date(reauthData.timestamp);
      const now = new Date();
      const hoursSinceReauth =
        (now.getTime() - reauthTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceReauth > 1) {
        sessionStorage.removeItem("reauth_session");
        return true;
      }

      if (reauthData.action !== action && action !== "general") {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao verificar reautenticação:", error);
      sessionStorage.removeItem("reauth_session");
      return true;
    }
  };

  const requireReauthentication = (
    action: "password" | "email" | "general",
  ) => {
    router.push(`/reautenticacao?action=${action}`);
  };

  return {
    checkReauthenticationRequired,
    requireReauthentication,
  };
}
