"use client";

import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { PWAUpdateNotification } from "./PWAUpdateNotification";
import { PWAStatus } from "./PWAStatus";
import { PushNotificationManager } from "./PushNotificationManager";

/**
 * PWAManager - Componente principal que gerencia todos os aspectos do PWA
 *
 * Funcionalidades:
 * - Prompt de instalação personalizado
 * - Notificação de atualização automática
 * - Status do PWA no header
 * - Sincronização em background
 * - Cache inteligente de imagens
 */
export function PWAManager() {
  return (
    <>
      {/* Prompt de instalação */}
      <PWAInstallPrompt />

      {/* Notificação de atualização */}
      <PWAUpdateNotification />

      {/* Gerenciador de notificações push - Proativo */}
      <div className="fixed bottom-24 right-4 z-50 max-w-xs scale-90 origin-bottom-right opacity-90 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="pointer-events-auto">
          <PushNotificationManager />
        </div>
      </div>
    </>
  );
}

// Export do status separadamente para usar no header
export { PWAStatus };
