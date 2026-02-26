"use client";

import { useEffect, useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

/**
 * Custom hook to manage font size preference
 * Applies font size to document root and persists to database
 */
export function useFontSize() {
  const { user, profile, updateProfile } = useAuthContext();

  // Get current font size from profile or default based on device
  const defaultFontSize =
    typeof window !== "undefined" && window.innerWidth < 768 ? 80 : 100;
  const fontSize = profile?.font_size_preference ?? defaultFontSize;

  /**
   * Apply font size to document root
   */
  const applyFontSize = useCallback((size: number) => {
    // Calculate scale factor (100 = 1.0, 75 = 0.75, 150 = 1.5)
    const scale = size / 100;

    // Apply to CSS custom property
    document.documentElement.style.setProperty(
      "--font-size-scale",
      scale.toString(),
    );
  }, []);

  /**
   * Update font size in database
   */
  const updateFontSize = useCallback(
    async (newSize: number) => {
      if (!user?.id) return;

      // Validate range
      if (newSize < 75 || newSize > 150) {
        toast.error("Tamanho de fonte inválido. Use valores entre 75% e 150%.");
        return;
      }

      try {
        // Use updateProfile from AuthContext to ensure global state stays in sync
        const { error } = await updateProfile({
          font_size_preference: newSize,
        });

        if (error) throw new Error(error.message);

        // Apply immediately
        applyFontSize(newSize);
      } catch (error) {
        console.error("Error updating font size:", error);
        toast.error("Erro ao salvar preferência de tamanho de fonte");
      }
    },
    [user?.id, updateProfile, applyFontSize],
  );

  /**
   * Apply font size on mount and when it changes
   */
  useEffect(() => {
    applyFontSize(fontSize);
  }, [fontSize, applyFontSize]);

  return {
    fontSize,
    updateFontSize,
    applyFontSize,
  };
}
