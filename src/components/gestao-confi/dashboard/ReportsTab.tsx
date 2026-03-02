"use client";

import React, { useState, useEffect } from "react";
import { reportService } from "@/modules/reports/services/reportService";
import type { Report, ReportStatus } from "@/modules/reports/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Flag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Shield,
  MessageSquare,
  Star,
  Megaphone,
  Image as ImageIcon,
  Archive,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";

export function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    loadReports();
    const handleFocus = () => loadReports();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await reportService.getAllReportsForAdmin();
      setReports(data);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.reason?.toLowerCase().includes(search.toLowerCase()) ||
      report.description.toLowerCase().includes(search.toLowerCase()) ||
      report.reporter?.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      report.reported_user?.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? report.status !== "dismissed"
        : report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusStyles: Record<
    string,
    { variant: any; icon: any; label: string }
  > = {
    pending: { variant: "warning", icon: Clock, label: "Pendente" },
    reviewing: { variant: "default", icon: Clock, label: "Análise" },
    resolved: { variant: "success", icon: CheckCircle2, label: "Resolvido" },
    dismissed: { variant: "outline", icon: Archive, label: "Arquivado" },
  };

  const typeIconMap: Record<string, any> = {
    user: Shield,
    post: MessageSquare,
    message: MessageSquare,
    review: Star,
    classified: Megaphone,
    story: ImageIcon,
    other: AlertTriangle,
  };

  const counts = {
    all: reports.filter((r) => r.status !== "dismissed").length,
    pending: reports.filter((r) => r.status === "pending").length,
    reviewing: reports.filter((r) => r.status === "reviewing").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "Não Arquivadas", count: counts.all },
            { id: "pending", label: "Pendentes", count: counts.pending },
            { id: "reviewing", label: "Análise", count: counts.reviewing },
            { id: "resolved", label: "Resolvidas", count: counts.resolved },
            { id: "dismissed", label: "Arquivadas", count: counts.dismissed },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={statusFilter === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(tab.id)}
              className="capitalize text-[10px] sm:text-[11px] h-8 px-3 rounded-lg font-bold"
            >
              {tab.label}
              <Badge
                variant="secondary"
                className="text-[9px] px-1 py-0 h-4 ml-1.5 opacity-70"
              >
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar denúncias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs rounded-lg"
          />
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Clock className="w-8 h-8 animate-spin text-primary opacity-20" />
          </div>
        ) : filteredReports.length === 0 ? (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Flag className="w-12 h-12 text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground text-sm font-medium">
                Nenhuma denúncia encontrada.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => {
            const style = statusStyles[report.status] || statusStyles.pending;
            const Icon = typeIconMap[report.type] || typeIconMap.other;

            return (
              <Card
                key={report.id}
                className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer group rounded-xl border-border/50 shadow-sm"
                onClick={() =>
                  router.push(`/gestao-confi/dashboard/reports/${report.id}`)
                }
              >
                <div className="flex items-center p-2.5 sm:p-4 gap-2.5 sm:gap-4">
                  <div className="relative shrink-0">
                    {report.reported_user?.avatar_url ? (
                      <img
                        src={report.reported_user.avatar_url}
                        alt={report.reported_user.full_name || "Denunciado"}
                        className="w-9 h-9 sm:w-12 sm:h-12 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground border">
                        <Icon className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge
                        variant={style.variant}
                        className="text-[9px] uppercase font-black px-1.5 h-4 rounded-md"
                      >
                        {style.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Denúncia de {report.type.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-bold text-[13px] sm:text-sm truncate">
                      {report.reason || "Violação de Termos"}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                      {format(new Date(report.created_at), "dd MMM", {
                        locale: ptBR,
                      })}{" "}
                      • Contra{" "}
                      <span className="text-foreground font-semibold">
                        {report.reported_user?.full_name || "Usuário"}
                      </span>
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
