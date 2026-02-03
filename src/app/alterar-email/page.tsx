"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthContext } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ReauthenticationGuard } from "@/components/auth/ReauthenticationGuard";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Shield,
  Info,
} from "lucide-react";
import { LightModeLayout } from "@/components/layout/LightModeLayout";

const emailChangeSchema = z
  .object({
    newEmail: z.string().email("Email inválido").min(1, "Email é obrigatório"),
    confirmEmail: z.string().min(1, "Confirmação de email é obrigatória"),
  })
  .refine((data) => data.newEmail === data.confirmEmail, {
    message: "Emails não coincidem",
    path: ["confirmEmail"],
  });

type EmailChangeFormData = z.infer<typeof emailChangeSchema>;

export default function AlterarEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailUpdated, setEmailUpdated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user, updateEmail } = useAuthContext();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EmailChangeFormData>({
    resolver: zodResolver(emailChangeSchema),
  });

  const newEmail = watch("newEmail", "");
  const confirmEmail = watch("confirmEmail", "");

  // Verificar se o usuário está autenticado
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    } else {
      router.push("/auth");
    }
  }, [user, router]);

  const onSubmit = async (data: EmailChangeFormData) => {
    setIsLoading(true);

    try {
      const { error } = await updateEmail(data.newEmail);

      if (error) {
        if (
          error.message.includes("Reautenticação necessária") ||
          error.message.includes("Sessão de reautenticação expirada")
        ) {
          toast.info("Redirecionando para verificação de segurança...");
        } else {
          toast.error("Erro ao atualizar email: " + error.message);
        }
        setIsLoading(false);
      } else {
        toast.success("Email atualizado com sucesso!");
        setEmailUpdated(true);
        setIsLoading(false);
      }
    } catch {
      toast.error("Erro inesperado ao atualizar email");
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  // Loading quando verificando autenticação
  if (!isAuthenticated) {
    return (
      <LightModeLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center bg-white/80 backdrop-blur-md border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Verificando autenticação...
              </h1>
              <p className="text-gray-600">
                Aguarde enquanto verificamos sua conta.
              </p>
            </CardContent>
          </Card>
        </div>
      </LightModeLayout>
    );
  }

  // Sucesso - Email atualizado
  if (emailUpdated) {
    return (
      <LightModeLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center bg-white/80 backdrop-blur-md border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Email atualizado!
              </h1>
              <p className="text-gray-600 mb-8">
                Seu email foi alterado com sucesso. Verifique sua nova caixa de
                entrada para confirmar a alteração.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-green-900 mb-2">
                    Próximos passos:
                  </h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>• Verifique seu novo email</p>
                    <p>• Confirme a alteração no link enviado</p>
                    <p>• Use o novo email para login</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleBackToHome}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                Voltar para página inicial
              </Button>
            </CardContent>
          </Card>
        </div>
      </LightModeLayout>
    );
  }

  return (
    <ReauthenticationGuard requiredAction="email">
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
                onClick={handleBackToHome}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 dark:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                <span>Voltar</span>
              </Button>
            </div>
          </header>

          {/* Conteúdo principal */}
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <Card className="max-w-md w-full bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Alterar email
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Atualize seu endereço de email para continuar recebendo nossas
                  comunicações
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Aviso importante */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-blue-600" />
                    Importante
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Você precisará confirmar o novo email</p>
                    <p>• Um link será enviado para o novo endereço</p>
                    <p>• Use o novo email para futuros logins</p>
                  </div>
                </div>

                {/* Email atual */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Email atual
                  </h3>
                  <p className="text-sm text-gray-600 break-all">
                    {user?.email}
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="newEmail"
                      className="text-sm font-medium text-gray-700"
                    >
                      Novo email
                    </Label>
                    <Input
                      id="newEmail"
                      type="email"
                      placeholder="Digite seu novo email"
                      {...register("newEmail")}
                      className={
                        errors.newEmail
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                    />
                    {errors.newEmail && (
                      <p className="text-sm text-red-500 font-medium">
                        {errors.newEmail.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmEmail"
                      className="text-sm font-medium text-gray-700"
                    >
                      Confirmar novo email
                    </Label>
                    <Input
                      id="confirmEmail"
                      type="email"
                      placeholder="Digite novamente seu novo email"
                      {...register("confirmEmail")}
                      className={
                        errors.confirmEmail
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                    />
                    {errors.confirmEmail && (
                      <p className="text-sm text-red-500 font-medium">
                        {errors.confirmEmail.message}
                      </p>
                    )}
                  </div>

                  {/* Validação visual */}
                  {newEmail && confirmEmail && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                            Verificação necessária
                          </h3>
                          <div className="text-sm text-yellow-700 space-y-1">
                            <p>
                              • Confirme o novo email no link que enviaremos
                            </p>
                            <p>• Pode levar alguns minutos para receber</p>
                            <p>• Verifique também a pasta de spam</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      isLoading ||
                      !newEmail ||
                      !confirmEmail ||
                      newEmail !== confirmEmail
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  >
                    {isLoading ? "Atualizando..." : "Atualizar email"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </LightModeLayout>
    </ReauthenticationGuard>
  );
}
