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
        <div className="flex min-h-screen bg-gray-50 dark:bg-black pb-24 md:pb-0">
          {/* Desktop Sidebar - Hidden on Mobile */}
          <aside className="hidden md:flex flex-col w-64 border-r bg-white dark:bg-gray-900 sticky top-0 h-screen max-h-screen overflow-y-auto z-30">
            <AdminSidebar />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0">
            {/* Mobile Header (Simplified) */}
            <div className="md:hidden flex items-center p-4 border-b bg-white dark:bg-gray-900 sticky top-20 z-40">
              {/* Note: top-20 because MainLayout header is fixed at top-0 (h-20/h-24) usually. 
                   Checking MainLayout... MainLayout has padding-top but header is likely fixed.
                   If MainLayout header is fixed, we might need to adjust top or remove this header if redundant.
                   Since we are inside MainLayout, valid to have a sub-header or title area.
               */}
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h1 className="font-bold text-lg">Admin</h1>
              </div>
            </div>

            {/* Content Padding */}
            <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
              {children}
            </div>

            {/* Mobile Bottom Navigation */}
            <AdminBottomNav />
          </main>
        </div>
      </AdminGuard>
    </MainLayout>
  );
}
