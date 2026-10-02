"use client";

import { useEffect, useRef } from "react";
import { Toaster, useSonner, type ToasterProps } from "sonner";
import { useTheme } from "next-themes";
import {
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { soundManager } from "@/lib/soundManager";

/** Shared user/admin feedback without mutating the toast API. */
export function ToasterWithSounds({
  toastOptions,
  className,
  ...props
}: ToasterProps) {
  const { resolvedTheme } = useTheme();
  const { toasts } = useSonner();
  const sounded = useRef(new Set<string | number>());
  useEffect(() => {
    for (const toast of toasts) {
      if (toast.type !== "error" || sounded.current.has(toast.id)) continue;
      sounded.current.add(toast.id);
      void soundManager
        .play("/sounds/New/error.mp3", { volume: 0.5 })
        .catch(() => {});
    }
    if (sounded.current.size > 100) {
      sounded.current = new Set(
        toasts
          .filter((toast) => toast.type === "error")
          .map((toast) => toast.id),
      );
    }
  }, [toasts]);
  return (
    <Toaster
      position="top-center"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      closeButton
      duration={4500}
      visibleToasts={3}
      gap={10}
      offset={20}
      mobileOffset={{
        top: "calc(env(safe-area-inset-top, 0px) + 12px)",
        left: 12,
        right: 12,
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 90px)",
      }}
      containerAriaLabel="Avisos do ConfiLar"
      icons={{
        success: <CheckCircle2 />,
        error: <CircleAlert />,
        info: <Info />,
        warning: <TriangleAlert />,
        close: <X />,
      }}
      {...props}
      richColors={false}
      className={`confilar-toaster ${className || ""}`}
      toastOptions={{ ...toastOptions, closeButtonAriaLabel: "Fechar aviso" }}
    />
  );
}
