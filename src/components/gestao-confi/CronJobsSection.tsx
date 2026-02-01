"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// ⚠️ SEGURANÇA: Removidos imports de Input e Label - não são mais necessários
import {
  Loader2,
  Bell,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  HelpCircle,
  BookOpen,
  PlayCircle,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

interface NotificationResult {
  success: boolean;
  message: string;
  deactivated_count?: number;
  deactivated_ids?: string[];
  expiring_notifications: number;
  expired_notifications: number;
  expiring_post_ids: string[];
  expired_post_ids: string[];
  timestamp: string;
}

interface ClassifiedsResult {
  success: boolean;
  message: string;
  deactivated: number;
  expiring_notifications: number;
  expired_notifications: number;
  timestamp: string;
}

interface StoriesCleanupResult {
  success: boolean;
  message: string;
  stories_deleted: number;
  story_ids: string[];
  timestamp: string;
}

interface InactiveUsersResult {
  success: boolean;
  message: string;
  users_marked_unavailable: number;
  user_ids: string[];
  user_details?: Array<{
    id: string;
    name: string;
    email: string;
    last_login_at?: string | null;
    updated_at?: string | null;
    days_inactive: number;
  }>;
  timestamp: string;
}

export function CronJobsSection() {
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingClassifieds, setLoadingClassifieds] = useState(false);
  const [loadingStories, setLoadingStories] = useState(false);
  const [loadingInactiveUsers, setLoadingInactiveUsers] = useState(false);
  const [notificationResult, setNotificationResult] =
    useState<NotificationResult | null>(null);
  const [classifiedsResult, setClassifiedsResult] =
    useState<ClassifiedsResult | null>(null);
  const [storiesResult, setStoriesResult] =
    useState<StoriesCleanupResult | null>(null);
  const [inactiveUsersResult, setInactiveUsersResult] =
    useState<InactiveUsersResult | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(
    null,
  );
  const [classifiedsError, setClassifiedsError] = useState<string | null>(null);
  const [storiesError, setStoriesError] = useState<string | null>(null);
  const [inactiveUsersError, setInactiveUsersError] = useState<string | null>(
    null,
  );
  // ⚠️ SEGURANÇA: Removido armazenamento de Service Role Key no frontend
  // As APIs agora usam apenas autenticação de admin (withAdminAuth)

  const executeNotifications = async () => {
    setLoadingNotifications(true);
    setNotificationError(null);
    setNotificationResult(null);

    try {
      // ⚠️ SEGURANÇA: Não enviar Service Role Key do frontend
      // A API usa withAdminAuth para verificar permissões
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      const response = await fetch("/api/cron/premium-posts-notifications", {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao executar notificações");
      }

      setNotificationResult(data);
      const deactivatedMsg = data.deactivated_count
        ? `, ${data.deactivated_count} posts convertidos para normais`
        : "";
      toast.success("Notificações executadas com sucesso!", {
        description: `${data.expiring_notifications} expirando e ${data.expired_notifications} expiradas${deactivatedMsg}`,
      });
    } catch (err: any) {
      setNotificationError(err.message || "Erro ao executar notificações");
      toast.error("Erro ao executar notificações", {
        description: err.message,
      });
    } finally {
      setLoadingNotifications(false);
    }
  };

  const executeClassifiedsMaintenance = async () => {
    setLoadingClassifieds(true);
    setClassifiedsError(null);
    setClassifiedsResult(null);

    try {
      // ⚠️ SEGURANÇA: Não enviar Service Role Key do frontend
      // A API usa withAdminAuth para verificar permissões
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      const response = await fetch("/api/cron/expired-premium-classifieds", {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erro ao executar manutenção de classificados",
        );
      }

      setClassifiedsResult(data);
      toast.success("Manutenção de classificados executada com sucesso!", {
        description: `${data.deactivated || 0} classificados convertidos para normais`,
      });
    } catch (err: any) {
      setClassifiedsError(
        err.message || "Erro ao executar manutenção de classificados",
      );
      toast.error("Erro ao executar manutenção de classificados", {
        description: err.message,
      });
    } finally {
      setLoadingClassifieds(false);
    }
  };

  const executeStoriesCleanup = async () => {
    setLoadingStories(true);
    setStoriesError(null);
    setStoriesResult(null);

    try {
      // ⚠️ SEGURANÇA: Não enviar Service Role Key do frontend
      // A API usa withAdminAuth para verificar permissões
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      const response = await fetch("/api/cron/cleanup-stories", {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao limpar stories");
      }

      setStoriesResult(data);
      toast.success("Stories limpos com sucesso!", {
        description: `${data.stories_deleted} stories deletados`,
      });
    } catch (err: any) {
      setStoriesError(err.message || "Erro ao limpar stories");
      toast.error("Erro ao limpar stories", {
        description: err.message,
      });
    } finally {
      setLoadingStories(false);
    }
  };

  const executeInactiveUsers = async () => {
    setLoadingInactiveUsers(true);
    setInactiveUsersError(null);
    setInactiveUsersResult(null);

    try {
      // ⚠️ SEGURANÇA: Não enviar Service Role Key do frontend
      // A API usa withAdminAuth para verificar permissões
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      const response = await fetch("/api/cron/inactive-users-availability", {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar usuários inativos");
      }

      setInactiveUsersResult(data);
      toast.success("Usuários inativos processados!", {
        description: `${data.users_marked_unavailable} usuário(s) marcado(s) como indisponível(is)`,
      });
    } catch (err: any) {
      setInactiveUsersError(
        err.message || "Erro ao processar usuários inativos",
      );
      toast.error("Erro ao processar usuários inativos", {
        description: err.message,
      });
    } finally {
      setLoadingInactiveUsers(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Cron Jobs Manuais
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Execute manualmente os cron jobs do sistema
        </p>
      </div>

      {/* Campo de Credenciais */}
      {/* ⚠️ SEGURANÇA: Removido campo de credenciais - agora usa autenticação de admin automática */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Autenticação Automática
          </CardTitle>
          <CardDescription>
            Os cron jobs usam sua autenticação de administrador automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                <HelpCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Autenticação Automática</p>
                  <p className="text-xs">
                    Os cron jobs usam sua autenticação de administrador
                    automaticamente. Não é necessário inserir credenciais
                    manualmente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notificações de Posts Premium */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações de Posts Premium
            </CardTitle>
            <CardDescription>
              Cria notificações e remove status premium de posts que expiraram
              (converte para posts normais)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={executeNotifications}
                disabled={loadingNotifications}
                className="w-full"
                size="lg"
              >
                {loadingNotifications ? (
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

              {notificationError && (
                <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                  <div className="flex items-center gap-2 text-error-600 dark:text-error-400">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Erro</span>
                  </div>
                  <p className="mt-2 text-sm text-error-700 dark:text-error-300">
                    {notificationError}
                  </p>
                </div>
              )}

              {notificationResult && (
                <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                  <div className="flex items-center gap-2 text-success-600 dark:text-success-400 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Sucesso!</span>
                  </div>
                  <p className="text-sm text-success-700 dark:text-success-300 mb-4">
                    {notificationResult.message}
                  </p>

                  <div className="grid grid-cols-3 gap-4">
                    {notificationResult.deactivated_count !== undefined && (
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-success-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Convertidos
                          </span>
                        </div>
                        <Badge variant="outline" className="text-lg">
                          {notificationResult.deactivated_count}
                        </Badge>
                      </div>
                    )}
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-primary-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Expirando (24h)
                        </span>
                      </div>
                      <Badge variant="outline" className="text-lg">
                        {notificationResult.expiring_notifications}
                      </Badge>
                    </div>

                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-error-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Expirados
                        </span>
                      </div>
                      <Badge variant="outline" className="text-lg">
                        {notificationResult.expired_notifications}
                      </Badge>
                    </div>
                  </div>

                  {notificationResult.timestamp && (
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      Executado em:{" "}
                      {new Date(notificationResult.timestamp).toLocaleString(
                        "pt-BR",
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manutenção de Classificados Premium */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Manutenção de Classificados Premium
            </CardTitle>
            <CardDescription>
              Remove status premium de classificados que expiraram (converte
              para classificados normais)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={executeClassifiedsMaintenance}
                disabled={loadingClassifieds}
                className="w-full"
                size="lg"
              >
                {loadingClassifieds ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Executar Manutenção
                  </>
                )}
              </Button>

              {classifiedsError && (
                <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                  <div className="flex items-center gap-2 text-error-600 dark:text-error-400">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Erro</span>
                  </div>
                  <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {classifiedsError}
                  </p>
                </div>
              )}

              {classifiedsResult && (
                <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                  <div className="flex items-center gap-2 text-success-600 dark:text-success-400 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Sucesso!</span>
                  </div>
                  <p className="text-sm text-success-700 dark:text-success-300 mb-4">
                    {classifiedsResult.message}
                  </p>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Convertidos
                        </span>
                      </div>
                      <Badge variant="outline" className="text-lg">
                        {classifiedsResult.deactivated || 0}
                      </Badge>
                    </div>

                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-primary-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Expirando (24h)
                        </span>
                      </div>
                      <Badge variant="outline" className="text-lg">
                        {classifiedsResult.expiring_notifications}
                      </Badge>
                    </div>

                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-error-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Expirados
                        </span>
                      </div>
                      <Badge variant="outline" className="text-lg">
                        {classifiedsResult.expired_notifications}
                      </Badge>
                    </div>
                  </div>

                  {classifiedsResult.timestamp && (
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      Executado em:{" "}
                      {new Date(classifiedsResult.timestamp).toLocaleString(
                        "pt-BR",
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Usuários Inativos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5" />
              Usuários Inativos
            </CardTitle>
            <CardDescription>
              Marca como indisponível usuários que ficaram mais de 1 semana sem
              acessar o site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={executeInactiveUsers}
                disabled={loadingInactiveUsers}
                className="w-full"
                size="lg"
                variant="outline"
              >
                {loadingInactiveUsers ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Marcar Usuários Inativos
                  </>
                )}
              </Button>

              {inactiveUsersError && (
                <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                  <div className="flex items-center gap-2 text-error-600 dark:text-error-400">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Erro</span>
                  </div>
                  <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {inactiveUsersError}
                  </p>
                </div>
              )}

              {inactiveUsersResult && (
                <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                  <div className="flex items-center gap-2 text-success-600 dark:text-success-400 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Sucesso!</span>
                  </div>
                  <p className="text-sm text-success-700 dark:text-success-300 mb-4">
                    {inactiveUsersResult.message}
                  </p>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <UserX className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Usuários Marcados
                      </span>
                    </div>
                    <Badge variant="outline" className="text-lg">
                      {inactiveUsersResult.users_marked_unavailable}
                    </Badge>
                  </div>

                  {inactiveUsersResult.user_details &&
                    inactiveUsersResult.user_details.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Detalhes dos usuários:
                        </p>
                        {inactiveUsersResult.user_details.map((user) => (
                          <div
                            key={user.id}
                            className="p-2 bg-white dark:bg-gray-800 rounded text-xs"
                          >
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.name || user.email}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {user.days_inactive} dias sem atividade
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                  {inactiveUsersResult.timestamp && (
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      Executado em:{" "}
                      {new Date(inactiveUsersResult.timestamp).toLocaleString(
                        "pt-BR",
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Limpeza de Stories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Limpeza de Stories
            </CardTitle>
            <CardDescription>
              Deleta stories que já passaram de 24 horas (expiraram) do banco de
              dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={executeStoriesCleanup}
                disabled={loadingStories}
                className="w-full"
                size="lg"
                variant="destructive"
              >
                {loadingStories ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Stories Antigos
                  </>
                )}
              </Button>

              {storiesError && (
                <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                  <div className="flex items-center gap-2 text-error-600 dark:text-error-400">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Erro</span>
                  </div>
                  <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {storiesError}
                  </p>
                </div>
              )}

              {storiesResult && (
                <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                  <div className="flex items-center gap-2 text-success-600 dark:text-success-400 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Sucesso!</span>
                  </div>
                  <p className="text-sm text-success-700 dark:text-success-300 mb-4">
                    {storiesResult.message}
                  </p>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Trash2 className="h-4 w-4 text-error-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Stories Deletados
                      </span>
                    </div>
                    <Badge variant="outline" className="text-lg">
                      {storiesResult.stories_deleted}
                    </Badge>
                  </div>

                  {storiesResult.timestamp && (
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      Executado em:{" "}
                      {new Date(storiesResult.timestamp).toLocaleString(
                        "pt-BR",
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Instruções - Como Executar */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <BookOpen className="h-5 w-5" />
            Como Executar os Cron Jobs
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Guia passo a passo para executar os cron jobs manualmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Passo 1: Credenciais */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Configurar Credenciais
                </h3>
              </div>
              <div className="ml-10 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>O que é:</strong> As credenciais são necessárias para
                  autenticar e executar operações administrativas no sistema.
                </p>
                <p>
                  <strong>Como usar:</strong> Insira suas credenciais no campo
                  acima. Elas não são armazenadas e serão usadas apenas durante
                  a execução dos cron jobs.
                </p>
                <div className="p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg mt-2">
                  <p className="text-xs text-warning-700 dark:text-warning-300">
                    ⚠️ <strong>Importante:</strong> Mantenha suas credenciais em
                    segredo. Elas têm acesso administrativo ao sistema.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 2: Executar Notificações */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Executar Manutenção de Posts Premium
                </h3>
              </div>
              <div className="ml-10 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>O que faz:</strong> Cria notificações para usuários
                  quando seus posts premium estão expirando (24h antes) ou já
                  expiraram. Também remove o status premium e featured de posts
                  que expiraram, convertendo-os para posts normais.
                </p>
                <p>
                  <strong>Como executar:</strong> Clique no botão{" "}
                  <strong>"Executar Notificações"</strong> acima.
                </p>
                <p>
                  <strong>Quando executar:</strong> Execute algumas vezes ao dia
                  (manhã, tarde, noite) para garantir que posts expirados sejam
                  convertidos para normais e todas as notificações sejam criadas
                  em tempo hábil.
                </p>
                <div className="p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg mt-2">
                  <p className="text-xs text-success-700 dark:text-success-300">
                    ✅ <strong>Resultado esperado:</strong> Você verá a
                    quantidade de posts convertidos para normais, notificações
                    criadas (expirando e expiradas) e os IDs dos posts afetados.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 3: Executar Manutenção de Classificados */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Executar Manutenção de Classificados Premium
                </h3>
              </div>
              <div className="ml-10 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>O que faz:</strong> Remove o status premium e featured
                  de classificados que expiraram, convertendo-os para
                  classificados normais. Também cria notificações para usuários.
                </p>
                <p>
                  <strong>Como executar:</strong> Clique no botão{" "}
                  <strong>"Executar Manutenção"</strong> acima.
                </p>
                <p>
                  <strong>Quando executar:</strong> Execute algumas vezes ao dia
                  (manhã, tarde, noite) para garantir que classificados
                  expirados sejam convertidos para normais.
                </p>
                <div className="p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg mt-2">
                  <p className="text-xs text-success-700 dark:text-success-300">
                    ✅ <strong>Resultado esperado:</strong> Você verá a
                    quantidade de classificados convertidos para normais e
                    notificações criadas.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 4: Executar Limpeza */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Executar Limpeza de Stories Antigos
                </h3>
              </div>
              <div className="ml-10 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>O que faz:</strong> Deleta stories que já passaram de
                  24 horas (expiraram) e suas visualizações associadas do banco
                  de dados.
                </p>
                <p>
                  <strong>Como executar:</strong> Clique no botão{" "}
                  <strong>"Limpar Stories Antigos"</strong> acima.
                </p>
                <p>
                  <strong>Quando executar:</strong> Execute algumas vezes ao dia
                  (manhã, tarde, noite) para manter o banco de dados limpo.
                </p>
                <div className="p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg mt-2">
                  <p className="text-xs text-success-700 dark:text-success-300">
                    ✅ <strong>Resultado esperado:</strong> Você verá a
                    quantidade de stories deletados e os IDs dos stories
                    removidos.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 5: Usuários Inativos */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold">
                  5
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Marcar Usuários Inativos como Indisponíveis
                </h3>
              </div>
              <div className="ml-10 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>O que faz:</strong> Identifica usuários que ficaram
                  mais de 1 semana (7 dias) sem acessar o site e marca o perfil
                  deles como indisponível (is_available = false). Isso afeta o
                  botão de disponibilidade no menu dropdown.
                </p>
                <p>
                  <strong>Como executar:</strong> Clique no botão{" "}
                  <strong>"Marcar Usuários Inativos"</strong> acima.
                </p>
                <p>
                  <strong>Quando executar:</strong> Execute diariamente ou
                  algumas vezes por semana para manter os perfis atualizados.
                </p>
                <p>
                  <strong>Critério de inatividade:</strong> Usuários que não
                  acessaram o site há mais de 7 dias (verifica last_login_at ou
                  updated_at).
                </p>
                <div className="p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg mt-2">
                  <p className="text-xs text-success-700 dark:text-success-300">
                    ✅ <strong>Resultado esperado:</strong> Você verá a
                    quantidade de usuários marcados como indisponíveis e os
                    detalhes de cada um (nome, email, dias inativo).
                  </p>
                </div>
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg mt-2">
                  <p className="text-xs text-primary-700 dark:text-primary-300">
                    ℹ️ <strong>Nota:</strong> Usuários podem voltar a ficar
                    disponíveis manualmente através do botão de disponibilidade
                    no menu dropdown.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 6: Monitoramento */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold">
                  6
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Monitorar Resultados
                </h3>
              </div>
              <div className="ml-10 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Notificações:</strong> Verifique se as notificações
                  foram criadas corretamente no app. Os usuários receberão
                  notificações quando seus posts premium estiverem expirando ou
                  expirados.
                </p>
                <p>
                  <strong>Stories:</strong> Verifique se os stories antigos
                  foram deletados. Stories que já passaram de 24 horas não devem
                  mais aparecer no app.
                </p>
                <p>
                  <strong>Usuários Inativos:</strong> Verifique se os usuários
                  inativos foram marcados como indisponíveis. Eles não
                  aparecerão como disponíveis para receber ofertas até que
                  voltem a acessar o site.
                </p>
                <p>
                  <strong>Logs:</strong> Os resultados de cada execução são
                  exibidos abaixo dos botões. Verifique se há erros ou avisos.
                </p>
              </div>
            </div>

            {/* Dica Final */}
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm text-primary-700 dark:text-primary-300">
                  <p className="font-semibold">💡 Dica:</p>
                  <p>
                    Para garantir que todas as tarefas sejam executadas em tempo
                    hábil, execute os cron jobs manualmente algumas vezes ao
                    dia:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>
                      <strong>Manhã (08:00):</strong> Executar notificações,
                      limpeza e usuários inativos
                    </li>
                    <li>
                      <strong>Tarde (14:00):</strong> Executar notificações e
                      limpeza
                    </li>
                    <li>
                      <strong>Noite (20:00):</strong> Executar notificações e
                      limpeza
                    </li>
                    <li>
                      <strong>Diariamente (uma vez):</strong> Executar usuários
                      inativos
                    </li>
                  </ul>
                  <p className="text-xs mt-2">
                    <strong>Nota:</strong> Como estamos usando o plano free da
                    Vercel, não podemos usar cron jobs automáticos. Por isso, a
                    execução manual é necessária.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Informações Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Notificações de Posts Premium
              </h3>
              <p>
                Cria notificações para posts premium que vão expirar nas
                próximas 24 horas e para posts premium que expiraram nas últimas
                24 horas. Execute algumas vezes ao dia para garantir que todas
                as notificações sejam criadas.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Limpeza de Stories
              </h3>
              <p>
                Deleta stories que já passaram de 24 horas (expiraram) do banco
                de dados. Isso ajuda a manter o banco limpo e reduzir o uso de
                armazenamento. Execute algumas vezes ao dia.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Usuários Inativos
              </h3>
              <p>
                Marca como indisponível usuários que ficaram mais de 1 semana (7
                dias) sem acessar o site. Isso afeta o botão de disponibilidade
                no menu dropdown. Execute diariamente ou algumas vezes por
                semana.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Frequência Recomendada
              </h3>
              <p>
                Execute manualmente algumas vezes ao dia (manhã, tarde, noite)
                para garantir que todas as tarefas sejam executadas em tempo
                hábil. Usuários inativos podem ser executados diariamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
