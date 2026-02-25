"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Settings, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useUnifiedAuth";

interface PushNotificationManagerProps {
  onClose?: () => void;
  showDismissed?: boolean;
}

export function PushNotificationManager({
  onClose,
  showDismissed = false,
}: PushNotificationManagerProps) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [permission, setPermission] = useState<{
    granted: boolean;
    denied: boolean;
    default: boolean;
  }>({
    granted: false,
    denied: false,
    default: false,
  });
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Verificar se foi dispensado anteriormente
    const dismissed = localStorage.getItem("push-prompt-dismissed") === "true";
    setIsDismissed(dismissed);

    checkNotificationSupport();
    checkPermission();
    checkSubscription();
  }, []);

  const checkNotificationSupport = () => {
    const supported =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setIsSupported(supported);
  };

  const checkPermission = () => {
    if (!isSupported) return;

    const permissionStatus = Notification.permission;
    setPermission({
      granted: permissionStatus === "granted",
      denied: permissionStatus === "denied",
      default: permissionStatus === "default",
    });
  };

  const checkSubscription = async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
      }
    } catch (error) {
      console.error("Erro ao verificar subscription:", error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) return;

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();

      setPermission({
        granted: permission === "granted",
        denied: permission === "denied",
        default: permission === "default",
      });

      if (permission === "granted") {
        await subscribeToPush();
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToPush = async () => {
    if (!isSupported || !user) return;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        // Registrar se não existir
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      }

      const readyRegistration = await navigator.serviceWorker.ready;

      // VAPID public key
      const vapidPublicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        "BHFq3qgyqedilKnplJxWlfdducWsnU8CnG_80ZcWvngwFOL_NPv-gQF25VV6nLr4wTueXcZBBawN5BU5_BQSs25M";

      const subscription = await readyRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(subscription);

      // Enviar subscription para o servidor via rota segura
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(
                String.fromCharCode(
                  ...new Uint8Array(subscription.getKey("p256dh")!),
                ),
              ),
              auth: btoa(
                String.fromCharCode(
                  ...new Uint8Array(subscription.getKey("auth")!),
                ),
              ),
            },
          },
        }),
      });

      if (!response.ok) throw new Error("Erro ao salvar inscrição");

      console.log("✅ Inscrito em notificações push com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao inscrever em push:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Remover subscription do servidor
      await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });

      console.log("✅ Desinscrito de notificações push com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao desinscrever de push:", error);
    }
  };

  const openNotificationSettings = () => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "notifications" as PermissionName })
        .then((result) => {
          // Abrir configurações do navegador
          window.open("chrome://settings/content/notifications", "_blank");
        });
    }
  };

  // Converter VAPID key para Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleDismiss = () => {
    localStorage.setItem("push-prompt-dismissed", "true");
    setIsDismissed(true);
    if (onClose) onClose();
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5 text-gray-400" />
            Notificações Não Suportadas
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta notificações push ou Service Worker.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isDismissed && !showDismissed) return null;
  if (permission.granted && subscription && !showDismissed) return null;

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba notificações sobre mensagens, avaliações e atualizações.
        </CardDescription>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-7 w-7 p-0"
          onClick={handleDismiss}
        >
          <XCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status da permissão */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            {permission.granted && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ativado
              </Badge>
            )}
            {permission.denied && (
              <Badge variant="destructive">
                <XCircle className="w-3 h-3 mr-1" />
                Negado
              </Badge>
            )}
            {permission.default && (
              <Badge variant="outline">
                <Bell className="w-3 h-3 mr-1" />
                Não configurado
              </Badge>
            )}
          </div>
        </div>

        {/* Status da subscription */}
        {permission.granted && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Inscrição:</span>
              {subscription ? (
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ativa
                </Badge>
              ) : (
                <Badge variant="outline">
                  <BellOff className="w-3 h-3 mr-1" />
                  Inativa
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-2">
          {permission.default && (
            <Button
              onClick={requestPermission}
              disabled={isLoading}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              {isLoading ? "Solicitando..." : "Ativar Notificações"}
            </Button>
          )}

          {permission.denied && (
            <div className="space-y-2">
              <p className="text-sm text-red-600">
                As notificações foram negadas. Para ativá-las:
              </p>
              <Button
                onClick={openNotificationSettings}
                variant="outline"
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Abrir Configurações
              </Button>
            </div>
          )}

          {permission.granted && !subscription && (
            <Button
              onClick={subscribeToPush}
              disabled={isLoading}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              {isLoading ? "Configurando..." : "Inscrever em Notificações"}
            </Button>
          )}

          {permission.granted && subscription && (
            <Button
              onClick={unsubscribeFromPush}
              variant="outline"
              className="w-full"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Desativar Notificações
            </Button>
          )}
        </div>

        {/* Informações */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Notificações sobre mensagens de chat</p>
          <p>• Avaliações e recomendações recebidas</p>
          <p>• Atualizações importantes do sistema</p>
        </div>
      </CardContent>
    </Card>
  );
}
