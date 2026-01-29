"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  BellOff,
  Settings,
  Clock,
  Zap,
  Mail,
  Phone,
  MapPin,
  Shield,
  X,
  AlertCircle,
  MessageCircle,
  Star,
  Calendar,
  Trophy,
  CheckCircle,
  Filter,
} from "lucide-react";
import { useAuth } from "@/hooks/useUnifiedAuth";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { toast } from "sonner";

interface NotificationSettingsOnlyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tipos de notificação disponíveis
const NOTIFICATION_TYPES = [
  {
    value: "message",
    label: "Mensagem de Chat",
    icon: MessageCircle,
    color: "bg-blue-500",
  },
  { value: "review", label: "Avaliação", icon: Star, color: "bg-yellow-500" },
  {
    value: "booking",
    label: "Agendamento",
    icon: Calendar,
    color: "bg-green-500",
  },
  { value: "system", label: "Sistema", icon: Settings, color: "bg-gray-500" },
  {
    value: "achievement",
    label: "Conquista",
    icon: Trophy,
    color: "bg-purple-500",
  },
  {
    value: "verification",
    label: "Verificação",
    icon: Shield,
    color: "bg-indigo-500",
  },
  {
    value: "success",
    label: "Sucesso",
    icon: CheckCircle,
    color: "bg-emerald-500",
  },
  {
    value: "warning",
    label: "Aviso",
    icon: AlertCircle,
    color: "bg-orange-500",
  },
  { value: "error", label: "Erro", icon: AlertCircle, color: "bg-red-500" },
];

// Prioridades disponíveis
const PRIORITY_LEVELS = [
  { value: "low", label: "Baixa", color: "bg-gray-100 text-gray-800" },
  { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-800" },
  { value: "high", label: "Alta", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgente", color: "bg-red-100 text-red-800" },
];

export function NotificationSettingsOnlyModal({
  isOpen,
  onClose,
}: NotificationSettingsOnlyModalProps) {
  const { user } = useAuth();
  const {
    isSupported,
    isGranted,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [settings, setSettings] = useState({
    // Tipos de notificação
    message: true,
    review: true,
    booking: false,
    system: true,
    achievement: true,
    verification: false,
    success: true,
    warning: true,
    error: true,

    // Frequência
    frequency: "immediate",
    startTime: "08:00",
    endTime: "22:00",
    quietHours: true,

    // Prioridades
    low: false,
    normal: true,
    high: true,
    urgent: true,

    // Som e vibração
    sound: true,
    vibration: true,
    desktop: true,
    soundType: "default",

    // Email
    emailNotifications: true,
    emailDigest: true,
    emailFrequency: "daily",

    // SMS
    smsNotifications: false,
    phoneNumber: "",

    // Localização
    locationNotifications: false,
    locationRadius: "10",

    // Privacidade
    showContent: true,
    showSender: true,
    groupNotifications: true,

    // Avançadas
    maxNotifications: "50",
    autoDelete: "7",
    markReadAuto: true,
    syncDevices: true,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    // Aqui você pode salvar as configurações no banco de dados
    toast.success("Configurações salvas com sucesso!");
    onClose();
  };

  const handleReset = () => {
    setSettings({
      message: true,
      review: true,
      booking: false,
      system: true,
      achievement: true,
      verification: false,
      success: true,
      warning: true,
      error: true,
      frequency: "immediate",
      startTime: "08:00",
      endTime: "22:00",
      quietHours: true,
      low: false,
      normal: true,
      high: true,
      urgent: true,
      sound: true,
      vibration: true,
      desktop: true,
      soundType: "default",
      emailNotifications: true,
      emailDigest: true,
      emailFrequency: "daily",
      smsNotifications: false,
      phoneNumber: "",
      locationNotifications: false,
      locationRadius: "10",
      showContent: true,
      showSender: true,
      groupNotifications: true,
      maxNotifications: "50",
      autoDelete: "7",
      markReadAuto: true,
      syncDevices: true,
    });
    toast.info("Configurações resetadas para o padrão");
  };

  if (!user) return null;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Configurações de Notificações"
      description="Configure suas preferências de notificação"
      className="max-sm:max-h-[90vh] sm:max-w-2xl"
      footer={
        <div className="flex gap-3 w-full">
          <Button onClick={handleSave} className="flex-1">
            Salvar Configurações
          </Button>
          <Button onClick={handleReset} variant="outline">
            Resetar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-6">
        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-600" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Configure as notificações push do navegador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isGranted && (
              <Button
                onClick={requestPermission}
                disabled={isLoading}
                className="w-full"
              >
                <Bell className="w-4 h-4 mr-2" />
                Solicitar Permissão
              </Button>
            )}

            {isGranted && !isSubscribed && (
              <Button
                onClick={subscribe}
                disabled={isLoading}
                className="w-full"
              >
                <Bell className="w-4 h-4 mr-2" />
                Ativar Notificações
              </Button>
            )}

            {isSubscribed && (
              <Button
                onClick={unsubscribe}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                <BellOff className="w-4 h-4 mr-2" />
                Desativar Notificações
              </Button>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tipos de Notificação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-600" />
              Tipos de Notificação
            </CardTitle>
            <CardDescription>
              Configure quais tipos de notificação você deseja receber
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {NOTIFICATION_TYPES.map((type) => {
              const IconComponent = type.icon;
              return (
                <div
                  key={type.value}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${type.color} text-white`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <Label
                        htmlFor={`type-${type.value}`}
                        className="font-medium"
                      >
                        {type.label}
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receber notificações de {type.label.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={`type-${type.value}`}
                    checked={
                      settings[type.value as keyof typeof settings] as boolean
                    }
                    onCheckedChange={(checked) =>
                      handleSettingChange(type.value, checked)
                    }
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Frequência e Horários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Frequência e Horários
            </CardTitle>
            <CardDescription>
              Configure quando e com que frequência receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="frequency">Frequência de notificações</Label>
              <Select
                value={settings.frequency}
                onValueChange={(value) =>
                  handleSettingChange("frequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Imediata</SelectItem>
                  <SelectItem value="hourly">A cada hora</SelectItem>
                  <SelectItem value="daily">Diária</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Horário inicial</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={settings.startTime}
                  onChange={(e) =>
                    handleSettingChange("startTime", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-time">Horário final</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={settings.endTime}
                  onChange={(e) =>
                    handleSettingChange("endTime", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="quiet-hours">Horário silencioso</Label>
                <p className="text-sm text-gray-500">
                  Não receber notificações durante a noite
                </p>
              </div>
              <Switch
                id="quiet-hours"
                checked={settings.quietHours}
                onCheckedChange={(checked) =>
                  handleSettingChange("quietHours", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Som e Vibração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Som e Vibração
            </CardTitle>
            <CardDescription>
              Configure como as notificações são apresentadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound">Som de notificação</Label>
                <p className="text-sm text-gray-500">
                  Reproduzir som ao receber notificações
                </p>
              </div>
              <Switch
                id="sound"
                checked={settings.sound}
                onCheckedChange={(checked) =>
                  handleSettingChange("sound", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="vibration">Vibração</Label>
                <p className="text-sm text-gray-500">
                  Vibrar ao receber notificações
                </p>
              </div>
              <Switch
                id="vibration"
                checked={settings.vibration}
                onCheckedChange={(checked) =>
                  handleSettingChange("vibration", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="desktop">Notificações desktop</Label>
                <p className="text-sm text-gray-500">
                  Mostrar notificações na área de trabalho
                </p>
              </div>
              <Switch
                id="desktop"
                checked={settings.desktop}
                onCheckedChange={(checked) =>
                  handleSettingChange("desktop", checked)
                }
              />
            </div>

            <div>
              <Label htmlFor="sound-type">Tipo de som</Label>
              <Select
                value={settings.soundType}
                onValueChange={(value) =>
                  handleSettingChange("soundType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o som" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="gentle">Suave</SelectItem>
                  <SelectItem value="loud">Alto</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Notificações por Email
            </CardTitle>
            <CardDescription>Configure notificações por email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">
                  Notificações por email
                </Label>
                <p className="text-sm text-gray-500">
                  Receber notificações por email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  handleSettingChange("emailNotifications", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-digest">Resumo diário</Label>
                <p className="text-sm text-gray-500">
                  Receber um resumo diário por email
                </p>
              </div>
              <Switch
                id="email-digest"
                checked={settings.emailDigest}
                onCheckedChange={(checked) =>
                  handleSettingChange("emailDigest", checked)
                }
              />
            </div>

            <div>
              <Label htmlFor="email-frequency">Frequência do email</Label>
              <Select
                value={settings.emailFrequency}
                onValueChange={(value) =>
                  handleSettingChange("emailFrequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Imediato</SelectItem>
                  <SelectItem value="hourly">A cada hora</SelectItem>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Privacidade
            </CardTitle>
            <CardDescription>
              Configure as configurações de privacidade das notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-content">Mostrar conteúdo</Label>
                <p className="text-sm text-gray-500">
                  Mostrar conteúdo das notificações na tela de bloqueio
                </p>
              </div>
              <Switch
                id="show-content"
                checked={settings.showContent}
                onCheckedChange={(checked) =>
                  handleSettingChange("showContent", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-sender">Mostrar remetente</Label>
                <p className="text-sm text-gray-500">
                  Mostrar nome do remetente nas notificações
                </p>
              </div>
              <Switch
                id="show-sender"
                checked={settings.showSender}
                onCheckedChange={(checked) =>
                  handleSettingChange("showSender", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="group-notifications">
                  Agrupar notificações
                </Label>
                <p className="text-sm text-gray-500">
                  Agrupar notificações do mesmo tipo
                </p>
              </div>
              <Switch
                id="group-notifications"
                checked={settings.groupNotifications}
                onCheckedChange={(checked) =>
                  handleSettingChange("groupNotifications", checked)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveModal>
  );
}
