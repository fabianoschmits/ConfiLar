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
    return isActive ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Ativo" : "Desbanido";
  };

  const getBanTypeColor = (type: string) => {
    switch (type) {
      case "permanent":
        return "bg-red-100 text-red-800";
      case "temporary":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gerenciamento de Banimentos
        </h2>
        <Button
          variant="outline"
          onClick={() => {
            fetchBans();
            fetchInvestigations();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="expired">Expirados</SelectItem>
                  <SelectItem value="revoked">Revogados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  id="search"
                  placeholder="Buscar por nome..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="investigations"
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Investigados ({filteredInvestigations.length})
          </TabsTrigger>
          <TabsTrigger value="bans" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            Banidos ({filteredBans.length})
          </TabsTrigger>
          <TabsTrigger value="revoked" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Revogados ({bans.filter((b) => !b.is_active).length})
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
                      className="border-l-4 border-l-yellow-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">
                                {investigation.user.full_name}
                              </span>
                              <Badge variant="outline">
                                {investigation.user.user_type}
                              </Badge>
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Em Investigação
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-600 mb-2">
                              {investigation.user.email}
                            </p>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">
                                  Total de Denúncias:
                                </span>
                                <span className="ml-2 text-red-600">
                                  {investigation.total_reports}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Pendentes:</span>
                                <span className="ml-2 text-yellow-600">
                                  {investigation.pending_reports}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Em Revisão:</span>
                                <span className="ml-2 text-blue-600">
                                  {investigation.reviewing_reports}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">
                                Resumo das Denúncias:
                              </p>
                              <div className="space-y-2">
                                {investigation.reports
                                  .slice(0, 3)
                                  .map((report, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-gray-50 p-2 rounded text-xs"
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <Flag className="h-3 w-3" />
                                        <span className="font-medium">
                                          {report.type}
                                        </span>
                                        <Badge
                                          className={
                                            report.status === "pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-blue-100 text-blue-800"
                                          }
                                        >
                                          {report.status}
                                        </Badge>
                                      </div>
                                      <p className="text-gray-600">
                                        {report.description}
                                      </p>
                                    </div>
                                  ))}
                                {investigation.reports.length > 3 && (
                                  <p className="text-xs text-gray-500">
                                    +{investigation.reports.length - 3} mais
                                    denúncias...
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(investigation);
                                setShowBanModal(true);
                              }}
                            >
                              <Ban className="h-4 w-4 mr-2" />
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
                <div className="space-y-4">
                  {filteredBans.map((ban) => (
                    <div
                      key={ban.id}
                      className="border-l-4 border-l-red-500 bg-white dark:bg-gray-900 rounded-lg shadow cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors p-4"
                      onClick={() => {
                        console.log("Card clicked:", ban.id);
                        handleBanClick(ban);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <UserX className="h-4 w-4" />
                            <span className="font-medium">
                              {ban.profiles.full_name}
                            </span>
                            <Badge variant="outline">
                              {ban.profiles.user_type}
                            </Badge>
                            <Badge className={getStatusColor(ban.is_active)}>
                              {getStatusText(ban.is_active)}
                            </Badge>
                            <Badge className={getBanTypeColor(ban.ban_type)}>
                              {ban.ban_type}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {ban.profiles.email}
                          </p>

                          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                            <div>
                              <span className="font-medium">Motivo:</span>
                              <span className="ml-2">{ban.reason}</span>
                            </div>
                            <div>
                              <span className="font-medium">Banido em:</span>
                              <span className="ml-2">
                                {new Date(ban.created_at).toLocaleString()}
                              </span>
                            </div>
                            {ban.expires_at && (
                              <div>
                                <span className="font-medium">Expira em:</span>
                                <span className="ml-2">
                                  {new Date(ban.expires_at).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {ban.duration_days && (
                              <div>
                                <span className="font-medium">Duração:</span>
                                <span className="ml-2">
                                  {ban.duration_days} dias
                                </span>
                              </div>
                            )}
                          </div>

                          {ban.admin_notes && (
                            <div className="bg-gray-50 p-2 rounded text-xs">
                              <span className="font-medium">
                                Notas Administrativas:
                              </span>
                              <p className="text-gray-600">{ban.admin_notes}</p>
                            </div>
                          )}
                        </div>

                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Ver Detalhes clicked");
                              handleBanClick(ban);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                          {ban.is_active && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnbanClick(ban);
                              }}
                              className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Desbanir
                            </Button>
                          )}
                          {!ban.is_active && (
                            <Badge className="bg-green-100 text-green-800">
                              Desbanido
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Revogados */}
        <TabsContent value="revoked">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Banimentos Revogados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bans.filter((b) => !b.is_active).length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum banimento revogado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bans
                    .filter((b) => !b.is_active)
                    .map((ban) => (
                      <Card
                        key={ban.id}
                        className="border-l-4 border-l-green-500"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4" />
                                <span className="font-medium">
                                  {ban.profiles.full_name}
                                </span>
                                <Badge variant="outline">
                                  {ban.profiles.user_type}
                                </Badge>
                                <Badge className="bg-green-100 text-green-800">
                                  Revogado
                                </Badge>
                              </div>

                              <p className="text-sm text-gray-600 mb-2">
                                {ban.profiles.email}
                              </p>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">
                                    Motivo Original:
                                  </span>
                                  <span className="ml-2">{ban.reason}</span>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Revogado em:
                                  </span>
                                  <span className="ml-2">
                                    {new Date(
                                      ban.updated_at || ban.created_at,
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>
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
              <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded border border-blue-200 dark:border-blue-800">
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
