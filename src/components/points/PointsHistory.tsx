"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { usePointsHistory } from "@/hooks/usePoints";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  PointTransaction,
  PointTransactionType,
  PointSource,
} from "@/types/points";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PointsHistoryProps {
  className?: string;
  limit?: number;
}

export function PointsHistory({ className, limit = 10 }: PointsHistoryProps) {
  const { user } = useAuthContext();
  const [showAll, setShowAll] = useState(false);
  const [typeFilter, setTypeFilter] = useState<PointTransactionType | "all">(
    "all",
  );
  const [sourceFilter, setSourceFilter] = useState<PointSource | "all">("all");

  const { transactions, loading, error } = usePointsHistory(user?.id, {
    limit: showAll ? 50 : limit,
    type: typeFilter !== "all" ? typeFilter : undefined,
    source: sourceFilter !== "all" ? sourceFilter : undefined,
  });

  const displayedTransactions = showAll
    ? transactions
    : transactions.slice(0, limit);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Histórico de Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Histórico de Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Erro ao carregar histórico</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          Histórico de Pontos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) =>
              setTypeFilter(value as PointTransactionType | "all")
            }
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="earn">Ganhos</SelectItem>
              <SelectItem value="spend">Gastos</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sourceFilter}
            onValueChange={(value) =>
              setSourceFilter(value as PointSource | "all")
            }
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Fonte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as fontes</SelectItem>
              <SelectItem value="receive_like">Curtidas recebidas</SelectItem>
              <SelectItem value="give_like">Curtidas dadas</SelectItem>
              <SelectItem value="daily_login">Login diário</SelectItem>
              <SelectItem value="referral_signup">Indicações</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Transações */}
        {displayedTransactions.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Nenhuma transação encontrada
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Comece a interagir para ganhar pontos!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}

        {/* Botão Ver Mais/Menos */}
        {transactions.length > limit && (
          <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/20"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Ver mais ({transactions.length - limit} restantes)
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TransactionItemProps {
  transaction: PointTransaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const isPositive = transaction.amount > 0;
  const amount = Math.abs(transaction.amount);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {/* Ícone */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          isPositive
            ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
            : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
        )}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
      </div>

      {/* Detalhes */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">
          {transaction.description || getSourceDescription(transaction.source)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {getSourceIcon(transaction.source)}{" "}
            {transaction.source.replace("_", " ")}
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(transaction.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
      </div>

      {/* Valor */}
      <div
        className={cn(
          "text-right font-medium",
          isPositive
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400",
        )}
      >
        {isPositive ? "+" : "-"}
        {amount}
        <p className="text-xs text-gray-500 dark:text-gray-400">pontos</p>
      </div>
    </div>
  );
}

function getSourceIcon(source: PointSource): string {
  const icons: Record<PointSource, string> = {
    referral_signup: "👥",
    referral_profile_completed: "✅",
    referral_first_post: "📝",
    referral_first_review: "⭐",
    referral_active_30_days: "🔥",
    receive_like: "❤️",
    give_like: "👍",
    receive_comment: "💬",
    give_comment: "✍️",
    daily_login: "🌅",
    profile_completion: "🎯",
    first_post: "🚀",
    create_classified: "📢",
    level_up: "🎉",
    milestone_reached: "🏆",
    premium_ad_purchase: "👑",
  };
  return icons[source] || "💰";
}

function getSourceDescription(source: PointSource): string {
  const descriptions: Record<PointSource, string> = {
    referral_signup: "Pessoa indicada se cadastrou",
    referral_profile_completed: "Pessoa indicada completou perfil",
    referral_first_post: "Pessoa indicada fez primeiro post",
    referral_first_review: "Pessoa indicada fez primeira avaliação",
    referral_active_30_days: "Pessoa indicada ficou ativa por 30 dias",
    receive_like: "Recebeu curtida em post",
    give_like: "Curtiu um post",
    receive_comment: "Recebeu comentário em post",
    give_comment: "Comentou um post",
    daily_login: "Login diário",
    profile_completion: "Completou perfil 100%",
    first_post: "Primeiro post no feed",
    create_classified: "Criou anúncio de serviço",
    level_up: "Subiu de nível",
    milestone_reached: "Alcançou marco",
    premium_ad_purchase: "Comprou Anúncio Premium",
  };
  return descriptions[source] || source;
}
