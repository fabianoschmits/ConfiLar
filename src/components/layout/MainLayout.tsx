"use client";

import React, { useState, useEffect } from "react";
import { ModernSidebar } from "./ModernSidebar";
import { ModernHeader } from "./ModernHeader";
import { QuickActionMenu } from "@/components/navigation/QuickActionMenu";
import { LoginPrompt } from "./LoginPrompt";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAutoRedirect } from "@/hooks/useAutoRedirect";
import { useProfileCheck } from "@/hooks/useProfileCheck";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/common/BrandLogo";
import { AIAnnouncement } from "@/components/profile/AIAnnouncement";
import { cn } from "@/lib/utils";

import { useSidebar } from "@/contexts/SidebarContext";

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Nova prop para indicar se a página requer autenticação
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  requireAuth = false,
}) => {
  const { user, profile } = useAuthContext();
  const pathname = usePathname();
  const isLoggedIn = user && profile;
  const [mounted, setMounted] = useState(false);

  // Hook para redirecionamento automático
  useAutoRedirect();

  // Hook para verificar se o perfil está completo
  const { isChecking: isCheckingProfile } = useProfileCheck();

  const { isCollapsed } = useSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Se ainda não montou, mostrar loading
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Sidebar sempre visível para navegação */}
      <ModernSidebar />

      {/* Header Moderno */}
      <ModernHeader />

      <main
        className={cn(
          "app-shell app-shell-main min-h-screen bg-[var(--cl-paper)]",
          pathname?.startsWith("/gestao-confi") && "app-shell-admin",
          isCollapsed ? "lg:ml-16" : "lg:ml-56",
        )}
      >
        {requireAuth && !isLoggedIn ? (
          // Mostrar prompt de login se a página requer autenticação
          <div className="app-access-screen">
            <div className="app-access-card text-center space-y-4">
              <div className="h-10 flex items-center">
                <BrandLogo width={120} height={28} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--cl-ink)] mb-2">
                  Acesso Restrito
                </h2>
                <p className="text-sm leading-relaxed text-[var(--cl-ink-secondary)]">
                  Esta página requer que você esteja logado para acessar o
                  conteúdo.
                </p>
              </div>
              <div className="space-y-3">
                <LoginPrompt />
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {!pathname?.startsWith("/gestao-confi") && <QuickActionMenu />}

      {/* Anúncio de IA para Profissionais */}
      <AIAnnouncement />
    </>
  );
};
