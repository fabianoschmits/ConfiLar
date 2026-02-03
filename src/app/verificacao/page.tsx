"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Mail,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { LightModeLayout } from "@/components/layout/LightModeLayout";

export default function EmailVerificationSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "expired"
  >("loading");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Erro ao verificar usuário:", error);
          setStatus("error");
          setMessage("Erro ao verificar sua conta. Tente novamente.");
          return;
        }

        if (currentUser?.email_confirmed_at) {
          setStatus("success");
          setMessage("Sua conta foi verificada com sucesso!");
        } else {
          setStatus("expired");
          setMessage("Link de verificação expirado ou inválido.");
        }
      } catch (error) {
        console.error("Erro inesperado:", error);
        setStatus("error");
        setMessage("Ocorreu um erro inesperado. Tente novamente.");
      }
    };

    checkVerificationStatus();
  }, []);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: searchParams.get("email") || "",
      });

      if (error) {
        console.error("Erro ao reenviar email:", error);
        setMessage("Erro ao reenviar email. Tente novamente.");
      } else {
        setMessage(
          "Email de verificação reenviado! Verifique sua caixa de entrada.",
        );
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      setMessage("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    router.push("/auth");
  };

  const handleGoToHome = () => {
    router.push("/");
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <Card className="max-w-md w-full bg-white/80 backdrop-blur-md border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Verificando conta...
              </h1>
              <p className="text-gray-600">
                Aguarde enquanto verificamos sua conta.
              </p>
            </CardContent>
          </Card>
        );

      case "success":
        return (
          <Card className="max-w-md w-full bg-white/80 backdrop-blur-md border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Email verificado!
              </h1>
              <p className="text-gray-600 mb-8">{message}</p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-700 font-medium text-sm">
                  Sua conta está ativa e você já pode fazer login na plataforma.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleGoToLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Fazer Login
                </Button>
                <Button
                  onClick={handleGoToHome}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
                >
                  Voltar para página inicial
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "expired":
      case "error":
        return (
          <Card className="max-w-md w-full bg-white/80 backdrop-blur-md border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {status === "expired" ? "Link expirado" : "Erro de verificação"}
              </h1>
              <p className="text-gray-600 mb-8">{message}</p>

              <Alert className="mb-6">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  {status === "expired"
                    ? "O link de verificação pode ter expirado. Solicite um novo email de verificação."
                    : "Ocorreu um problema durante a verificação. Tente novamente ou entre em contato com o suporte."}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {status === "expired" && (
                  <Button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Reenviando...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Reenviar email de verificação
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={handleGoToLogin}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
                >
                  Ir para login
                </Button>
                <Button
                  onClick={handleGoToHome}
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-900 dark:text-white py-3"
                >
                  Voltar para página inicial
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <LightModeLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header moderno */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-lg">C</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                ConfiLar
              </span>
            </div>

            <Button
              onClick={handleGoToHome}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 dark:text-white transition-colors"
            >
              Página inicial
            </Button>
          </div>
        </header>

        {/* Conteúdo principal */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          {renderContent()}
        </div>
      </div>
    </LightModeLayout>
  );
}
