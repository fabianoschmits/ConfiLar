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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Settings,
  Database,
  Server,
  Shield,
  Key,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface SystemInfo {
  supabaseUrl: string;
  environment: string;
  version: string;
  databaseSize: number;
  activeConnections: number;
  cacheHitRate: number;
}

export default function AdminSystemPage() {
  const { user } = useAuthContext();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<
    "healthy" | "warning" | "error"
  >("healthy");

  useEffect(() => {
    fetchSystemInfo();
    checkHealth();
  }, []);

  const fetchSystemInfo = async () => {
    setLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const environment = process.env.NODE_ENV || "development";

      // Buscar informações do banco
      let dbInfo = null;
      try {
        const result = await supabase.rpc("get_database_size");
        dbInfo = result.data;
      } catch (error) {
        // Função RPC pode não existir, ignorar erro
        console.log("Função get_database_size não disponível");
      }

      // Estatísticas básicas
      const [postsCount, usersCount] = await Promise.all([
        supabase.from("feed_posts").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);

      setSystemInfo({
        supabaseUrl,
        environment,
        version: "5.0.0",
        databaseSize: dbInfo?.size || 0,
        activeConnections: 0, // Não disponível via API pública
        cacheHitRate: 0, // Não disponível via API pública
      });
    } catch (error) {
      console.error("Erro ao buscar informações do sistema:", error);
      toast.error("Erro ao carregar informações do sistema");
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      // Verificar conexão com Supabase
      const { error } = await supabase.from("profiles").select("id").limit(1);

      if (error) {
        setHealthStatus("error");
        return;
      }

      // Verificar se há erros recentes
      const { count } = await supabase
        .from("system_logs")
        .select("*", { count: "exact", head: true })
        .eq("level", "ERROR")
        .gte(
          "created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        );

      if ((count || 0) > 10) {
        setHealthStatus("warning");
      } else {
        setHealthStatus("healthy");
      }
    } catch (error) {
      setHealthStatus("error");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Configurações do Sistema
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Informações e configurações gerais do sistema
        </p>
      </div>

      {/* Status de Saúde */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge
              variant={
                healthStatus === "healthy"
                  ? "default"
                  : healthStatus === "warning"
                    ? "secondary"
                    : "destructive"
              }
              className="text-lg px-4 py-2"
            >
              {healthStatus === "healthy" && (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {healthStatus === "warning" && (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              {healthStatus === "error" && (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              {healthStatus === "healthy"
                ? "Saudável"
                : healthStatus === "warning"
                  ? "Atenção"
                  : "Erro"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                checkHealth();
                fetchSystemInfo();
              }}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="database">Banco de Dados</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="environment">Ambiente</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemInfo && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Versão</p>
                      <p className="font-semibold">{systemInfo.version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ambiente</p>
                      <Badge
                        variant={
                          systemInfo.environment === "production"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {systemInfo.environment}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">URL do Supabase</p>
                    <p className="font-mono text-sm break-all">
                      {systemInfo.supabaseUrl}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Banco de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemInfo && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Tamanho Aproximado
                      </p>
                      <p className="font-semibold">
                        {formatBytes(systemInfo.databaseSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Conexões Ativas</p>
                      <p className="font-semibold">
                        {systemInfo.activeConnections || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Taxa de Cache</p>
                    <p className="font-semibold">
                      {systemInfo.cacheHitRate > 0
                        ? `${systemInfo.cacheHitRate}%`
                        : "N/A"}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Content Security Policy</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rate Limiting</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Validação de Entrada</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sanitização HTML</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Validação de Arquivos</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Variáveis de Ambiente
              </CardTitle>
              <CardDescription>
                Variáveis configuradas (valores sensíveis não são exibidos)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">NODE_ENV:</span>
                  <span>{process.env.NODE_ENV || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    NEXT_PUBLIC_SUPABASE_URL:
                  </span>
                  <span>
                    {process.env.NEXT_PUBLIC_SUPABASE_URL
                      ? "✓ Configurado"
                      : "✗ Não configurado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    SUPABASE_SERVICE_ROLE_KEY:
                  </span>
                  <span>
                    {process.env.SUPABASE_SERVICE_ROLE_KEY
                      ? "✓ Configurado"
                      : "✗ Não configurado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ABACATEPAY_API_KEY:</span>
                  <span>
                    {process.env.ABACATEPAY_API_KEY
                      ? "✓ Configurado"
                      : "✗ Não configurado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">CRON_SECRET:</span>
                  <span>
                    {process.env.CRON_SECRET
                      ? "✓ Configurado"
                      : "✗ Não configurado"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
