"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  Users,
  UserCheck,
  Globe,
  Lock,
  Save,
  Loader2,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ExtendedProfile } from "@/types/privacy";
import { toast } from "sonner";

interface ProfileVisibilitySettings {
  // Apenas configurações que realmente existem no sistema
  isAvailable: boolean;
}

export function ProfileVisibilitySettings() {
  const { user, profile, refreshAuth } = useAuthContext();
  const extendedProfile = profile as ExtendedProfile;
  const [settings, setSettings] = useState<ProfileVisibilitySettings>({
    isAvailable: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      // Carregar configurações do perfil (apenas campos que existem)
      setSettings({
        isAvailable: profile.is_available ?? true,
      });
    }
  }, [profile]);

  const handleSettingChange = (
    key: keyof ProfileVisibilitySettings,
    value: boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    if (!user || !profile) {
      toast.error("Usuário não encontrado");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_available: settings.isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      toast.success("Configurações de disponibilidade salvas com sucesso!");
      await refreshAuth(); // Atualizar dados do usuário
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const visibilityOptions = [
    {
      key: "isAvailable" as keyof ProfileVisibilitySettings,
      title: "Disponibilidade",
      description:
        "Mostrar que você está disponível para receber propostas de trabalho",
      icon: <UserCheck className="h-4 w-4" />,
      impact: "Médio",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          Visibilidade do Perfil
        </CardTitle>
        <p className="text-sm text-gray-600">
          Controle quem pode ver suas informações pessoais
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configurações */}
        <div className="space-y-4">
          {visibilityOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="text-[var(--cl-teal)]">{option.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-900">{option.title}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge
                  variant={
                    option.impact === "Alto"
                      ? "destructive"
                      : option.impact === "Médio"
                        ? "default"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {option.impact}
                </Badge>
                <Switch
                  checked={settings[option.key]}
                  onCheckedChange={(value) =>
                    handleSettingChange(option.key, value)
                  }
                  disabled={isSaving}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Resumo de Impacto */}
        <div className="bg-[var(--cl-mist)] p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">
            Resumo de Impacto:
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-red-600 font-semibold">
                {
                  visibilityOptions.filter(
                    (opt) => opt.impact === "Alto" && settings[opt.key],
                  ).length
                }
              </div>
              <div className="text-gray-600">Alto Risco</div>
            </div>
            <div className="text-center">
              <div className="text-orange-600 font-semibold">
                {
                  visibilityOptions.filter(
                    (opt) => opt.impact === "Médio" && settings[opt.key],
                  ).length
                }
              </div>
              <div className="text-gray-600">Médio Risco</div>
            </div>
            <div className="text-center">
              <div className="text-green-600 font-semibold">
                {
                  visibilityOptions.filter(
                    (opt) => opt.impact === "Baixo" && settings[opt.key],
                  ).length
                }
              </div>
              <div className="text-gray-600">Baixo Risco</div>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-[var(--cl-cta)] hover:brightness-110"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>

        {/* Aviso de Segurança */}
        <div className="bg-amber-50 p-4 rounded-lg">
          <h4 className="font-semibold text-amber-800 mb-2">
            ⚠️ Aviso de Segurança
          </h4>
          <p className="text-amber-700 text-sm">
            Informações com "Alto Risco" podem ser usadas para contato direto.
            Recomendamos manter apenas as informações essenciais visíveis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
