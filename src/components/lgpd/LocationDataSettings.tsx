"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Navigation,
  Map,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ExtendedProfile } from "@/types/privacy";
import { toast } from "sonner";

interface LocationDataSettings {
  // Apenas configurações que realmente existem no sistema
  // Por enquanto, não temos sistema de localização configurável
}

export function LocationDataSettings() {
  const { user, profile, refreshAuth } = useAuthContext();
  const extendedProfile = profile as ExtendedProfile;
  const [settings, setSettings] = useState<LocationDataSettings>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Por enquanto, não temos configurações de localização no banco
    // Este componente será implementado quando o sistema de localização estiver completo
  }, []);

  const handleSettingChange = (key: any, value: boolean) => {
    // Por enquanto, não há configurações para alterar
    console.log("Configuração alterada:", key, value);
  };

  const handleSaveSettings = async () => {
    toast.info(
      "Sistema de localização em desenvolvimento. Em breve você poderá configurar suas preferências!",
    );
  };

  const locationOptions = [
    {
      key: "comingSoon" as any,
      title: "Sistema de Localização",
      description:
        "Em breve você poderá configurar suas preferências de localização",
      icon: <MapPin className="h-4 w-4" />,
      risk: "Em Desenvolvimento",
      impact: "Funcionalidade em desenvolvimento",
    },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Alto":
        return "destructive";
      case "Médio":
        return "default";
      case "Baixo":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Dados de Localização
        </CardTitle>
        <p className="text-sm text-gray-600">
          Controle o compartilhamento de sua localização e dados geográficos
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configurações */}
        <div className="space-y-4">
          {locationOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="text-[var(--cl-teal)]">{option.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {option.title}
                    </h4>
                    <Badge
                      variant={getRiskColor(option.risk)}
                      className="text-xs"
                    >
                      {option.risk}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {option.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    Impacto: {option.impact}
                  </p>
                </div>
              </div>
              <Switch
                checked={false}
                onCheckedChange={(value) =>
                  handleSettingChange(option.key, value)
                }
                disabled={true}
              />
            </div>
          ))}
        </div>

        {/* Resumo de Privacidade */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">
            🔒 Resumo de Privacidade:
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-red-600 font-semibold">
                {
                  locationOptions.filter(
                    (opt) => opt.risk === "Alto" && settings[opt.key],
                  ).length
                }
              </div>
              <div className="text-gray-600">Alto Risco</div>
            </div>
            <div className="text-center">
              <div className="text-orange-600 font-semibold">
                {
                  locationOptions.filter(
                    (opt) => opt.risk === "Médio" && settings[opt.key],
                  ).length
                }
              </div>
              <div className="text-gray-600">Médio Risco</div>
            </div>
            <div className="text-center">
              <div className="text-green-600 font-semibold">
                {
                  locationOptions.filter(
                    (opt) => opt.risk === "Baixo" && settings[opt.key],
                  ).length
                }
              </div>
              <div className="text-gray-600">Baixo Risco</div>
            </div>
          </div>
        </div>

        {/* Recomendações */}
        <div className="bg-[var(--cl-mist)] p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">
            💡 Recomendações de Segurança:
          </h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>
              • <strong>Localização Exata:</strong> Desative para maior
              privacidade
            </li>
            <li>
              • <strong>Rastreamento:</strong> Mantenha desativado a menos que
              necessário
            </li>
            <li>
              • <strong>Cidade/Estado:</strong> Seguro para mostrar para
              descoberta
            </li>
            <li>
              • <strong>Área de Serviço:</strong> Útil para profissionais
            </li>
          </ul>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-[var(--cl-ink)] hover:brightness-110"
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
            Configurações de "Alto Risco" podem comprometer sua privacidade.
            Recomendamos manter apenas o essencial ativado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
