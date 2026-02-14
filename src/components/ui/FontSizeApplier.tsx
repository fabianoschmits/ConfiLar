"use client";

import { useFontSize } from "@/hooks/useFontSize";

/**
 * Global component that applies font size preferences on mount.
 * Should be placed in the RootLayout to ensure settings are applied immediately.
 */
export function FontSizeApplier() {
  // The hook already handles applying the font size in its own useEffect
  useFontSize();

  return null;
}
