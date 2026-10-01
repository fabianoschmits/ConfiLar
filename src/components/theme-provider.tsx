"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";
import { useThemePersistence } from "@/hooks/useThemePersistence";

export const THEME_STORAGE_KEY = "confilar-theme";

function ThemeSync() {
  // Hook para garantir persistência do tema
  useThemePersistence();
  return null;
}

export function ThemeProvider({
  children,
  storageKey: _storageKey,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider storageKey={THEME_STORAGE_KEY} {...props}>
      <ThemeSync />
      {children}
    </NextThemesProvider>
  );
}
