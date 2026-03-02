"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Phone,
  Save,
  Mail,
  CheckCircle2,
  Calendar,
  FileText,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ChangeEmailForm } from "@/components/forms/ChangeEmailForm";
import { ValidationUtils } from "@/lib/validation";
import { Badge } from "@/components/ui/badge";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";

const accountDataSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
  cpf_cnpj: z
    .string()
    .min(11, "CPF/CNPJ deve ter pelo menos 11 dígitos")
    .refine((value) => {
      const cleanValue = value.replace(/\D/g, "");
      if (cleanValue.length === 11) return ValidationUtils.isValidCPF(value);
      if (cleanValue.length === 14) return true;
      return false;
    }, "CPF/CNPJ inválido"),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  bio: z.string().optional(),
  escolaridade: z
    .enum([
      "ensino_fundamental_incompleto",
      "ensino_fundamental_completo",
      "ensino_medio_incompleto",
      "ensino_medio_completo",
      "ensino_superior_incompleto",
      "ensino_superior_completo",
      "pos_graduacao",
      "mestrado",
      "doutorado",
    ])
    .optional(),
  filhos: z.number().min(0).max(20).default(0).optional(),
  estado_civil: z
    .enum([
      "solteiro",
      "casado",
      "divorciado",
      "viuvo",
      "uniao_estavel",
      "outro",
    ])
    .optional(),
});

type AccountDataFormData = z.infer<typeof accountDataSchema>;

export function AccountDataForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user, refreshAuth } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const handleFocusIn = () => {
      if (window.innerWidth < 768) {
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (
            activeElement &&
            (activeElement.tagName === "INPUT" ||
              activeElement.tagName === "TEXTAREA" ||
              activeElement.tagName === "SELECT" ||
              activeElement.getAttribute("role") === "combobox")
          ) {
            activeElement.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }, 300);
      }
    };
    wrapper.addEventListener("focusin", handleFocusIn);
    return () => wrapper.removeEventListener("focusin", handleFocusIn);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccountDataFormData>({
    resolver: zodResolver(accountDataSchema),
    defaultValues: { filhos: 0 },
  });

  const watchedValues = watch();

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) {
        setValue("full_name", profile.full_name || "");
        setValue("phone", ValidationUtils.formatPhone(profile.phone || ""));
        setValue("cpf_cnpj", ValidationUtils.formatCPF(profile.cpf_cnpj || ""));
        setValue("birth_date", profile.birth_date || "");
        setValue("bio", profile.bio || "");
        setValue("escolaridade", (profile.escolaridade as any) || undefined);
        setValue("filhos", profile.filhos || 0);
        setValue("estado_civil", (profile.estado_civil as any) || undefined);
      }
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setEmailVerified(authUser?.email_confirmed_at !== null);
    };
    loadProfileData();
  }, [user, setValue]);

  const { updateProfile, isUpdating: isProfileUpdating } = useProfileUpdate();

  const onSubmit = async (data: AccountDataFormData) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { success } = await updateProfile({
        full_name: data.full_name,
        phone: data.phone,
        cpf_cnpj: data.cpf_cnpj,
        birth_date: data.birth_date,
        bio: data.bio || null,
        escolaridade: data.escolaridade || null,
        filhos: data.filhos || 0,
        estado_civil: data.estado_civil || null,
      });

      if (success) {
        toast.success("🎉 Dados atualizados!");
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("Erro ao atualizar dados da conta:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={wrapperRef}>
      <form
        id="account-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Email Section */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">Email da conta</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowEmailForm(!showEmailForm)}
            >
              {showEmailForm ? "Cancelar" : "Alterar"}
            </Button>
          </div>
          {showEmailForm && (
            <div className="mt-4">
              <ChangeEmailForm
                currentEmail={user?.email || ""}
                onSuccess={() => {
                  setShowEmailForm(false);
                  setEmailVerified(true);
                }}
                onCancel={() => setShowEmailForm(false)}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input
              {...register("full_name")}
              placeholder="Seu nome"
              onBlur={(e) => {
                const hookFormOnBlur = register("full_name").onBlur;
                if (hookFormOnBlur) hookFormOnBlur(e);

                const formatted = ValidationUtils.formatFullName(
                  e.target.value,
                );
                setValue("full_name", formatted, {
                  shouldValidate: true,
                });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              {...register("phone")}
              placeholder="(00) 00000-0000"
              onChange={(e) => {
                const formatted = ValidationUtils.formatPhone(e.target.value);
                setValue("phone", formatted);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>CPF</Label>
            <Input
              {...register("cpf_cnpj")}
              placeholder="000.000.000-00"
              readOnly
              className="bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed opacity-80"
              title="O CPF não pode ser alterado após o cadastro"
            />
            <p className="text-[10px] text-gray-400">
              Campo não editável por segurança
            </p>
          </div>
          <div className="space-y-2">
            <Label>Data de Nascimento</Label>
            <Input type="date" {...register("birth_date")} />
          </div>
          <div className="space-y-2">
            <Label>Escolaridade</Label>
            <Select
              value={watchedValues.escolaridade || ""}
              onValueChange={(v) => setValue("escolaridade", v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ensino_fundamental_incompleto">
                  Ensino Fundamental Incompleto
                </SelectItem>
                <SelectItem value="ensino_fundamental_completo">
                  Ensino Fundamental Completo
                </SelectItem>
                <SelectItem value="ensino_medio_incompleto">
                  Ensino Médio Incompleto
                </SelectItem>
                <SelectItem value="ensino_medio_completo">
                  Ensino Médio Completo
                </SelectItem>
                <SelectItem value="ensino_superior_incompleto">
                  Ensino Superior Incompleto
                </SelectItem>
                <SelectItem value="ensino_superior_completo">
                  Ensino Superior Completo
                </SelectItem>
                <SelectItem value="pos_graduacao">Pós-Graduação</SelectItem>
                <SelectItem value="mestrado">Mestrado</SelectItem>
                <SelectItem value="doutorado">Doutorado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Estado Civil</Label>
            <Select
              value={watchedValues.estado_civil || ""}
              onValueChange={(v) => setValue("estado_civil", v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                <SelectItem value="casado">Casado(a)</SelectItem>
                <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                <SelectItem value="uniao_estavel">União Estável</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Filhos</Label>
            <Input
              type="number"
              min={0}
              max={20}
              {...register("filhos", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Biografia</Label>
          <Textarea
            {...register("bio")}
            placeholder="Conte sobre você..."
            rows={3}
            className="resize-none"
          />
        </div>

        <div className="flex justify-end pt-4">
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" /> Salvar Alterações
          </LoadingButton>
        </div>
        {/* Espaçador extra para evitar que o teclado cubra os campos finais no mobile */}
        <div className="h-40 sm:h-0" />
      </form>
    </div>
  );
}
