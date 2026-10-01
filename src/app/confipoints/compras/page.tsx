"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
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
  Copy,
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
      "bg-[var(--cl-mist)] text-purple-800 dark:bg-purple-900/20 dark:text-[var(--cl-teal)]",
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
        <div className="app-screen bg-[var(--cl-paper)]">
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
      <div className="app-screen bg-[var(--cl-paper)]">
        <div className="app-page space-y-6">
          {/* Header */}
          <PageHeader
            title="Minhas compras"
            description="Acompanhe suas aquisições de ConfiPoints."
            icon={ShoppingBag}
            actions={
              <Button asChild>
                <Link href="/confipoints/comprar">Nova compra</Link>
              </Button>
            }
          />

          {/* Estatísticas - Ajustadas com Detalhe da Marca */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-[var(--cl-border)] shadow-none bg-[var(--cl-surface)]">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 p-2 bg-[var(--cl-mist)] rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-[var(--cl-teal)]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--cl-ink-muted)] font-medium">
                      Totais
                    </p>
                    <p className="text-base font-bold text-[var(--cl-ink)]">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[var(--cl-border)] shadow-none bg-[var(--cl-surface)]">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 p-2 bg-[var(--cl-mist)] rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-[var(--cl-teal)]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--cl-ink-muted)] font-medium">
                      Aprovadas
                    </p>
                    <p className="text-base font-bold text-[var(--cl-ink)]">
                      {stats.approved}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[var(--cl-border)] shadow-none bg-[var(--cl-surface)]">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 p-2 bg-[var(--cl-mist)] rounded-lg">
                    <Clock className="w-5 h-5 text-[var(--cl-teal)]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--cl-ink-muted)] font-medium">
                      Pendentes
                    </p>
                    <p className="text-base font-bold text-[var(--cl-ink)]">
                      {stats.pending}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[var(--cl-border)] shadow-none bg-[var(--cl-surface)]">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 p-2 bg-[var(--cl-mist)] rounded-lg">
                    <CreditCard className="w-5 h-5 text-[var(--cl-teal)]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--cl-ink-muted)] font-medium">
                      Investido
                    </p>
                    <p className="text-base font-bold text-[var(--cl-ink)]">
                      {formatCurrency(stats.totalSpent)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por ID..."
                className="pl-9 h-9 text-sm border-[var(--cl-border)] focus-visible:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className="h-9 px-4 text-xs"
              >
                Todas
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("pending")}
                className="h-9 px-4 text-xs"
              >
                Pendentes
              </Button>
              <Button
                variant={statusFilter === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("approved")}
                className="h-9 px-4 text-xs"
              >
                Aprovadas
              </Button>
            </div>
          </div>

          {/* Lista de Registros */}
          <div className="space-y-3">
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((purchase) => (
                <Card
                  key={purchase.id}
                  className="border-gray-100 dark:border-gray-800 shadow-none hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <CardContent className="p-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--cl-surface)] border border-[var(--cl-border)] rounded-lg flex items-center justify-center">
                          <Coins className="h-5 w-5 text-[var(--cl-teal)]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--cl-ink)] flex items-center gap-2">
                            Compra de Pontos
                            <Badge
                              variant="outline"
                              className="text-[10px] font-normal py-0 px-1.5 h-4 opacity-70"
                            >
                              #{purchase.id.slice(0, 8)}
                            </Badge>
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(purchase.created_at)}
                            </span>
                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              {getPaymentMethodLabel(
                                purchase.payment_method || "pix",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 pt-3 md:pt-0 border-t md:border-0 border-gray-100 dark:border-gray-800">
                        <div className="text-left md:text-right">
                          <p className="text-sm font-bold text-[var(--cl-ink)]">
                            {(purchase.points_received || 0).toLocaleString()}{" "}
                            pts
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {formatCurrency(purchase.amount_brl || 0)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                              purchase.status === "approved"
                                ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800/30"
                                : purchase.status === "pending" ||
                                    purchase.status === "processing"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-800/30"
                                  : "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/30"
                            }`}
                          >
                            {purchase.status === "approved" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span className="capitalize">
                              {purchase.status}
                            </span>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-[var(--cl-teal)] transition-colors"
                            onClick={() => {
                              setSelectedPurchase(purchase);
                              setIsCheckoutOpen(true);
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-900 rounded-xl">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Nenhuma compra encontrada.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPurchase && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedPurchase(null);
          }}
          packageData={{
            id: selectedPurchase.id,
            name:
              selectedPurchase.package?.name ||
              `Compra #${selectedPurchase.id.substring(0, 8)}`,
            points: selectedPurchase.points_received || 0,
            price: formatCurrency(selectedPurchase.amount_brl || 0),
            priceValue: selectedPurchase.amount_brl || 0,
            bonus: 0,
          }}
          existingPurchase={{
            id: selectedPurchase.id,
            status: selectedPurchase.status,
            payment_id: selectedPurchase.payment_id,
            payment_url: selectedPurchase.payment_url,
            payment_data: selectedPurchase.payment_data,
            points_received: selectedPurchase.points_received || 0,
            amount_brl: selectedPurchase.amount_brl || 0,
            customer_data: selectedPurchase.customer_data,
            expires_at: selectedPurchase.expires_at,
            created_at: selectedPurchase.created_at,
          }}
        />
      )}
    </MainLayout>
  );
}
