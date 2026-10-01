"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPageHeader } from "@/components/gestao-confi/AdminPageHeader";
import { MessageSquare, Flag, Ban, LifeBuoy, ShieldCheck } from "lucide-react";
import { TicketsTab } from "@/components/gestao-confi/dashboard/TicketsTab";
import { ReportsTab } from "@/components/gestao-confi/dashboard/ReportsTab";
import { BansManagementEnhanced } from "@/components/gestao-confi/BansManagementEnhanced";
import { VerificationsTab } from "@/components/gestao-confi/dashboard/VerificationsTab";

export default function AtendimentoHubPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("tickets");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["tickets", "reports", "bans", "verifications"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <AdminPageHeader
        title="Hub de Atendimento"
        description="Gestão unificada de suporte, moderação e segurança da plataforma."
        icon={LifeBuoy}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6 sm:space-y-8"
      >
        <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md p-1.5 rounded-2xl border shadow-sm sticky top-[72px] md:top-4 z-20">
          <TabsList className="bg-transparent w-full justify-start gap-1 sm:gap-2 h-10 sm:h-11 overflow-x-auto no-scrollbar">
            <TabsTrigger
              value="tickets"
              className="flex-1 sm:flex-none px-3 sm:px-6 rounded-xl data-[state=active]:bg-[var(--cl-cta)] data-[state=active]:text-[var(--cl-on-cta)] font-bold text-[11px] sm:text-xs transition-all gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tickets de Suporte</span>
              <span className="sm:hidden">Tickets</span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex-1 sm:flex-none px-3 sm:px-6 rounded-xl data-[state=active]:bg-[var(--cl-cta)] data-[state=active]:text-[var(--cl-on-cta)] font-bold text-[11px] sm:text-xs transition-all gap-2"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Denúncias & Posts</span>
              <span className="sm:hidden">Denúncias</span>
            </TabsTrigger>
            <TabsTrigger
              value="verifications"
              className="flex-1 sm:flex-none px-3 sm:px-6 rounded-xl data-[state=active]:bg-[var(--cl-cta)] data-[state=active]:text-[var(--cl-on-cta)] font-bold text-[11px] sm:text-xs transition-all gap-2"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Verificações ID</span>
              <span className="sm:hidden">Validar</span>
            </TabsTrigger>
            <TabsTrigger
              value="bans"
              className="flex-1 sm:flex-none px-3 sm:px-6 rounded-xl data-[state=active]:bg-[var(--cl-cta)] data-[state=active]:text-[var(--cl-on-cta)] font-bold text-[11px] sm:text-xs transition-all gap-2"
            >
              <Ban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gestão de Bans</span>
              <span className="sm:hidden">Bans</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tickets" className="mt-0 outline-none">
          <TicketsTab />
        </TabsContent>

        <TabsContent value="reports" className="mt-0 outline-none">
          <ReportsTab />
        </TabsContent>

        <TabsContent value="verifications" className="mt-0 outline-none">
          <VerificationsTab />
        </TabsContent>

        <TabsContent value="bans" className="mt-0 outline-none">
          <BansManagementEnhanced />
        </TabsContent>
      </Tabs>
    </div>
  );
}
