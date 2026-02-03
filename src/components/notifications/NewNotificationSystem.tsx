"use client";

import { useEffect } from "react";

/**
 * Inicializador do sistema de notificações
 *
 * Sistema usa TRIGGERS SQL + REALTIME para notificações instantâneas:
 * - Triggers criam notificações automaticamente no banco
 * - Realtime envia notificações instantaneamente para o frontend
 * - Sem polling (0 delay)
 */
export function NewNotificationSystem() {
  useEffect(() => {
    // Verificar se já existe uma instância
    const existingInstance = document.querySelector(
      "[data-notification-system]",
    );
    if (existingInstance) {
      return;
    }

    // Marcar esta instância
    const marker = document.createElement("div");
    marker.setAttribute("data-notification-system", "true");
    marker.style.display = "none";
    document.body.appendChild(marker);

    return () => {
      if (marker.parentNode) {
        marker.parentNode.removeChild(marker);
      }
    };
  }, []);

  return null;
}
