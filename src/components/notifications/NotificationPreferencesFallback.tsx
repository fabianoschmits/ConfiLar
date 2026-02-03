"use client";

import React, { useState } from "react";
import { Settings, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  message_notifications: boolean;
  review_notifications: boolean;
  booking_notifications: boolean;
  achievement_notifications: boolean;
  marketing_notifications: boolean;
}

interface NotificationPreferencesFallbackProps {
  onBack: () => void;
}

export const NotificationPreferencesFallback: React.FC<
  NotificationPreferencesFallbackProps
> = ({ onBack }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push_enabled: true,
    email_enabled: true,
    message_notifications: true,
    review_notifications: true,
    booking_notifications: true,
    achievement_notifications: true,
    marketing_notifications: false,
  });
  const [saving, setSaving] = useState(false);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      // Salvar no localStorage como fallback
      localStorage.setItem(
        "notification_preferences",
        JSON.stringify(preferences),
      );
      toast.success("Configurações salvas localmente!");
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-96">
      {/* Header das Configurações */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft size={16} />
          </Button>
          <Settings size={16} />
          <span className="text-sm font-medium">Configurações</span>
        </div>
        <Button
          size="sm"
          onClick={savePreferences}
          disabled={saving}
          className="h-8 text-xs"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
          ) : (
            <Save size={12} className="mr-1" />
          )}
          Salvar
        </Button>
      </div>

      {/* Aviso sobre tabela não encontrada */}
      <div className="p-3 bg-yellow-50 border-b border-yellow-200">
        <div className="text-xs text-yellow-800">
          <strong>⚠️ Aviso:</strong> A tabela de preferências não foi
          encontrada. As configurações serão salvas localmente até que a tabela
          seja criada.
        </div>
      </div>

      {/* Conteúdo das Configurações */}
      <div className="p-3 space-y-4 max-h-80 overflow-y-auto">
        {/* Canais de Notificação */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Canais de Notificação
          </h4>

          <div className="flex items-center justify-between">
            <Label htmlFor="push_enabled" className="text-sm">
              Notificações Push
            </Label>
            <Switch
              id="push_enabled"
              checked={preferences.push_enabled}
              onCheckedChange={() => handleToggle("push_enabled")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="email_enabled" className="text-sm">
              Notificações por Email
            </Label>
            <Switch
              id="email_enabled"
              checked={preferences.email_enabled}
              onCheckedChange={() => handleToggle("email_enabled")}
            />
          </div>
        </div>

        <Separator />

        {/* Tipos de Notificação */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Tipos de Notificação
          </h4>

          <div className="flex items-center justify-between">
            <Label htmlFor="message_notifications" className="text-sm">
              Mensagens
            </Label>
            <Switch
              id="message_notifications"
              checked={preferences.message_notifications}
              onCheckedChange={() => handleToggle("message_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="review_notifications" className="text-sm">
              Avaliações
            </Label>
            <Switch
              id="review_notifications"
              checked={preferences.review_notifications}
              onCheckedChange={() => handleToggle("review_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="booking_notifications" className="text-sm">
              Agendamentos
            </Label>
            <Switch
              id="booking_notifications"
              checked={preferences.booking_notifications}
              onCheckedChange={() => handleToggle("booking_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="achievement_notifications" className="text-sm">
              Conquistas
            </Label>
            <Switch
              id="achievement_notifications"
              checked={preferences.achievement_notifications}
              onCheckedChange={() => handleToggle("achievement_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="marketing_notifications" className="text-sm">
              Marketing
            </Label>
            <Switch
              id="marketing_notifications"
              checked={preferences.marketing_notifications}
              onCheckedChange={() => handleToggle("marketing_notifications")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
