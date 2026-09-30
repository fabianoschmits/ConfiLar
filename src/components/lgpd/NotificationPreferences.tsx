"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Star,
  Heart,
  Save,
  Loader2,
  Smartphone,
  Monitor,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ExtendedProfile } from "@/types/privacy";
import { toast } from "sonner";

interface NotificationPreferences {
  // Apenas configurações que realmente existem no sistema
  // Por enquanto, não temos sistema de notificações configurável
}

export function NotificationPreferences() {
  const { user, profile, refreshAuth } = useAuthContext();
  const extendedProfile = profile as ExtendedProfile;
  const [preferences, setPreferences] = useState<NotificationPreferences>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Por enquanto, não temos configurações de notificação no banco
    // Este componente será implementado quando o sistema de notificações estiver completo
  }, []);

  const handlePreferenceChange = (key: any, value: boolean) => {
    // Por enquanto, não há preferências para alterar
    console.log("Preferência alterada:", key, value);
  };

  const handleSavePreferences = async () => {
    toast.info(
      "Sistema de notificações em desenvolvimento. Em breve você poderá configurar suas preferências!",
    );
  };

  const notificationOptions = [
    {
      key: "comingSoon" as any,
      title: "Sistema de Notificações",
      description:
        "Em breve você poderá configurar suas preferências de notificação",
      icon: <Bell className="h-4 w-4" />,
      category: "Em Desenvolvimento",
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Essencial":
        return "destructive";
      case "Importante":
        return "default";
      case "Social":
        return "secondary";
      case "Marketing":
        return "outline";
      case "Sistema":
        return "secondary";
      case "Resumo":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Preferências de Notificação
        </CardTitle>
        <p className="text-sm text-gray-600">
          Gerencie como e quando você recebe notificações
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configurações por Categoria */}
        <div className="space-y-6">
          {[
            "Essencial",
            "Importante",
            "Social",
            "Marketing",
            "Sistema",
            "Resumo",
          ].map((category) => {
            const categoryOptions = notificationOptions.filter(
              (opt) => opt.category === category,
            );
            if (categoryOptions.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Badge variant={getCategoryColor(category)} className="mr-2">
                    {category}
                  </Badge>
                  {category}
                </h4>

                <div className="space-y-3">
                  {categoryOptions.map((option) => (
                    <div
                      key={option.key}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-[var(--cl-teal)]">{option.icon}</div>
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {option.title}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={false}
                        onCheckedChange={(value) =>
                          handlePreferenceChange(option.key, value)
                        }
                        disabled={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumo de Ativações */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">
            Resumo de Notificações:
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 font-semibold">
                Em Desenvolvimento
              </div>
              <div className="text-gray-500">Sistema de Notificações</div>
            </div>
            <div>
              <div className="text-gray-600 font-semibold">Em Breve</div>
              <div className="text-gray-500">Funcionalidades Futuras</div>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSavePreferences}
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
                Salvar Preferências
              </>
            )}
          </Button>
        </div>

        {/* Dica de Otimização */}
        <div className="bg-[var(--cl-mist)] p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Informação</h4>
          <p className="text-blue-700 text-sm">
            O sistema de notificações está em desenvolvimento. Em breve você
            poderá configurar suas preferências de notificação para ter controle
            total sobre o que recebe.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
