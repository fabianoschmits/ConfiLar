"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  BellOff,
  Smartphone,
  Mail,
  Save,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";

interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  message_notifications: boolean;
  review_notifications: boolean;
  booking_notifications: boolean;
  achievement_notifications: boolean;
  marketing_notifications: boolean;
}

interface NotificationSettingsInlineProps {
  onBack: () => void;
}

export const NotificationSettingsInline: React.FC<
  NotificationSettingsInlineProps
> = ({ onBack }) => {
  const { user } = useAuthContext();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push_enabled: true,
    email_enabled: true,
    message_notifications: true,
    review_notifications: true,
    booking_notifications: true,
    achievement_notifications: true,
    marketing_notifications: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar preferências do usuário
  const loadPreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar preferências:", error);
        return;
      }

      if (data) {
        setPreferences({
          push_enabled: data.push_enabled ?? true,
          email_enabled: data.email_enabled ?? true,
          message_notifications: data.message_notifications ?? true,
          review_notifications: data.review_notifications ?? true,
          booking_notifications: data.booking_notifications ?? true,
          achievement_notifications: data.achievement_notifications ?? true,
          marketing_notifications: data.marketing_notifications ?? false,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar preferências:", error);
    } finally {
      setLoading(false);
    }
  };

  // Salvar preferências
  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("notification_preferences").upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Erro ao salvar preferências:", error);
        toast.error("Erro ao salvar configurações");
        return;
      }

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  // Carregar preferências ao montar o componente
  useEffect(() => {
    loadPreferences();
  }, [user]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">
          Carregando configurações...
        </p>
      </div>
    );
  }

  return (
    <div className="w-80">
      {/* Header */}
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

      {/* Conteúdo */}
      <div className="p-3 space-y-4 max-h-80 overflow-y-auto">
        {/* Canais de Notificação */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Canais de Notificação
          </h4>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone size={14} className="text-gray-500" />
              <Label htmlFor="push_enabled" className="text-sm">
                Notificações Push
              </Label>
            </div>
            <Switch
              id="push_enabled"
              checked={preferences.push_enabled}
              onCheckedChange={() => handleToggle("push_enabled")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-gray-500" />
              <Label htmlFor="email_enabled" className="text-sm">
                Notificações por Email
              </Label>
            </div>
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
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-blue-500" />
              <Label htmlFor="message_notifications" className="text-sm">
                Mensagens
              </Label>
            </div>
            <Switch
              id="message_notifications"
              checked={preferences.message_notifications}
              onCheckedChange={() => handleToggle("message_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-yellow-500" />
              <Label htmlFor="review_notifications" className="text-sm">
                Avaliações
              </Label>
            </div>
            <Switch
              id="review_notifications"
              checked={preferences.review_notifications}
              onCheckedChange={() => handleToggle("review_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-green-500" />
              <Label htmlFor="booking_notifications" className="text-sm">
                Agendamentos
              </Label>
            </div>
            <Switch
              id="booking_notifications"
              checked={preferences.booking_notifications}
              onCheckedChange={() => handleToggle("booking_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-orange-500" />
              <Label htmlFor="achievement_notifications" className="text-sm">
                Conquistas
              </Label>
            </div>
            <Switch
              id="achievement_notifications"
              checked={preferences.achievement_notifications}
              onCheckedChange={() => handleToggle("achievement_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-purple-500" />
              <Label htmlFor="marketing_notifications" className="text-sm">
                Marketing
              </Label>
            </div>
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
