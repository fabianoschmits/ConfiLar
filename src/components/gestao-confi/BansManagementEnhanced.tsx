"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ban,
  UserX,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Filter,
  User,
  MessageCircle,
  Flag,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Ban {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  ban_type: "temporary" | "permanent";
  duration_days?: number;
  is_active: boolean;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
  expires_at?: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    user_type: string;
    avatar_url?: string;
  };
}

interface Investigation {
  user: {
    id: string;
    full_name: string;
    email: string;
    user_type: string;
    avatar_url?: string;
  };
  reports: Array<{
    id: string;
    type: string;
    reason: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
  }>;
  total_reports: number;
  pending_reports: number;
  reviewing_reports: number;
  last_report_date: string;
}

export function BansManagementEnhanced() {
  const [activeTab, setActiveTab] = useState("investigations");
  const [bans, setBans] = useState<Ban[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Investigation | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [banToUnban, setBanToUnban] = useState<Ban | null>(null);
  const [showBanDetailsModal, setShowBanDetailsModal] = useState(false);
  const [selectedBan, setSelectedBan] = useState<Ban | null>(null);
  const [banAdminInfo, setBanAdminInfo] = useState<any>(null);
  const [banForm, setBanForm] = useState({
    reason: "",
    ban_type: "temporary" as "temporary" | "permanent",
    duration_days: 7,
    admin_notes: "",
  });
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  const fetchBans = async () => {
    try {
      const response = await fetch("/api/gestao-confi/bans");
      if (!response.ok) throw new Error("Erro ao buscar banimentos");

      const { bans } = await response.json();
      setBans(bans);
    } catch (error) {
      console.error("Erro ao buscar banimentos:", error);
      toast.error("Erro ao carregar banimentos");
    }
  };

  const fetchInvestigations = async () => {
    try {
      const response = await fetch("/api/gestao-confi/investigations");
      if (!response.ok) throw new Error("Erro ao buscar investigações");

      const { investigations } = await response.json();
      setInvestigations(investigations);
    } catch (error) {
      console.error("Erro ao buscar investigações:", error);
      toast.error("Erro ao carregar investigações");
    }
  };

  const banUser = async (userId: string) => {
    if (!banForm.reason.trim()) {
      toast.error("Preencha o motivo do banimento");
      return;
    }

    try {
      const response = await fetch("/api/gestao-confi/bans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          reason: banForm.reason,
          banType: banForm.ban_type,
          durationDays: banForm.duration_days,
          adminNotes: banForm.admin_notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao banir usuário");
      }

      toast.success("Usuário banido com sucesso");
      setShowBanModal(false);
      setBanForm({
        reason: "",
        ban_type: "temporary",
        duration_days: 7,
        admin_notes: "",
      });
      fetchBans();
    } catch (error) {
      console.error("Erro ao banir usuário:", error);
      toast.error("Erro ao banir usuário");
    }
  };

  const revokeBan = async (banId: string) => {
    try {
      const response = await fetch("/api/gestao-confi/bans", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          banId,
          status: "revoked",
          adminNotes: "Banimento revogado pelo administrador",
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao revogar banimento");
      }

      toast.success("Usuário desbanido com sucesso");
      setShowUnbanModal(false);
      setBanToUnban(null);
      fetchBans();
    } catch (error) {
      console.error("Erro ao revogar banimento:", error);
      toast.error("Erro ao desbanir usuário");
    }
  };

  const handleBanClick = async (ban: Ban) => {
    setSelectedBan(ban);
    setShowBanDetailsModal(true);

    // Fetch admin info who created the ban
    if (ban.banned_by) {
      try {
        const response = await fetch(
          `/api/gestao-confi/bans?adminId=${ban.banned_by}`,
        );
        if (response.ok) {
          const data = await response.json();
          setBanAdminInfo(data.admin);
        }
      } catch (error) {
        console.error("Erro ao buscar informações do admin:", error);
      }
    }
  };

  const handleCloseBanDetails = () => {
    setShowBanDetailsModal(false);
    setSelectedBan(null);
    setBanAdminInfo(null);
  };

  const handleUnbanClick = (ban: Ban) => {
    setBanToUnban(ban);
    setShowUnbanModal(true);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "destructive" : "success";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Ativo" : "Desbanido";
  };

  const getBanTypeColor = (type: string) => {
    switch (type) {
      case "permanent":
        return "destructive";
      case "temporary":
        return "warning";
      default:
        return "secondary";
    }
  };

  const filteredBans = bans.filter((ban) => {
    if (filters.status !== "all") {
      if (filters.status === "active" && !ban.is_active) return false;
      if (filters.status === "revoked" && ban.is_active) return false;
    }
    if (
      filters.search &&
      ban.profiles &&
      !ban.profiles.full_name
        .toLowerCase()
        .includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  const filteredInvestigations = investigations.filter((inv) => {
    if (
      filters.search &&
      !inv.user.full_name.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  useEffect(() => {
    fetchBans();
    fetchInvestigations();
  }, []);

  useEffect(() => {
    console.log("🔍 Total de banimentos:", bans.length);
    console.log("🔍 Banimentos filtrados:", filteredBans.length);
    console.log("🔍 Dados dos banimentos:", bans);
  }, [bans, filteredBans]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Gestão de Banimentos
          </h2>
          <p className="text-xs text-muted-foreground">
            Controle de usuários banidos e investigações em andamento.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs font-bold"
          onClick={() => {
            fetchBans();
            fetchInvestigations();
          }}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card className="border-none shadow-sm bg-muted/5">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-8 h-8 text-[11px] rounded-lg border-muted bg-background"
                />
              </div>
            </div>

            <div className="w-[180px]">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger className="h-8 text-[11px] rounded-lg bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="revoked">Revogados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-muted/50 p-1 h-10 sm:h-12 rounded-xl">
          <TabsTrigger
            value="investigations"
            className="rounded-lg px-4 sm:px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 text-xs sm:text-[11px] font-bold"
          >
            <Shield className="h-3.5 w-3.5" />
            Investigados
            <Badge
              variant="secondary"
              className="ml-1 px-1 py-0 h-4 text-[9px] bg-muted/50"
            >
              {filteredInvestigations.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="bans"
            className="rounded-lg px-4 sm:px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 text-xs sm:text-[11px] font-bold"
          >
            <Ban className="h-3.5 w-3.5" />
            Banidos Ativos
            <Badge
              variant="secondary"
              className="ml-1 px-1 py-0 h-4 text-[9px] bg-muted/50"
            >
              {filteredBans.filter((b) => b.is_active).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="revoked"
            className="rounded-lg px-4 sm:px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 text-xs sm:text-[11px] font-bold"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Histórico/Revogados
            <Badge
              variant="secondary"
              className="ml-1 px-1 py-0 h-4 text-[9px] bg-muted/50"
            >
              {bans.filter((b) => !b.is_active).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Aba de Investigados */}
        <TabsContent value="investigations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Usuários Investigados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredInvestigations.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Nenhum usuário em investigação
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInvestigations.map((investigation) => (
                    <Card
                      key={investigation.user.id}
                      className="border-none shadow-sm overflow-hidden hover:border-primary/30 transition-all rounded-xl border border-border/50"
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                              {investigation.user.avatar_url ? (
                                <img
                                  src={investigation.user.avatar_url}
                                  className="w-7 h-7 rounded-full border border-border shadow-xs"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
                                  <User className="h-3.5 w-3.5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <h3 className="font-bold text-[13px] truncate">
                                  {investigation.user.full_name}
                                </h3>
                                <p className="text-[9px] text-muted-foreground truncate">
                                  {investigation.user.email}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[8px] px-1.5 py-0 h-3.5 ml-0.5"
                              >
                                {investigation.user.user_type}
                              </Badge>
                              <Badge className="text-[8px] px-1.5 py-0 h-3.5 bg-yellow-500/10 text-yellow-600 border-yellow-200">
                                ANÁLISE
                              </Badge>
                            </div>

                            <div className="flex gap-3 text-[10px] mt-1.5 mb-2.5 bg-muted/20 p-1.5 rounded-lg border border-border/30">
                              <div className="flex flex-col">
                                <span className="text-muted-foreground font-medium uppercase text-[8px] tracking-tight">
                                  Total
                                </span>
                                <span className="font-black text-red-600 leading-none">
                                  {investigation.total_reports}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-muted-foreground font-medium uppercase text-[8px] tracking-tight">
                                  Pend.
                                </span>
                                <span className="font-black text-yellow-600 leading-none">
                                  {investigation.pending_reports}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-muted-foreground font-medium uppercase text-[8px] tracking-tight">
                                  Última
                                </span>
                                <span className="font-bold leading-none">
                                  {investigation.last_report_date
                                    ? format(
                                        new Date(
                                          investigation.last_report_date,
                                        ),
                                        "dd/MM",
                                      )
                                    : "---"}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              {investigation.reports
                                .slice(0, 2)
                                .map((report, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-muted/10 p-2 rounded-lg border border-border/20 text-xs flex flex-col gap-0.5"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <Flag className="h-3 w-3 text-primary/60" />
                                      <span className="font-bold text-[10px] uppercase">
                                        {report.type}
                                      </span>
                                      <span className="text-[9px] text-muted-foreground uppercase ml-auto">
                                        {format(
                                          new Date(report.created_at),
                                          "dd MMM HH:mm",
                                          { locale: ptBR },
                                        )}
                                      </span>
                                    </div>
                                    <p className="text-muted-foreground italic text-[11px] line-clamp-1">
                                      "{report.description}"
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                              onClick={() => {
                                setSelectedUser(investigation);
                                setShowBanModal(true);
                              }}
                            >
                              <Ban className="h-3.5 w-3.5 mr-1.5" />
                              Banir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Banidos */}
        <TabsContent value="bans">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5" />
                Usuários Banidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredBans.length === 0 ? (
                <div className="text-center py-8">
                  <Ban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum usuário banido</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {filteredBans.map((ban) => (
                    <Card
                      key={ban.id}
                      className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer group rounded-xl border-border/50"
                      onClick={() => handleBanClick(ban)}
                    >
                      <div className="flex items-center p-3 sm:p-4 gap-3 sm:gap-4">
                        <div className="relative shrink-0">
                          {ban.profiles?.avatar_url ? (
                            <img
                              src={ban.profiles.avatar_url}
                              alt={ban.profiles.full_name}
                              className="w-8 h-8 sm:w-11 sm:h-11 rounded-full object-cover shadow-sm border border-border"
                            />
                          ) : (
                            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground border border-border shadow-sm">
                              <UserX className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <Badge
                              variant={getStatusColor(ban.is_active)}
                              className="text-[8px] sm:text-[10px] uppercase font-bold px-1.5 h-3.5 sm:h-4"
                            >
                              {getStatusText(ban.is_active)}
                            </Badge>
                            <Badge
                              variant={getBanTypeColor(ban.ban_type)}
                              className="text-[8px] sm:text-[10px] uppercase font-bold px-1.5 h-3.5 sm:h-4"
                            >
                              {ban.ban_type === "permanent"
                                ? "PERMANENTE"
                                : "TEMPORÁRIO"}
                            </Badge>
                          </div>
                          <h4 className="font-bold text-[12px] sm:text-sm truncate">
                            {ban.profiles?.full_name}
                          </h4>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                              {ban.profiles?.email}
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-1">
                              <span className="font-medium">Motivo:</span>{" "}
                              {ban.reason}
                            </p>
                          </div>
                        </div>

                        <div className="hidden sm:flex flex-col items-end gap-1">
                          {ban.expires_at ? (
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Expira{" "}
                              {format(new Date(ban.expires_at), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-[9px]">
                              VITALÍCIO
                            </Badge>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revoked">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 space-y-4">
              {bans.filter((b) => !b.is_active).length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-sm font-medium">
                      Nenhum banimento revogado no momento.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {bans
                    .filter((b) => !b.is_active)
                    .map((ban) => (
                      <Card
                        key={ban.id}
                        className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer group rounded-xl border-border/50"
                        onClick={() => handleBanClick(ban)}
                      >
                        <div className="flex items-center p-3 sm:p-4 gap-3 sm:gap-4">
                          <div className="relative shrink-0">
                            {ban.profiles?.avatar_url ? (
                              <img
                                src={ban.profiles.avatar_url}
                                alt={ban.profiles.full_name}
                                className="w-8 h-8 sm:w-11 sm:h-11 rounded-full object-cover shadow-sm border border-border"
                              />
                            ) : (
                              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground border border-border shadow-sm">
                                <User className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <Badge
                                variant="success"
                                className="text-[8px] sm:text-[10px] uppercase font-bold px-1.5 h-3.5 sm:h-4"
                              >
                                HISTÓRICO
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-[8px] sm:text-[10px] uppercase font-bold px-1.5 h-3.5 sm:h-4"
                              >
                                REVOGADO
                              </Badge>
                            </div>
                            <h4 className="font-bold text-[13px] sm:text-sm truncate">
                              {ban.profiles?.full_name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {ban.profiles?.email} • Revogado em{" "}
                              {format(
                                new Date(ban.updated_at || ban.created_at),
                                "dd/MM/yy",
                                { locale: ptBR },
                              )}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Banimento */}
      {/* Modal de Banimento */}
      <ResponsiveModal
        isOpen={showBanModal}
        onOpenChange={setShowBanModal}
        title="Banir Usuário"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">
                Usuário: {selectedUser.user.full_name}
              </h3>
              <p className="text-sm text-yellow-700">
                Email: {selectedUser.user.email}
              </p>
              <p className="text-sm text-yellow-700">
                Total de Denúncias: {selectedUser.total_reports}
              </p>
            </div>

            <div>
              <Label htmlFor="ban-reason">Motivo do Banimento</Label>
              <Textarea
                id="ban-reason"
                value={banForm.reason}
                onChange={(e) =>
                  setBanForm({ ...banForm, reason: e.target.value })
                }
                placeholder="Descreva o motivo do banimento..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="ban-type">Tipo de Banimento</Label>
              <Select
                value={banForm.ban_type}
                onValueChange={(value: "temporary" | "permanent") =>
                  setBanForm({ ...banForm, ban_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temporary">Temporário</SelectItem>
                  <SelectItem value="permanent">Permanente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {banForm.ban_type === "temporary" && (
              <div>
                <Label htmlFor="ban-duration">Duração (dias)</Label>
                <Input
                  id="ban-duration"
                  type="number"
                  value={banForm.duration_days}
                  onChange={(e) =>
                    setBanForm({
                      ...banForm,
                      duration_days: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max="365"
                />
              </div>
            )}

            <div>
              <Label htmlFor="ban-notes">Notas Administrativas</Label>
              <Textarea
                id="ban-notes"
                value={banForm.admin_notes}
                onChange={(e) =>
                  setBanForm({ ...banForm, admin_notes: e.target.value })
                }
                placeholder="Notas internas sobre o banimento..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (selectedUser.user.id) {
                    banUser(selectedUser.user.id);
                  }
                }}
                disabled={!banForm.reason.trim()}
              >
                Confirmar Banimento
              </Button>
              <Button variant="outline" onClick={() => setShowBanModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </ResponsiveModal>

      {/* Modal de Confirmação para Desbanir */}
      {/* Modal de Confirmação para Desbanir */}
      <ResponsiveModal
        isOpen={showUnbanModal}
        onOpenChange={setShowUnbanModal}
        title={
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Desbanir Usuário</span>
          </div>
        }
      >
        {banToUnban && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">
                Usuário: {banToUnban.profiles?.full_name}
              </h3>
              <p className="text-sm text-green-700">
                Email: {banToUnban.profiles?.email}
              </p>
              <p className="text-sm text-green-700">
                Banido em: {new Date(banToUnban.created_at).toLocaleString()}
              </p>
              <p className="text-sm text-green-700">
                Motivo: {banToUnban.reason}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                ⚠️ Confirmação Necessária
              </p>
              <p className="text-sm text-yellow-700">
                Tem certeza que deseja desbanir este usuário? Ele terá acesso
                completo ao sistema novamente.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (banToUnban.id) {
                    revokeBan(banToUnban.id);
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar Desbanimento
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUnbanModal(false);
                  setBanToUnban(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </ResponsiveModal>

      {/* Modal de Detalhes do Banimento */}
      <ResponsiveModal
        isOpen={showBanDetailsModal}
        onOpenChange={handleCloseBanDetails}
        title={
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-600" />
            <span>Detalhes do Banimento</span>
          </div>
        }
      >
        {selectedBan && (
          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3 mb-3">
                {selectedBan.profiles.avatar_url && (
                  <img
                    src={selectedBan.profiles.avatar_url}
                    alt={selectedBan.profiles.full_name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-100">
                    {selectedBan.profiles.full_name}
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {selectedBan.profiles.email}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {selectedBan.profiles.user_type}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Ban Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Status</Label>
                <Badge className={getStatusColor(selectedBan.is_active)}>
                  {getStatusText(selectedBan.is_active)}
                </Badge>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Tipo</Label>
                <Badge className={getBanTypeColor(selectedBan.ban_type)}>
                  {selectedBan.ban_type === "permanent"
                    ? "Permanente"
                    : "Temporário"}
                </Badge>
              </div>
            </div>

            {/* Ban Details */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-500">
                  Motivo do Banimento
                </Label>
                <p className="text-sm mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  {selectedBan.reason}
                </p>
              </div>

              {selectedBan.admin_notes && (
                <div>
                  <Label className="text-xs text-gray-500">
                    Notas Administrativas
                  </Label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    {selectedBan.admin_notes}
                  </p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Timeline</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Criado em:</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(selectedBan.created_at).toLocaleString("pt-BR")}
                  </span>
                </div>

                {selectedBan.expires_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Expira em:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(selectedBan.expires_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                )}

                {selectedBan.duration_days && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Duração:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedBan.duration_days} dias
                    </span>
                  </div>
                )}

                {selectedBan.updated_at && !selectedBan.is_active && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Revogado em:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(selectedBan.updated_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Info */}
            {banAdminInfo && (
              <div className="bg-[var(--cl-mist)] dark:bg-blue-900/10 p-3 rounded border border-blue-200 dark:border-blue-800">
                <Label className="text-xs text-blue-700 dark:text-blue-300">
                  Banido por
                </Label>
                <div className="mt-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {banAdminInfo.full_name}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {banAdminInfo.email}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(selectedBan.id);
                  toast.success("ID do banimento copiado!");
                }}
              >
                Copiar ID
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(`/perfil/${selectedBan.user_id}`, "_blank");
                }}
              >
                <User className="h-4 w-4 mr-2" />
                Ver Perfil
              </Button>

              {selectedBan.is_active && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleCloseBanDetails();
                    handleUnbanClick(selectedBan);
                  }}
                  className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Desbanir
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseBanDetails}
                className="ml-auto"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
}
