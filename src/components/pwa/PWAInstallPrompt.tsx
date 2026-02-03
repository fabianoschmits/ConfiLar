"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePWA } from "@/hooks/usePWA";

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já dismissou o prompt
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Mostrar prompt após 3 segundos se for instalável
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installApp();

    if (success) {
      setIsVisible(false);
      localStorage.setItem("pwa-install-dismissed", "true");
    }

    setIsInstalling(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const handleRemindLater = () => {
    setIsVisible(false);
    // Não salva no localStorage, vai aparecer novamente depois

    // Mostrar novamente em 24 horas
    setTimeout(() => {
      if (isInstallable && !isInstalled && !isDismissed) {
        setIsVisible(true);
      }
    }, 86400000); // 24 horas
  };

  // Não mostrar se já foi dismissado, já está instalado, ou não está visível
  if (!isVisible || isDismissed || isInstalled || !isInstallable) {
    return null;
  }

  return (
    <>
      {/* Overlay escuro */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={handleRemindLater}
      />

      {/* Modal de instalação */}
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 pointer-events-none">
        <Card className="w-full max-w-md pointer-events-auto animate-in slide-in-from-bottom duration-300 md:slide-in-from-bottom-0">
          <CardContent className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Instalar ConfiLar</h3>
                  <p className="text-sm text-gray-600">
                    Acesso rápido e offline
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Benefícios */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">
                  Acesso rápido da tela inicial
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">Funciona offline</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">
                  Notificações em tempo real
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">
                  Experiência como app nativo
                </span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="w-full bg-black hover:bg-gray-800 text-white"
                size="lg"
              >
                {isInstalling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Instalando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Instalar Agora
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRemindLater}
                  className="flex-1"
                >
                  Lembrar Depois
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDismiss}
                  className="flex-1"
                >
                  Não, Obrigado
                </Button>
              </div>
            </div>

            {/* Informação adicional */}
            <p className="text-xs text-gray-500 text-center">
              O ConfiLar não ocupará espaço significativo no seu dispositivo
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
