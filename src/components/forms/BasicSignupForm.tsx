"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { FormFieldFeedback } from "@/components/ui/FormFieldFeedback";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { checkEmailExists } from "@/lib/checkDuplicates";
import { RefreshCw } from "lucide-react";
import { createReferral } from "@/hooks/useReferralTracking";
import { SimpleCaptcha, useCaptcha } from "@/components/auth/SimpleCaptcha";
import { checkCpfExists } from "@/lib/checkDuplicates";
import { isValidCPF } from "@/lib/validation";

// Função para validar CPF
const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11) return false;

  const invalidCPFs = [
    "00000000000",
    "11111111111",
    "22222222222",
    "33333333333",
    "44444444444",
    "55555555555",
    "66666666666",
    "77777777777",
    "88888888888",
    "99999999999",
  ];

  if (invalidCPFs.includes(cpf)) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
};

// Schema para cadastro básico - email, CPF, senha, confirmação e código de referência
const basicSignupSchema = z
  .object({
    email: z.string().email("Email inválido"),
    cpf_cnpj: z
      .string()
      .min(11, "CPF deve ter pelo menos 11 dígitos")
      .refine((val) => {
        const cleaned = val.replace(/[^\d]+/g, "");
        return cleaned.length === 11;
      }, "CPF deve ter exatamente 11 dígitos")
      .refine((val) => isValidCPF(val), "CPF inválido"),
    referral_code: z.string().optional(), // Código de referência (opcional)
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
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type BasicSignupFormData = z.infer<typeof basicSignupSchema>;

export function BasicSignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [cpfExists, setCpfExists] = useState(false);
  const [isCheckingCpf, setIsCheckingCpf] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null); // Nome de quem indicou
  const [referralCodeFromUrl, setReferralCodeFromUrl] = useState<string | null>(
    null,
  ); // Código de referência vindo da URL
  const [isValidatingReferralCode, setIsValidatingReferralCode] =
    useState(false);
  const [referralCodeValid, setReferralCodeValid] = useState<boolean | null>(
    null,
  );
  const { signUpBasic, signInWithGoogle } = useAuthContext();

  // CAPTCHA
  const { isCaptchaValid, isBlocked, handleCaptchaValidate } = useCaptcha();

  // Evitar problemas de hidratação
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Buscar nome do indicador se houver código de referral na URL ou localStorage
  useEffect(() => {
    const checkReferrer = async () => {
      try {
        // 1. Tentar ler da URL primeiro
        const urlParams = new URLSearchParams(window.location.search);
        let refCode = urlParams.get("ref");

        // 2. Se não houver na URL, tentar localStorage
        if (!refCode) {
          const REFERRAL_STORAGE_KEY = "confilar_referral_code";
          const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
          if (stored) {
            try {
              const data = JSON.parse(stored);
              // Verificar se não expirou
              if (Date.now() <= data.expiry) {
                refCode = data.code;
                console.log(
                  "🔍 [BasicSignupForm] Código de referral recuperado do localStorage:",
                  refCode,
                );
              }
            } catch (err) {
              console.error("Erro ao ler localStorage:", err);
            }
          }
        } else {
          console.log(
            "🔍 [BasicSignupForm] Código de referral encontrado na URL:",
            refCode,
          );
        }

        if (!refCode) {
          return;
        }

        setReferralCodeFromUrl(refCode);

        // Buscar o nome do referrer no banco via API
        const response = await fetch("/api/referrals/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: refCode }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(
            "✅ [BasicSignupForm] Nome do referrer encontrado:",
            data.userName,
          );
          setReferrerName(data.userName);
          setReferralCodeValid(true);
        } else {
          console.error("❌ [BasicSignupForm] Código de referral inválido");
          setReferralCodeValid(false);
        }
      } catch (err) {
        console.error("❌ [BasicSignupForm] Erro ao buscar referrer:", err);
        setReferralCodeValid(false);
      }
    };

    checkReferrer();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger,
  } = useForm<BasicSignupFormData>({
    resolver: zodResolver(basicSignupSchema),
    mode: "all",
    reValidateMode: "onChange",
  });

  const watchedValues = watch();

  // Função para verificar email em tempo real
  const checkEmailInRealTime = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailExists(false);
      return;
    }

    setIsCheckingEmail(true);
    try {
      const exists = await checkEmailExists(email);
      setEmailExists(exists);
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      setEmailExists(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Função para verificar CPF em tempo real
  const checkCpfInRealTime = async (cpf: string) => {
    const cleaned = cpf.replace(/[^\d]+/g, "");
    if (!cleaned || cleaned.length !== 11) {
      setCpfExists(false);
      return;
    }

    if (!isValidCPF(cpf)) {
      setCpfExists(false);
      return;
    }

    setIsCheckingCpf(true);
    try {
      const exists = await checkCpfExists(cpf);
      setCpfExists(exists);
    } catch (error) {
      console.error("Erro ao verificar CPF:", error);
      setCpfExists(false);
    } finally {
      setIsCheckingCpf(false);
    }
  };

  // Debounce para verificação de email
  useEffect(() => {
    const email = watchedValues.email;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailExists(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkEmailInRealTime(email);
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [watchedValues.email]);

  // Debounce para verificação de CPF
  useEffect(() => {
    const cpf = watchedValues.cpf_cnpj;
    const cleaned = cpf?.replace(/[^\d]+/g, "");

    if (!cleaned || cleaned.length !== 11) {
      setCpfExists(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkCpfInRealTime(cpf);
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [watchedValues.cpf_cnpj]);

  // Validação de código de referência digitado manualmente
  const validateReferralCode = async (code: string) => {
    if (!code || code.length < 6) {
      setReferralCodeValid(null);
      setReferrerName(null);
      return;
    }

    console.log("🔍 [BasicSignupForm] Iniciando validação do código:", code);
    setIsValidatingReferralCode(true);
    try {
      const response = await fetch("/api/referrals/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      console.log("📡 [BasicSignupForm] Resposta da API:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ [BasicSignupForm] Código válido! Dados:", data);
        setReferrerName(data.userName);
        setReferralCodeValid(true);
      } else {
        const errorData = await response.json().catch(() => null);
        console.error("❌ [BasicSignupForm] Código inválido. Erro:", errorData);
        setReferrerName(null);
        setReferralCodeValid(false);
      }
    } catch (err) {
      console.error("❌ [BasicSignupForm] Erro ao validar código:", err);
      setReferrerName(null);
      setReferralCodeValid(false);
    } finally {
      setIsValidatingReferralCode(false);
    }
  };

  // Ref para controlar o número de execuções do loop
  const loopCountRef = useRef<number>(0);
  const MAX_LOOP_COUNT = 20;

  // Garantir que o código seja preenchido automaticamente no campo
  useEffect(() => {
    // Limitar o número de execuções
    if (loopCountRef.current >= MAX_LOOP_COUNT) {
      console.log(
        "⏸️ [BasicSignupForm] Loop limitado atingido. Parando execuções.",
      );
      return;
    }

    loopCountRef.current += 1;
    console.log(
      `🔄 [BasicSignupForm] Execução ${loopCountRef.current}/${MAX_LOOP_COUNT}`,
    );

    if (referralCodeFromUrl) {
      console.log(
        "🔄 [BasicSignupForm] Preenchendo campo referral_code com:",
        referralCodeFromUrl,
      );
      setValue("referral_code", referralCodeFromUrl, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    } else {
      // Se não houver código da URL, tentar restaurar do localStorage
      // Isso garante que o código seja restaurado mesmo se o usuário voltar à página
      const REFERRAL_STORAGE_KEY = "confilar_referral_code";
      try {
        const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          // Verificar se não expirou
          if (Date.now() <= data.expiry && data.code) {
            console.log(
              "🔄 [BasicSignupForm] Restaurando código do localStorage:",
              data.code,
            );
            setValue("referral_code", data.code, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
            setReferralCodeFromUrl(data.code);
            // Validar o código restaurado
            validateReferralCode(data.code);
          }
        }
      } catch (err) {
        console.error("Erro ao restaurar código do localStorage:", err);
      }
    }
  }, [referralCodeFromUrl, setValue, validateReferralCode]);

  // Debounce para validação de código de referência
  useEffect(() => {
    const code = watchedValues.referral_code;

    // Se veio da URL, não validar novamente
    if (referralCodeFromUrl) {
      return;
    }

    if (!code) {
      setReferralCodeValid(null);
      setReferrerName(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      validateReferralCode(code);
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [watchedValues.referral_code, referralCodeFromUrl]);

  // Função para verificar a força da senha
  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score, isStrong: score === 5 };
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result?.error) {
        toast.error("Erro ao cadastrar com Google", {
          description: result.error.message,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro no cadastro Google:", error);
      toast.error("Erro inesperado ao cadastrar com Google");
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: BasicSignupFormData) => {
    setIsLoading(true);
    try {
      // ✅ VALIDAR CAPTCHA
      if (!isCaptchaValid) {
        toast.error(
          "❌ Por favor, resolva a verificação de segurança corretamente.",
        );
        setIsLoading(false);
        return;
      }

      if (isBlocked) {
        toast.error("❌ Muitas tentativas incorretas. Aguarde 1 minuto.");
        setIsLoading(false);
        return;
      }

      // ✅ VALIDAR DUPLICATAS ANTES DE CADASTRAR
      console.log("🔍 Verificando duplicatas...");

      // Verificar email
      if (emailExists) {
        toast.error(
          "❌ Este email já está cadastrado. Use o link de recuperação de conta.",
        );
        setIsLoading(false);
        return;
      }

      const emailCheck = await checkEmailExists(data.email);
      if (emailCheck) {
        toast.error("❌ Este email já está cadastrado na plataforma");
        setIsLoading(false);
        return;
      }

      console.log("✅ Email disponível");

      // Verificar CPF
      if (cpfExists) {
        toast.error(
          "❌ Este CPF já está cadastrado. Use o link de recuperação de conta.",
        );
        setIsLoading(false);
        return;
      }

      const cpfCheck = await checkCpfExists(data.cpf_cnpj);
      if (cpfCheck) {
        toast.error("❌ Este CPF já está cadastrado na plataforma");
        setIsLoading(false);
        return;
      }

      console.log("✅ CPF disponível");

      // ✅ SALVAR CÓDIGO DE REFERÊNCIA NO LOCALSTORAGE (sempre que houver código)
      if (data.referral_code) {
        console.log(
          "💾 [Cadastro] Salvando código de referência no localStorage:",
          data.referral_code,
        );
        const REFERRAL_STORAGE_KEY = "confilar_referral_code";
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        localStorage.setItem(
          REFERRAL_STORAGE_KEY,
          JSON.stringify({
            code: data.referral_code,
            timestamp: Date.now(),
            expiry: expiryDate.getTime(),
          }),
        );

        console.log(
          "✅ [Cadastro] Código salvo com sucesso! Será processado no onboarding.",
        );
      } else {
        console.log("⚠️ [Cadastro] Nenhum código de referência para salvar");
      }

      const { error, data: signUpData } = await signUpBasic({
        email: data.email,
        password: data.password,
        cpf_cnpj: data.cpf_cnpj,
      });

      if (error) {
        console.error("❌ Erro detalhado:", error);

        // Tratar erros específicos do Supabase
        let errorMessage = error.message;
        let errorTitle = "Erro ao criar conta";

        if (
          error.message?.toLowerCase().includes("rate limit") ||
          error.message?.toLowerCase().includes("email rate limit exceeded")
        ) {
          errorTitle = "Limite de emails excedido";
          errorMessage =
            "Muitos emails foram enviados recentemente. Por favor, aguarde algumas horas e tente novamente. Se o problema persistir, entre em contato com o suporte.";
        } else if (
          error.message?.toLowerCase().includes("user already registered")
        ) {
          errorTitle = "Email já cadastrado";
          errorMessage =
            "Este email já está cadastrado. Use a opção de recuperação de senha se você já possui uma conta.";
        } else if (error.message?.toLowerCase().includes("invalid email")) {
          errorTitle = "Email inválido";
          errorMessage =
            "Por favor, verifique se o email está correto e tente novamente.";
        } else if (error.message?.toLowerCase().includes("password")) {
          errorTitle = "Senha inválida";
          errorMessage =
            "A senha não atende aos requisitos de segurança. Por favor, verifique e tente novamente.";
        }

        toast.error(`${errorTitle}: ${errorMessage}`, {
          duration: 8000, // Mostrar por mais tempo para mensagens importantes
        });
        setIsLoading(false);
        return;
      }

      console.log("✅ Conta criada com sucesso!");

      // ✅ CRIAR REFERRAL IMEDIATAMENTE SE HOUVER CÓDIGO
      if (data.referral_code && signUpData?.user?.id) {
        try {
          console.log(
            "👥 [Cadastro] Criando referral para o usuário:",
            signUpData.user.id,
          );
          console.log(
            "👥 [Cadastro] Código de referência:",
            data.referral_code,
          );

          const referralResult = await createReferral(
            signUpData.user.id,
            "signup_form",
            data.referral_code,
          );

          if (referralResult.success) {
            console.log("✅ [Cadastro] Referral criado com sucesso!");
          } else {
            console.warn(
              "⚠️ [Cadastro] Erro ao criar referral:",
              referralResult.error,
            );
          }
        } catch (referralError) {
          console.error(
            "❌ [Cadastro] Erro ao processar referral:",
            referralError,
          );
        }
      } else if (signUpData?.user?.id) {
        // ✅ BÔNUS ORGÂNICO: Se não houver código, tentar aplicar o bônus de boas-vindas padrão
        try {
          console.log(
            "🎁 [Cadastro] Usuário orgânico. Aplicando bônus de boas-vindas...",
          );
          fetch("/api/auth/hooks/apply-welcome-bonus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: signUpData.user.id }),
          }).catch((err) =>
            console.error("Erro silencioso ao aplicar bônus:", err),
          );
        } catch (e) {
          // Ignorar erro para não travar o fluxo
          console.error("Erro ao chamar API de bônus:", e);
        }
      }

      // Mostrar notificação de sucesso
      toast.success(
        "🎉 Conta criada com sucesso! Um email de confirmação foi enviado para você. Verifique sua caixa de entrada e clique no link para ativar sua conta.",
      );

      // Aguardar 3 segundos para o usuário ler a mensagem antes de redirecionar
      setTimeout(() => {
        setIsLoading(false);
        window.location.href = "/auth?message=account_created";
      }, 3000);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error("Erro inesperado ao criar conta");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Banner de Indicação */}
      {referrerName && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-2">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">
                🎉 Você foi indicado por {referrerName}!
              </p>
              <p className="text-xs text-green-700 mt-1">
                Complete seu cadastro e ambos receberão benefícios
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dados Básicos */}
      <div className="space-y-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Criar Conta
        </h3>

        <div className="space-y-4 pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full py-3 flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={handleGoogleSignUp}
            disabled={!isMounted || isLoading}
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
            <span className="font-medium text-gray-700">
              Cadastrar com Google
            </span>
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-white text-gray-500">
                Ou preencha os dados abaixo
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Crie sua conta com email, CPF e senha. Após o primeiro login, você
          completará seu perfil com nome e outros dados.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email *
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register("email")}
                className={cn(
                  "transition-colors pr-10",
                  errors.email ? "border-red-500 focus:border-red-500" : "",
                  emailExists
                    ? "border-orange-500 focus:border-orange-500"
                    : "",
                )}
              />
              {isCheckingEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <RefreshCw size={16} className="animate-spin text-blue-500" />
                </div>
              )}
            </div>

            {/* Mensagens de validação */}
            {isCheckingEmail && (
              <FormFieldFeedback
                state="validating"
                message="Verificando disponibilidade..."
              />
            )}
            {errors.email && (
              <FormFieldFeedback state="error" message={errors.email.message} />
            )}
            {emailExists && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium mb-2">
                  ⚠️ Este email já está cadastrado na plataforma
                </p>
                <p className="text-xs text-orange-700 mb-3">
                  Você já possui uma conta com este email. Escolha uma das
                  opções abaixo:
                </p>
                <div className="space-y-2">
                  <a
                    href="/recuperar-senha"
                    className="block text-sm text-orange-600 hover:text-orange-700 underline font-medium"
                  >
                    🔑 Recuperar senha
                  </a>
                  <a
                    href="/auth"
                    className="block text-sm text-orange-600 hover:text-orange-700 underline font-medium"
                  >
                    🔐 Fazer login
                  </a>
                </div>
              </div>
            )}
            {watchedValues.email &&
              !errors.email &&
              !emailExists &&
              !isCheckingEmail &&
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedValues.email) && (
                <FormFieldFeedback state="valid" message="Email disponível" />
              )}
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label
              htmlFor="cpf_cnpj"
              className="text-sm font-medium text-gray-700"
            >
              CPF *
            </Label>
            <div className="relative">
              <Input
                id="cpf_cnpj"
                type="text"
                placeholder="000.000.000-00"
                {...register("cpf_cnpj")}
                maxLength={14}
                onChange={(e) => {
                  // Formatar CPF enquanto digita
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 11) {
                    value = value.replace(/(\d{3})(\d)/, "$1.$2");
                    value = value.replace(/(\d{3})(\d)/, "$1.$2");
                    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                  }
                  e.target.value = value;
                  register("cpf_cnpj").onChange(e);
                }}
                className={cn(
                  "transition-colors pr-10",
                  errors.cpf_cnpj ? "border-red-500 focus:border-red-500" : "",
                  cpfExists ? "border-orange-500 focus:border-orange-500" : "",
                )}
              />
              {isCheckingCpf && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <RefreshCw size={16} className="animate-spin text-blue-500" />
                </div>
              )}
            </div>

            {isCheckingCpf && (
              <FormFieldFeedback
                state="validating"
                message="Verificando disponibilidade..."
              />
            )}
            {errors.cpf_cnpj && (
              <FormFieldFeedback
                state="error"
                message={errors.cpf_cnpj.message}
              />
            )}
            {cpfExists && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium mb-2">
                  ⚠️ Este CPF já está cadastrado na plataforma
                </p>
                <p className="text-xs text-orange-700 mb-3">
                  Você já possui uma conta com este CPF. Escolha uma das opções
                  abaixo:
                </p>
                <div className="space-y-2">
                  <a
                    href="/recuperar-senha"
                    className="block text-sm text-orange-600 hover:text-orange-700 underline font-medium"
                  >
                    🔑 Recuperar senha
                  </a>
                  <a
                    href="/auth"
                    className="block text-sm text-orange-600 hover:text-orange-700 underline font-medium"
                  >
                    🔐 Fazer login
                  </a>
                </div>
              </div>
            )}
            {watchedValues.cpf_cnpj &&
              !errors.cpf_cnpj &&
              !cpfExists &&
              !isCheckingCpf &&
              watchedValues.cpf_cnpj.replace(/\D/g, "").length === 11 && (
                <FormFieldFeedback state="valid" message="CPF disponível" />
              )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Senha *
            </Label>
            <PasswordInput
              id="password"
              placeholder="Digite sua senha"
              {...register("password")}
              error={!!errors.password}
            />

            {/* Indicador de força da senha */}
            {watchedValues.password && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        checkPasswordStrength(watchedValues.password).score ===
                        5
                          ? "bg-green-500"
                          : checkPasswordStrength(watchedValues.password)
                                .score >= 3
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{
                        width: `${(checkPasswordStrength(watchedValues.password).score / 5) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {checkPasswordStrength(watchedValues.password).score}/5
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`${checkPasswordStrength(watchedValues.password).checks.length ? "text-green-500" : "text-gray-400"}`}
                    >
                      ✓
                    </span>
                    <span
                      className={`${checkPasswordStrength(watchedValues.password).checks.uppercase ? "text-green-500" : "text-gray-400"}`}
                    >
                      ✓
                    </span>
                    <span
                      className={`${checkPasswordStrength(watchedValues.password).checks.lowercase ? "text-green-500" : "text-gray-400"}`}
                    >
                      ✓
                    </span>
                    <span
                      className={`${checkPasswordStrength(watchedValues.password).checks.number ? "text-green-500" : "text-gray-400"}`}
                    >
                      ✓
                    </span>
                    <span
                      className={`${checkPasswordStrength(watchedValues.password).checks.special ? "text-green-500" : "text-gray-400"}`}
                    >
                      ✓
                    </span>
                  </div>
                  <span
                    className={`font-medium ${
                      checkPasswordStrength(watchedValues.password).score === 5
                        ? "text-green-600"
                        : checkPasswordStrength(watchedValues.password).score >=
                            3
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {checkPasswordStrength(watchedValues.password).score === 5
                      ? "Senha forte"
                      : checkPasswordStrength(watchedValues.password).score >= 3
                        ? "Senha média"
                        : "Senha fraca"}
                  </span>
                </div>
              </div>
            )}

            {errors.password && (
              <p className="text-sm text-red-500 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirmar Senha *
            </Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Digite a senha novamente"
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
            />

            {/* Indicador de confirmação */}
            {watchedValues.confirmPassword && (
              <div className="space-y-1">
                {watchedValues.password === watchedValues.confirmPassword ? (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Senhas coincidem
                  </p>
                ) : (
                  <p className="text-sm text-red-500 font-medium">
                    ✗ As senhas não coincidem
                  </p>
                )}
              </div>
            )}

            {errors.confirmPassword && (
              <p className="text-sm text-red-500 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Código de Referência (Opcional) */}
          <div className="space-y-2">
            <Label
              htmlFor="referral_code"
              className="text-sm font-medium text-gray-700"
            >
              Código de Referência{" "}
              {referralCodeFromUrl && (
                <span className="text-xs text-green-600">
                  (Preenchido automaticamente)
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                id="referral_code"
                type="text"
                placeholder={
                  referralCodeFromUrl
                    ? ""
                    : "Digite o código de quem te indicou (opcional)"
                }
                {...register("referral_code", {
                  onChange: (e) => {
                    // Converter para maiúsculas e remover espaços
                    const value = e.target.value.toUpperCase().trim();
                    e.target.value = value;
                  },
                })}
                disabled={!!referralCodeFromUrl}
                className={cn(
                  "transition-colors pr-10 uppercase",
                  referralCodeFromUrl
                    ? "bg-green-50 border-green-300 text-green-800 cursor-not-allowed"
                    : "",
                  referralCodeValid === true ? "border-green-500" : "",
                  referralCodeValid === false ? "border-red-500" : "",
                )}
              />
              {isValidatingReferralCode && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <RefreshCw size={16} className="animate-spin text-blue-500" />
                </div>
              )}
            </div>

            {referralCodeValid === true && referrerName && (
              <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                ✓ Você será indicado por {referrerName}
              </p>
            )}

            {referralCodeValid === false && watchedValues.referral_code && (
              <p className="text-sm text-red-500 font-medium">
                ✗ Código de referência inválido
              </p>
            )}

            {!watchedValues.referral_code && !referralCodeFromUrl && (
              <p className="text-xs text-gray-500">
                Se alguém te indicou para o ConfiLar, digite o código dela aqui
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CAPTCHA de Segurança */}
      <SimpleCaptcha onValidate={handleCaptchaValidate} />

      {/* Botão de cadastro */}
      <div className="pt-4">
        <LoadingButton
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          disabled={
            !isMounted ||
            isLoading ||
            !isValid ||
            !isCaptchaValid ||
            isBlocked ||
            watchedValues.password !== watchedValues.confirmPassword ||
            emailExists ||
            cpfExists
          }
          isLoading={isLoading}
          loadingText="Criando conta..."
        >
          {!isMounted
            ? "Criar conta"
            : isBlocked
              ? "Aguarde para tentar novamente"
              : !isCaptchaValid
                ? "Complete a verificação de segurança"
                : emailExists || cpfExists
                  ? "Resolva o problema acima"
                  : "Criar conta"}
        </LoadingButton>

        {/* Mensagem explicativa quando há duplicatas */}
        {emailExists && (
          <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-orange-800 font-medium mb-2">
                ⚠️ Não é possível criar a conta com este email
              </p>
              <p className="text-xs text-orange-700 mb-3">
                Você já possui uma conta na plataforma. Use as opções acima
                para:
              </p>
              <div className="flex justify-center gap-4 text-xs">
                <a
                  href="/recuperar-senha"
                  className="text-orange-600 hover:text-orange-700 underline font-medium"
                >
                  🔑 Recuperar senha
                </a>
                <a
                  href="/auth"
                  className="text-orange-600 hover:text-orange-700 underline font-medium"
                >
                  🔐 Fazer login
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-gray-600 pt-2">
        <p>
          Já tem uma conta?{" "}
          <a
            href="/auth"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            Faça login
          </a>
        </p>
      </div>
    </form>
  );
}
