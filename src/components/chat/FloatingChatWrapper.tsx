"use client";

import React from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { FloatingChat } from "@/components/chat";
import { useProfileCheck } from "@/hooks/useProfileCheck";

export default function FloatingChatWrapper() {
  const { user, profile } = useAuthContext();
  const pathname = usePathname();
  const { needsOnboarding } = useProfileCheck();

  // Não mostrar se não estiver logado
  if (!user || !profile) {
    return null;
  }

  // Não mostrar durante o onboarding (modal ou página)
  if (needsOnboarding || pathname === "/onboarding") {
    return null;
  }

  return (
    <>
      <FloatingChat />
    </>
  );
}
