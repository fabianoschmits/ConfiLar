"use client";

import { useState } from "react";
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
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { Key, Shield, Check, X } from "lucide-react";
import { useReauthentication } from "@/hooks/useReauthentication";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número")
      .regex(
        /[^A-Za-z0-9]/,
        "Senha deve conter pelo menos um caractere especial",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "Código deve ter 6 dígitos")
    .regex(/^\d+$/, "Código deve conter apenas números"),
});

type PasswordFormData = z.infer<typeof passwordSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

type Step = "reauth" | "password" | "success";

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function ChangePasswordForm({
  onSuccess,
  onCancel,
  className,
}: ChangePasswordFormProps) {
  const [step, setStep] = useState<Step>("reauth");
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword } = useAuthContext();
  const router = useRouter();

  const {
    isLoading: isReauthLoading,
    isReauthenticated,
    error: reauthError,
    otpSent,
    requestReauthentication,
    verifyOTP,
    resetReauthentication,
    checkReauthenticationRequired,
  } = useReauthentication();

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: errorsOtp },
    reset: resetOtp,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const password = watch("password", "");

  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    return {
      checks,
      score,
      strength: score < 3 ? "weak" : score < 4 ? "medium" : "strong",
    };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleRequestOTP = async () => {
    const needsReauth = await checkReauthenticationRequired("password");

    if (needsReauth) {
      const { error } = await requestReauthentication();
      if (error) {
        toast.error("Erro ao enviar código: " + error.message);
      }
    } else {
      setStep("password");
    }
  };

  const handleVerifyOTP = async (data: OtpFormData) => {
    const { error } = await verifyOTP(data.otp);

    if (error) {
      toast.error("Código inválido: " + error.message);
    } else {
      setStep("password");
      resetOtp();
    }
  };

  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);

    try {
      const { error } = await updatePassword(data.password);

      if (error) {
        if (error.message.includes("Reautenticação necessária")) {
          toast.info("Reautenticação necessária. Redirecionando...");
          setStep("reauth");
          resetReauthentication();
        } else {
          toast.error("Erro ao atualizar senha", {
            description:
              error.message || "Não foi possível atualizar sua senha.",
          });
        }
        setIsLoading(false);
      } else {
        toast.success("Senha alterada com sucesso!");
        setStep("success");
        setIsLoading(false);

        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      }
    } catch (error) {
      toast.error("Erro inesperado ao atualizar senha");
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep("reauth");
    reset();
    resetOtp();
    resetReauthentication();
  };

  if (step === "success") {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Senha alterada!
          </h2>
          <p className="text-gray-600 mb-6">
            Sua senha foi alterada com sucesso.
          </p>
          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="w-full">
              Fechar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === "reauth") {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-5 w-5 text-[var(--cl-teal)]" />
            <CardTitle>Alterar Senha</CardTitle>
          </div>
          <CardDescription>
            Para alterar sua senha, precisamos confirmar sua identidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!otpSent ? (
            <>
              <div className="bg-[var(--cl-mist)] border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-[var(--cl-teal)]" />
                  Verificação de segurança
                </h3>
                <p className="text-sm text-gray-600">
                  Enviaremos um código de verificação para seu email cadastrado.
                </p>
              </div>

              <Button
                onClick={handleRequestOTP}
                disabled={isReauthLoading}
                className="w-full bg-[var(--cl-ink)] hover:brightness-110 text-white"
              >
                {isReauthLoading
                  ? "Enviando..."
                  : "Enviar código de verificação"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Código de verificação</Label>
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

              <LoadingButton
                onClick={handleSubmitOtp(handleVerifyOTP)}
                disabled={isReauthLoading}
                isLoading={isReauthLoading}
                loadingText="Verificando..."
                className="w-full bg-[var(--cl-ink)] hover:brightness-110 text-white"
              >
                Verificar código
              </LoadingButton>

              <div className="bg-[var(--cl-mist)] border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Não recebeu o código?{" "}
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    disabled={isReauthLoading}
                    className="text-[var(--cl-teal)] hover:text-[var(--cl-teal)] hover:underline font-medium"
                  >
                    Reenviar código
                  </button>
                </p>
              </div>
            </>
          )}

          {onCancel && (
            <Button onClick={onCancel} variant="ghost" className="w-full">
              Cancelar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Key className="h-5 w-5 text-[var(--cl-teal)]" />
          <CardTitle>Nova Senha</CardTitle>
        </div>
        <CardDescription>
          Defina uma nova senha segura para sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-[var(--cl-mist)] border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Shield className="h-4 w-4 mr-2 text-[var(--cl-teal)]" />
            Critérios de segurança
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Mínimo de 8 caracteres</p>
            <p>• Pelo menos uma letra maiúscula</p>
            <p>• Pelo menos uma letra minúscula</p>
            <p>• Pelo menos um número</p>
            <p>• Pelo menos um caractere especial</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <PasswordInput
              id="password"
              placeholder="Digite sua nova senha"
              {...register("password")}
              error={!!errors.password}
            />
            {errors.password && (
              <FormFieldFeedback
                state="error"
                message={errors.password.message}
              />
            )}

            {password && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength === "strong"
                          ? "bg-green-500"
                          : passwordStrength.strength === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {passwordStrength.score}/5
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    className={`flex items-center space-x-1 ${passwordStrength.checks.length ? "text-green-600" : "text-gray-400"}`}
                  >
                    {passwordStrength.checks.length ? (
                      <Check size={12} />
                    ) : (
                      <X size={12} />
                    )}
                    <span>8+ caracteres</span>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${passwordStrength.checks.uppercase ? "text-green-600" : "text-gray-400"}`}
                  >
                    {passwordStrength.checks.uppercase ? (
                      <Check size={12} />
                    ) : (
                      <X size={12} />
                    )}
                    <span>Maiúscula</span>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${passwordStrength.checks.lowercase ? "text-green-600" : "text-gray-400"}`}
                  >
                    {passwordStrength.checks.lowercase ? (
                      <Check size={12} />
                    ) : (
                      <X size={12} />
                    )}
                    <span>Minúscula</span>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${passwordStrength.checks.number ? "text-green-600" : "text-gray-400"}`}
                  >
                    {passwordStrength.checks.number ? (
                      <Check size={12} />
                    ) : (
                      <X size={12} />
                    )}
                    <span>Número</span>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${passwordStrength.checks.special ? "text-green-600" : "text-gray-400"}`}
                  >
                    {passwordStrength.checks.special ? (
                      <Check size={12} />
                    ) : (
                      <X size={12} />
                    )}
                    <span>Especial</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Digite novamente sua nova senha"
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <FormFieldFeedback
                state="error"
                message={errors.confirmPassword.message}
              />
            )}
          </div>

          <div className="flex gap-3">
            <LoadingButton
              type="submit"
              disabled={isLoading || passwordStrength.strength === "weak"}
              className="flex-1 bg-[var(--cl-ink)] hover:brightness-110 text-white"
              isLoading={isLoading}
              loadingText="Atualizando..."
            >
              Atualizar senha
            </LoadingButton>
            {onCancel && (
              <Button onClick={onCancel} variant="outline" type="button">
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
