"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/gestao-confi/AdminGuard";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface NotificationResult {
  success: boolean;
  message: string;
  expiring_notifications: number;
  expired_notifications: number;
  expiring_post_ids: string[];
  expired_post_ids: string[];
  timestamp: string;
}

export default function NotificationsAdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NotificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeNotifications = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/cron/premium-posts-notifications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao executar notificações");
      }

      setResult(data);
      toast.success("Notificações executadas com sucesso!", {
        description: `${data.expiring_notifications} expirando e ${data.expired_notifications} expiradas`,
      });
    } catch (err: any) {
      setError(err.message || "Erro ao executar notificações");
      toast.error("Erro ao executar notificações", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout requireAuth={true}>
      <AdminGuard>
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Notificações de Posts Premium
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Execute manualmente as notificações de posts premium expirando ou
              expirados
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Executar Notificações
              </CardTitle>
              <CardDescription>
                Cria notificações para posts premium expirando em 24h e posts
                premium expirados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={executeNotifications}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Executar Notificações
                    </>
                  )}
                </Button>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Erro</span>
                    </div>
                    <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                )}

                {result && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Sucesso!</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                        {result.message}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Expirando (24h)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-lg">
                              {result.expiring_notifications}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              notificações criadas
                            </span>
                          </div>
                          {result.expiring_post_ids.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Posts:{" "}
                              {result.expiring_post_ids.slice(0, 3).join(", ")}
                              {result.expiring_post_ids.length > 3 && "..."}
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Expirados
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-lg">
                              {result.expired_notifications}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              notificações criadas
                            </span>
                          </div>
                          {result.expired_post_ids.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Posts:{" "}
                              {result.expired_post_ids.slice(0, 3).join(", ")}
                              {result.expired_post_ids.length > 3 && "..."}
                            </div>
                          )}
                        </div>
                      </div>

                      {result.timestamp && (
                        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                          Executado em:{" "}
                          {new Date(result.timestamp).toLocaleString("pt-BR")}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Como Funciona</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Notificações de Expiração (24h)
                  </h3>
                  <p>
                    Cria notificações para posts premium que vão expirar nas
                    próximas 24 horas. Os usuários recebem uma notificação
                    alertando sobre a expiração iminente.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Notificações de Expirados
                  </h3>
                  <p>
                    Cria notificações para posts premium que expiraram nas
                    últimas 24 horas. Os usuários são notificados que seu post
                    premium perdeu o destaque.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Frequência Recomendada
                  </h3>
                  <p>
                    Execute manualmente algumas vezes ao dia (manhã, tarde,
                    noite) para garantir que todas as notificações sejam criadas
                    em tempo hábil.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminGuard>
    </MainLayout>
  );
}
