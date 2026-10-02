"use client";

import React from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
const FloatingChat = dynamic(
  () => import("./FloatingChat").then((m) => m.FloatingChat),
  { ssr: false },
);
import { useProfileCheck } from "@/hooks/useProfileCheck";

export default function FloatingChatWrapper() {
  const { user, profile } = useAuthContext();
  const { isOpen } = useFloatingChat();
  const pathname = usePathname();
  const { needsOnboarding } = useProfileCheck();

  // Não mostrar se não estiver logado
  if (!user || !profile || !isOpen) {
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
