"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Coins, X, Zap } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePremiumAd } from "@/hooks/usePremiumAd";
import { usePoints } from "@/hooks/usePoints";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PREMIUM_PRICES } from "@/constants/premiumPrices";

interface RenewPremiumAdFormProps {
  adId: string;
  adTitle: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export function RenewPremiumAdForm({
  adId,
  adTitle,
  onSubmit,
  onCancel,
}: RenewPremiumAdFormProps) {
  const { user, profile } = useAuthContext();
  const { balance } = usePoints(user?.id);
  const { renewPremiumAd, isProcessing } = usePremiumAd({
    onSuccess: () => {
      onSubmit();
    },
    onError: (error) => {
      toast.error(`Erro ao renovar anúncio premium: ${error}`);
    },
  });

  // States for fresh credits
  const [credits1d, setCredits1d] = useState(
    profile?.credits_ad_premium_1d || 0,
  );
  const [credits7d, setCredits7d] = useState(
    profile?.credits_ad_premium_7d || 0,
  );

  // Fetch latest credits on mount
  useEffect(() => {
    async function fetchCredits() {
      if (!user?.id) return;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("credits_ad_premium_1d, credits_ad_premium_7d")
          .eq("id", user.id)
          .single();

        if (data) {
          setCredits1d(data.credits_ad_premium_1d || 0);
          setCredits7d(data.credits_ad_premium_7d || 0);
        }
      } catch (err) {
        console.error("Erro ao buscar créditos:", err);
      }
    }
    fetchCredits();
  }, [user?.id]);

  const [formData, setFormData] = useState<{
    pointsToSpend: number;
    durationDays: number;
    useCreditType?: "1d" | "7d";
  }>({
    pointsToSpend: PREMIUM_PRICES.AD_1_DAY.POINTS,
    durationDays: 1,
    useCreditType: profile?.credits_ad_premium_1d ? "1d" : undefined,
  });

  const premiumOptions = [
    {
      points: PREMIUM_PRICES.AD_1_DAY.POINTS,
      label: "1 Dia",
      description: "Destaque por 24 horas",
      color: "#10B981",
      days: 1,
      badge: "Teste",
    },
    {
      points: PREMIUM_PRICES.AD_7_DAYS.POINTS,
      label: "7 Dias",
      description: "Destaque por 1 semana",
      color: "#FFD700",
      days: 7,
      badge: "Popular",
    },
    {
      points: PREMIUM_PRICES.AD_14_DAYS.POINTS,
      label: "14 Dias",
      description: "Destaque por 2 semanas",
      color: "#FF6B6B",
      days: 14,
      badge: "Econômico",
    },
    {
      points: PREMIUM_PRICES.AD_30_DAYS.POINTS,
      label: "30 Dias",
      description: "Destaque por 1 mês",
      color: "#9B59B6",
      days: 30,
      badge: "Máximo",
    },
  ];

  const hasCredit1Day = credits1d > 0;
  const hasCredit7Days = credits7d > 0;

  const canAfford =
    !!formData.useCreditType ||
    (balance?.balance ? balance.balance >= formData.pointsToSpend : false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAfford) {
      toast.error("Saldo insuficiente para renovar anúncio premium");
      return;
    }

    await renewPremiumAd(
      adId,
      formData.useCreditType ? 0 : formData.pointsToSpend,
      formData.durationDays,
      formData.useCreditType,
    );
  };

  const currentBalance = balance?.balance || 0;

  return (
    <div className="space-y-4">
      <Card className="border-[var(--cl-teal)]/20 dark:border-[var(--cl-teal)]/40 bg-[var(--cl-teal)]/5 dark:bg-[var(--cl-teal)]/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Crown className="h-5 w-5 text-[var(--cl-teal)] mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-[#008080] dark:text-[var(--cl-teal)] mb-1">
                Renovar Anúncio Premium
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                💡 Seu anúncio "{adTitle}" será renovado com destaque premium.
                Escolha a duração desejada.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Opções Premium */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Escolha a duração do destaque:
          </Label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {premiumOptions.map((option) => {
              const isCreditAvailable =
                (option.days === 1 && hasCredit1Day) ||
                (option.days === 7 && hasCredit7Days);
              const isSelected = formData.durationDays === option.days;
              const hasBalance = currentBalance >= option.points;

              return (
                <Card
                  key={option.days}
                  className={`relative cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-[var(--cl-teal)] bg-[var(--cl-teal)]/5 dark:bg-[var(--cl-teal)]/10 border-[var(--cl-teal)]/30 dark:border-[var(--cl-teal)]/50 shadow-[0_0_15px_rgba(0,176,176,0.1)]"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                  } ${!isCreditAvailable && !hasBalance ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => {
                    if (isCreditAvailable || hasBalance) {
                      setFormData({
                        pointsToSpend: option.points,
                        durationDays: option.days,
                        useCreditType:
                          option.days === 1 && hasCredit1Day
                            ? "1d"
                            : option.days === 7 && hasCredit7Days
                              ? "7d"
                              : undefined,
                      });
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {option.label}
                      </span>
                      {option.badge && !isCreditAvailable && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: option.color + "20",
                            color: option.color,
                          }}
                        >
                          {option.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {option.description}
                    </p>

                    {isCreditAvailable ? (
                      <div className="flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        <Zap className="h-4 w-4" fill="currentColor" />
                        <span>GRÁTIS</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        <Coins className="h-4 w-4 text-[var(--cl-teal)]" />
                        <span>
                          {option.points.toLocaleString("pt-BR")} pontos
                        </span>
                      </div>
                    )}

                    {!isCreditAvailable && !hasBalance && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                        Saldo insuficiente
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Saldo e Total */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Saldo atual:
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {currentBalance.toLocaleString("pt-BR")} pontos
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Custo:</span>
            <span
              className={`font-semibold ${formData.useCreditType ? "text-emerald-600 dark:text-emerald-400" : "text-[#008080] dark:text-[var(--cl-teal)]"}`}
            >
              {formData.useCreditType
                ? "Crédito Premium"
                : `-${formData.pointsToSpend.toLocaleString("pt-BR")} pontos`}
            </span>
          </div>
          {!formData.useCreditType && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Saldo após:
              </span>
              <span
                className={`font-bold ${
                  currentBalance - formData.pointsToSpend >= 0
                    ? "text-green-600 dark:text-green-500"
                    : "text-red-600 dark:text-red-500"
                }`}
              >
                {(currentBalance - formData.pointsToSpend).toLocaleString(
                  "pt-BR",
                )}{" "}
                pontos
              </span>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            disabled={!canAfford || isProcessing}
            isLoading={isProcessing}
            loadingText="Renovando..."
            className="flex-1 bg-[var(--cl-teal)] hover:bg-[#008a8a] text-white shadow-[0_4px_14px_rgba(0,176,176,0.3)] transition-all"
          >
            <Crown className="h-4 w-4 mr-2" />
            Renovar Premium
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
