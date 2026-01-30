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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Save } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { services } from "@/data/services";
import { toast } from "sonner";

const professionalDataSchema = z.object({
  experience_years: z.string().optional(),
  services_offered: z.array(z.string()).optional(),
  referencia_profissional: z.string().optional(),
  turno_trabalho: z
    .enum(["manha", "tarde", "noite", "integral", "flexivel"])
    .optional(),
});

type ProfessionalDataFormData = z.infer<typeof professionalDataSchema>;

export function ProfessionalDataForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { user, refreshAuth } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [servicesOpen, setServicesOpen] = useState(false);
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

  const { register, watch, setValue, handleSubmit } =
    useForm<ProfessionalDataFormData>({
      resolver: zodResolver(professionalDataSchema),
    });

  const watchedValues = watch();
  const serviceCategoryNames = services.map((cat) => cat.name);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) {
        setValue(
          "experience_years",
          profile.professional_experience_years?.toString() || "",
        );
        setSelectedServices(profile.professional_services || []);
        setValue(
          "referencia_profissional",
          profile.referencia_profissional || "",
        );
        setValue(
          "turno_trabalho",
          (profile.turno_trabalho as any) || undefined,
        );
      }
    };
    loadProfileData();
  }, [user, setValue]);

  const onSubmit = async (data: ProfessionalDataFormData) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await supabase
        .from("profiles")
        .update({
          professional_experience_years: data.experience_years
            ? parseInt(data.experience_years)
            : 0,
          professional_services: selectedServices,
          referencia_profissional: data.referencia_profissional || null,
          turno_trabalho: data.turno_trabalho || null,
        })
        .eq("id", user.id);
      toast.success("🎉 Dados profissionais salvos!");
      await refreshAuth();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Erro ao salvar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={wrapperRef}>
      <form
        id="professional-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Experiência (anos)</Label>
            <Input type="number" {...register("experience_years")} />
          </div>
          <div className="space-y-2">
            <Label>Serviços</Label>
            <Popover open={servicesOpen} onOpenChange={setServicesOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-10"
                >
                  {selectedServices.length === 0
                    ? "Selecione..."
                    : `${selectedServices.length} selecionado(s)`}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Buscar..." />
                  <CommandList>
                    <CommandGroup>
                      {serviceCategoryNames.map((s) => (
                        <CommandItem
                          key={s}
                          value={s}
                          onSelect={() => {
                            const newServices = selectedServices.includes(s)
                              ? selectedServices.filter((x) => x !== s)
                              : [...selectedServices, s];
                            setSelectedServices(newServices);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedServices.includes(s)
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />{" "}
                          {s}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Bio Profissional</Label>
          <Textarea {...register("referencia_profissional")} rows={3} />
        </div>
        <div className="flex justify-end pt-4">
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" /> Salvar Profissional
          </LoadingButton>
        </div>
        {/* Espaçador extra para evitar que o teclado cubra os campos finais no mobile */}
        <div className="h-40 sm:h-0" />
      </form>
    </div>
  );
}
