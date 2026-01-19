"use client";

import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  DollarSign,
  Briefcase,
  ShoppingBag,
  Crown,
  Zap,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ImageUploadFeed } from "@/components/ui/ImageUploadFeed";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Combobox } from "@/components/ui/Combobox";
import { LocationComboboxesMultiCountry } from "@/components/ui/LocationComboboxesMultiCountry";
import { services } from "@/data/services";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePoints } from "@/hooks/usePoints";
import { PREMIUM_PRICES } from "@/constants/premiumPrices";
import { useLocale } from "@/contexts/LocaleContext";
import { useIBGE } from "@/hooks/useIBGE";
import { Card, CardContent } from "@/components/ui/card";

interface UnifiedCreateAdFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    ad_type: "offer" | "request";
    price?: number;
    images: string[];
    isPremium: boolean;
    pointsToSpend?: number;
    durationDays?: number;
    useCreditType?: "1d" | "7d";
    location_country: string;
    location_state: string;
    location_city: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UnifiedCreateAdForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: UnifiedCreateAdFormProps) {
  const { profile } = useAuthContext();
  const { balance } = usePoints(profile?.id);
  const { country: contextCountry } = useLocale();
  const { estados, loadCidades } = useIBGE();

  // Initial State from Profile
  const [selectedCountry, setSelectedCountry] = useState<string>(
    (profile as any)?.country || contextCountry || "BR",
  );
  const [selectedState, setSelectedState] = useState<string>(
    profile?.location_state || "",
  );
  const [selectedStateSigla, setSelectedStateSigla] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>(
    profile?.location_city || "",
  );

  // Initialize location state properly
  useEffect(() => {
    if (profile?.location_state) {
      // Logic to resolve state name/sigla similar to NewPostForm
      if (profile.location_state.length === 2) {
        const estado = estados.find((e) => e.sigla === profile.location_state);
        if (estado) {
          setSelectedState(estado.nome);
          setSelectedStateSigla(estado.sigla);
          loadCidades(estado.sigla);
        } else {
          setSelectedState(profile.location_state);
          setSelectedStateSigla(profile.location_state);
        }
      } else {
        setSelectedState(profile.location_state);
        // Try to find sigla
        const estado = estados.find((e) => e.nome === profile.location_state);
        if (estado) {
          setSelectedStateSigla(estado.sigla);
          loadCidades(estado.sigla);
        }
      }
    }
    if (profile?.location_city) setSelectedCity(profile.location_city);
  }, [profile, estados, loadCidades]);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    ad_type: "offer" as "offer" | "request",
    price: "",
    images: [] as string[],
    isPremium: false,
    pointsToSpend: PREMIUM_PRICES.POST_1_DAY.POINTS as number,
    durationDays: 1 as number,
    useCreditType: undefined as "1d" | "7d" | undefined,
  });

  const [showLocation, setShowLocation] = useState(false);

  // Categories for Combobox
  const categoryOptions = services.map((service) => ({
    value: service.name,
    label: `${service.icon} ${service.name}`,
  }));

  const premiumOptions = [
    {
      points: PREMIUM_PRICES.POST_1_DAY.POINTS,
      label: "1 Dia",
      days: 1,
      color: "#10B981",
    },
    {
      points: PREMIUM_PRICES.POST_7_DAYS.POINTS,
      label: "7 Dias",
      days: 7,
      color: "#FFD700",
    },
    {
      points: PREMIUM_PRICES.POST_14_DAYS.POINTS,
      label: "14 Dias",
      days: 14,
      color: "#FF6B6B",
    },
    {
      points: PREMIUM_PRICES.POST_30_DAYS.POINTS,
      label: "30 Dias",
      days: 30,
      color: "#9B59B6",
    },
  ];

  const handleSubmit = async () => {
    // Basic Validation
    if (!formData.title || !formData.description || !formData.category) return;

    // Resolve Final Location
    const finalState = showLocation
      ? selectedStateSigla || selectedState || ""
      : profile?.location_state || "";

    // For city, logic similar to NewPostForm
    const finalCity = showLocation
      ? selectedCity || ""
      : profile?.location_city || "";

    // Price parsing
    const parsedPrice = formData.price
      ? parseFloat(formData.price.replace(/[^\d,]/g, "").replace(",", "."))
      : undefined;

    await onSubmit({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      ad_type: formData.ad_type,
      price: parsedPrice,
      images: formData.images,
      isPremium: formData.isPremium,
      pointsToSpend: formData.useCreditType
        ? 0
        : formData.isPremium
          ? formData.pointsToSpend
          : undefined,
      durationDays: formData.isPremium ? formData.durationDays : undefined,
      useCreditType: formData.useCreditType,
      location_country: selectedCountry,
      location_state: finalState,
      location_city: finalCity,
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Simple currency mask logic or just text for now?
    // Let's allow numbers and commas.
    // Ideally use a mask library but simple regex cleaning for display is fine.
    const cleanValue = value.replace(/[^\d,]/g, "");
    setFormData((prev) => ({ ...prev, price: cleanValue }));
  };

  const currentBalance = balance?.balance || 0;

  // Credit Availability
  const hasCredit1Day = (profile?.credits_ad_premium_1d || 0) > 0;
  const hasCredit7Days = (profile?.credits_ad_premium_7d || 0) > 0;

  // Update useCreditType when duration changes or toggle premium
  useEffect(() => {
    if (!formData.isPremium) {
      setFormData((p) => ({ ...p, useCreditType: undefined }));
      return;
    }

    // Auto-select credit if available for selected duration (optional, but good UX)
    // Or just clear it and let user select?
    // Let's reset it to avoid stale state, but user must explicitly click "Use Credit"?
    // User requested: "na hora de celecionar o anuncio premium ele deve ter a opção de usar o anuncio de boas vindas"
    // So let's provide an option effectively.

    setFormData((p) => {
      // If current selected duration matches a credit type, we can keep it if already set, or default to false?
      // Let's reset if duration doesn't match credit type
      if (p.useCreditType === "1d" && p.durationDays !== 1)
        return { ...p, useCreditType: undefined };
      if (p.useCreditType === "7d" && p.durationDays !== 7)
        return { ...p, useCreditType: undefined };
      return p;
    });
  }, [formData.isPremium, formData.durationDays]);

  const canAfford =
    !formData.isPremium ||
    !!formData.useCreditType ||
    currentBalance >= formData.pointsToSpend;

  // Toggle Type
  const toggleType = (type: "offer" | "request") => {
    setFormData((prev) => ({ ...prev, ad_type: type }));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
      {/* Helper Header for Modal context if needed, but Dialog usually has header. 
            However, we might want this component to own its header/footer for consistent spacing if reused directly. 
            Since it's used inside a DialogContent, we'll keep it cleaner, maybe just content. 
            Wait, existing dialogs have DialogHeader. We'll skip header here and assume parent renders title.
            But we need a Cancel button somewhere if not in header? 
            Let's stick to content body style.
        */}

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-6">
        {/* TYPE SELECTION */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => toggleType("offer")}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              formData.ad_type === "offer"
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                : "border-gray-200 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 text-gray-600"
            }`}
          >
            <Briefcase className="h-6 w-6 mb-2" />
            <span className="font-semibold text-sm">Oferecer</span>
            <span className="text-xs opacity-70 mt-1">Oferecer um serviço</span>
          </button>
          <button
            type="button"
            onClick={() => toggleType("request")}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              formData.ad_type === "request"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                : "border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 text-gray-600"
            }`}
          >
            <ShoppingBag className="h-6 w-6 mb-2" />
            <span className="font-semibold text-sm">Solicitar</span>
            <span className="text-xs opacity-70 mt-1">
              Buscar por um profissional
            </span>
          </button>
        </div>

        {/* BASIC FIELDS */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Título do Anúncio *</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder={
                formData.ad_type === "offer"
                  ? "Ex: Instalação Elétrica Residencial"
                  : "Ex: Preciso de Encanador Urgente"
              }
              className="bg-white dark:bg-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Categoria *</Label>
            <Combobox
              options={categoryOptions}
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
              placeholder="Selecione uma categoria"
              searchPlaceholder="Buscar categoria..."
              emptyMessage="Nenhuma categoria encontrada."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Valor (Opcional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  value={formData.price}
                  onChange={handlePriceChange}
                  placeholder="0,00"
                  className="pl-9 bg-white dark:bg-gray-900"
                />
              </div>
            </div>
            {/* Could add urgency level here if needed, keeping it simple for now */}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Descrição *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Descreva detalhadamente os serviços que você realiza ou o que você precisa..."
              rows={4}
              className="bg-white dark:bg-gray-900 resize-none"
              maxLength={2000}
            />
            <div className="flex justify-end">
              <span className="text-xs text-gray-400">
                {formData.description.length}/2000
              </span>
            </div>
          </div>
        </div>

        {/* IMAGES */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Fotos</Label>
          <ImageUploadFeed
            currentImages={formData.images}
            onImagesUpload={(images) =>
              setFormData((prev) => ({ ...prev, images }))
            }
            maxImages={5}
            className="rounded-xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
          />
          <p className="text-xs text-gray-400">
            Adicione até 5 fotos para ilustrar seu anúncio.
          </p>
        </div>

        {/* LOCATION TOGGLE */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowLocation(!showLocation)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span className="font-medium underline decoration-dotted">
              {showLocation
                ? "Ocultar Localização Personalizada"
                : selectedCity
                  ? `${selectedCity} - ${selectedStateSigla || selectedState}`
                  : "Usar Localização do Perfil"}
            </span>
          </button>

          {showLocation && (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-2">
              <LocationComboboxesMultiCountry
                country={selectedCountry}
                stateCode={selectedStateSigla}
                city={selectedCity}
                onCountryChange={setSelectedCountry}
                onStateChange={(state) => {
                  setSelectedStateSigla(state);
                  // Need to set full name logic if needed, but sticking to sigla for submission is usually verified in NewPostForm
                  setSelectedState(state);
                  setSelectedCity("");
                }}
                onCityChange={setSelectedCity}
              />
            </div>
          )}
        </div>

        {/* PREMIUM SECTION */}
        <div className="p-4 rounded-xl border border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-900/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
                <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Destacar Anúncio
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Apareça no topo das buscas
                </p>
              </div>
            </div>
            <Switch
              checked={formData.isPremium}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isPremium: checked }))
              }
            />
          </div>

          {formData.isPremium && (
            <div className="pt-2 animate-in fade-in">
              <Label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">
                Duração do Destaque
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {premiumOptions.map((opt) => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        pointsToSpend: opt.points,
                        durationDays: opt.days,
                      }))
                    }
                    disabled={currentBalance < opt.points}
                    className={`
                                    relative p-3 rounded-lg border-2 text-left transition-all
                                    ${
                                      formData.pointsToSpend === opt.points
                                        ? "border-yellow-500 bg-white dark:bg-gray-800 shadow-sm"
                                        : "border-transparent bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
                                    }
                                    ${currentBalance < opt.points ? "opacity-50 cursor-not-allowed" : ""}
                                `}
                  >
                    <div className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">
                      {opt.label}
                    </div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                      {opt.points} pts
                    </div>
                    {formData.pointsToSpend === opt.points && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-500" />
                    )}
                  </button>
                ))}
              </div>

              {/* CREDIT USAGE OPTION */}
              {formData.durationDays === 1 && hasCredit1Day && (
                <div className="mt-4 p-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500 hover:bg-emerald-600">
                      GRÁTIS
                    </Badge>
                    <div className="text-sm text-emerald-800 dark:text-emerald-300">
                      <span className="font-bold">Usar Crédito de 1 Dia</span>
                      <span className="text-xs block opacity-80">
                        Você tem {profile?.credits_ad_premium_1d} disponível(is)
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={formData.useCreditType === "1d"}
                    onCheckedChange={(checked) =>
                      setFormData((p) => ({
                        ...p,
                        useCreditType: checked ? "1d" : undefined,
                      }))
                    }
                  />
                </div>
              )}

              {formData.durationDays === 7 && hasCredit7Days && (
                <div className="mt-4 p-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      GRÁTIS
                    </Badge>
                    <div className="text-sm text-yellow-800 dark:text-yellow-300">
                      <span className="font-bold">Usar Crédito de 7 Dias</span>
                      <span className="text-xs block opacity-80">
                        Você tem {profile?.credits_ad_premium_7d} disponível(is)
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={formData.useCreditType === "7d"}
                    onCheckedChange={(checked) =>
                      setFormData((p) => ({
                        ...p,
                        useCreditType: checked ? "7d" : undefined,
                      }))
                    }
                  />
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                <span>
                  Saldo atual:{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currentBalance} pts
                  </span>
                </span>
                <span>
                  Custo:{" "}
                  <span
                    className={`font-medium ${formData.useCreditType ? "text-emerald-500 decoration-none" : "text-red-500"}`}
                  >
                    {formData.useCreditType ? (
                      <span className="flex items-center gap-1">
                        0 pts (Crédito)
                      </span>
                    ) : (
                      `-${formData.pointsToSpend} pts`
                    )}
                  </span>
                </span>
              </div>

              {!canAfford && (
                <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <Info className="h-3 w-3" />
                  Saldo insuficiente para esta opção.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/50 flex justify-end gap-3 rounded-b-lg">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <LoadingButton
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={
            !formData.title ||
            !formData.description ||
            !formData.category ||
            (formData.isPremium && !canAfford)
          }
          className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black min-w-[120px] transition-colors"
        >
          {isLoading
            ? "Criando..."
            : formData.isPremium
              ? "Criar & Destacar"
              : "Criar Anúncio"}
        </LoadingButton>
      </div>
    </div>
  );
}
