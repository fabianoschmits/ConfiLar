"use client";

import React, { useState, useEffect } from "react";
import { reportService } from "@/modules/reports/services/reportService";
import type { Report, ReportStatus } from "@/modules/reports/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BansManagementEnhanced } from "@/components/gestao-confi/BansManagementEnhanced";
import {
  Search,
  Flag,
  User as UserIcon,
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
  Ban,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    loadReports();

    // Atualizar dados quando a janela ganhar foco (re-entrar na aba)
    const handleFocus = () => {
      loadReports();
    };

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
    reviewing: { variant: "default", icon: Clock, label: "Em Análise" },
    resolved: { variant: "success", icon: CheckCircle2, label: "Resolvido" },
    dismissed: { variant: "outline", icon: Archive, label: "Arquivada" },
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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Gestão de Denúncias
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Monitore denúncias e gerencie banimentos de usuários.
          </p>
        </div>
      </div>

      <Tabs defaultValue="reports" className="w-full space-y-6">
        <TabsList className="bg-muted/50 p-1 h-10 sm:h-12 rounded-xl">
          <TabsTrigger
            value="reports"
            className="rounded-lg px-4 sm:px-8 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 text-xs sm:text-sm font-bold"
          >
            <Flag className="w-3.5 h-3.5" />
            Denúncias
          </TabsTrigger>
          <TabsTrigger
            value="bans"
            className="rounded-lg px-4 sm:px-8 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 text-xs sm:text-sm font-bold"
          >
            <Ban className="w-3.5 h-3.5" />
            Banimentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6 outline-none">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* Filters Bar */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "Todas", count: counts.all },
                { id: "pending", label: "Pendentes", count: counts.pending },
                {
                  id: "reviewing",
                  label: "Em Análise",
                  count: counts.reviewing,
                },
                { id: "resolved", label: "Resolvidas", count: counts.resolved },
                {
                  id: "dismissed",
                  label: "Arquivadas",
                  count: counts.dismissed,
                },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={statusFilter === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(tab.id)}
                  className="capitalize text-[10px] sm:text-[11px] h-7 sm:h-8 px-2 sm:px-3 gap-1.5 rounded-lg font-bold"
                >
                  {tab.label}
                  <Badge
                    variant={
                      statusFilter === tab.id ? "secondary" : "secondary"
                    }
                    className="text-[9px] px-1 py-0 h-4 bg-muted text-muted-foreground ml-0.5"
                  >
                    {tab.count}
                  </Badge>
                </Button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar denúncia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 sm:h-9 text-[11px] sm:text-sm rounded-lg"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Clock className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredReports.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Flag className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-sm font-medium">
                    Nenhuma denúncia encontrada para estes filtros.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => {
                const style =
                  statusStyles[report.status] || statusStyles.pending;
                const Icon = typeIconMap[report.type] || typeIconMap.other;

                return (
                  <Card
                    key={report.id}
                    className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer group rounded-xl border-border/50"
                    onClick={() =>
                      router.push(
                        `/gestao-confi/dashboard/reports/${report.id}`,
                      )
                    }
                  >
                    <div className="flex items-center p-3 sm:p-4 gap-3 sm:gap-4">
                      <div className="relative shrink-0">
                        {report.reported_user?.avatar_url ? (
                          <img
                            src={report.reported_user.avatar_url}
                            alt={report.reported_user.full_name || "Denunciado"}
                            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover shadow-sm border border-border"
                          />
                        ) : (
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground border border-border shadow-sm">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <Badge
                            variant={style.variant}
                            className="text-[8px] sm:text-[10px] uppercase font-bold px-1.5 h-3.5 sm:h-4"
                          >
                            {style.label}
                          </Badge>
                          <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-medium">
                            {report.type}
                          </span>
                        </div>
                        <h4 className="font-bold text-[13px] sm:text-sm truncate">
                          {report.reason || "Denúncia de Conteúdo"}
                        </h4>
                        <div className="flex flex-wrap flex-col gap-0.5 mt-0.5">
                          <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                            Por{" "}
                            <span className="font-medium text-foreground">
                              {report.reporter?.full_name || "Usuário"}
                            </span>{" "}
                            •{" "}
                            {format(new Date(report.created_at), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </p>
                          {report.reported_user && (
                            <p className="text-[9px] text-muted-foreground">
                              Denunciando:{" "}
                              <span className="font-bold">
                                {report.reported_user.full_name}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="hidden sm:flex flex-col items-end gap-1">
                        <Badge
                          variant={
                            report.priority === "urgent" ||
                            report.priority === "high"
                              ? "destructive"
                              : "outline"
                          }
                          className="text-[9px]"
                        >
                          {report.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="bans" className="outline-none">
          <BansManagementEnhanced />
        </TabsContent>
      </Tabs>
    </div>
  );
}
