"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
  fallback?: React.ReactNode;
}

export function AdminGuard({
  children,
  requireSuperAdmin = false,
  fallback,
}: AdminGuardProps) {
  const { isAdmin, isSuperAdmin, loading, error } = useAdmin();
  const router = useRouter();
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (error) {
      setShowAccessDenied(true);
      return;
    }

    if (!isAdmin) {
      setShowAccessDenied(true);
      return;
    }

    if (requireSuperAdmin && !isSuperAdmin) {
      setShowAccessDenied(true);
      return;
    }

    setShowAccessDenied(false);
  }, [isAdmin, isSuperAdmin, loading, error, requireSuperAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">
              Verificando permissões de administrador...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showAccessDenied) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {requireSuperAdmin
                  ? "Você precisa ser um super administrador para acessar esta página."
                  : "Você precisa ser um administrador para acessar esta página."}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {requireSuperAdmin
                  ? "Esta página requer privilégios de super administrador."
                  : "Esta página é restrita a administradores do sistema."}
              </p>

              {error && <p className="text-sm text-red-600">Erro: {error}</p>}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button onClick={() => router.push("/")} className="flex-1">
                Ir para Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Componente específico para super admins
export function SuperAdminGuard({
  children,
  fallback,
}: Omit<AdminGuardProps, "requireSuperAdmin">) {
  return (
    <AdminGuard requireSuperAdmin={true} fallback={fallback}>
      {children}
    </AdminGuard>
  );
}
