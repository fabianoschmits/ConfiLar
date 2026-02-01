"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  AlertTriangle,
  AlertCircle,
  User as UserIcon,
  MessageCircle,
  FileText,
  Flag,
  CheckCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Ban as BanIcon,
  Trash2,
  Star,
  ShoppingBag,
  Key,
} from "lucide-react";
import { AdminPageHeader } from "@/components/gestao-confi/AdminPageHeader";
import { ResponsiveTable } from "@/components/gestao-confi/ResponsiveTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// --- Interfaces ---

interface Report {
  id: string;
  type: string;
  reason: string;
  description: string;
  status: string;
  priority: string;
  reporter_id: string;
  reported_user_id?: string;
  reported_post_id?: string;
  created_at: string;
  reporter?: {
    full_name: string;
    email: string;
  };
  reported_user?: {
    full_name: string;
    email: string;
  };
  [key: string]: any; // Allow other fields
}

interface Ban {
  id: string;
  user_id: string;
  reason: string;
  ban_type: string;
  duration_days?: number;
  is_active: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface ReportStats {
  total: number;
  pending: number;
  resolved: number;
  dismissed: number;
}

// --- Main Component ---

export default function ModerationPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("reports");

  // Credentials
  const [serviceRoleKey, setServiceRoleKey] = useState<string>("");
  const [showServiceRoleKey, setShowServiceRoleKey] = useState(false);
  const [adminSupabase, setAdminSupabase] = useState<SupabaseClient | null>(
    null,
  );

  // Data
  const [reports, setReports] = useState<Report[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");

  // --- Effects ---

  useEffect(() => {
    if (serviceRoleKey.trim() && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const trimmedKey = serviceRoleKey.trim();
      if (trimmedKey.split(".").length === 3) {
        setAdminSupabase(
          createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, trimmedKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          }),
        );
      }
    } else {
      setAdminSupabase(null);
    }
  }, [serviceRoleKey]);

  useEffect(() => {
    if (adminSupabase) {
      if (activeTab === "reports") {
        fetchReports();
        fetchStats();
      } else {
        fetchBans();
      }
    }
  }, [activeTab, adminSupabase]);

  // --- Fetch Logic ---

  const fetchReports = async () => {
    if (!adminSupabase) return;
    setLoading(true);
    try {
      const { data, error } = await adminSupabase
        .from("reports")
        .select(
          `
          *,
          reporter:reporter_id(full_name, email),
          reported_user:reported_user_id(full_name, email)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setReports(data || []);
    } catch (e: any) {
      toast.error("Erro ao buscar denúncias: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBans = async () => {
    if (!adminSupabase) return;
    setLoading(true);
    try {
      const { data, error } = await adminSupabase
        .from("user_bans")
        .select(
          `
            *,
            profiles:user_id(full_name, email)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBans(data || []);
    } catch (e: any) {
      toast.error("Erro ao buscar banimentos");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!adminSupabase) return;
    const { data } = await adminSupabase.from("reports").select("status");
    if (data) {
      setReportStats({
        total: data.length,
        pending: data.filter((r) => r.status === "pending").length,
        resolved: data.filter((r) => r.status === "resolved").length,
        dismissed: data.filter((r) => r.status === "dismissed").length,
      });
    }
  };

  const createTestReports = async () => {
    if (!adminSupabase) return;
    try {
      await adminSupabase.from("reports").insert({
        type: "user",
        reason: "Teste de Moderação",
        description: "Esta é uma denúncia de teste criada automaticamente.",
        priority: "medium",
        reporter_id: user?.id,
        status: "pending",
      });
      toast.success("Denúncia de teste criada!");
      fetchReports();
    } catch (e) {
      toast.error("Erro ao criar teste");
    }
  };

  // --- Render Helpers ---

  const getPriorityBadge = (priority: string) => {
    const colors: any = {
      urgent: "destructive",
      high: "orange", // custom class needed usually, defaulting to destructive for now
      medium: "secondary",
      low: "outline",
    };
    return <Badge variant={colors[priority] || "outline"}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: "warning", // yellow
      resolved: "success", // green
      dismissed: "secondary",
    };
    // Using default classes for simplicity in this artifact
    let className = "bg-gray-100 text-gray-800";
    if (status === "pending") className = "bg-yellow-100 text-yellow-800";
    if (status === "resolved") className = "bg-green-100 text-green-800";

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}
      >
        {status}
      </span>
    );
  };

  // --- Columns ---

  const reportColumns = [
    {
      header: "Tipo/Prioridade",
      cell: (r: Report) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium flex items-center gap-1">
            {r.type === "user" ? <UserIcon size={14} /> : <Flag size={14} />}{" "}
            {r.type}
          </span>
          {getPriorityBadge(r.priority)}
        </div>
      ),
    },
    {
      header: "Descrição",
      accessorKey: "description",
      cell: (r: Report) => (
        <span
          className="text-sm text-muted-foreground truncate max-w-[200px] block"
          title={r.description}
        >
          {r.description}
        </span>
      ),
    },
    {
      header: "Denunciado",
      cell: (r: Report) => (
        <div className="flex flex-col text-sm">
          <span className="font-medium">
            {r.reported_user?.full_name || "N/A"}
          </span>
          <span className="text-xs text-muted-foreground">
            {r.reported_user?.email}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (r: Report) => getStatusBadge(r.status),
    },
    {
      header: "Data",
      cell: (r: Report) => format(new Date(r.created_at), "dd/MM HH:mm"),
    },
  ];

  const banColumns = [
    {
      header: "Usuário",
      cell: (b: Ban) => (
        <div>
          <p className="font-medium">{b.profiles?.full_name}</p>
          <p className="text-xs text-muted-foreground">{b.profiles?.email}</p>
        </div>
      ),
    },
    {
      header: "Motivo",
      accessorKey: "reason" as keyof Ban,
      cell: (b: Ban) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {b.reason}
        </span>
      ),
    },
    {
      header: "Tipo",
      accessorKey: "ban_type" as keyof Ban,
      cell: (b: Ban) => (
        <Badge
          variant={b.ban_type === "permanent" ? "destructive" : "secondary"}
        >
          {b.ban_type}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (b: Ban) =>
        b.is_active ? (
          <Badge className="bg-green-500">Ativo</Badge>
        ) : (
          <Badge variant="outline">Inativo</Badge>
        ),
    },
  ];

  // --- Mobile Cards ---

  const renderReportCard = (r: Report) => (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex gap-2 items-center">
          {getPriorityBadge(r.priority)}
          <span className="font-bold text-sm capitalize">{r.type}</span>
        </div>
        {getStatusBadge(r.status)}
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {r.description}
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <UserIcon size={12} />
        <span>Denunciado: {r.reported_user?.full_name || "N/A"}</span>
      </div>
      <div className="pt-2 flex justify-end">
        <Button variant="outline" size="sm">
          Ver Detalhes
        </Button>
      </div>
    </div>
  );

  const renderBanCard = (b: Ban) => (
    <div className="bg-card border rounded-lg p-4 space-y-2">
      <div className="flex justify-between">
        <span className="font-bold">{b.profiles?.full_name}</span>
        {b.is_active ? (
          <Badge className="bg-green-500">Ativo</Badge>
        ) : (
          <Badge variant="outline">Inativo</Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{b.profiles?.email}</p>
      <Badge variant={b.ban_type === "permanent" ? "destructive" : "secondary"}>
        {b.ban_type}
      </Badge>
      <p className="text-sm bg-muted p-2 rounded text-muted-foreground">
        {b.reason}
      </p>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <AdminPageHeader
        title="Moderação"
        description="Gestão de denúncias e segurança."
      >
        <div className="flex gap-2">
          {!adminSupabase && (
            <div className="flex items-center gap-2 max-w-xs">
              <Input
                type="password"
                placeholder="Service Key..."
                className="h-8 text-xs font-mono"
                value={serviceRoleKey}
                onChange={(e) => setServiceRoleKey(e.target.value)}
              />
            </div>
          )}
          {adminSupabase && (
            <Button
              size="sm"
              variant="outline"
              onClick={createTestReports}
              className="hidden sm:flex"
            >
              <Flag className="w-3 h-3 mr-1" /> Teste
            </Button>
          )}
        </div>
      </AdminPageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">
            Denúncias
            {reportStats && reportStats.pending > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]"
              >
                {reportStats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bans">Banimentos</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {!adminSupabase ? (
            <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-4">
                <Key className="h-10 w-10 text-yellow-600" />
                <div>
                  <h3 className="font-bold text-lg text-yellow-800 dark:text-yellow-500">
                    Credenciais Necessárias
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-600 max-w-md mx-auto">
                    Para acessar os dados sensíveis de moderação, insira a{" "}
                    <strong>Service Role Key</strong> na barra superior.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <TabsContent value="reports">
                <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
                  {/* Stats */}
                  <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0">
                    <div className="border rounded px-4 py-2 min-w-[100px] text-center">
                      <div className="text-2xl font-bold">
                        {reportStats?.total || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div className="border rounded px-4 py-2 min-w-[100px] text-center bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-700">
                        {reportStats?.pending || 0}
                      </div>
                      <div className="text-xs text-yellow-700">Pendentes</div>
                    </div>
                    <div className="border rounded px-4 py-2 min-w-[100px] text-center bg-green-50 dark:bg-green-900/10 border-green-200">
                      <div className="text-2xl font-bold text-green-700">
                        {reportStats?.resolved || 0}
                      </div>
                      <div className="text-xs text-green-700">Resolvidas</div>
                    </div>
                  </div>
                </div>

                <ResponsiveTable
                  data={reports}
                  columns={reportColumns}
                  renderMobileCard={renderReportCard}
                  keyExtractor={(r) => r.id}
                  isLoading={loading}
                  emptyMessage="Nenhuma denúncia encontrada."
                />
              </TabsContent>

              <TabsContent value="bans">
                <div className="mb-4">
                  <Input
                    placeholder="Buscar banimentos..."
                    className="max-w-sm"
                    onChange={(e) => {
                      /* Client-side filter could be added here similar to before */
                    }}
                  />
                </div>
                <ResponsiveTable
                  data={bans}
                  columns={banColumns}
                  renderMobileCard={renderBanCard}
                  keyExtractor={(b) => b.id}
                  isLoading={loading}
                  emptyMessage="Nenhum banimento registrado."
                />
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
}
