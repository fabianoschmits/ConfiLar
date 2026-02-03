"use client";

import { useEffect, useState } from "react";
import { useErrorInterceptor } from "@/utils/errorInterceptor";

interface ErrorHandlerProps {
  children: React.ReactNode;
}

export function ErrorHandler({ children }: ErrorHandlerProps) {
  const [mounted, setMounted] = useState(false);
  const { resetErrorCount, getStatus } = useErrorInterceptor();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Resetar contador de erros a cada 5 minutos
    const interval = setInterval(
      () => {
        resetErrorCount();
      },
      5 * 60 * 1000,
    ); // 5 minutos

    return () => clearInterval(interval);
  }, [mounted, resetErrorCount]);

  // Log do status em desenvolvimento
  useEffect(() => {
    if (!mounted) return;

    if (process.env.NODE_ENV === "development") {
      const status = getStatus();
      console.log("🛡️ ErrorHandler status:", status);
    }
  }, [mounted, getStatus]);

  // Não renderizar até estar montado no cliente
  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
