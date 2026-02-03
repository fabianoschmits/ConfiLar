"use client";

import { LoadingOverlay } from "./LoadingOverlay";
import { useLoading } from "@/hooks/useLoading";

export function LoadingOverlayProvider() {
  const { loadingState } = useLoading();

  return (
    <LoadingOverlay
      isLoading={loadingState.isLoading}
      message={loadingState.message}
    />
  );
}
