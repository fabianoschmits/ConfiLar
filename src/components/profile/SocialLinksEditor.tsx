"use client";

import { useState } from "react";
import { CompleteProfileData } from "@/hooks/useProfileData";
import { Profile } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Music2,
  MessageCircle,
  Save,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface SocialLinksEditorProps {
  profile: Profile | CompleteProfileData;
  onUpdate?: (updatedProfile: Record<string, string | null>) => void;
}

const socialFields = [
  {
    key: "instagram_url" as keyof CompleteProfileData,
    icon: Instagram,
    label: "Instagram",
    placeholder: "@seu_usuario",
    baseUrl: "https://instagram.com/",
    pattern: "^@?[a-zA-Z0-9._]+$",
  },
  {
    key: "facebook_url" as keyof CompleteProfileData,
    icon: Facebook,
    label: "Facebook",
    placeholder: "seu_perfil",
    baseUrl: "https://facebook.com/",
    pattern: "^[a-zA-Z0-9.]+$",
  },
  {
    key: "linkedin_url" as keyof CompleteProfileData,
    icon: Linkedin,
    label: "LinkedIn",
    placeholder: "seu_perfil",
    baseUrl: "https://linkedin.com/in/",
    pattern: "^[a-zA-Z0-9-]+$",
  },
  {
    key: "twitter_url" as keyof CompleteProfileData,
    icon: Twitter,
    label: "Twitter/X",
    placeholder: "@seu_usuario",
    baseUrl: "https://x.com/",
    pattern: "^@?[a-zA-Z0-9_]+$",
  },
  {
    key: "youtube_url" as keyof CompleteProfileData,
    icon: Youtube,
    label: "YouTube",
    placeholder: "@seu_canal",
    baseUrl: "https://youtube.com/@",
    pattern: "^@?[a-zA-Z0-9._-]+$",
  },
  {
    key: "tiktok_url" as keyof CompleteProfileData,
    icon: Music2,
    label: "TikTok",
    placeholder: "@seu_usuario",
    baseUrl: "https://tiktok.com/@",
    pattern: "^@?[a-zA-Z0-9._-]+$",
  },
];

export function SocialLinksEditor({
  profile,
  onUpdate,
}: SocialLinksEditorProps) {
  const [formData, setFormData] = useState({
    instagram_url: profile.instagram_url || "",
    facebook_url: profile.facebook_url || "",
    linkedin_url: profile.linkedin_url || "",
    twitter_url: profile.twitter_url || "",
    youtube_url: profile.youtube_url || "",
    tiktok_url: profile.tiktok_url || "",
    whatsapp_number: profile.whatsapp_number || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const extractHandle = (value: string, baseUrl: string): string => {
    if (!value) return "";
    let cleanValue = value.trim();

    // Se for uma URL completa, tentar extrair o username
    if (cleanValue.includes("http")) {
      try {
        const url = new URL(cleanValue);
        const path = url.pathname.split("/").filter(Boolean);

        if (cleanValue.includes("linkedin.com/in/")) {
          return path[path.indexOf("in") + 1] || path[path.length - 1] || "";
        }

        // Para a maioria das redes, o username é o último segmento do path
        let handle = path[path.length - 1] || "";
        // Remover o @ se existir para padronizar (vamos adicionar se necessário no display)
        if (handle.startsWith("@")) handle = handle.substring(1);
        return handle;
      } catch (e) {
        return cleanValue;
      }
    }

    // Remover @ inicial se o usuário digitou
    if (cleanValue.startsWith("@")) {
      return cleanValue.substring(1);
    }

    return cleanValue;
  };

  const handleChange = (field: string, value: string, baseUrl?: string) => {
    let finalValue = value;
    if (baseUrl && value.includes("http")) {
      finalValue = extractHandle(value, baseUrl);
    } else if (baseUrl && value.startsWith("@")) {
      finalValue = value.substring(1);
    }

    setFormData((prev) => ({ ...prev, [field]: finalValue }));
    // Limpar erro ao digitar
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    // Validar URLs
    const newErrors: Record<string, string> = {};

    socialFields.forEach((field) => {
      const value = formData[field.key as keyof typeof formData] as string;
      if (value && !new RegExp(field.pattern).test(value)) {
        newErrors[field.key] = `Formato inválido para ${field.label}`;
      }
    });

    // Validar WhatsApp (deve conter apenas números, +, -, espaços e parênteses)
    if (
      formData.whatsapp_number &&
      !/^[\d\s\-\+\(\)]+$/.test(formData.whatsapp_number)
    ) {
      newErrors.whatsapp_number =
        "Número de WhatsApp inválido (use apenas números e caracteres +, -, (), espaço)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Por favor, corrija os erros antes de salvar");
      return;
    }

    setSaving(true);

    try {
      // Preparar dados para atualização (converter strings vazias em null)
      const updateData: Record<string, string | null> = {};
      Object.entries(formData).forEach(([key, value]) => {
        updateData[key] = value.trim() === "" ? null : value;
      });

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id);

      if (error) throw error;

      toast.success("Redes sociais atualizadas com sucesso!");
      onUpdate?.(updateData);
    } catch (error) {
      console.error("Erro ao salvar redes sociais:", error);
      toast.error("Erro ao salvar redes sociais");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Adicione links para suas redes sociais. Eles aparecerão no seu perfil
        público.
      </div>

      <div className="space-y-4">
        {socialFields.map((field) => {
          const Icon = field.icon;
          const value = formData[field.key] as string;

          return (
            <div key={field.key} className="space-y-2">
              <Label
                htmlFor={field.key}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Icon className="w-4 h-4" />
                {field.label}
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    @
                  </span>
                  <Input
                    id={field.key}
                    value={value || ""}
                    onChange={(e) =>
                      handleChange(field.key, e.target.value, field.baseUrl)
                    }
                    placeholder={field.placeholder.replace("@", "")}
                    className={`pl-8 ${errors[field.key] ? "border-red-500" : ""}`}
                  />
                </div>
                {value && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    asChild
                    disabled={!!errors[field.key]}
                  >
                    <a
                      href={`${field.baseUrl}${value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Visualizar"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
              {errors[field.key] && (
                <p className="text-sm text-red-500">{errors[field.key]}</p>
              )}
            </div>
          );
        })}

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label
            htmlFor="whatsapp_number"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Label>
          <Input
            id="whatsapp_number"
            type="tel"
            value={formData.whatsapp_number}
            onChange={(e) => handleChange("whatsapp_number", e.target.value)}
            placeholder="+55 11 98765-4321"
            className={errors.whatsapp_number ? "border-red-500" : ""}
          />
          {errors.whatsapp_number && (
            <p className="text-sm text-red-500">{errors.whatsapp_number}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Formato internacional recomendado: +55 11 98765-4321
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-[#00b0b0] to-cyan-600 hover:from-[#00a0a0] hover:to-cyan-700"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Redes Sociais
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
