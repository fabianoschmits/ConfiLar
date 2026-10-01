"use client";

import { Card } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Flag, Info, ChevronLeft } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";
import ReportsModule from "@/modules/reports/ReportsModule";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MinhasDenunciasPage() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id");

  return (
    <ClientOnly>
      <MainLayout requireAuth={true}>
        <div className="app-screen bg-[var(--cl-paper)]">
          <div className="app-page app-page--narrow">
            {/* Header */}
            <PageHeader
              title="Central de denúncias"
              description="Acompanhe o status e as resoluções das suas denúncias."
              icon={Flag}
              backHref="/ajuda"
              backLabel="Central de ajuda"
            />

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="p-3 sm:p-6">
                <ReportsModule initialReportId={reportId} />
              </Card>

              {/* Tips Section */}
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <Card className="p-4 bg-[var(--cl-surface)] border-none shadow-sm flex items-start gap-3">
                  <div className="p-2 bg-[var(--cl-mist)] dark:bg-blue-900/20 rounded-lg">
                    <Info className="w-5 h-5 text-[var(--cl-teal)]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Transparência</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nossa equipe analisa cada denúncia individualmente para
                      garantir um ambiente seguro para todos.
                    </p>
                  </div>
                </Card>
                <Card className="p-4 bg-[var(--cl-surface)] border-none shadow-sm flex items-start gap-3">
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <Flag className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Responsabilidade</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use este canal com responsabilidade. Denúncias falsas
                      prejudicam o sistema e outros usuários.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </ClientOnly>
  );
}
