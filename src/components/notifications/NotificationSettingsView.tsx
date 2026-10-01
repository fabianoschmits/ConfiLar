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
    <div className={`flex flex-col bg-[var(--cl-surface)] ${className}`}>
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
      <div className="p-4 space-y-4 overflow-y-auto max-h-[400px] md:max-h-[500px] bg-[var(--cl-surface)] rounded-b-xl scrollbar-hide">
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
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--cl-cta)]"></div>
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
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--cl-cta)]"></div>
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
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--cl-cta)]"></div>
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
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--cl-cta)]"></div>
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
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--cl-cta)]"></div>
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
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--cl-cta)]"></div>
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
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--cl-cta)]"></div>
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
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--cl-cta)]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
