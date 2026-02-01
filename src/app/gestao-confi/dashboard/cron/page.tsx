"use client";

import { CronJobsSection } from "@/components/gestao-confi/CronJobsSection";

export default function CronJobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Cron Jobs
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Execute manualmente os cron jobs do sistema. Configure a Service Role
          Key no início para habilitar a execução.
        </p>
      </div>

      <CronJobsSection />
    </div>
  );
}
