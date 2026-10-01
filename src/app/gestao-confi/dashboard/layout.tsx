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
        <div className="flex min-h-screen bg-[var(--cl-paper)] pb-32 md:pb-0">
          {/* Desktop Sidebar - Hidden on Mobile */}
          <aside className="hidden md:flex flex-col w-72 border-r bg-[var(--cl-surface)] sticky top-0 h-screen max-h-screen overflow-y-auto z-30 shadow-sm transition-all">
            <AdminSidebar />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0">
            {/* Mobile Header (Modern & Floating effect) */}
            <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b sticky top-0 z-40">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--cl-cta)] p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <h1 className="font-extrabold text-lg tracking-tight">Admin</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-bold">
                  LIVE
                </span>
              </div>
            </div>

            {/* Content Padding */}
            <div className="flex-1 p-5 md:p-10 overflow-x-hidden">
              <div className="max-w-7xl mx-auto">{children}</div>
            </div>

            {/* Mobile Bottom Navigation */}
            <AdminBottomNav />
          </main>
        </div>
      </AdminGuard>
    </MainLayout>
  );
}
