"use client";

import { ReactNode } from "react";
import { AdminGuard } from "@/components/gestao-confi/AdminGuard";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminSidebar } from "@/components/gestao-confi/AdminSidebar";
import { AdminBottomNav } from "@/components/gestao-confi/AdminBottomNav";
import { Shield } from "lucide-react";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <MainLayout requireAuth={true}>
      <AdminGuard>
        <div className="app-screen flex bg-[var(--cl-paper)]">
          {/* Desktop Sidebar - Hidden on Mobile */}
          <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-[var(--cl-border)] bg-[var(--cl-surface)] sticky top-[calc(var(--app-header-height)+var(--app-top-inset))] h-[calc(100dvh-var(--app-header-height)-var(--app-top-inset))] overflow-y-auto z-30">
            <AdminSidebar />
          </aside>

          {/* Main Content Area */}
          <section
            aria-label="Área administrativa"
            className="flex-1 flex flex-col min-w-0"
          >
            {/* Mobile Header (Modern & Floating effect) */}
            <div className="md:hidden flex items-center px-4 py-3 bg-[var(--cl-surface)] border-b border-[var(--cl-border)]">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--cl-cta)] p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <p className="font-extrabold text-sm text-[var(--cl-ink)]">
                  Gestão ConfiLar
                </p>
              </div>
            </div>

            {/* Content Padding */}
            <div className="app-admin-content flex-1">
              <div className="max-w-7xl mx-auto">{children}</div>
            </div>

            {/* Mobile Bottom Navigation */}
            <AdminBottomNav />
          </section>
        </div>
      </AdminGuard>
    </MainLayout>
  );
}
