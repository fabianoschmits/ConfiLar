"use client";

// Desabilitar SSG para esta página
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { LightModeLayout } from "@/components/layout/LightModeLayout";

export default function LogoutPage() {
  const [mounted, setMounted] = useState(false);
  const { signOut } = useAuthContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const performSignOut = async () => {
      try {
        console.log("🚪 Executando logout manual...");

        // Executar signOut e aguardar conclusão
        await signOut();

        console.log("✅ Logout concluído, redirecionando para login...");

        // Redirecionar imediatamente para página de login
        window.location.replace("/auth");
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        // Mesmo com erro, redirecionar para login
        window.location.replace("/auth");
      }
    };

    if (mounted) {
      performSignOut();
    }
  }, [signOut, mounted]);

  if (!mounted) {
    return null;
  }

  // Tela de logout moderna
  return (
    <LightModeLayout>
      <div className="min-h-screen bg-[var(--cl-paper)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center bg-[var(--cl-surface)] border-[var(--cl-border)] shadow-[var(--cl-shadow)]">
          <CardContent className="p-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-[var(--cl-ink)] rounded-full flex items-center justify-center mb-6 shadow-lg">
              <LogOut className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--cl-ink)] mb-4">
              Logout em andamento...
            </h1>
            <p className="text-gray-600 mb-8">
              Encerrando sua sessão e redirecionando para o login.
            </p>

            <div className="bg-[var(--cl-mist)] border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--cl-teal)] border-t-transparent mr-3"></div>
                <p className="text-blue-700 font-medium text-sm">
                  Redirecionando para o login...
                </p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>Obrigado por usar o ConfiLar!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </LightModeLayout>
  );
}
