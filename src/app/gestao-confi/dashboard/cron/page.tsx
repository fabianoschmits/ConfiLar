"use client";

import { AdminPageHeader } from "@/components/gestao-confi/AdminPageHeader";
import { Clock } from "lucide-react";
import { CronJobsSection } from "@/components/gestao-confi/CronJobsSection";

export default function CronJobsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tarefas agendadas"
        description="Execute manualmente as tarefas do sistema e confira os resultados."
        icon={Clock}
      />

      <CronJobsSection />
    </div>
  );
}
