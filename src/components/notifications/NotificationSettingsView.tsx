"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Smartphone,
  CheckCircle,
  XCircle,
  X,
  ArrowLeft,
} from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { toast } from "sonner";

interface NotificationSettingsViewProps {
  onBack?: () => void;
  className?: string;
}

export function NotificationSettingsView({
  onBack,
  className = "",
}: NotificationSettingsViewProps) {
  const {
    isSupported,
    isGranted,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    isLoading,
    error,
  } = usePushNotifications();

  const { updatePreferences: updateSoundPreferences } = useNotificationSound();

  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    sound: false,
    vibration: true,
    messages: true,
    reviews: true,
    favorites: true,
    recommendations: true,
    system: true,
  });

  // Carregar configurações salvas ao montar o componente
  useEffect(() => {
    const savedSettings = localStorage.getItem("notificationSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setNotificationSettings((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    }
  }, []);

  const updateSetting = async (key: string, value: boolean) => {
    const updatedSettings = { ...notificationSettings, [key]: value };

    // Atualizar estado
    setNotificationSettings(updatedSettings);

    // Salvar automaticamente no localStorage
    localStorage.setItem(
      "notificationSettings",
      JSON.stringify(updatedSettings),
    );

    // CONECTAR AOS SISTEMAS REAIS
    if (key === "sound") {
      try {
        await updateSoundPreferences({ enabled: value });
        toast.success(`Som ${value ? "ativado" : "desativado"}`);
      } catch (error) {
        console.error("Erro ao atualizar som:", error);
      }
    }

    if (key === "vibration" && value) {
      if ("vibrate" in navigator) {
        navigator.vibrate(200);
        toast.success("Vibração ativada");
      } else {
        toast.warning("Vibração não suportada neste dispositivo");
      }
    }

    if (key === "pushEnabled") {
      try {
        if (value) {
          if (!isGranted) {
            const granted = await requestPermission();
            if (!granted) {
              setNotificationSettings((prev) => ({
                ...prev,
                pushEnabled: false,
              }));
              localStorage.setItem(
                "notificationSettings",
                JSON.stringify({ ...updatedSettings, pushEnabled: false }),
              );
              return;
            }
          }
          if (!isSubscribed) {
            await subscribe();
            toast.success("Notificações push ativadas");
          }
        } else {
          if (isSubscribed) {
            await unsubscribe();
            toast.success("Notificações push desativadas");
          }
        }
      } catch (error) {
        console.error("Erro ao atualizar push:", error);
      }
    }

    if (
      [
        "messages",
        "reviews",
        "favorites",
        "recommendations",
        "system",
      ].includes(key)
    ) {
      const typeNames: Record<string, string> = {
        messages: "Mensagens",
        reviews: "Avaliações",
        favorites: "Favoritos",
        recommendations: "Recomendações",
        system: "Sistema",
      };
      toast.success(`${typeNames[key]} ${value ? "ativadas" : "desativadas"}`);
    }
  };

  const handlePushNotificationToggle = async () => {
    try {
      if (!isGranted) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (error) {
      console.error("Erro ao alternar notificações push:", error);
    }
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-900 ${className}`}>
      {/* Header de Configurações */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Voltar"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Configurações
            </h3>
          </div>
        </div>
      </div>

      {/* Conteúdo de Configurações */}
      <div className="p-4 space-y-4 overflow-y-auto bg-white dark:bg-gray-900 rounded-b-xl scrollbar-hide">
        {/* Notificações Push */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Notificações Gerais
          </h4>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Ativar notificações push
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receba notificações no navegador
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationSettings.pushEnabled}
                onChange={(e) => updateSetting("pushEnabled", e.target.checked)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Som
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Reproduzir som ao receber
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationSettings.sound}
                onChange={(e) => updateSetting("sound", e.target.checked)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Vibração
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Vibrar no celular
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationSettings.vibration}
                onChange={(e) => updateSetting("vibration", e.target.checked)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>

        {/* Tipos de Notificação */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Tipos de Notificação
          </h4>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Mensagens
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Chat e mensagens diretas
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationSettings.messages}
                onChange={(e) => updateSetting("messages", e.target.checked)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Avaliações
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Novas avaliações recebidas
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationSettings.reviews}
                onChange={(e) => updateSetting("reviews", e.target.checked)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Favoritos
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Quando alguém favorita você
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationSettings.favorites}
                onChange={(e) => updateSetting("favorites", e.target.checked)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Recomendações
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Quando alguém recomenda você
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationSettings.recommendations}
                onChange={(e) =>
                  updateSetting("recommendations", e.target.checked)
                }
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Sistema
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Notificações importantes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationSettings.system}
                onChange={(e) => updateSetting("system", e.target.checked)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Seção de Notificações Push - Detalhada */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Status do Navegador
            </h4>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Receber notificações push
                  </h5>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                    Ative para receber alertas no dispositivo, mesmo com o site
                    fechado.
                  </p>

                  {error && (
                    <div className="text-xs text-red-600 mb-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded">
                      <div className="font-medium mb-1">
                        ⚠️ Problema com Notificações
                      </div>
                      <div>{error}</div>
                    </div>
                  )}

                  <button
                    onClick={handlePushNotificationToggle}
                    disabled={!isSupported || isLoading}
                    className={`
                      w-full px-4 py-2 text-sm font-medium rounded-md transition-colors
                      ${
                        isSubscribed
                          ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/60"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                      }
                      ${
                        !isSupported || isLoading
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                    `}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Processando...
                      </div>
                    ) : isSubscribed ? (
                      <div className="flex items-center justify-center gap-2">
                        <X className="w-4 h-4" />
                        Desativar Push
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Bell className="w-4 h-4" />
                        Ativar Push
                      </div>
                    )}
                  </button>

                  {!isSupported && (
                    <p className="text-[10px] text-gray-500 mt-2 text-center">
                      Navegador sem suporte a notificações push
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
