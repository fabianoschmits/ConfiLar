"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const THEME_STATE_STORAGE_KEY = "confilar-theme-state";
const LEGACY_THEME_STORAGE_KEY = "confilar-theme";
const THEME_STORAGE_VERSION = "v1";

interface ThemeState {
  theme: string;
  version: string;
  lastUpdate: number;
}

/**
 * Hook para gerenciar persistência robusta do tema
 * Previne trocas indesejadas ao minimizar/restaurar o app
 */
export function useThemePersistence() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isHydrated, setIsHydrated] = useState(false);

  // Salvar tema no localStorage de forma robusta
  const saveTheme = (newTheme: string) => {
    if (typeof window === "undefined") return;

    const themeState: ThemeState = {
      theme: newTheme,
      version: THEME_STORAGE_VERSION,
      lastUpdate: Date.now(),
    };

    try {
      localStorage.setItem(THEME_STATE_STORAGE_KEY, JSON.stringify(themeState));

      // Também salvar em sessionStorage como backup
      sessionStorage.setItem(THEME_STATE_STORAGE_KEY, newTheme);

      console.log("✅ Tema salvo:", newTheme);
    } catch (error) {
      console.error("❌ Erro ao salvar tema:", error);
    }
  };

  // Carregar tema do localStorage
  const loadTheme = (): string | null => {
    if (typeof window === "undefined") return null;

    try {
      // Tentar carregar do localStorage primeiro
      const stored = localStorage.getItem(THEME_STATE_STORAGE_KEY);

      if (stored) {
        try {
          const themeState: ThemeState = JSON.parse(stored);

          // Verificar se é uma versão válida
          if (themeState.version === THEME_STORAGE_VERSION) {
            console.log("✅ Tema carregado do localStorage:", themeState.theme);
            return themeState.theme;
          }
        } catch (parseError) {
          // Se falhar o parse, pode ser um valor simples (compatibilidade)
          console.log("✅ Tema carregado (formato antigo):", stored);
          return stored;
        }
      }

      // Fallback para sessionStorage
      const sessionTheme = sessionStorage.getItem(THEME_STATE_STORAGE_KEY);
      if (sessionTheme) {
        console.log("✅ Tema carregado do sessionStorage:", sessionTheme);
        return sessionTheme;
      }

      // Compatibilidade com a versão que compartilhava a chave do next-themes.
      // Objetos antigos são lidos uma única vez; a chave principal volta a conter
      // somente "light" ou "dark", como o next-themes espera.
      const legacyTheme = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
      if (legacyTheme) {
        try {
          const legacyState: ThemeState = JSON.parse(legacyTheme);
          if (legacyState.theme) return legacyState.theme;
        } catch {
          return legacyTheme;
        }
      }

      return null;
    } catch (error) {
      console.error("❌ Erro ao carregar tema:", error);
      return null;
    }
  };

  // Restaurar tema ao montar o componente
  useEffect(() => {
    const savedTheme = loadTheme();

    if (savedTheme && savedTheme !== theme) {
      console.log("🔄 Restaurando tema salvo:", savedTheme);
      setTheme(savedTheme);
    }

    setIsHydrated(true);
  }, []); // Rodar apenas uma vez ao montar

  // Salvar tema sempre que mudar (com debounce)
  useEffect(() => {
    if (!isHydrated) return;
    if (!theme) return;

    const timeoutId = setTimeout(() => {
      saveTheme(theme);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [theme, isHydrated]);

  // Listener para mudanças no localStorage (sincronização entre abas)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STATE_STORAGE_KEY && e.newValue) {
        try {
          const themeState: ThemeState = JSON.parse(e.newValue);
          if (themeState.theme !== theme) {
            console.log("🔄 Sincronizando tema entre abas:", themeState.theme);
            setTheme(themeState.theme);
          }
        } catch (error) {
          // Formato antigo
          if (e.newValue !== theme) {
            setTheme(e.newValue);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [theme, setTheme]);

  return {
    isHydrated,
    currentTheme: resolvedTheme || theme,
    saveTheme,
  };
}
