"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { soundManager } from "@/lib/soundManager";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = async () => {
    if (isTransitioning) return; // Prevenir múltiplos cliques

    setIsTransitioning(true);

    // Tocar som antes de alternar o tema
    soundManager
      .play("/sounds/New/switchMode.mp3", { volume: 0.3 })
      .catch((err) => {
        console.warn("⚠️ Erro ao tocar som de tema:", err);
      });

    // Determinar o tema atual de forma mais robusta
    const currentTheme = resolvedTheme || theme || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    console.log("🎨 Alterando tema:", { de: currentTheme, para: newTheme });

    // Aplicar o novo tema (next-themes já cuida do DOM)
    setTheme(newTheme);

    // Liberar o botão após um curto delay
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <Sun className="h-5 w-5 opacity-50" />
        <span className="sr-only">Alternar tema</span>
      </Button>
    );
  }

  const currentTheme = resolvedTheme || theme || "light";
  const isDark = currentTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      disabled={isTransitioning}
      className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
      title={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}
    >
      <div className="relative w-5 h-5">
        {isDark ? (
          <Sun
            className="h-5 w-5 text-yellow-500 transition-all duration-300 hover:rotate-180 absolute inset-0"
            style={{ opacity: isTransitioning ? 0.5 : 1 }}
          />
        ) : (
          <Moon
            className="h-5 w-5 text-gray-700 dark:text-gray-300 transition-all duration-300 hover:rotate-12 absolute inset-0"
            style={{ opacity: isTransitioning ? 0.5 : 1 }}
          />
        )}
      </div>
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
