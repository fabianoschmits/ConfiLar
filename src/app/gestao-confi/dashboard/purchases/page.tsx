"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/gestao-confi/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveTable } from "@/components/gestao-confi/ResponsiveTable";
import { PurchaseDetailModal } from "@/components/gestao-confi/PurchaseDetailModal";

interface Purchase {
  id: string;
  user_id: string;
  package_id: string;
  amount_brl: number;
  points_received: number;
  payment_method: string;
  status: string;
  created_at: string;
  approved_at?: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  package: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Stats {
  totalRevenue: number;
  totalPurchases: number;
  purchasesByStatus: Record<string, number>;
  revenueByPaymentMethod: Record<string, number>;
  successRate: number;
  topPackages: any[];
  pendingCount: number;
}

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    payment_method: "all",
    search: "",
    page: 1,
    limit: 25,
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await fetch("/api/gestao-confi/purchases/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.payment_method && filters.payment_method !== "all")
        params.append("payment_method", filters.payment_method);
      if (filters.search) params.append("search", filters.search);
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/gestao-confi/purchases?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPurchases(data.purchases);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleRefresh = () => {
    fetchStats();
    fetchPurchases();
  };

  const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowDetailModal(true);
  };

  const handleModalClose = () => {
    setShowDetailModal(false);
    setSelectedPurchase(null);
    fetchPurchases();
    fetchStats();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      pending: { label: "Pendente", variant: "outline" },
      approved: { label: "Aprovado", variant: "default" },
      rejected: { label: "Rejeitado", variant: "destructive" },
      expired: { label: "Expirado", variant: "secondary" },
      refunded: { label: "Reembolsado", variant: "secondary" },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "outline" as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const columns = [
    {
      header: "ID",
      cell: (purchase: Purchase) => (
        <span className="font-mono text-xs">
          {purchase.id.substring(0, 8)}...
        </span>
      ),
    },
    {
      header: "Usuário",
      cell: (purchase: Purchase) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={purchase.user?.avatar_url} />
            <AvatarFallback>
              {purchase.user?.full_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {purchase.user?.full_name || "Sem nome"}
            </span>
            <span className="text-xs text-muted-foreground">
              {purchase.user?.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Pacote",
      cell: (purchase: Purchase) => (
        <span className="text-sm">{purchase.package?.name || "N/A"}</span>
      ),
    },
    {
      header: "Valor",
      cell: (purchase: Purchase) => (
        <span className="font-semibold">
          {formatCurrency(purchase.amount_brl)}
        </span>
      ),
    },
    {
      header: "Pontos",
      cell: (purchase: Purchase) => (
        <span className="text-sm">{purchase.points_received}</span>
      ),
    },
    {
      header: "Método",
      cell: (purchase: Purchase) => (
        <Badge variant="outline">{purchase.payment_method || "N/A"}</Badge>
      ),
    },
    {
      header: "Status",
      cell: (purchase: Purchase) => getStatusBadge(purchase.status),
    },
    {
      header: "Data",
      cell: (purchase: Purchase) => (
        <span className="text-xs text-muted-foreground">
          {format(new Date(purchase.created_at), "dd/MM/yy HH:mm", {
            locale: ptBR,
          })}
        </span>
      ),
    },
    {
      header: "Ações",
      cell: (purchase: Purchase) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleViewDetails(purchase)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalhes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "text-right",
    },
  ];

  const renderMobileCard = (purchase: Purchase) => (
    <div className="bg-card border rounded-lg p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={purchase.user?.avatar_url} />
            <AvatarFallback>
              {purchase.user?.full_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">
              {purchase.user?.full_name || "Sem nome"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {purchase.package?.name}
            </p>
          </div>
        </div>
        {getStatusBadge(purchase.status)}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Valor:</span>
          <p className="font-semibold">{formatCurrency(purchase.amount_brl)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Pontos:</span>
          <p className="font-semibold">{purchase.points_received}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
        <span>
          {format(new Date(purchase.created_at), "dd MMM yyyy HH:mm", {
            locale: ptBR,
          })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(purchase)}
          className="h-7 px-2"
        >
          Detalhes
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <AdminPageHeader
        title="Gerenciar Compras"
        description="Visualize e gerencie todas as compras de pontos da plataforma."
      >
        <Button size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </AdminPageHeader>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  Compras aprovadas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Compras
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.totalPurchases || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Todas as compras
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compras Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.pendingCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.pendingCount && stats.pendingCount > 0
                    ? "Requer atenção"
                    : "Tudo em dia"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Sucesso
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.successRate.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Compras aprovadas
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário ou ID..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value, page: 1 })
                }
                className="pl-8"
              />
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value, page: 1 })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.payment_method}
              onValueChange={(value) =>
                setFilters({ ...filters, payment_method: value, page: 1 })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Método de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchPurchases} disabled={loading}>
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <ResponsiveTable
        data={purchases}
        columns={columns}
        keyExtractor={(purchase) => purchase.id}
        renderMobileCard={renderMobileCard}
        isLoading={loading}
        emptyMessage="Nenhuma compra encontrada."
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {purchases.length} de {pagination.total} compras
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1 || loading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page >= pagination.totalPages || loading}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Purchase Detail Modal */}
      {selectedPurchase && (
        <PurchaseDetailModal
          purchaseId={selectedPurchase.id}
          open={showDetailModal}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
