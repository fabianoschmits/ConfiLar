"use client";

import { useState, useEffect } from "react";
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
import { PasswordInput } from "@/components/ui/password-input";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { FormFieldFeedback } from "@/components/ui/FormFieldFeedback";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { signIn, signInWithGoogle, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Evitar problemas de hidratação
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Verificar se a conta foi criada
  const accountCreated = searchParams.get("message") === "account_created";

  // Obter o parâmetro de redirecionamento - redireciona para home por padrão
  const redirectPath = searchParams.get("redirect") || "/feed";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!data.email || !data.password) {
      toast.error("Campos obrigatórios", {
        description: "Por favor, preencha o email e a senha para fazer login.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(data.email, data.password);

      if (result.error) {
        toast.error("Erro ao fazer login", {
          description:
            result.error.message ||
            "Verifique suas credenciais e tente novamente.",
        });
        setIsLoading(false);
      } else {
        toast.success("Login realizado com sucesso!");
        router.push(redirectPath);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Erro inesperado ao fazer login", {
        description:
          "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result?.error) {
        toast.error("Erro ao fazer login com Google", {
          description: result.error.message,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro no login Google:", error);
      toast.error("Erro inesperado ao fazer login com Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center pb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Entrar na sua conta
        </h2>
        <p className="text-gray-600">
          Digite suas credenciais para acessar a plataforma
        </p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Mensagem de sucesso quando a conta for criada */}
          {accountCreated && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-700">
                    Conta criada com sucesso! Confirme seu email e faça login
                    para continuar.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                errors.email ? "border-red-500 focus:border-red-500" : ""
              }`}
            />
            {errors.email && (
              <FormFieldFeedback state="error" message={errors.email.message} />
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Senha
            </Label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              {...register("password")}
              error={!!errors.password}
            />
            {errors.password && (
              <FormFieldFeedback
                state="error"
                message={errors.password.message}
              />
            )}
          </div>

          <LoadingButton
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            disabled={!isMounted || isLoading || authLoading}
            isLoading={isLoading || authLoading}
            loadingText="Entrando..."
          >
            Entrar
          </LoadingButton>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Ou continue com
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full py-3 flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={handleGoogleSignIn}
            disabled={!isMounted || isLoading || authLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.09z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-medium text-gray-700">Entrar com Google</span>
          </Button>

          <div className="text-center">
            <Link
              href="/recuperar-senha"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Esqueci minha senha
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600 pt-2">
            Não tem uma conta?{" "}
            <button
              type="button"
              onClick={() => router.push("/auth?tab=register")}
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Cadastre-se
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
