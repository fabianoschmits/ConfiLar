"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const ctrlMatch =
          shortcut.ctrlKey === undefined || shortcut.ctrlKey === e.ctrlKey;
        const metaMatch =
          shortcut.metaKey === undefined || shortcut.metaKey === e.metaKey;
        const shiftMatch =
          shortcut.shiftKey === undefined || shortcut.shiftKey === e.shiftKey;
        const altMatch =
          shortcut.altKey === undefined || shortcut.altKey === e.altKey;
        const keyMatch = shortcut.key.toLowerCase() === e.key.toLowerCase();

        if (ctrlMatch && metaMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// Hook específico para atalhos de navegação
export function useNavigationShortcuts() {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: "k",
      ctrlKey: true,
      action: () => {
        // Focar no campo de busca do header
        const searchInput = document.querySelector(
          'input[placeholder*="Buscar"]',
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      description: "Ctrl+K: Focar na busca",
    },
    {
      key: "h",
      altKey: true,
      action: () => router.push("/home"),
      description: "Alt+H: Ir para Home",
    },
    {
      key: "f",
      altKey: true,
      action: () => router.push("/feed"),
      description: "Alt+F: Ir para Feed",
    },
    {
      key: "n",
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        // Abrir modal de novo post
        const newPostButton = document.querySelector(
          '[aria-label="Criar novo post"]',
        ) as HTMLButtonElement;
        newPostButton?.click();
      },
      description: "Ctrl+Shift+N: Novo post",
    },
  ];

  useKeyboardShortcuts(shortcuts);
}
