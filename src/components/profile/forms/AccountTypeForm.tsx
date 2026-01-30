"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Save, User, Briefcase } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const accountTypeSchema = z.object({
  user_type: z.enum(["client", "professional"]),
});

type AccountTypeFormData = z.infer<typeof accountTypeSchema>;

interface AccountTypeFormProps {
  onSuccess?: () => void;
}

export function AccountTypeForm({ onSuccess }: AccountTypeFormProps) {
  const { user, updateProfile, refreshAuth } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
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
              block: "center",
            });
          }
        }, 300);
      }
    };
    wrapper.addEventListener("focusin", handleFocusIn);
    return () => wrapper.removeEventListener("focusin", handleFocusIn);
  }, []);

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountTypeFormData>({
    resolver: zodResolver(accountTypeSchema),
    defaultValues: {
      user_type: "client",
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();

      if (profile) {
        setValue("user_type", profile.user_type as "client" | "professional");
      }
    };
    loadProfileData();
  }, [user, setValue]);

  const onSubmit = async (data: AccountTypeFormData) => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ user_type: data.user_type })
        .eq("id", user.id);

      if (profileError) throw profileError;

      await supabase.auth.updateUser({
        data: { user_type: data.user_type },
      });

      await updateProfile({ user_type: data.user_type });
      await refreshAuth();

      toast.success("🎉 Tipo de conta atualizado!");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erro ao atualizar tipo de conta:", error);
      toast.error("Erro ao atualizar", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={wrapperRef}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Label className="text-sm font-medium">
            Como você usará o ConfiLar?
          </Label>
          <Select
            value={watchedValues.user_type}
            onValueChange={(v) => setValue("user_type", v as any)}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">
                🙋‍♂️ Cliente - Procuro profissionais
              </SelectItem>
              <SelectItem value="professional">
                👨‍💼 Profissional - Ofereço serviços
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div
              className={cn(
                "p-4 rounded-xl border-2 transition-all",
                watchedValues.user_type === "client"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-100 bg-gray-50",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-bold">Cliente</span>
              </div>
              <p className="text-xs text-gray-600">
                Ideal para quem busca contratar serviços residenciais com
                segurança.
              </p>
            </div>
            <div
              className={cn(
                "p-4 rounded-xl border-2 transition-all",
                watchedValues.user_type === "professional"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-100 bg-gray-50",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-orange-600" />
                <span className="font-bold">Profissional</span>
              </div>
              <p className="text-xs text-gray-600">
                Ideal para ganhar dinheiro oferecendo seus serviços na
                plataforma.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
          >
            <Save className="w-4 h-4 mr-2" /> Confirmar Mudança
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
