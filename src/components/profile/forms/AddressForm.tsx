"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Save } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ValidationUtils } from "@/lib/validation";
import { LocationComboboxesMultiCountry } from "@/components/ui/LocationComboboxesMultiCountry";

const addressSchema = z.object({
  country: z.string(),
  location_state: z.string().min(1, "Estado é obrigatório"),
  location_city: z.string().min(1, "Cidade é obrigatória"),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  address_number: z.string().min(1, "Número é obrigatório"),
  zip_code: z.string().min(8, "CEP inválido"),
});

type AddressFormData = z.infer<typeof addressSchema>;

export function AddressForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user, refreshAuth } = useAuthContext();
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
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: "BR",
    },
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
        setValue("country", profile.country || "BR");
        setValue("location_state", profile.location_state || "");
        setValue("location_city", profile.location_city || "");
        setValue("neighborhood", profile.neighborhood || "");
        setValue("address", profile.address || "");
        setValue("address_number", profile.address_number || "");
        setValue("address_number", profile.address_number || "");
        setValue("zip_code", ValidationUtils.formatCEP(profile.zip_code || ""));
      }
    };
    loadProfileData();
  }, [user, setValue]);

  const onSubmit = async (data: AddressFormData) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await supabase
        .from("profiles")
        .update({
          country: data.country,
          location_state: data.location_state,
          location_city: data.location_city,
          neighborhood: data.neighborhood,
          address: data.address,
          address_number: data.address_number,
          zip_code: data.zip_code.replace(/\D/g, ""),
        })
        .eq("id", user.id);
      await supabase.auth.updateUser({
        data: {
          country: data.country,
          location_state: data.location_state,
          location_city: data.location_city,
          neighborhood: data.neighborhood,
          address: data.address,
          address_number: data.address_number,
          zip_code: data.zip_code.replace(/\D/g, ""),
        },
      });
      toast.success("🎉 Endereço salvo!");
      await refreshAuth();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error("Erro ao salvar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={wrapperRef}>
      <form
        id="address-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 lg:col-span-2 space-y-2">
            <Label>Localização</Label>
            <LocationComboboxesMultiCountry
              country={watchedValues.country}
              stateCode={watchedValues.location_state}
              city={watchedValues.location_city}
              modal={true}
              onCountryChange={(country) => {
                setValue("country", country);
                setValue("location_state", "");
                setValue("location_city", "");
              }}
              onStateChange={(state) => {
                setValue("location_state", state);
                setValue("location_city", "");
              }}
              onCityChange={(city) => {
                setValue("location_city", city);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Bairro</Label>
            <Input {...register("neighborhood")} />
          </div>
          <div className="space-y-2">
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input
                {...register("zip_code")}
                onChange={(e) => {
                  const formatted = ValidationUtils.formatCEP(e.target.value);
                  setValue("zip_code", formatted);
                }}
                maxLength={9}
              />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label>Endereço e Número</Label>
              <div className="flex gap-2">
                <Input {...register("address")} className="flex-1" />
                <Input {...register("address_number")} className="w-24" />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" /> Salvar Endereço
            </LoadingButton>
          </div>
          {/* Espaçador extra para evitar que o teclado cubra os campos finais no mobile */}
          <div className="h-40 sm:h-0" />
        </div>
      </form>
    </div>
  );
}
