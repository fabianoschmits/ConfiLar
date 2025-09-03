"use client"

import { useEffect } from "react"

export function ServiceWorkerCleaner() {
  // 🧹 LIMPEZA AUTOMÁTICA DO SERVICE WORKER ANTIGO
  // Desregistra todos os Service Workers antigos e limpa cache quando o usuário acessa o site
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => {
          console.log("🧹 Desregistrando SW antigo:", reg);
          reg.unregister();
        });
      });
    }

    // Limpar cache do Service Worker
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          console.log("🧹 Limpando cache:", name);
          caches.delete(name);
        });
      });
    }
  }, []);

  return null
}
