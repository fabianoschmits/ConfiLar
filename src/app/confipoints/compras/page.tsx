"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  CreditCard,
  Coins,
  Package,
  ExternalLink,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePointsPurchases } from "@/hooks/useEconomy";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type PurchaseStatus =
  | "pending"
  | "processing"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded";

const statusConfig: Record<
  PurchaseStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pendente",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    icon: <Clock className="w-4 h-4" />,
  },
  processing: {
    label: "Processando",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
  },
  approved: {
    label: "Aprovado",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  rejected: {
    label: "Rejeitado",
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    icon: <XCircle className="w-4 h-4" />,
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    icon: <XCircle className="w-4 h-4" />,
  },
  refunded: {
    label: "Reembolsado",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    icon: <AlertCircle className="w-4 h-4" />,
  },
};

export default function ComprasPage() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { purchases, loading, refetch } = usePointsPurchases(user?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | "all">(
    "all",
  );
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState<string | null>(
    null,
  );

  // Filtrar compras
  const filteredPurchases =
    purchases?.filter((purchase) => {
      const matchesSearch =
        !searchTerm ||
        purchase.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (purchase.customer_data as any)?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (purchase.customer_data as any)?.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || purchase.status === statusFilter;

      return matchesSearch && matchesStatus;
    }) || [];

  // Estatísticas
  const stats = {
    total: purchases?.length || 0,
    approved: purchases?.filter((p) => p.status === "approved").length || 0,
    pending:
      purchases?.filter(
        (p) => p.status === "pending" || p.status === "processing",
      ).length || 0,
    totalSpent:
      purchases?.reduce((sum, p) => sum + (p.amount_brl || 0), 0) || 0,
    totalPoints:
      purchases?.reduce((sum, p) => sum + (p.points_received || 0), 0) || 0,
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      pix: "PIX",
      credit_card: "Cartão de Crédito",
      debit_card: "Cartão de Débito",
      boleto: "Boleto",
      bank_transfer: "Transferência Bancária",
    };
    return methods[method] || method.toUpperCase();
  };

  if (loading) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-200 dark:bg-gray-800 rounded"
                  ></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-black p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8" />
                Minhas Compras
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                Histórico completo de suas compras de ConfiPoints
              </p>
            </div>
            <Link href="/confipoints/comprar">
              <Button className="w-full sm:w-auto">
                <Package className="w-4 h-4 mr-2" />
                Nova Compra
              </Button>
            </Link>
          </div>

          {/* Estatísticas - Mobile: Lista compacta, Desktop: Cards */}
          <div className="sm:hidden">
            {/* Versão Mobile: Lista compacta */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3 space-y-2">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Total de Compras
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stats.total}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Aprovadas
                  </span>
                </div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {stats.approved}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Pendentes
                  </span>
                </div>
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  {stats.pending}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Total Gasto
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalSpent)}
                </span>
              </div>
            </div>
          </div>

          {/* Versão Desktop: Cards */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total de Compras
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stats.total}
                    </p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Aprovadas
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {stats.approved}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pendentes
                    </p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                      {stats.pending}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Gasto
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {formatCurrency(stats.totalSpent)}
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    placeholder="Buscar por ID, código de pagamento, nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                    className="whitespace-nowrap"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Todas
                  </Button>
                  <Button
                    variant={statusFilter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("pending")}
                    className="whitespace-nowrap"
                  >
                    Pendentes
                  </Button>
                  <Button
                    variant={
                      statusFilter === "approved" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setStatusFilter("approved")}
                    className="whitespace-nowrap"
                  >
                    Aprovadas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Compras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Histórico de Compras</span>
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                  {filteredPurchases.length}{" "}
                  {filteredPurchases.length === 1 ? "compra" : "compras"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {filteredPurchases.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Nenhuma compra encontrada
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchTerm || statusFilter !== "all"
                      ? "Tente ajustar os filtros de busca"
                      : "Você ainda não realizou nenhuma compra de ConfiPoints"}
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Link href="/confipoints/comprar">
                      <Button>
                        <Package className="w-4 h-4 mr-2" />
                        Fazer Primeira Compra
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredPurchases.map((purchase) => {
                    const status =
                      statusConfig[purchase.status as PurchaseStatus] ||
                      statusConfig.pending;
                    const customerData = purchase.customer_data as any;
                    const paymentData = purchase.payment_data as any;

                    return (
                      <div
                        key={purchase.id}
                        className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Informações principais */}
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                      {purchase.package_id
                                        ? `Pacote ${purchase.package_id}`
                                        : "Compra Personalizada"}
                                    </h3>
                                    <Badge className={status.color}>
                                      <span className="flex items-center gap-1">
                                        {status.icon}
                                        {status.label}
                                      </span>
                                    </Badge>
                                  </div>
                                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    ID: {purchase.id?.substring(0, 8)}...
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    Pontos
                                  </p>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {(
                                      purchase.points_received || 0
                                    ).toLocaleString("pt-BR")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    Valor
                                  </p>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(purchase.amount_brl || 0)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    Data
                                  </p>
                                  <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                                    {formatDate(purchase.created_at)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <div>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    Método
                                  </p>
                                  <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                                    {getPaymentMethodLabel(
                                      purchase.payment_method || "pix",
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Informações do cliente (se disponível) */}
                            {customerData && (
                              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">Cliente:</span>{" "}
                                  {customerData.name || "N/A"}
                                  {customerData.email &&
                                    ` • ${customerData.email}`}
                                </p>
                              </div>
                            )}

                            {/* Informações de pagamento (se disponível) */}
                            {purchase.payment_id && (
                              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">
                                    ID Pagamento:
                                  </span>{" "}
                                  {purchase.payment_id}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Ações */}
                          <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                            {purchase.status === "pending" &&
                              purchase.payment_id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  onClick={async () => {
                                    setIsCheckingPayment(purchase.id);
                                    try {
                                      const response = await fetch(
                                        `/api/payment/pagouai/check?id=${purchase.payment_id}&purchase_id=${purchase.id}`,
                                        {
                                          method: "GET",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                        },
                                      );
                                      const data = await response.json();

                                      if (response.ok) {
                                        // Forçar atualização imediata do cache
                                        // Primeiro invalidar para marcar como stale
                                        queryClient.invalidateQueries({
                                          queryKey: [
                                            "points-purchases",
                                            user?.id,
                                          ],
                                        });
                                        queryClient.invalidateQueries({
                                          queryKey: [
                                            "user-points-balance",
                                            user?.id,
                                          ],
                                        });

                                        // Aguardar um pouco para garantir que a atualização no banco foi concluída
                                        await new Promise((resolve) =>
                                          setTimeout(resolve, 500),
                                        );

                                        // Forçar refetch imediato ignorando staleTime
                                        await queryClient.refetchQueries(
                                          {
                                            queryKey: [
                                              "points-purchases",
                                              user?.id,
                                            ],
                                            type: "active",
                                          },
                                          { cancelRefetch: false },
                                        );

                                        // Refetch manual também
                                        if (refetch) {
                                          await refetch();
                                        }

                                        if (
                                          data.status === "approved" ||
                                          data.paymentStatus === "PAID" ||
                                          data.paymentStatus === "paid"
                                        ) {
                                          toast.success(
                                            "Pagamento confirmado! Seus pontos foram creditados.",
                                          );

                                          // Aguardar mais um pouco e forçar refetch novamente para garantir
                                          setTimeout(async () => {
                                            await queryClient.refetchQueries(
                                              {
                                                queryKey: [
                                                  "points-purchases",
                                                  user?.id,
                                                ],
                                                type: "active",
                                              },
                                              { cancelRefetch: false },
                                            );
                                            if (refetch) {
                                              await refetch();
                                            }
                                          }, 1000);
                                        } else {
                                          toast.info(
                                            `Status do pagamento: ${data.status || data.paymentStatus}`,
                                          );
                                        }
                                      } else {
                                        toast.error(
                                          data.error ||
                                            "Erro ao verificar pagamento",
                                        );
                                      }
                                    } catch (err: any) {
                                      toast.error(
                                        "Erro ao verificar pagamento",
                                      );
                                    } finally {
                                      setIsCheckingPayment(null);
                                    }
                                  }}
                                  disabled={isCheckingPayment === purchase.id}
                                >
                                  {isCheckingPayment === purchase.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Verificando...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Verificar
                                    </>
                                  )}
                                </Button>
                              )}
                            {(purchase.payment_url ||
                              purchase.payment_id ||
                              purchase.payment_data) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPurchase(purchase);
                                  setIsCheckoutOpen(true);
                                }}
                                className="w-full sm:w-auto"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {purchase.status === "approved"
                                  ? "Ver Detalhes"
                                  : "Ver QR Code"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Checkout para visualizar QR Code */}
      {selectedPurchase && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedPurchase(null);
          }}
          packageData={
            selectedPurchase
              ? {
                  id: selectedPurchase.id,
                  name: `Compra #${selectedPurchase.id.substring(0, 8)}`,
                  points: selectedPurchase.points_received || 0,
                  price: formatCurrency(selectedPurchase.amount_brl || 0),
                  priceValue: selectedPurchase.amount_brl || 0,
                  bonus: 0,
                }
              : null
          }
          existingPurchase={
            selectedPurchase
              ? {
                  id: selectedPurchase.id,
                  status: selectedPurchase.status,
                  payment_id: selectedPurchase.payment_id,
                  payment_url: selectedPurchase.payment_url,
                  payment_data: selectedPurchase.payment_data,
                  points_received: selectedPurchase.points_received || 0,
                  amount_brl: selectedPurchase.amount_brl || 0,
                  customer_data: selectedPurchase.customer_data,
                  created_at: selectedPurchase.created_at,
                }
              : null
          }
        />
      )}
    </MainLayout>
  );
}
