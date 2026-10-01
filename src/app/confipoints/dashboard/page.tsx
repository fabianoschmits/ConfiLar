"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Trophy,
  Target,
  Users,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Crown,
  Sparkles,
  Gift,
  Send,
  Wallet,
  Info,
  ChevronRight,
  DollarSign,
  Zap,
  Star,
  Plus,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePoints, usePointsHistory } from "@/hooks/usePoints";
import { usePointsTransfers } from "@/hooks/useEconomy";
import { PREMIUM_PRICES } from "@/constants/premiumPrices";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionSkeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export default function ConfiPointsDashboardPage() {
  const t = useTranslations("confipoints");
  const tCommon = useTranslations("common");
  const { user, profile } = useAuthContext();
  const { balance, loading: loadingPoints } = usePoints(user?.id);
  const { transactions, loading: loadingHistory } = usePointsHistory(user?.id, {
    limit: 200,
  });
  const { transfers, loading: loadingTransfers } = usePointsTransfers(user?.id);

  const [activeTab, setActiveTab] = useState("visao-geral");
  const [visibleTransactionsCount, setVisibleTransactionsCount] = useState(10);

  // Calcular nível baseado nos pontos
  const calculateLevel = (points: number) => {
    if (points >= 10000)
      return {
        name: "Diamond",
        color: "text-cyan-600",
        bgColor: "bg-cyan-100",
        icon: "💎",
      };
    if (points >= 5000)
      return {
        name: "Platinum",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: "⚪",
      };
    if (points >= 2000)
      return {
        name: "Gold",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        icon: "🟡",
      };
    if (points >= 500)
      return {
        name: "Silver",
        color: "text-gray-400",
        bgColor: "bg-[var(--cl-mist)]",
        icon: "⚪",
      };
    return {
      name: "Bronze",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      icon: "🟤",
    };
  };

  const currentLevel = calculateLevel(balance?.balance || 0);

  // Próximo nível
  const getNextLevel = (points: number) => {
    if (points < 500) return { target: 500, name: "Silver" };
    if (points < 2000) return { target: 2000, name: "Gold" };
    if (points < 5000) return { target: 5000, name: "Platinum" };
    if (points < 10000) return { target: 10000, name: "Diamond" };
    return null;
  };

  const nextLevel = getNextLevel(balance?.balance || 0);
  const progress = nextLevel
    ? ((balance?.balance || 0) / nextLevel.target) * 100
    : 100;

  // Mapear transferências para formato de transações
  const transferTransactions = (transfers || []).map((transfer: any) => {
    const isSent = transfer.from_user_id === user?.id;
    const otherUser = isSent ? transfer.to_user : transfer.from_user;

    return {
      id: `transfer-${transfer.id}`,
      type: isSent ? "transfer_sent" : "transfer_received",
      amount: isSent
        ? -Math.abs(transfer.points_amount)
        : Math.abs(transfer.net_amount),
      description: isSent
        ? t("transferredPoints", {
            amount: Math.abs(transfer.points_amount).toLocaleString(),
            user: otherUser?.full_name || tCommon("user"),
          })
        : t("receivedTransfer", {
            amount: Math.abs(transfer.net_amount).toLocaleString(),
            user: otherUser?.full_name || tCommon("user"),
          }),
      date: transfer.created_at,
      status: "completed",
      source: "transfer",
      metadata: {
        ...(transfer.metadata || {}),
        transfer_id: transfer.id,
        from_user_id: transfer.from_user_id,
        to_user_id: transfer.to_user_id,
        from_user: transfer.from_user,
        to_user: transfer.to_user,
        from_user_name: transfer.from_user?.full_name,
        to_user_name: transfer.to_user?.full_name,
        message: transfer.message,
      },
      // Incluir dados de usuário diretamente também
      from_user: transfer.from_user,
      to_user: transfer.to_user,
      from_user_id: transfer.from_user_id,
      to_user_id: transfer.to_user_id,
    };
  });

  // Mapear transações do histórico para formato da UI
  // Filtrar transferências daqui pois elas vêm da tabela points_transfers
  const pointTransactions = (transactions || [])
    .filter((tx: any) => tx.type !== "transfer" || tx.source !== "transfer") // Remover transferências duplicadas
    .map((tx: any) => {
      const isPositive =
        tx.amount > 0 ||
        tx.type === "earn" ||
        tx.type === "purchase" ||
        tx.type === "refund";

      let typeLabel = "";
      let description = tx.description || "";

      // Determinar tipo e descrição baseado na transação
      switch (tx.type) {
        case "earn":
          typeLabel = "received";
          if (!description)
            description = t("earnedPoints", { amount: Math.abs(tx.amount) });
          break;
        case "spend":
          typeLabel = "spent";
          if (!description)
            description = t("spentPoints", { amount: Math.abs(tx.amount) });
          break;
        case "transfer":
          // Se chegar aqui, é uma transferência antiga sem dados completos
          // Vamos tentar buscar informações do metadata
          typeLabel = isPositive ? "transfer_received" : "transfer_sent";
          if (!description) {
            // Tentar pegar nome do usuário do metadata
            const otherUserName =
              tx.metadata?.to_user_name ||
              tx.metadata?.from_user_name ||
              tx.metadata?.user_name ||
              tCommon("user");
            const otherUserId =
              tx.metadata?.to_user_id || tx.metadata?.from_user_id;

            if (isPositive && otherUserId) {
              description = t("receivedTransfer", {
                amount: Math.abs(tx.amount),
                user: otherUserName,
              });
            } else if (!isPositive && otherUserId) {
              description = t("transferredPoints", {
                amount: Math.abs(tx.amount),
                user: otherUserName,
              });
            } else {
              description = isPositive
                ? t("receivedTransferNoUser", { amount: Math.abs(tx.amount) })
                : t("transferredPointsNoUser", { amount: Math.abs(tx.amount) });
            }
          }
          break;
        case "purchase":
          typeLabel = "purchase";
          if (!description)
            description = t("purchasedPoints", { amount: Math.abs(tx.amount) });
          break;
        case "refund":
          typeLabel = "refund";
          if (!description)
            description = t("refundPoints", { amount: Math.abs(tx.amount) });
          break;
        default:
          typeLabel = tx.type || "other";
          if (!description)
            description = t("transactionPoints", {
              amount: Math.abs(tx.amount),
            });
      }

      // Adicionar informações sobre a fonte se disponível
      if (tx.source) {
        const sourceLabels: Record<string, string> = {
          referral: `(${t("sourceReferral")})`,
          post: `(${t("sourcePost")})`,
          like: `(${t("sourceLike")})`,
          daily: `(${t("sourceDaily")})`,
          purchase: `(${t("sourcePurchase")})`,
          transfer: `(${t("sourceTransfer")})`,
          premium_post: `(${t("sourcePremiumPost")})`,
          store: `(${t("sourceStore")})`,
          bonus: `(${t("sourceBonus")})`,
        };
        if (sourceLabels[tx.source]) {
          description += ` ${sourceLabels[tx.source]}`;
        }
      }

      return {
        id: tx.id,
        type: typeLabel,
        amount: tx.amount,
        description,
        date: tx.created_at,
        status: "completed",
        source: tx.source,
        metadata: tx.metadata,
        // Preservar informações de usuário se disponível
        from_user: tx.metadata?.from_user,
        to_user: tx.metadata?.to_user,
        from_user_id: tx.metadata?.from_user_id,
        to_user_id: tx.metadata?.to_user_id,
      };
    });

  // Combinar transações de pontos com transferências
  // Remover duplicatas baseado no ID ou metadata
  const allTransactions = [...transferTransactions, ...pointTransactions]
    .filter((tx, index, self) => {
      // Ignora a transação auxiliar (points_transactions) se já houver registro rico na tabela de transferências
      if (!tx.id?.startsWith("transfer-")) {
        const isTransferRelated =
          tx.source === "transfer_sent" ||
          tx.source === "transfer_received" ||
          tx.source === "transfer";

        // Remove transação genérica completamente para evitar duplo registro,
        // já que a points_transfers gerará os cards confiáveis principais.
        if (isTransferRelated) {
          return false;
        }
      }

      // Para transferências originadas do histórico detalhado
      if (tx.id?.startsWith("transfer-")) {
        const transferId =
          tx.metadata?.transfer_id || tx.id.replace("transfer-", "");
        return (
          index ===
          self.findIndex(
            (tr) =>
              tr.id?.startsWith("transfer-") &&
              (tr.metadata?.transfer_id === transferId || tr.id === tx.id),
          )
        );
      }
      // Para outras transações, verificar ID normal
      return (
        index ===
        self.findIndex(
          (tr) => tr.id === tx.id && !tr.id?.startsWith("transfer-"),
        )
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ShoppingBag className="h-4 w-4" />;
      case "transfer_sent":
        return <Send className="h-4 w-4" />;
      case "transfer_received":
        return <Gift className="h-4 w-4" />;
      case "spent":
        return <ArrowDownRight className="h-4 w-4" />;
      case "received":
        return <ArrowUpRight className="h-4 w-4" />;
      case "refund":
        return <History className="h-4 w-4" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    // Se o amount é positivo, é verde; se negativo, é vermelho
    if (
      amount > 0 ||
      type === "purchase" ||
      type === "received" ||
      type === "transfer_received" ||
      type === "refund"
    ) {
      return "text-green-600 dark:text-green-400";
    }
    return "text-red-600 dark:text-red-400";
  };

  return (
    <MainLayout requireAuth={true}>
      <div className="app-screen bg-[var(--cl-paper)]">
        <div className="app-page">
          <div className="min-w-0">
            {/* Header */}
            <PageHeader
              title={t("myConfiPoints")}
              description={t("managePoints")}
              icon={Coins}
              actions={
                <>
                  <Button asChild variant="outline">
                    <Link href="/confipoints/transferir">{t("transfer")}</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/confipoints/comprar">{t("buyPoints")}</Link>
                  </Button>
                </>
              }
            />

            {/* Resumo de Saldo e Nível - Sutil com Cor da Marca */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Card de Saldo */}
              <Card className="border-[var(--cl-border)] shadow-none bg-[var(--cl-surface)]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 bg-[var(--cl-mist)] rounded-lg">
                      <Coins className="w-5 h-5 text-[var(--cl-teal)]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--cl-ink-muted)] font-medium">
                        {t("balance")}
                      </p>
                      <p className="text-base font-bold text-[var(--cl-ink)]">
                        {loadingPoints
                          ? "..."
                          : (balance?.balance || 0).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Ganho */}
              <Card className="border-[var(--cl-border)] shadow-none bg-[var(--cl-surface)]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 bg-[var(--cl-mist)] rounded-lg">
                      <TrendingUp className="w-5 h-5 text-[var(--cl-teal)]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--cl-ink-muted)] font-medium">
                        {t("totalEarned")}
                      </p>
                      <p className="text-base font-bold text-[var(--cl-ink)]">
                        {loadingPoints
                          ? "..."
                          : (balance?.total_earned || 0).toLocaleString(
                              "pt-BR",
                            )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Gasto */}
              <Card className="border-[var(--cl-border)] shadow-none bg-[var(--cl-surface)]">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 bg-[var(--cl-mist)] rounded-lg">
                      <TrendingDown className="w-5 h-5 text-[var(--cl-teal)]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--cl-ink-muted)] font-medium">
                        {t("totalSpent")}
                      </p>
                      <p className="text-base font-bold text-[var(--cl-ink)]">
                        {loadingPoints
                          ? "..."
                          : (balance?.total_spent || 0).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nível e Progresso */}
              <Card className="border-[var(--cl-border)] shadow-none bg-[var(--cl-surface)]">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[var(--cl-teal)]" />
                      <span className="text-xs font-bold text-[var(--cl-ink)] capitalize">
                        {currentLevel.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-1.5 bg-[var(--cl-mist)] [&>div]:bg-[var(--cl-teal)]"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Seção Principal */}
            <Tabs defaultValue="visao-geral" className="space-y-6">
              <TabsList className="bg-[var(--cl-mist)]/50 p-1 border border-[var(--cl-border)] rounded-xl">
                <TabsTrigger
                  value="visao-geral"
                  className="rounded-md px-4 py-2 text-xs"
                >
                  {t("overview")}
                </TabsTrigger>
                <TabsTrigger
                  value="ganhar"
                  className="rounded-md px-4 py-2 text-xs"
                >
                  {t("howToEarn")}
                </TabsTrigger>
                <TabsTrigger
                  value="usar"
                  className="rounded-md px-4 py-2 text-xs"
                >
                  {t("howToUse")}
                </TabsTrigger>
                <TabsTrigger
                  value="historico"
                  className="rounded-md px-4 py-2 text-xs"
                >
                  {t("history")}
                </TabsTrigger>
              </TabsList>

              {/* Visão Geral */}
              <TabsContent value="visao-geral" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ações Rápidas */}
                  <Card className="border-[var(--cl-border)] shadow-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        {t("quickActions")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Link href="/confipoints/comprar" className="block">
                        <Button
                          className="w-full justify-between h-10 px-3 bg-[var(--cl-surface)] hover:bg-[var(--cl-mist)] text-[var(--cl-ink)] border-[var(--cl-border)] shadow-none"
                          variant="outline"
                        >
                          <span className="flex items-center gap-2 text-xs">
                            <PlusCircle className="h-4 w-4 text-[var(--cl-teal)]" />
                            {t("buyPoints")}
                          </span>
                          <ChevronRight className="h-3 w-3 text-gray-400" />
                        </Button>
                      </Link>
                      <Link href="/confipoints/transferir" className="block">
                        <Button
                          className="w-full justify-between h-10 px-3 bg-[var(--cl-surface)] hover:bg-[var(--cl-mist)] text-[var(--cl-ink)] border-[var(--cl-border)] shadow-none"
                          variant="outline"
                        >
                          <span className="flex items-center gap-2 text-xs">
                            <Send className="h-4 w-4 text-[var(--cl-teal)]" />
                            {t("transferPoints")}
                          </span>
                          <ChevronRight className="h-3 w-3 text-gray-400" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Transações Recentes */}
                  <Card className="border-[var(--cl-border)] shadow-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <History className="h-4 w-4 text-[var(--cl-teal)]" />
                        {t("latestTransactions")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {allTransactions.length === 0 ? (
                        <p className="text-xs text-[var(--cl-ink-muted)] text-center py-4">
                          {t("noTransactions")}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {allTransactions.slice(0, 5).map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-2 rounded-md border border-gray-100 dark:border-gray-800"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                    transaction.amount > 0
                                      ? "bg-green-50 dark:bg-green-900/10"
                                      : "bg-red-50 dark:bg-red-900/10"
                                  }`}
                                >
                                  <div
                                    className={
                                      transaction.amount > 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {getTransactionIcon(transaction.type)}
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-[var(--cl-ink)] truncate max-w-[150px] sm:max-w-[200px]">
                                    {transaction.description}
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    {formatDistanceToNow(
                                      new Date(transaction.date),
                                      { addSuffix: true, locale: ptBR },
                                    )}
                                  </p>
                                  {transaction.metadata?.message && (
                                    <p className="text-[10px] text-[var(--cl-teal)] italic line-clamp-1">
                                      "{transaction.metadata.message}"
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div
                                className={`text-xs font-bold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {transaction.amount > 0 ? "+" : ""}
                                {transaction.amount.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Como Ganhar */}
              <TabsContent value="ganhar" className="space-y-6">
                <Card className="bg-[var(--cl-mist)] border-[var(--cl-border)]">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-[var(--cl-teal)] mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-[var(--cl-ink)] mb-2">
                          {t("pointsSystem")}
                        </h3>
                        <p className="text-sm text-[var(--cl-ink-secondary)]">
                          {t("onlyWayToEarn")}{" "}
                          <strong>{t("referralProgram")}</strong>.{" "}
                          {t("canAlsoBuy")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      {t("referralSystem")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[var(--cl-ink-secondary)] mb-4">
                      {t("referralDescription")}
                    </p>
                    <div className="space-y-3">
                      {[
                        {
                          action: t("friendRegistered"),
                          points: 200,
                          icon: "👋",
                        },
                        {
                          action: t("friendCompletedProfile"),
                          points: 150,
                          icon: "📋",
                        },
                        {
                          action: t("friendFirstPost"),
                          points: 100,
                          icon: "📝",
                        },
                        {
                          action: t("friendFirstReview"),
                          points: 100,
                          icon: "⭐",
                        },
                        {
                          action: t("friendActive30Days"),
                          points: 300,
                          icon: "🔥",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg border border-[var(--cl-border)]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-sm font-medium text-[var(--cl-ink)]">
                              {item.action}
                            </span>
                          </div>
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-0">
                            +{item.points} pts
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                        💰 Total Possível por Indicação: 950 pontos (R$ 9,50)
                      </p>
                      <Link href="/indicacoes">
                        <Button className="w-full mt-2" variant="default">
                          <Users className="h-4 w-4 mr-2" />
                          Ir para Indicações
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-[var(--cl-teal)]" />
                      {t("buyPoints")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[var(--cl-ink-secondary)] mb-4">
                      Você também pode comprar pontos diretamente para usar nas
                      funcionalidades premium da plataforma.
                    </p>
                    <Link href="/confipoints/comprar">
                      <Button className="w-full" variant="outline">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Ver Pacotes de Pontos
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Como Usar */}
              <TabsContent value="usar" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[var(--cl-teal)]" />
                      Ações Premium na Plataforma
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          name: "Curtida Premium",
                          cost: PREMIUM_PRICES.LIKE.POINTS,
                          description: PREMIUM_PRICES.LIKE.DESCRIPTION,
                          icon: "💎",
                          link: "/feed",
                        },
                        {
                          name: "Comentário Premium",
                          cost: PREMIUM_PRICES.COMMENT.POINTS,
                          description: PREMIUM_PRICES.COMMENT.DESCRIPTION,
                          icon: "💬",
                          link: "/feed",
                        },
                        {
                          name: "Post Premium",
                          cost: PREMIUM_PRICES.POST.POINTS,
                          description: `${PREMIUM_PRICES.POST.DESCRIPTION} (${PREMIUM_PRICES.POST.DURATION})`,
                          icon: "🚀",
                          link: "/feed",
                        },
                        {
                          name: "Anúncio Premium",
                          cost: PREMIUM_PRICES.AD.POINTS,
                          description: `${PREMIUM_PRICES.AD.DESCRIPTION} (${PREMIUM_PRICES.AD.DURATION})`,
                          icon: "⭐",
                          link: "/classificados",
                        },
                      ].map((item, index) => (
                        <Link key={index} href={item.link}>
                          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-3xl">{item.icon}</span>
                                <Badge
                                  variant="outline"
                                  className="text-[var(--cl-teal)] border-[var(--cl-teal)]"
                                >
                                  -{item.cost} pts
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-[var(--cl-ink)] mb-1">
                                {item.name}
                              </h3>
                              <p className="text-xs text-[var(--cl-ink-secondary)]">
                                {item.description}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Crown className="h-5 w-5 text-yellow-600" />
                        {t("premiumStore")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-[var(--cl-ink-secondary)] mb-4">
                        Compre badges exclusivos, recursos especiais e muito
                        mais.
                      </p>
                      <Link href="/confipoints/comprar">
                        <Button className="w-full" variant="outline">
                          {t("premiumStore")}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Send className="h-5 w-5 text-[var(--cl-teal)]" />
                        Transferir
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-[var(--cl-ink-secondary)] mb-4">
                        Envie pontos para outros usuários (taxa de 25%).
                      </p>
                      <Link href="/confipoints/transferir">
                        <Button className="w-full" variant="outline">
                          {t("transfer")}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                          Conversão de Pontos
                        </h3>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>100 pontos = R$ 1,00</strong>
                          <br />
                          Use seus pontos na loja, posts premium, curtidas e
                          muito mais!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Histórico */}
              <TabsContent value="historico" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-gray-600" />
                      {t("allTransactions")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingHistory || loadingTransfers ? (
                      <TransactionSkeleton />
                    ) : allTransactions.length === 0 ? (
                      <EmptyState
                        icon={<History className="h-12 w-12 text-gray-400" />}
                        title="Nenhuma transação encontrada"
                        description="Você ainda não possui transações de ConfiPoints. Comece a usar a plataforma para ver seu histórico aqui."
                        variant="minimal"
                      />
                    ) : (
                      <>
                        <div className="space-y-3">
                          {allTransactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-4 rounded-lg border border-[var(--cl-border)] hover:bg-[var(--cl-mist)] transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    transaction.amount > 0
                                      ? "bg-green-100 dark:bg-green-900/20"
                                      : "bg-red-100 dark:bg-red-900/20"
                                  }`}
                                >
                                  <div
                                    className={getTransactionColor(
                                      transaction.type,
                                      transaction.amount,
                                    )}
                                  >
                                    {getTransactionIcon(transaction.type)}
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium text-[var(--cl-ink)]">
                                    {(() => {
                                      // Se for transferência, criar links para perfis
                                      if (
                                        (transaction.source === "transfer" ||
                                          transaction.id?.startsWith(
                                            "transfer-",
                                          )) &&
                                        transaction.metadata
                                      ) {
                                        const isSent = transaction.amount < 0;
                                        const otherUser = isSent
                                          ? transaction.metadata.to_user
                                          : transaction.metadata.from_user;
                                        const otherUserId = isSent
                                          ? transaction.metadata.to_user_id
                                          : transaction.metadata.from_user_id;

                                        if (otherUser && otherUserId) {
                                          const userName =
                                            otherUser.full_name || "Usuário";
                                          const transferText = isSent
                                            ? `Transferiu ${Math.abs(transaction.amount).toLocaleString()} pontos para `
                                            : `Recebeu transferência de ${transaction.amount.toLocaleString()} pontos de `;

                                          return (
                                            <>
                                              {transferText}
                                              <Link
                                                href={`/perfil/${otherUserId}`}
                                                className="text-[var(--cl-teal)] hover:underline"
                                              >
                                                {userName}
                                              </Link>
                                            </>
                                          );
                                        }

                                        // Fallback: tentar usar dados do metadata diretamente
                                        if (otherUserId && !otherUser) {
                                          const userName =
                                            transaction.metadata.to_user_name ||
                                            transaction.metadata
                                              .from_user_name ||
                                            "Usuário";
                                          const transferText = isSent
                                            ? `Transferiu ${Math.abs(transaction.amount).toLocaleString()} pontos para `
                                            : `Recebeu transferência de ${transaction.amount.toLocaleString()} pontos de `;

                                          return (
                                            <>
                                              {transferText}
                                              <Link
                                                href={`/perfil/${otherUserId}`}
                                                className="text-[var(--cl-teal)] hover:underline"
                                              >
                                                {userName}
                                              </Link>
                                            </>
                                          );
                                        }
                                      }

                                      // Para outras transações, mostrar descrição normal
                                      // Mas verificar se há nome de usuário na descrição para adicionar link
                                      const desc = transaction.description;

                                      // Verificar se há informações de usuário no metadata ou diretamente na transação
                                      if (
                                        transaction.from_user &&
                                        transaction.from_user_id &&
                                        desc.includes(
                                          transaction.from_user.full_name,
                                        )
                                      ) {
                                        return desc
                                          .split(
                                            transaction.from_user.full_name,
                                          )
                                          .map(
                                            (
                                              part: string,
                                              index: number,
                                              arr: string[],
                                            ) => {
                                              if (index === arr.length - 1)
                                                return part;
                                              return (
                                                <span key={index}>
                                                  {part}
                                                  <Link
                                                    href={`/perfil/${transaction.from_user_id}`}
                                                    className="text-[var(--cl-teal)] hover:underline"
                                                  >
                                                    {
                                                      transaction.from_user
                                                        .full_name
                                                    }
                                                  </Link>
                                                </span>
                                              );
                                            },
                                          );
                                      }

                                      if (
                                        transaction.to_user &&
                                        transaction.to_user_id &&
                                        desc.includes(
                                          transaction.to_user.full_name,
                                        )
                                      ) {
                                        return desc
                                          .split(transaction.to_user.full_name)
                                          .map(
                                            (
                                              part: string,
                                              index: number,
                                              arr: string[],
                                            ) => {
                                              if (index === arr.length - 1)
                                                return part;
                                              return (
                                                <span key={index}>
                                                  {part}
                                                  <Link
                                                    href={`/perfil/${transaction.to_user_id}`}
                                                    className="text-[var(--cl-teal)] hover:underline"
                                                  >
                                                    {
                                                      transaction.to_user
                                                        .full_name
                                                    }
                                                  </Link>
                                                </span>
                                              );
                                            },
                                          );
                                      }

                                      // Verificar se há userId no metadata para criar link
                                      if (
                                        transaction.metadata?.from_user_id &&
                                        desc.includes(
                                          transaction.metadata?.from_user_name,
                                        )
                                      ) {
                                        return desc
                                          .split(
                                            transaction.metadata.from_user_name,
                                          )
                                          .map(
                                            (
                                              part: string,
                                              index: number,
                                              arr: string[],
                                            ) => {
                                              if (index === arr.length - 1)
                                                return part;
                                              return (
                                                <span key={index}>
                                                  {part}
                                                  <Link
                                                    href={`/perfil/${transaction.metadata.from_user_id}`}
                                                    className="text-[var(--cl-teal)] hover:underline"
                                                  >
                                                    {
                                                      transaction.metadata
                                                        .from_user_name
                                                    }
                                                  </Link>
                                                </span>
                                              );
                                            },
                                          );
                                      }

                                      if (
                                        transaction.metadata?.to_user_id &&
                                        desc.includes(
                                          transaction.metadata?.to_user_name,
                                        )
                                      ) {
                                        return desc
                                          .split(
                                            transaction.metadata.to_user_name,
                                          )
                                          .map(
                                            (
                                              part: string,
                                              index: number,
                                              arr: string[],
                                            ) => {
                                              if (index === arr.length - 1)
                                                return part;
                                              return (
                                                <span key={index}>
                                                  {part}
                                                  <Link
                                                    href={`/perfil/${transaction.metadata.to_user_id}`}
                                                    className="text-[var(--cl-teal)] hover:underline"
                                                  >
                                                    {
                                                      transaction.metadata
                                                        .to_user_name
                                                    }
                                                  </Link>
                                                </span>
                                              );
                                            },
                                          );
                                      }

                                      return desc;
                                    })()}
                                  </p>
                                  <div className="flex flex-col mt-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs text-[var(--cl-ink-muted)]">
                                        {formatDistanceToNow(
                                          new Date(transaction.date),
                                          {
                                            addSuffix: true,
                                            locale: ptBR,
                                          },
                                        )}
                                      </p>
                                      <Badge
                                        variant={
                                          transaction.status === "completed"
                                            ? "default"
                                            : "outline"
                                        }
                                        className="text-xs"
                                      >
                                        {transaction.status === "completed"
                                          ? "Concluído"
                                          : transaction.status === "pending"
                                            ? "Pendente"
                                            : transaction.status ===
                                                "processing"
                                              ? "Processando"
                                              : transaction.status}
                                      </Badge>
                                    </div>
                                    {transaction.metadata?.message && (
                                      <p className="text-xs text-[var(--cl-teal)] mt-1 italic">
                                        "{transaction.metadata.message}"
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`text-lg font-bold ${
                                    transaction.amount > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {transaction.amount > 0 ? "+" : ""}
                                  {transaction.amount.toLocaleString("pt-BR")}
                                </p>
                                <p className="text-xs text-gray-500">pontos</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Sempre mostrar todas as transações - sem limite */}
                        {allTransactions.length > 0 && (
                          <div className="mt-6 flex justify-center">
                            <p className="text-sm text-[var(--cl-ink-muted)]">
                              Total de {allTransactions.length} transações
                              exibidas
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
