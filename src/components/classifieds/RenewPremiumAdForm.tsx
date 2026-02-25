"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Coins, X } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePremiumAd } from "@/hooks/usePremiumAd";
import { usePoints } from "@/hooks/usePoints";
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
  const { user } = useAuthContext();
  const { balance } = usePoints(user?.id);
  const { renewPremiumAd, isProcessing } = usePremiumAd({
    onSuccess: () => {
      toast.success("Anúncio premium renovado com sucesso! 🌟");
      onSubmit();
    },
    onError: (error) => {
      toast.error(`Erro ao renovar anúncio premium: ${error}`);
    },
  });

  const [formData, setFormData] = useState<{
    pointsToSpend: number;
    durationDays: number;
  }>({
    pointsToSpend: PREMIUM_PRICES.AD_1_DAY.POINTS,
    durationDays: 1,
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

  const canAfford = balance?.balance
    ? balance.balance >= formData.pointsToSpend
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAfford) {
      toast.error("Saldo insuficiente para renovar anúncio premium");
      return;
    }

    await renewPremiumAd(adId, formData.pointsToSpend, formData.durationDays);
  };

  return (
    <div className="space-y-4">
      <Card className="border-[#00b0b0]/20 dark:border-[#00b0b0]/40 bg-[#00b0b0]/5 dark:bg-[#00b0b0]/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Crown className="h-5 w-5 text-[#00b0b0] mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-[#008080] dark:text-[#00b0b0] mb-1">
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
            {premiumOptions.map((option) => (
              <Card
                key={option.points}
                className={`cursor-pointer transition-all ${formData.pointsToSpend === option.points
                    ? "ring-2 ring-[#00b0b0] bg-[#00b0b0]/5 dark:bg-[#00b0b0]/10 border-[#00b0b0]/30 dark:border-[#00b0b0]/50 shadow-[0_0_15px_rgba(0,176,176,0.1)]"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                  } ${!canAfford && option.points > (balance?.balance || 0) ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (canAfford || option.points <= (balance?.balance || 0)) {
                    setFormData((prev) => ({
                      ...prev,
                      pointsToSpend: option.points,
                      durationDays: option.days,
                    }));
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {option.label}
                    </span>
                    {option.badge && (
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
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                    <Coins className="h-4 w-4 text-[#00b0b0]" />
                    <span>{option.points.toLocaleString("pt-BR")} pontos</span>
                  </div>
                  {option.points > (balance?.balance || 0) && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                      Saldo insuficiente
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Saldo e Total */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Saldo atual:
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {balance?.balance?.toLocaleString("pt-BR") || 0} pontos
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Custo:</span>
            <span className="font-semibold text-[#008080] dark:text-[#00b0b0]">
              -{formData.pointsToSpend.toLocaleString("pt-BR")} pontos
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              Saldo após:
            </span>
            <span
              className={`font-bold ${(balance?.balance || 0) - formData.pointsToSpend >= 0
                  ? "text-green-600 dark:text-green-500"
                  : "text-red-600 dark:text-red-500"
                }`}
            >
              {(
                (balance?.balance || 0) - formData.pointsToSpend
              ).toLocaleString("pt-BR")}{" "}
              pontos
            </span>
          </div>
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
            className="flex-1 bg-[#00b0b0] hover:bg-[#008a8a] text-white shadow-[0_4px_14px_rgba(0,176,176,0.3)] transition-all"
          >
            <Crown className="h-4 w-4 mr-2" />
            Renovar Premium
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
