"use client";
import { useEffect, useState } from "react";
export function ConnectionStatus() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online ? null : (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 top-20 z-[100] rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] p-3 text-center text-sm text-[var(--cl-ink)] shadow-sm"
    >
      Sem conexão. Seus dados já carregados continuam disponíveis. Compras e
      transferências precisam de internet.
    </div>
  );
}
