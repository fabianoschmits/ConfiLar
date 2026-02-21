"use client";

import { Card } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { Flag, Info } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";
import ReportsModule from "@/modules/reports/ReportsModule";
import { useSearchParams } from "next/navigation";

export default function MinhasDenunciasPage() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id");

  return (
    <ClientOnly>
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-black">
          <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
            {/* Header */}
            <div className="mb-8 flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Flag className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Central de Denúncias
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Acompanhe o status e as resoluções das suas denúncias.
                </p>
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="min-h-[500px] sm:min-h-[600px] p-3 sm:p-6 bg-background/60 backdrop-blur-md border-red-100 dark:border-red-900/20">
                <ReportsModule initialReportId={reportId} />
              </Card>

              {/* Tips Section */}
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <Card className="p-4 bg-white dark:bg-gray-900 border-none shadow-sm flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Transparência</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nossa equipe analisa cada denúncia individualmente para
                      garantir um ambiente seguro para todos.
                    </p>
                  </div>
                </Card>
                <Card className="p-4 bg-white dark:bg-gray-900 border-none shadow-sm flex items-start gap-3">
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
