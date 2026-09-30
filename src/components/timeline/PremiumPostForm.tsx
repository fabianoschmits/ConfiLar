"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Zap, Crown, Coins } from "lucide-react";
import { ImageUploadFeed } from "@/components/ui/ImageUploadFeed";
import { ServiceAutocomplete } from "@/components/ui/ServiceAutocomplete";
import { usePoints } from "@/hooks/usePoints";
import { useAuthContext } from "@/contexts/AuthContext";
import { PREMIUM_PRICES } from "@/constants/premiumPrices";
import { getServiceById } from "@/data/services";

interface PremiumPostFormProps {
  onSubmit: (postData: {
    title?: string;
    description?: string;
    images?: string[];
    service?: string;
    pointsToSpend: number;
    durationDays: number;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  postStatus: "idle" | "sending" | "sent";
  isRenewal?: boolean;
}

export function PremiumPostForm({
  onSubmit,
  onCancel,
  isLoading,
  postStatus,
  isRenewal = false,
}: PremiumPostFormProps) {
  const { profile } = useAuthContext();
  const { balance } = usePoints(profile?.id);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    images: string[];
    service: string;
    pointsToSpend: number;
    durationDays: number;
  }>({
    title: "",
    description: "",
    images: [] as string[],
    service: "",
    pointsToSpend: PREMIUM_PRICES.POST_1_DAY.POINTS,
    durationDays: 1,
  });

  const textareaWrapperRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Efeito para scroll automático em dispositivos móveis quando o teclado aparece
  useEffect(() => {
    const wrapper = textareaWrapperRef.current;
    if (!wrapper) return;

    const handleFocusIn = () => {
      // Detectar se é mobile (largura < 768px)
      if (window.innerWidth < 768) {
        // Aguardar um pouco para o teclado aparecer
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (activeElement && wrapper.contains(activeElement)) {
            activeElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }, 300);
      }
    };

    wrapper.addEventListener("focusin", handleFocusIn);
    return () => wrapper.removeEventListener("focusin", handleFocusIn);
  }, []);

  // Foco automático no título ao abrir
  useEffect(() => {
    if (!isRenewal) {
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isRenewal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Se for renovação, não precisa de título e descrição
    if (!isRenewal && (!formData.title.trim() || !formData.description.trim()))
      return;

    await onSubmit({
      ...(isRenewal
        ? {}
        : {
          title: formData.title,
          description: formData.description,
          images: formData.images,
          service: formData.service,
        }),
      pointsToSpend: formData.pointsToSpend,
      durationDays: formData.durationDays,
    });
  };

  const handleImagesUpload = (images: string[]) => {
    setFormData((prev) => ({ ...prev, images }));
  };

  const premiumOptions = [
    {
      points: PREMIUM_PRICES.POST_1_DAY.POINTS,
      label: "1 Dia",
      description: "Destaque por 24 horas",
      color: "#10B981",
      days: 1,
      badge: "Teste",
    },
    {
      points: PREMIUM_PRICES.POST_7_DAYS.POINTS,
      label: "7 Dias",
      description: "Destaque por 1 semana",
      color: "#FFD700",
      days: 7,
      badge: "Popular",
    },
    {
      points: PREMIUM_PRICES.POST_14_DAYS.POINTS,
      label: "14 Dias",
      description: "Destaque por 2 semanas",
      color: "#FF6B6B",
      days: 14,
      badge: "Econômico",
    },
    {
      points: PREMIUM_PRICES.POST_30_DAYS.POINTS,
      label: "30 Dias",
      description: "Destaque por 1 mês",
      color: "#9B59B6",
      days: 30,
      badge: "Máximo",
    },
  ];

  const canAfford = balance?.balance >= formData.pointsToSpend;

  return (
    <div ref={textareaWrapperRef} className="space-y-6">
      {/* Header Premium */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-6 w-6 text-[var(--cl-teal)]" />
          <h3 className="text-xl font-bold text-[#008080]">Post Premium</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Escolha a duração do destaque para seu post ter maior visibilidade
        </p>
      </div>

      {/* Saldo Atual */}
      <Card className="border-[var(--cl-teal)]/20 dark:border-[var(--cl-teal)]/30 bg-[var(--cl-teal)]/5 dark:bg-[var(--cl-teal)]/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-[var(--cl-teal)]" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Seus ConfiPoints:
              </span>
            </div>
            <Badge
              variant="secondary"
              className="bg-[var(--cl-teal)]/10 dark:bg-[var(--cl-teal)]/20 text-[#008080] dark:text-[var(--cl-teal)]"
            >
              {balance?.balance || 0} pontos
            </Badge>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRenewal && (
          <div className="bg-[var(--cl-mist)] dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 Seu post será renovado com destaque premium. Escolha a duração
              desejada.
            </p>
          </div>
        )}

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
                    ? "ring-2 ring-[var(--cl-teal)] bg-[var(--cl-teal)]/5 dark:bg-[var(--cl-teal)]/10 border-[var(--cl-teal)]/30 dark:border-[var(--cl-teal)]/50 shadow-[0_0_15px_rgba(0,176,176,0.1)]"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                  } ${!canAfford && option.points > (balance?.balance || 0) ? "opacity-50" : ""}`}
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
                  <div className="text-center space-y-3">
                    {option.badge && (
                      <Badge
                        className="mb-2"
                        style={{
                          backgroundColor: option.color,
                          color: "white",
                          borderColor: option.color,
                        }}
                      >
                        {option.badge}
                      </Badge>
                    )}
                    <div
                      className="w-12 h-12 rounded-full border-4 mx-auto flex items-center justify-center"
                      style={{
                        backgroundColor:
                          formData.pointsToSpend === option.points
                            ? option.color
                            : "transparent",
                        borderColor: option.color,
                      }}
                    >
                      <span
                        className="text-xl font-bold"
                        style={{
                          color:
                            formData.pointsToSpend === option.points
                              ? "white"
                              : option.color,
                        }}
                      >
                        {option.days}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {option.label}
                      </div>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: option.color,
                          color: option.color,
                        }}
                        className="bg-[var(--cl-surface)] text-base font-semibold px-3 py-1"
                      >
                        {option.points.toLocaleString("pt-BR")} pts
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {option.description}
                    </p>
                    {option.points > (balance?.balance || 0) && (
                      <Badge variant="destructive" className="text-xs">
                        Saldo Insuficiente
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {!isRenewal && (
          <>
            {/* Título */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-gray-900 dark:text-gray-100"
              >
                Título *
              </Label>
              <Input
                id="title"
                ref={titleInputRef}
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Digite o título do seu post premium..."
                className="border-[var(--cl-teal)]/20 dark:border-[var(--cl-teal)]/40 focus:border-[var(--cl-teal)] dark:focus:border-[var(--cl-teal)] bg-[var(--cl-surface)] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* Serviço */}
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100 flex items-center gap-1">
                Serviço{" "}
                <span className="text-gray-500 font-normal">(opcional)</span>
              </Label>
              <div className="flex flex-col gap-2">
                <ServiceAutocomplete
                  value={formData.service}
                  onChange={(v) =>
                    setFormData((prev) => ({ ...prev, service: v }))
                  }
                  placeholder="Selecione um serviço..."
                  disabled={isLoading}
                />
                {formData.service && getServiceById(formData.service) && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <span className="text-xs text-gray-500">Tag do post:</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-none w-fit"
                    >
                      {getServiceById(formData.service)?.name}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-gray-900 dark:text-gray-100"
              >
                Descrição *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Compartilhe sua experiência, dica ou conhecimento... Use @ para mencionar alguém"
                rows={4}
                className="border-[var(--cl-teal)]/20 dark:border-[var(--cl-teal)]/40 focus:border-[var(--cl-teal)] dark:focus:border-[var(--cl-teal)] bg-[var(--cl-surface)] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* Upload de Imagens */}
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-gray-100">
                Imagens
              </Label>
              <div>
                <ImageUploadFeed
                  currentImages={formData.images}
                  onImagesUpload={handleImagesUpload}
                  maxImages={5}
                />
              </div>
            </div>
          </>
        )}

        {/* Resumo do Custo */}
        <Card className="border-[var(--cl-teal)]/20 dark:border-[var(--cl-teal)]/40 bg-[var(--cl-teal)]/5 dark:bg-[var(--cl-teal)]/10">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[var(--cl-teal)]" />
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  Custo do Post Premium:
                </span>
              </div>
              <Badge
                variant="secondary"
                className="bg-[var(--cl-teal)]/10 dark:bg-[var(--cl-teal)]/20 text-[#008080] dark:text-[var(--cl-teal)] text-sm"
              >
                {formData.pointsToSpend} ConfiPoints
              </Badge>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              Saldo após {isRenewal ? "renovação" : "criação"}:{" "}
              {(balance?.balance || 0) - formData.pointsToSpend} pontos
            </p>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            className="flex-1 bg-[var(--cl-teal)] hover:bg-[#008a8a] text-white shadow-[0_4px_14px_rgba(0,176,176,0.3)] transition-all"
            disabled={
              isLoading ||
              !canAfford ||
              (!isRenewal &&
                (!formData.title.trim() || !formData.description.trim()))
            }
            isLoading={isLoading}
            loadingText={
              postStatus === "sending"
                ? isRenewal
                  ? "Renovando..."
                  : "Criando..."
                : "Enviado!"
            }
          >
            <Star className="h-4 w-4" />
            {isRenewal ? "Renovar Post Premium" : "Criar Post Premium"}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
