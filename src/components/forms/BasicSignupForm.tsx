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
import { RefreshCw } from "lucide-react";
import { createReferral } from "@/hooks/useReferralTracking";
import {
  checkEmailExists,
  checkCpfExists,
  checkPhoneExists,
} from "@/lib/checkDuplicates";
import { isValidCPF } from "@/lib/validation";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

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
    phone: z
      .string()
      .min(10, "Telefone inválido")
      .refine((val) => {
        const cleaned = val.replace(/[^\d]+/g, "");
        return cleaned.length >= 10 && cleaned.length <= 11;
      }, "Telefone deve ter 10 ou 11 dígitos"),
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
  const [phoneExists, setPhoneExists] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
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
  const { executeRecaptcha } = useGoogleReCaptcha();

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

  // Função para verificar telefone em tempo real
  const checkPhoneInRealTime = async (phone: string) => {
    const cleaned = phone.replace(/[^\d]+/g, "");
    if (!cleaned || cleaned.length < 10) {
      setPhoneExists(false);
      return;
    }

    setIsCheckingPhone(true);
    try {
      const exists = await checkPhoneExists(phone);
      setPhoneExists(exists);
    } catch (error) {
      console.error("Erro ao verificar telefone:", error);
      setPhoneExists(false);
    } finally {
      setIsCheckingPhone(false);
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

  // Debounce para verificação de Telefone
  useEffect(() => {
    const phone = watchedValues.phone;
    const cleaned = phone?.replace(/[^\d]+/g, "");

    if (!cleaned || cleaned.length < 10) {
      setPhoneExists(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkPhoneInRealTime(phone);
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [watchedValues.phone]);

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
    console.log("📝 [SignupForm] Iniciando submissão do formulário...");

    if (!executeRecaptcha) {
      console.error("❌ [SignupForm] executeRecaptcha não está definido!");
      toast.error("Erro de segurança", {
        description:
          "Verificação de segurança não disponível. Recarregue a página.",
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // ✅ VALIDAR reCAPTCHA v3
      console.log("🔐 [SignupForm] Solicitando token reCAPTCHA...");
      const token = await executeRecaptcha("signup");
      console.log("✅ [SignupForm] Token gerado com sucesso");

      console.log("📡 [SignupForm] Validando token no servidor...");
      const recaptchaRes = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!recaptchaRes.ok) {
        const recaptchaData = await recaptchaRes.json();
        console.error(
          "❌ [SignupForm] Falha na validação do reCAPTCHA:",
          recaptchaData,
        );
        toast.error("Verificação de segurança falhou", {
          description: recaptchaData.message || "Por favor, tente novamente.",
        });
        setIsLoading(false);
        return;
      }

      console.log("✅ [SignupForm] reCAPTCHA validado com sucesso");

      // ✅ VALIDAR DUPLICATAS ANTES DE CADASTRAR
      console.log("🔍 [SignupForm] Verificando duplicatas...");

      // Verificar email
      if (emailExists) {
        console.warn("⚠️ [SignupForm] Email já cadastrado (estado local)");
        toast.error(
          "❌ Este email já está cadastrado. Use o link de recuperação de conta.",
        );
        setIsLoading(false);
        return;
      }

      const emailCheck = await checkEmailExists(data.email);
      if (emailCheck) {
        console.warn("⚠️ [SignupForm] Email já cadastrado (verificação API)");
        toast.error("❌ Este email já está cadastrado na plataforma");
        setIsLoading(false);
        return;
      }

      console.log("✅ [SignupForm] Email disponível");

      // Verificar CPF
      if (cpfExists) {
        console.warn("⚠️ [SignupForm] CPF já cadastrado (estado local)");
        toast.error(
          "❌ Este CPF já está cadastrado. Use o link de recuperação de conta.",
        );
        setIsLoading(false);
        return;
      }

      const cpfCheck = await checkCpfExists(data.cpf_cnpj);
      if (cpfCheck) {
        console.warn("⚠️ [SignupForm] CPF já cadastrado (verificação API)");
        toast.error("❌ Este CPF já está cadastrado na plataforma");
        setIsLoading(false);
        return;
      }

      console.log("✅ [SignupForm] CPF disponível");

      // Verificar Telefone
      if (phoneExists) {
        console.warn("⚠️ [SignupForm] Telefone já cadastrado (estado local)");
        toast.error("❌ Este telefone já está cadastrado na plataforma");
        setIsLoading(false);
        return;
      }

      const phoneCheck = await checkPhoneExists(data.phone);
      if (phoneCheck) {
        console.warn(
          "⚠️ [SignupForm] Telefone já cadastrado (verificação API)",
        );
        toast.error("❌ Este telefone já está cadastrado na plataforma");
        setIsLoading(false);
        return;
      }

      console.log("✅ [SignupForm] Telefone disponível");

      // ✅ SALVAR CÓDIGO DE REFERÊNCIA NO LOCALSTORAGE (sempre que houver código)
      if (data.referral_code) {
        console.log(
          "💾 [SignupForm] Salvando código de referência no localStorage:",
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
      }

      console.log("🚀 [SignupForm] Criando conta no Supabase...");
      const { error, data: signUpData } = await signUpBasic({
        email: data.email,
        password: data.password,
        cpf_cnpj: data.cpf_cnpj.replace(/\D/g, ""),
        phone: data.phone.replace(/\D/g, ""),
      });

      if (error) {
        console.error("❌ [SignupForm] Erro detalhado Supabase:", error);

        // Tratar erros específicos do Supabase
        let errorMessage = error.message;
        let errorTitle = "Erro ao criar conta";

        if (
          error.message?.toLowerCase().includes("rate limit") ||
          error.message?.toLowerCase().includes("email rate limit exceeded")
        ) {
          errorTitle = "Limite de emails excedido";
          errorMessage =
            "Muitos emails foram enviados recentemente. Por favor, aguarde algumas horas e tente novamente.";
        } else if (
          error.message?.toLowerCase().includes("user already registered")
        ) {
          errorTitle = "Email já cadastrado";
          errorMessage =
            "Este email já está cadastrado. Use a opção de recuperação de senha.";
        }

        toast.error(`${errorTitle}: ${errorMessage}`, {
          duration: 8000,
        });
        setIsLoading(false);
        return;
      }

      console.log("✅ [SignupForm] Conta criada com sucesso!");

      // ✅ CRIAR REFERRAL IMEDIATAMENTE SE HOUVER CÓDIGO
      if (data.referral_code && signUpData?.user?.id) {
        try {
          console.log("👥 [SignupForm] Criando registro de referral...");
          const referralResult = await createReferral(
            signUpData.user.id,
            "signup_form",
            data.referral_code,
          );
          console.log("✅ [SignupForm] Resultado referral:", referralResult);
        } catch (referralError) {
          console.error(
            "❌ [SignupForm] Erro ao processar referral:",
            referralError,
          );
        }
      } else if (signUpData?.user?.id) {
        // ✅ BÔNUS ORGÂNICO
        console.log("🎁 [SignupForm] Aplicando bônus orgânico...");
        fetch("/api/auth/hooks/apply-welcome-bonus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: signUpData.user.id }),
        }).catch((err) =>
          console.error("Erro silencioso ao aplicar bônus:", err),
        );
      }

      toast.success(
        "🎉 Conta criada com sucesso! Verifique sua caixa de entrada para ativar sua conta.",
      );

      setTimeout(() => {
        setIsLoading(false);
        window.location.href = "/auth?message=account_created";
      }, 3000);
    } catch (error: any) {
      console.error("💥 [SignupForm] Erro no cadastro:", error);
      toast.error("Erro inesperado ao criar conta", {
        description: error.message || "Tente novamente mais tarde.",
      });
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

          {/* Telefone */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
              Telefone *
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="text"
                placeholder="(00) 00000-0000"
                {...register("phone")}
                onChange={(e) => {
                  // Formatar Telefone enquanto digita
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 11) {
                    if (value.length > 2) {
                      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                    }
                    if (value.length > 9) {
                      value = `${value.slice(0, 9)}-${value.slice(9)}`;
                    }
                  }
                  e.target.value = value;
                  register("phone").onChange(e);
                }}
                className={cn(
                  "transition-colors pr-10",
                  errors.phone ? "border-red-500 focus:border-red-500" : "",
                  phoneExists
                    ? "border-orange-500 focus:border-orange-500"
                    : "",
                )}
              />
              {isCheckingPhone && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <RefreshCw size={16} className="animate-spin text-blue-500" />
                </div>
              )}
            </div>

            {isCheckingPhone && (
              <FormFieldFeedback
                state="validating"
                message="Verificando disponibilidade..."
              />
            )}
            {errors.phone && (
              <FormFieldFeedback state="error" message={errors.phone.message} />
            )}
            {phoneExists && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium mb-1">
                  ⚠️ Este telefone já está cadastrado
                </p>
                <p className="text-xs text-orange-700">
                  Cada conta deve possuir um telefone único.
                </p>
              </div>
            )}
            {watchedValues.phone &&
              !errors.phone &&
              !phoneExists &&
              !isCheckingPhone &&
              watchedValues.phone.replace(/\D/g, "").length >= 10 && (
                <FormFieldFeedback
                  state="valid"
                  message="Telefone disponível"
                />
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

      {/* Badge reCAPTCHA inline - acima dos termos */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-2">
        <svg
          viewBox="0 0 64 64"
          className="w-4 h-4 flex-shrink-0"
          aria-hidden="true"
        >
          <path
            d="M32 4C16.536 4 4 16.536 4 32s12.536 28 28 28 28-12.536 28-28S47.464 4 32 4z"
            fill="#4A90D9"
          />
          <path
            d="M32 12c-11.046 0-20 8.954-20 20s8.954 20 20 20 20-8.954 20-20-8.954-20-20-20z"
            fill="#fff"
          />
          <path
            d="M32 18c-7.732 0-14 6.268-14 14s6.268 14 14 14 14-6.268 14-14-6.268-14-14-14z"
            fill="#4A90D9"
          />
          <path d="M29 26l-5 6 5 5 2-2-3-3 3-4z" fill="#fff" />
          <path d="M35 26l5 6-5 5-2-2 3-3-3-4z" fill="#fff" />
        </svg>
        <span>
          Protegido pelo reCAPTCHA —{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Privacidade
          </a>
          {" · "}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Termos
          </a>
        </span>
      </div>

      {/* Botão de cadastro */}
      <div className="pt-4">
        <LoadingButton
          type="submit"
          className="w-full bg-[var(--cl-cta)] hover:brightness-110 text-[var(--cl-on-cta)] py-3"
          disabled={
            !isMounted ||
            isLoading ||
            !isValid ||
            watchedValues.password !== watchedValues.confirmPassword ||
            emailExists ||
            cpfExists ||
            phoneExists ||
            !executeRecaptcha
          }
          isLoading={isLoading}
          loadingText={
            !executeRecaptcha ? "Carregando segurança..." : "Criando conta..."
          }
        >
          {!executeRecaptcha
            ? "Carregando segurança..."
            : emailExists || cpfExists || phoneExists
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
            className="text-[var(--cl-teal)] hover:text-[var(--cl-teal)] hover:underline font-medium"
          >
            Faça login
          </a>
        </p>
      </div>
    </form>
  );
}
