"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useReportsModule } from "./hooks/useReportsModule";
import { ReportList } from "./components/ReportList";
import { ReportForm } from "./components/ReportForm";
import { ReportDetails } from "./components/ReportDetails";
import { Report } from "./types";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, Loader2, Flag } from "lucide-react";

export default function ReportsModule({
  initialReportId,
}: {
  initialReportId?: string | null;
}) {
  const { user } = useAuthContext();
  const {
    reports,
    currentReport,
    isLoading,
    fetchUserReports,
    fetchReportDetails,
    createReport,
  } = useReportsModule(user?.id);

  const [view, setView] = useState<"list" | "form" | "details">("list");

  useEffect(() => {
    if (user?.id) {
      fetchUserReports();
    }
  }, [user?.id, fetchUserReports]);

  useEffect(() => {
    if (initialReportId) {
      fetchReportDetails(initialReportId).then(() => {
        setView("details");
      });
    }
  }, [initialReportId, fetchReportDetails]);

  const handleSelectReport = async (report: Report) => {
    await fetchReportDetails(report.id);
    setView("details");
  };

  const handleCreateReport = async (data: any) => {
    try {
      const report = await createReport(data);
      if (report) {
        setView("list");
      }
    } catch (error) {
      console.error("Failed to create report:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
          {view === "list" && "Minhas Denúncias"}
          {view === "form" && "Nova Denúncia"}
          {view === "details" && "Detalhes da Denúncia"}
        </h3>
        {view === "list" && (
          <Button
            size="sm"
            onClick={() => setView("form")}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Denúncia
          </Button>
        )}
        {view === "form" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("list")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && view === "list" && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {view === "list" && !isLoading && (
          <ReportList reports={reports} onSelect={handleSelectReport} />
        )}

        {view === "form" && (
          <ReportForm onSubmit={handleCreateReport} isLoading={isLoading} />
        )}

        {view === "details" && currentReport && (
          <ReportDetails
            report={currentReport}
            onBack={() => {
              setView("list");
              fetchUserReports();
            }}
            currentUser={{ id: user.id }}
          />
        )}
      </div>
    </div>
  );
}
