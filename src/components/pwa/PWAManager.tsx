"use client";

import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { PWAUpdateNotification } from "./PWAUpdateNotification";
import { PWAStatus } from "./PWAStatus";

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
    </>
  );
}

// Export do status separadamente para usar no header
export { PWAStatus };
