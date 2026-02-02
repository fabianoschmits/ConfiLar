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
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchCronLogs,
  fetchCronStats,
  type CronLog,
  type CronStats,
} from "@/app/gestao-confi/dashboard/cron/actions";

// Job Definitions
const CRON_JOBS = [
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
    id: "process-email-queue",
    name: "Processar Fila de Emails",
    description: "Envia emails de notificação pendentes",
    endpoint: "/api/cron/process-email-queue",
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
    description: "Remove stories com mais de 24h",
    endpoint: "/api/cron/cleanup-stories",
  },
];

export function CronJobsSection() {
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [stats, setStats] = useState<CronStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [runningJob, setRunningJob] = useState<string | null>(null);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [fetchedLogs, fetchedStats] = await Promise.all([
        fetchCronLogs(),
        fetchCronStats(),
      ]);
      setLogs(fetchedLogs);
      setStats(fetchedStats);
    } catch (error) {
      console.error("Failed to load cron data", error);
      toast.error("Erro ao carregar dados dos cron jobs");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunJob = async (jobId: string, endpoint: string) => {
    setRunningJob(jobId);
    try {
      const response = await fetch(endpoint, {
        method: "GET", // Or POST if supported
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro na execução");
      }

      toast.success(`Job ${jobId} executado com sucesso!`, {
        description: data.message,
      });

      // Refresh logs
      await loadData();
    } catch (error: any) {
      console.error(`Error running job ${jobId}:`, error);
      toast.error(`Erro ao executar ${jobId}`, {
        description: error.message,
      });
    } finally {
      setRunningJob(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Painel de Controle Cron
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie e monitore as tarefas agendadas do sistema.
          </p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loadingData}>
          <RotateCw
            className={`mr-2 h-4 w-4 ${loadingData ? "animate-spin" : ""}`}
          />
          Atualizar Dados
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Execuções Hoje
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalRunsToday ?? "-"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Sucesso (7d)
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.successRateSevenDays ?? "-"}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Falha</CardTitle>
            <AlertTriangle className="h-4 w-4 text-error-500" />
          </CardHeader>
          <CardContent>
            {stats?.lastFailedJob ? (
              <div>
                <div
                  className="text-sm font-semibold truncate"
                  title={stats.lastFailedJob}
                >
                  {stats.lastFailedJob}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(stats.lastFailedTime!).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Nenhuma falha recente
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Job Actions List */}
      <Card>
        <CardHeader>
          <CardTitle>Tarefas Disponíveis</CardTitle>
          <CardDescription>
            Execute manualmente qualquer tarefa de manutenção.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CRON_JOBS.map((job) => (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="mb-4 sm:mb-0">
                  <h3 className="font-semibold text-base">{job.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.description}
                  </p>
                </div>
                <Button
                  onClick={() => handleRunJob(job.id, job.endpoint)}
                  disabled={!!runningJob}
                  variant={runningJob === job.id ? "secondary" : "default"}
                >
                  {runningJob === job.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {runningJob === job.id ? "Executando..." : "Executar"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                  {loadingData ? (
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
