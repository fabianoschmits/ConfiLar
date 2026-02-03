"use client";

// Desabilitar SSG para esta página
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { FormFieldFeedback } from "@/components/ui/FormFieldFeedback";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Mail, Key, Shield } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";
import { LightModeLayout } from "@/components/layout/LightModeLayout";
import { supabase } from "@/lib/supabase";

const recoverySchema = z.object({
  email: z.string().email("Email inválido"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "Código deve ter 6 dígitos")
    .regex(/^\d+$/, "Código deve conter apenas números"),
});

type RecoveryFormData = z.infer<typeof recoverySchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export default function RecuperarSenhaPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [userEmail, setUserEmail] = useState("");

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoveryFormData>({
    resolver: zodResolver(recoverySchema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: errorsOtp },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mostrar skeleton durante hidratação em vez de null para evitar problemas
  if (!mounted) {
    return (
      <LightModeLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-white/80 backdrop-blur-md border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </LightModeLayout>
    );
  }

  const onSubmit = async (data: RecoveryFormData) => {
    setIsLoading(true);

    try {
      // Enviar código OTP via API
      const response = await fetch("/api/auth/reset-password-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error("Erro ao enviar código de verificação", {
          description:
            result.error ||
            "Não foi possível enviar o código. Verifique o endereço e tente novamente.",
        });
        setIsLoading(false);
      } else {
        toast.success("Código de verificação enviado!", {
          description: "Verifique sua caixa de entrada",
        });
        setUserEmail(data.email);
        setStep("otp");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("Erro inesperado ao enviar código", {
        description:
          "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.",
      });
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async (data: OtpFormData) => {
    setIsLoading(true);

    try {
      // Verificar código OTP
      const { data: verifyData, error: verifyError } =
        await supabase.auth.verifyOtp({
          email: userEmail,
          token: data.otp,
          type: "email",
        });

      if (verifyError) {
        toast.error("Código inválido", {
          description:
            verifyError.message || "O código informado é inválido ou expirado.",
        });
        setIsLoading(false);
      } else if (verifyData.session) {
        // Criar sessão temporária para permitir alteração de senha
        await supabase.auth.setSession({
          access_token: verifyData.session.access_token,
          refresh_token: verifyData.session.refresh_token,
        });

        toast.success("Código verificado com sucesso!");
        setStep("success");
        setIsLoading(false);

        // Redirecionar para página de nova senha após 2 segundos
        setTimeout(() => {
          router.push("/nova-senha");
        }, 2000);
      }
    } catch (error) {
      toast.error("Erro ao verificar código", {
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error("Erro ao reenviar código", {
          description: result.error || "Não foi possível reenviar o código.",
        });
      } else {
        toast.success("Código reenviado!", {
          description: "Verifique sua caixa de entrada",
        });
      }
    } catch (error) {
      toast.error("Erro ao reenviar código");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/auth");
  };

  if (step === "success") {
    return (
      <LightModeLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center bg-white/80 backdrop-blur-md border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Código verificado!
              </h1>
              <p className="text-gray-600 mb-8">
                Redirecionando para definir sua nova senha...
              </p>
            </CardContent>
          </Card>
        </div>
      </LightModeLayout>
    );
  }

  if (step === "otp") {
    return (
      <LightModeLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
                onClick={() => setStep("email")}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 dark:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
            </div>
          </header>

          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <Card className="max-w-md w-full bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Key className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white text-center">
                  Verificar código
                </CardTitle>
                <CardDescription className="text-center">
                  Digite o código de 6 dígitos enviado para{" "}
                  <strong>{userEmail}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmitOtp(onVerifyOtp)}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="otp"
                      className="text-sm font-medium text-gray-700"
                    >
                      Código de verificação
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-2xl tracking-widest font-mono"
                      {...registerOtp("otp")}
                    />
                    {errorsOtp.otp && (
                      <FormFieldFeedback
                        state="error"
                        message={errorsOtp.otp.message}
                      />
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      Não recebeu o código?{" "}
                      <button
                        type="button"
                        onClick={resendOtp}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                      >
                        Reenviar código
                      </button>
                    </p>
                  </div>

                  <LoadingButton
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    disabled={isLoading}
                    isLoading={isLoading}
                    loadingText="Verificando..."
                  >
                    Verificar código
                  </LoadingButton>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </LightModeLayout>
    );
  }

  return (
    <ClientOnly>
      <LightModeLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Header Moderno */}
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
                onClick={handleBackToLogin}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 dark:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
            </div>
          </header>

          {/* Main Content Moderno */}
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <Card className="max-w-md w-full bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Recuperar senha
                  </h1>
                  <p className="text-gray-600">
                    Digite seu email para receber um código de verificação
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      {...register("email")}
                      className={`transition-colors ${
                        errors.email
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                    />
                    {errors.email && (
                      <FormFieldFeedback
                        state="error"
                        message={errors.email.message}
                      />
                    )}
                  </div>

                  <LoadingButton
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    disabled={isLoading}
                    isLoading={isLoading}
                    loadingText="Enviando..."
                  >
                    Enviar código de verificação
                  </LoadingButton>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium flex items-center justify-center gap-1 mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar para o login</span>
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </LightModeLayout>
    </ClientOnly>
  );
}
