"use client";

// Desabilitar SSG para esta página
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ConfiPointsAdminDashboard } from "@/components/gestao-confi/ConfiPointsAdminDashboard";
import { AdminGuard } from "@/components/gestao-confi/AdminGuard";

export default function ConfiPointsAdminPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <MainLayout requireAuth={true}>
      <AdminGuard>
        <div className="app-screen bg-[var(--cl-paper)]">
          <div className="container mx-auto py-8 px-4">
            <ConfiPointsAdminDashboard />
          </div>
        </div>
      </AdminGuard>
    </MainLayout>
  );
}
