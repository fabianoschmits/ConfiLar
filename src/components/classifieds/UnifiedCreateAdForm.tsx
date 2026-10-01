"use client";

import { useState, useEffect, useRef } from "react";
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
import { UnifiedUpload } from "@/components/ui/UnifiedUpload";
import { useImageCompression } from "@/hooks/useImageCompression";
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
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AdDraft {
  title: string;
  description: string;
  category: string;
  ad_type: "offer" | "request";
  price: string;
  images: string[];
  isPremium: boolean;
  pointsToSpend: number;
  durationDays: number;
  useCreditType?: "1d" | "7d";
  selectedCountry?: string;
  selectedState?: string;
  selectedStateSigla?: string;
  selectedCity?: string;
  showLocation?: boolean;
}

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
  initialData?: {
    title?: string;
    description?: string;
    category?: string;
    ad_type?: "offer" | "request";
    price?: number | string;
    images?: string[];
    isPremium?: boolean;
    location_country?: string;
    location_state?: string;
    location_city?: string;
  };
  title?: string;
}

export function UnifiedCreateAdForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
  title = "Criar Novo Anúncio",
}: UnifiedCreateAdFormProps) {
  const { profile } = useAuthContext();
  const { balance } = usePoints(profile?.id);
  const { country: contextCountry, t } = useLocale();
  const { estados, loadCidades } = useIBGE();

  // Initial State from Profile
  const [selectedCountry] = useState<string>("BR");
  const [selectedState, setSelectedState] = useState<string>(
    initialData?.location_state || profile?.location_state || "",
  );
  const [selectedStateSigla, setSelectedStateSigla] = useState<string>(
    initialData?.location_state && initialData.location_state.length === 2
      ? initialData.location_state
      : "",
  );
  const [selectedCity, setSelectedCity] = useState<string>(
    initialData?.location_city || profile?.location_city || "",
  );
  const [showLocation, setShowLocation] = useState(false);
  const textareaWrapperRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

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
      if (!profile?.id) return;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("credits_ad_premium_1d, credits_ad_premium_7d")
          .eq("id", profile.id)
          .single();

        if (data) {
          console.log("🎟️ Créditos atualizados:", data);
          setCredits1d(data.credits_ad_premium_1d || 0);
          setCredits7d(data.credits_ad_premium_7d || 0);
        }
      } catch (err) {
        console.error("Erro ao buscar créditos:", err);
      }
    }
    fetchCredits();
  }, [profile?.id]);

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
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    ad_type: (initialData?.ad_type as "offer" | "request") || "offer",
    price: initialData?.price ? initialData.price.toString() : "",
    images: initialData?.images || ([] as string[]),
    isPremium: initialData?.isPremium || false,
    pointsToSpend: PREMIUM_PRICES.AD_1_DAY.POINTS as number,
    durationDays: 1 as number,
    useCreditType: undefined as "1d" | "7d" | undefined,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData?.images || [],
  );
  const { compressImage } = useImageCompression();

  // Restaurar draft do localStorage ao montar
  useEffect(() => {
    if (!initialData) {
      // Só restaurar se não houver dados iniciais
      const savedDraft = localStorage.getItem("confilar_draft_ad");
      if (savedDraft) {
        try {
          const draft: AdDraft = JSON.parse(savedDraft);
          setFormData({
            title: draft.title,
            description: draft.description,
            category: draft.category,
            ad_type: draft.ad_type,
            price: draft.price,
            images: draft.images,
            isPremium: draft.isPremium,
            pointsToSpend: draft.pointsToSpend,
            durationDays: draft.durationDays,
            useCreditType: draft.useCreditType,
          });
          // Restaurar localização
          // Restaurar localização (país fixo em BR)
          if (draft.selectedState) setSelectedState(draft.selectedState);
          if (draft.selectedStateSigla)
            setSelectedStateSigla(draft.selectedStateSigla);
          if (draft.selectedCity) setSelectedCity(draft.selectedCity);
          if (draft.showLocation !== undefined)
            setShowLocation(draft.showLocation);
        } catch (error) {
          console.error("Erro ao restaurar draft de anúncio:", error);
        }
      }
    }
  }, []);

  // Auto-save: Salvar draft no localStorage com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        formData.title ||
        formData.description ||
        formData.images.length > 0
      ) {
        const draft: AdDraft = {
          ...formData,
          selectedCountry,
          selectedState,
          selectedStateSigla,
          selectedCity,
          showLocation,
        };
        localStorage.setItem("confilar_draft_ad", JSON.stringify(draft));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    formData,
    selectedCountry,
    selectedState,
    selectedStateSigla,
    selectedCity,
    showLocation,
  ]);

  // Foco automático no título ao abrir
  useEffect(() => {
    // Pequeno delay para garantir que o modal terminou de abrir
    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Scroll automático para manter campos visíveis no mobile quando teclado aparecer
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
              block: "nearest",
              inline: "nearest",
            });
          }
        }, 300);
      }
    };

    wrapper.addEventListener("focusin", handleFocusIn);
    return () => wrapper.removeEventListener("focusin", handleFocusIn);
  }, []);

  // Categories for Combobox
  const categoryOptions = services.map((service) => ({
    value: service.name,
    label: `${service.icon} ${service.name}`,
  }));

  const premiumOptions = [
    {
      points: PREMIUM_PRICES.AD_1_DAY.POINTS,
      label: "1 Dia",
      days: 1,
      color: "#10B981",
    },
    {
      points: PREMIUM_PRICES.AD_7_DAYS.POINTS,
      label: "7 Dias",
      days: 7,
      color: "#FFD700",
    },
    {
      points: PREMIUM_PRICES.AD_14_DAYS.POINTS,
      label: "14 Dias",
      days: 14,
      color: "#FF6B6B",
    },
    {
      points: PREMIUM_PRICES.AD_30_DAYS.POINTS,
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

    let finalImages = [...existingImages];

    // Upload novas imagens se houverem
    if (selectedFiles.length > 0) {
      try {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `classifieds/${profile?.id || "anon"}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("feed-images")
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("feed-images").getPublicUrl(fileName);

          uploadedUrls.push(publicUrl);
        }
        finalImages = [...finalImages, ...uploadedUrls];
      } catch (error) {
        console.error("Erro ao fazer upload das imagens:", error);
        toast.error("Erro ao fazer upload das imagens. Tente novamente.");
        return;
      }
    }

    await onSubmit({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      ad_type: formData.ad_type,
      price: parsedPrice,
      images: finalImages,
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

    // Limpar draft após publicação bem-sucedida
    localStorage.removeItem("confilar_draft_ad");
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

  // Credit Availability (Use fresh state values)
  const hasCredit1Day = credits1d > 0;
  const hasCredit7Days = credits7d > 0;

  // Update useCreditType when duration changes or toggle premium
  useEffect(() => {
    if (!formData.isPremium) {
      setFormData((p) => ({ ...p, useCreditType: undefined }));
      return;
    }

    // Auto-select credit if available for selected duration
    setFormData((p) => {
      // If switching to a duration where we have credit, use it by default?
      // Or just let the UI handle it?
      // We'll update the logic: if user selects a duration and has credit, we likely want to auto-use it
      // but let's do that in the onClick handler of the buttons instead of effect
      // to avoid loop.

      // Clear credit usage if duration mismatch
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
    <div
      ref={textareaWrapperRef}
      className="flex flex-col h-full bg-[var(--cl-surface)] overflow-hidden"
    >
      {/* HEADER FIXO */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-[var(--cl-surface)] flex-shrink-0 z-10">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          disabled={isLoading}
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate px-2">
          {title}
        </h2>
        <LoadingButton
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={
            !formData.title ||
            !formData.description ||
            !formData.category ||
            (formData.isPremium && !canAfford)
          }
          size="sm"
          className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-[var(--cl-cta)] dark:text-[var(--cl-on-cta)] dark:hover:brightness-110 min-w-[80px] sm:min-w-[120px] transition-colors"
        >
          {isLoading
            ? initialData
              ? "Salvando..."
              : "Criando..."
            : formData.isPremium
              ? "Destacar"
              : initialData
                ? "Salvar"
                : "Criar"}
        </LoadingButton>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-6 pb-10">
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
                ? "border-blue-500 bg-[var(--cl-mist)] dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
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
              ref={titleInputRef}
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder={
                formData.ad_type === "offer"
                  ? "Ex: Instalação Elétrica Residencial"
                  : "Ex: Preciso de Encanador Urgente"
              }
              className="bg-[var(--cl-surface)]"
            />
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
              className="bg-[var(--cl-surface)] resize-none"
              maxLength={2000}
            />
            <div className="flex justify-end">
              <span className="text-xs text-gray-400">
                {formData.description.length}/2000
              </span>
            </div>
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
                  className="pl-9 bg-[var(--cl-surface)]"
                />
              </div>
            </div>
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
        </div>

        {/* IMAGES */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Fotos</Label>

          <UnifiedUpload
            selectedFiles={selectedFiles}
            onFilesSelected={(files) =>
              setSelectedFiles((prev) => [...prev, ...files])
            }
            onRemoveFile={(index) =>
              setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
            }
            maxFiles={5 - existingImages.length}
            title="Adicionar Fotos"
            description="Mostre os detalhes do seu anúncio"
            subDescription="Arraste ou clique para selecionar (até 5 fotos)"
            isLoading={isLoading}
            compressOptions={{
              maxSizeMB: 0.8,
              maxWidthOrHeight: 1080,
            }}
          />

          {existingImages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase">
                Fotos Existentes
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {existingImages.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden group border border-gray-100 dark:border-gray-800"
                  >
                    <img
                      src={url}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setExistingImages((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Adicione fotos reais para aumentar a confiança dos interessados.
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
                stateCode={selectedStateSigla}
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
        <div className="p-4 rounded-xl border border-[var(--cl-teal)]/20 dark:border-[var(--cl-teal)]/40 bg-[var(--cl-teal)]/5 dark:bg-[var(--cl-teal)]/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[var(--cl-teal)]/10 dark:bg-[var(--cl-teal)]/20">
                <Crown className="h-5 w-5 text-[var(--cl-teal)]" />
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
                {premiumOptions.map((opt) => {
                  // Determine if this option is "Free" via credit
                  let isFreeCredit = false;
                  if (opt.days === 1 && hasCredit1Day) isFreeCredit = true;
                  if (opt.days === 7 && hasCredit7Days) isFreeCredit = true;

                  const isSelected =
                    formData.pointsToSpend === opt.points &&
                    formData.durationDays === opt.days;
                  // If utilizing credit, pointsToSpend should conceptually be 0, but we keep track of "which option" via duration/points
                  // Actually, validation logic uses useCreditType to zero the cost.

                  return (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          pointsToSpend: opt.points,
                          durationDays: opt.days,
                          // Auto-select credit if available for this duration
                          useCreditType:
                            opt.days === 1 && hasCredit1Day
                              ? "1d"
                              : opt.days === 7 && hasCredit7Days
                                ? "7d"
                                : undefined,
                        }))
                      }
                      disabled={!isFreeCredit && currentBalance < opt.points}
                      className={`
                                    relative p-3 rounded-lg border-2 text-left transition-all
                                    ${
                                      formData.durationDays === opt.days
                                        ? "border-[var(--cl-teal)] bg-white dark:bg-gray-800 shadow-[0_0_10px_rgba(0,176,176,0.1)]"
                                        : "border-transparent bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
                                    }
                                    ${!isFreeCredit && currentBalance < opt.points ? "opacity-50 cursor-not-allowed" : ""}
                                `}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">
                          {opt.label}
                        </span>

                        {isFreeCredit ? (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Zap className="w-3 h-3" fill="currentColor" />
                            GRÁTIS
                          </span>
                        ) : (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                            {opt.points} pts
                          </span>
                        )}
                      </div>

                      {formData.durationDays === opt.days && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-500" />
                      )}
                    </button>
                  );
                })}
              </div>

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
    </div>
  );
}
