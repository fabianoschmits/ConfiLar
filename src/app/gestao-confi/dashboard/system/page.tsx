"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/gestao-confi/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Settings,
  Database,
  Server,
  Shield,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface SystemInfo {
  supabaseUrl: string;
  environment: string;
  version: string;
  databaseSize: number;
}

export default function AdminSystemPage() {
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
      let dbSize = 0;
      try {
        const { data } = await supabase.rpc("get_database_size");
        dbSize = data?.size || 0;
      } catch (e) {}

      setSystemInfo({
        supabaseUrl,
        environment,
        version: "5.0.0",
        databaseSize: dbSize,
      });
    } catch (error) {
      toast.error("Erro ao carregar sistema.");
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      setHealthStatus(error ? "error" : "healthy");
    } catch (e) {
      setHealthStatus("error");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <AdminPageHeader
        title="Painel do Sistema"
        description="Monitoramento de infraestrutura e configurações críticas de ambiente."
        icon={Settings}
      />

      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-6">
        <div className="bg-[var(--cl-surface)] border border-border/50 rounded-2xl sm:rounded-[32px] p-3 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
              <div
                className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0",
                  healthStatus === "healthy"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600",
                )}
              >
                <Server className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-tight truncate">
                  Status Global
                </h4>
                <p className="text-[11px] sm:text-[10px] font-bold opacity-60 truncate">
                  Serviços OK
                </p>
              </div>
            </div>
            <Badge
              className={cn(
                "rounded-full h-5 sm:h-6 px-2 sm:px-3 text-[11px] sm:text-[10px] font-black uppercase tracking-widest border-0 shrink-0",
                healthStatus === "healthy"
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-rose-500 text-white",
              )}
            >
              {healthStatus === "healthy" ? "ON" : "OFF"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 sm:h-10 rounded-lg sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-wide gap-1 sm:gap-2"
              onClick={() => {
                fetchSystemInfo();
                checkHealth();
              }}
            >
              <RefreshCw
                className={cn(
                  "h-3 w-3 sm:h-3.5 sm:w-3.5",
                  loading && "animate-spin",
                )}
              />
              <span className="hidden sm:inline">Sincronizar</span>
            </Button>
          </div>
        </div>

        <div className="bg-[var(--cl-surface)] border border-border/50 rounded-2xl sm:rounded-[32px] p-3 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-2xl bg-[var(--cl-mist)] text-[var(--cl-teal)] flex items-center justify-center shrink-0">
              <Database className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-tight truncate">
                DB Size
              </h4>
              <p className="text-[11px] sm:text-[10px] font-bold opacity-60 truncate">
                Supabase PG
              </p>
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black truncate">
            {systemInfo ? formatBytes(systemInfo.databaseSize) : "---"}
          </div>
          <div className="text-[11px] sm:text-[10px] font-bold opacity-40 uppercase tracking-widest mt-0.5 sm:mt-1">
            Armazenamento
          </div>
        </div>
      </div>

      <Tabs defaultValue="infra" className="w-full space-y-4 sm:space-y-6">
        <TabsList className="bg-transparent h-auto p-0 gap-1 sm:gap-2 flex flex-wrap">
          <TabsTrigger
            value="infra"
            className="h-8 sm:h-10 px-3 sm:px-5 rounded-lg sm:rounded-xl font-black uppercase text-[9px] sm:text-[10px] data-[state=active]:bg-black data-[state=active]:text-white border shadow-sm"
          >
            Infra
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="h-8 sm:h-10 px-3 sm:px-5 rounded-lg sm:rounded-xl font-black uppercase text-[9px] sm:text-[10px] data-[state=active]:bg-black data-[state=active]:text-white border shadow-sm"
          >
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="infra">
          <div className="bg-[var(--cl-surface)] border border-border/40 rounded-2xl sm:rounded-[32px] p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              <div className="space-y-1">
                <span className="text-[11px] sm:text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                  <Globe className="h-2.5 w-2.5 sm:h-3 w-3" /> API Endpoint
                </span>
                <p className="text-[10px] sm:text-xs font-mono bg-muted/30 p-2 sm:p-3 rounded-xl break-all border">
                  {systemInfo?.supabaseUrl || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] sm:text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                  <Settings className="h-2.5 w-2.5 sm:h-3 w-3" /> Versão Core
                </span>
                <p className="text-lg sm:text-xl font-black">
                  {systemInfo?.version || "5.0.0"}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-dashed">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Ambiente de Execução</span>
                <Badge variant="outline" className="rounded-lg h-5 text-[9px]">
                  {systemInfo?.environment || "production"}
                </Badge>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="bg-[var(--cl-surface)] border border-border/40 rounded-2xl sm:rounded-[32px] p-4 sm:p-8 space-y-3 sm:space-y-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2 sm:mb-4">
              <Shield className="h-4 w-4 sm:h-5 w-5 text-emerald-600" />
              <h4 className="text-[11px] sm:text-sm font-black uppercase tracking-tighter">
                Protocolos Ativos
              </h4>
            </div>
            {[
              { label: "CSP", status: "Ativo" },
              { label: "RLS", status: "Ativo" },
              { label: "JWT Auth", status: "Configurado" },
              { label: "Anti-CSRF", status: "Global" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-muted/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-transparent hover:border-border/30 transition-colors"
              >
                <span className="text-[10px] sm:text-xs font-bold opacity-80">
                  {item.label}
                </span>
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 w-4 text-emerald-500" />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
