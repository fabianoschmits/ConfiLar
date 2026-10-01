"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Trash2,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useReauthentication } from "@/hooks/useReauthentication";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";

interface DeleteAccountFormProps {
  userEmail: string;
  className?: string;
}

export function DeleteAccountForm({
  userEmail,
  className,
}: DeleteAccountFormProps) {
  const router = useRouter();
  const { signOut } = useAuthContext();
  const [step, setStep] = useState<
    "warning" | "reauth" | "confirmation" | "processing" | "success"
  >("warning");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const {
    isLoading: isReauthLoading,
    isReauthenticated,
    error: reauthError,
    otpSent,
    requestReauthentication,
    verifyOTP,
    resetReauthentication,
  } = useReauthentication();

  const handleStartDeletion = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar se reautenticação é necessária
      // Account deletion always requires a fresh, server-verifiable OTP.
      resetReauthentication();
      setStep("reauth");
      setIsLoading(false);
    } catch (err: any) {
      console.error("Erro ao iniciar deleção:", err);
      setError(err.message || "Erro ao iniciar processo de deleção");
      toast.error("Erro ao iniciar deleção", {
        description: err.message,
      });
      setIsLoading(false);
    }
  };

  const handleReauthentication = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await requestReauthentication();
      if (error) {
        throw new Error(error.message);
      }

      // Código enviado com sucesso
      setIsLoading(false);
    } catch (err: any) {
      console.error("Erro na reautenticação:", err);
      setError(err.message || "Erro na reautenticação");
      toast.error("Erro na reautenticação", {
        description: err.message,
      });
      setIsLoading(false);
    }
  };

  const handleReauthOTP = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await verifyOTP(verificationCode);
      if (error) {
        throw new Error(error.message);
      }

      // Após reautenticação bem-sucedida, ir para confirmação
      setStep("confirmation");
      setIsLoading(false);
    } catch (err: any) {
      console.error("Erro ao verificar código de reautenticação:", err);
      setError(err.message || "Código inválido");
      toast.error("Código inválido", {
        description: err.message,
      });
      setIsLoading(false);
    }
  };

  const handleConfirmDeletion = async () => {
    if (!confirmText || confirmText !== "DELETAR CONTA") {
      toast.error('Digite exatamente "DELETAR CONTA" para confirmar');
      return;
    }

    setStep("processing");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/lgpd/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmation: "DELETAR CONTA",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao deletar conta");
      }

      setStep("success");
      toast.success("Conta deletada com sucesso!");

      // Deslogar o usuário e limpar sessão
      try {
        // Fazer signOut do Supabase
        await supabase.auth.signOut();

        // Fazer signOut do contexto de autenticação
        if (signOut) {
          await signOut();
        }

        // Limpar localStorage e sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        // Redirecionar para página inicial após 1 segundo
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } catch (logoutError) {
        console.error("Erro ao fazer logout:", logoutError);
        // Mesmo com erro, redirecionar
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (err: any) {
      console.error("Erro ao deletar conta:", err);
      setError(err.message || "Erro ao deletar conta");
      toast.error("Erro ao deletar conta", {
        description: err.message,
      });
      setStep("confirmation");
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep("warning");
    setError(null);
    setVerificationCode("");
    setConfirmText("");
    resetReauthentication();
  };

  if (step === "success") {
    return (
      <Card className={cn("border-red-200 dark:border-red-900", className)}>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Conta Deletada com Sucesso
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sua conta e todos os dados foram permanentemente removidos.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (step === "processing") {
    return (
      <Card className={cn("border-red-200 dark:border-red-900", className)}>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-red-600 dark:text-red-400 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Deletando Conta...
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Por favor, aguarde. Isso pode levar alguns segundos.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (step === "reauth") {
    return (
      <Card className={cn("border-red-200 dark:border-red-900", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Shield className="w-5 h-5" />
            Reautenticação Necessária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Para deletar sua conta, precisamos confirmar sua identidade.
              Enviaremos um código de verificação para{" "}
              <strong>{userEmail}</strong>.
            </AlertDescription>
          </Alert>

          {(error || reauthError) && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error || reauthError}</AlertDescription>
            </Alert>
          )}

          {!otpSent ? (
            <Button
              onClick={handleReauthentication}
              disabled={isLoading || isReauthLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading || isReauthLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Código de Verificação"
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reauthCode">Código de Verificação</Label>
                <Input
                  id="reauthCode"
                  type="text"
                  placeholder="Digite o código de 6 dígitos"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <Button
                onClick={handleReauthOTP}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar Código"
                )}
              </Button>
            </div>
          )}

          <Button onClick={resetForm} variant="ghost" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "confirmation") {
    return (
      <Card className={cn("border-red-200 dark:border-red-900", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Confirmar Deleção de Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Atenção:</strong> Esta ação é permanente e não pode ser
              desfeita. Todos os seus dados serão permanentemente removidos,
              incluindo:
            </AlertDescription>
          </Alert>

          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 space-y-2">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              Dados que serão deletados:
            </p>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
              <li>Perfil e informações pessoais</li>
              <li>Posts e publicações</li>
              <li>Anúncios e classificados</li>
              <li>Mensagens e conversas</li>
              <li>Avaliações e favoritos</li>
              <li>Notificações e configurações</li>
              <li>ConfiPoints e transações</li>
            </ul>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="confirmText"
              className="text-red-600 dark:text-red-400"
            >
              Digite <strong>DELETAR CONTA</strong> para confirmar:
            </Label>
            <Input
              id="confirmText"
              type="text"
              placeholder="DELETAR CONTA"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={cn(
                "font-mono",
                confirmText === "DELETAR CONTA"
                  ? "border-red-500 focus:border-red-600"
                  : "border-gray-300",
              )}
            />
          </div>

          <Button
            onClick={handleConfirmDeletion}
            disabled={isLoading || confirmText !== "DELETAR CONTA"}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Deletando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar Conta Permanentemente
              </>
            )}
          </Button>

          <Button onClick={resetForm} variant="ghost" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-red-200 dark:border-red-900", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <Trash2 className="w-5 h-5" />
          Deletar Conta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>Ação Irreversível:</strong> Ao deletar sua conta, todos os
            seus dados serão permanentemente removidos e não poderão ser
            recuperados.
          </AlertDescription>
        </Alert>

        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Antes de prosseguir, considere:
          </p>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
            <li>Fazer backup de informações importantes</li>
            <li>Cancelar assinaturas ou serviços ativos</li>
            <li>Salvar conversas ou dados que deseja manter</li>
            <li>Entender que esta ação não pode ser desfeita</li>
          </ul>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleStartDeletion}
            disabled={isLoading}
            variant="destructive"
            className="flex-1"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar Minha Conta
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
