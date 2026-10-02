"use client";

import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePWA } from "@/hooks/usePWA";

export function PWAUpdateNotification() {
  const { updateAvailable, updateApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setIsVisible(true);
    }
  }, [updateAvailable]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await updateApp();
    // updateApp já recarrega a página, então não precisa fazer nada aqui
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Mostrar novamente em 1 hora se ainda houver atualização
    setTimeout(() => {
      if (updateAvailable) {
        setIsVisible(true);
      }
    }, 3600000); // 1 hora
  };

  if (!isVisible || !updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+90px)] left-3 right-3 z-50 animate-in slide-in-from-bottom-5 duration-300 sm:bottom-6 sm:left-auto sm:right-6">
      <Card
        role="status"
        className="w-full max-w-sm border-[var(--cl-border)] bg-[var(--cl-surface)] py-0 shadow-[var(--cl-shadow)] sm:w-96"
      >
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--cl-mist)] rounded-full flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 text-[var(--cl-teal)]" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[var(--cl-ink)]">
                  Atualização disponível
                </h4>
                <p className="text-xs text-[var(--cl-ink-secondary)]">
                  Uma nova versão do ConfiLar está pronta.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              aria-label="Fechar aviso de atualização"
              className="h-10 w-10 text-[var(--cl-ink-muted)] hover:bg-[var(--cl-mist)]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Informações sobre a atualização */}
          <p className="text-xs leading-5 text-[var(--cl-ink-secondary)]">
            Salve o que estiver fazendo antes de atualizar. O aplicativo será
            recarregado.
          </p>

          {/* Ações */}
          <div className="flex gap-2">
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 bg-[var(--cl-cta)] hover:brightness-110 text-[var(--cl-on-cta)]"
              size="sm"
            >
              {isUpdating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Atualizar agora
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              size="sm"
              className="flex-1"
            >
              Mais tarde
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
