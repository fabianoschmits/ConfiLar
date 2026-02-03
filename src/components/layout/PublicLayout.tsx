"use client";

import { ReactNode } from "react";
import { PWAStatus } from "@/components/pwa/PWAStatus";
import { QuickActionMenu } from "@/components/navigation/QuickActionMenu";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      {children}
      <PWAStatus />
      {/* Menu de acesso rápido para mobile - aparece quando não está logado */}
      <QuickActionMenu />
    </>
  );
}
