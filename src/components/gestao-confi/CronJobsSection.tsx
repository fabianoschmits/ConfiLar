"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  RotateCw,
  Activity,
  Calendar,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchCronLogs,
  fetchCronStats,
  getEmailQueueCount,
  type CronLog,
  type CronStats,
} from "@/app/gestao-confi/dashboard/cron/actions";

// Job Definitions
const CRON_JOBS = [
  {
    id: "process-email-queue",
    name: "Processar Fila de Emails",
    description: "Envia emails de notificação pendentes",
    endpoint: "/api/cron/process-email-queue",
  },
  {
    id: "clear-email-queue",
    name: "Limpar Fila de Emails",
    description: "Remove todos os emails pendentes da fila",
    endpoint: "/api/cron/clear-email-queue",
    variant: "destructive" as const,
  },
  {
    id: "premium-posts-notifications",
    name: "Notificações Posts Premium",
    description: "Notifica e remove status premium expirado",
    endpoint: "/api/cron/premium-posts-notifications",
  },
  {
    id: "expired-premium-classifieds",
    name: "Manutenção Classificados",
    description: "Remove status de classificados expirados",
    endpoint: "/api/cron/expired-premium-classifieds",
  },
  {
    id: "inactive-users-availability",
    name: "Usuários Inativos",
    description: "Marca usuários inativos como indispo.",
    endpoint: "/api/cron/inactive-users-availability",
  },
  {
    id: "cleanup-stories",
    name: "Limpeza de Stories",
    description: "Deleta stories com mais de 24 horas",
    endpoint: "/api/cron/cleanup-stories",
  },
];

export function CronJobsSection() {
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [stats, setStats] = useState<CronStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<Record<string, string[]>>(
    {},
  );
  const [emailQueueCount, setEmailQueueCountState] = useState<number | null>(
    null,
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsData, statsData, queueCount] = await Promise.all([
        fetchCronLogs(),
        fetchCronStats(),
        getEmailQueueCount(),
      ]);
      setLogs(logsData);
      setStats(statsData);
      setEmailQueueCountState(queueCount);
    } catch (error) {
      console.error("Error loading cron data:", error);
      toast.error("Erro ao carregar dados dos cron jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunJob = async (job: (typeof CRON_JOBS)[0]) => {
    setRunningJob(job.id);
    setExecutionLogs((prev) => ({
      ...prev,
      [job.id]: ["🚀 Iniciando execução..."],
    }));

    try {
      const response = await fetch(job.endpoint, {
        method: "GET",
      });
      const data = await response.json();

      if (data.logs && Array.isArray(data.logs)) {
        setExecutionLogs((prev) => ({
          ...prev,
          [job.id]: [...(prev[job.id] || []), ...data.logs],
        }));
      }

      if (!response.ok) {
        throw new Error(data.error || "Erro na execução");
      }

      toast.success(`Job ${job.id} executado com sucesso!`);

      // Se for algo relacionado a emails, atualizar a contagem
      if (job.id === "process-email-queue" || job.id === "clear-email-queue") {
        const newCount = await getEmailQueueCount();
        setEmailQueueCountState(newCount);
      }

      // Refresh logs table
      await loadData();
    } catch (error: any) {
      console.error(`Error running job ${job.id}:`, error);
      setExecutionLogs((prev) => ({
        ...prev,
        [job.id]: [...(prev[job.id] || []), `❌ Erro: ${error.message}`],
      }));
      toast.error(`Erro ao executar ${job.id}`, {
        description: error.message,
      });
    } finally {
      setRunningJob(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            Painel Cron
          </h2>
          <p className="text-[11px] sm:text-sm text-gray-600 dark:text-gray-400">
            Gerencie as tarefas agendadas do sistema.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadData}
          disabled={loading}
          size="sm"
          className="h-8 text-xs sm:h-10 sm:text-sm"
        >
          <RotateCw
            className={`mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2.5 sm:pb-2 sm:p-6">
            <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider opacity-60">
              Fila Email
            </CardTitle>
            <RotateCw className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2.5 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-black">
              {emailQueueCount !== null ? emailQueueCount : "..."}
            </div>
            <p className="text-[9px] sm:text-xs text-muted-foreground">
              Aguardando
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2.5 sm:pb-2 sm:p-6">
            <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider opacity-60">
              Execuções
            </CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2.5 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-black">
              {stats?.totalRunsToday ?? "-"}
            </div>
            <p className="text-[9px] sm:text-xs text-muted-foreground">Hoje</p>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2.5 sm:pb-2 sm:p-6">
            <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider opacity-60">
              Sucesso
            </CardTitle>
            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-2.5 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-black">
              {stats?.successRateSevenDays ?? "-"}%
            </div>
            <p className="text-[9px] sm:text-xs text-muted-foreground">
              7 dias
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2.5 sm:pb-2 sm:p-6">
            <CardTitle className="text-[10px] sm:text-sm font-bold uppercase tracking-wider opacity-60">
              Falha
            </CardTitle>
            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
          </CardHeader>
          <CardContent className="p-2.5 pt-0 sm:p-6 sm:pt-0">
            {stats?.lastFailedJob ? (
              <div className="min-w-0">
                <div
                  className="text-[11px] sm:text-lg font-bold truncate"
                  title={stats.lastFailedJob}
                >
                  {stats.lastFailedJob}
                </div>
                <div className="text-[8px] sm:text-xs text-muted-foreground">
                  {new Date(stats.lastFailedTime!).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="text-[10px] sm:text-sm text-muted-foreground">
                Nenhuma
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {CRON_JOBS.map((job) => (
          <Card
            key={job.id}
            className="flex flex-col border-primary/10 hover:border-primary/30 transition-colors shadow-sm"
          >
            <CardHeader className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[13px] sm:text-base font-bold">
                  {job.name}
                </CardTitle>
                {(job.id === "process-email-queue" ||
                  job.id === "clear-email-queue") &&
                  emailQueueCount !== null && (
                    <Badge
                      variant="outline"
                      className="ml-2 font-mono text-[9px] h-4"
                    >
                      {emailQueueCount}
                    </Badge>
                  )}
              </div>
              <CardDescription className="line-clamp-2 text-[10px] sm:text-sm">
                {job.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end space-y-3 p-3 sm:p-6 sm:pt-0">
              <Button
                variant={(job as any).variant || "outline"}
                className={`w-full group h-8 sm:h-10 text-[11px] sm:text-sm ${job.id === "clear-email-queue" ? "hover:bg-red-600 hover:text-white" : ""}`}
                disabled={runningJob === job.id}
                onClick={() => handleRunJob(job)}
              >
                {runningJob === job.id ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    <span className="truncate">Executando...</span>
                  </>
                ) : (
                  <>
                    {job.id === "clear-email-queue" ? (
                      <Trash2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                    ) : (
                      <Play className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                    )}
                    {job.id === "clear-email-queue"
                      ? "Limpar Fila"
                      : "Executar"}
                  </>
                )}
              </Button>

              {/* Terminal Logs Area */}
              {executionLogs[job.id] && (
                <div className="mt-2 rounded-md bg-zinc-950 p-3 font-mono text-xs overflow-hidden border border-white/5">
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/10">
                    <span className="text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${runningJob === job.id ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}
                      />
                      Terminal de Execução
                    </span>
                    <button
                      onClick={() =>
                        setExecutionLogs((prev) => {
                          const next = { ...prev };
                          delete next[job.id];
                          return next;
                        })
                      }
                      className="text-zinc-600 hover:text-zinc-400"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-1 pr-1">
                    {executionLogs[job.id].map((log, i) => (
                      <div
                        key={i}
                        className={`break-words ${
                          log.includes("Erro") || log.includes("❌")
                            ? "text-red-400"
                            : log.includes("Sucesso") ||
                                log.includes("✅") ||
                                log.includes("concluída")
                              ? "text-emerald-400"
                              : "text-zinc-300"
                        }`}
                      >
                        <span className="text-zinc-600 mr-1.5 select-none hover:text-zinc-500">
                          $
                        </span>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* History Log */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Execuções</CardTitle>
          <CardDescription>
            Últimos registros de atividade das tarefas automáticas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="max-h-[400px] overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400 sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Data/Hora</th>
                    <th className="px-6 py-3">Job</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Mensagem</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-muted-foreground"
                      >
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString("pt-BR")}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {log.job_name}
                        </td>
                        <td className="px-6 py-4">
                          {log.status === "success" ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              Sucesso
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Erro</Badge>
                          )}
                        </td>
                        <td
                          className="px-6 py-4 truncate max-w-xs"
                          title={log.message}
                        >
                          {log.message}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
