"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Info, AlertCircle, X } from "lucide-react";
import { ImageUploadFeed } from "@/components/ui/ImageUploadFeed";
import { ServiceAutocomplete } from "@/components/ui/ServiceAutocomplete";
import { MentionInput } from "@/components/ui/MentionInput";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/contexts/AuthContext";
import { detectYouTubeUrls, removeYouTubeUrls } from "@/utils/youtube";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { LocationComboboxesMultiCountry } from "@/components/ui/LocationComboboxesMultiCountry";
import { LocationService } from "@/lib/location/LocationService";
import { Crown, MapPin, Zap, Coins, ChevronRight } from "lucide-react";
import { usePoints } from "@/hooks/usePoints";
import { PREMIUM_PRICES } from "@/constants/premiumPrices";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    description: string;
    images: string[];
    service?: string;
    location_state?: string | null;
    location_city?: string | null;
    location_country?: string | null;
    is_premium?: boolean;
  };
  onSave: (
    postId: string,
    updatedPost: {
      description: string;
      images: string[];
      service?: string;
      location_state?: string | null;
      location_city?: string | null;
      location_country?: string | null;
    },
  ) => Promise<void>;
  onMakePremium?: (pointsToSpend: number, durationDays: number) => void;
}

export function EditPostModal({
  isOpen,
  onClose,
  post,
  onSave,
  onMakePremium,
}: EditPostModalProps) {
  const { profile } = useAuthContext();
  const isProfessional = profile?.user_type === "professional";
  const [isLoading, setIsLoading] = useState(false);
  const [editedPost, setEditedPost] = useState({
    description: post.description || "",
    images: post.images || [],
    service: post.service || "",
  });

  const [showLocation, setShowLocation] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    post.location_country || "BR",
  );
  const [selectedStateSigla, setSelectedStateSigla] = useState(
    post.location_state || "",
  );
  const [selectedState, setSelectedState] = useState(post.location_state || "");
  const [selectedCity, setSelectedCity] = useState(post.location_city || "");
  const textareaWrapperRef = useRef<HTMLDivElement>(null);

  const [showPremiumOptions, setShowPremiumOptions] = useState(false);
  const [selectedPremiumOption, setSelectedPremiumOption] = useState<
    number | null
  >(null);
  const { balance } = usePoints(profile?.id);

  const premiumOptions = [
    { points: PREMIUM_PRICES.POST_1_DAY.POINTS, days: 1, label: "1 Dia" },
    { points: PREMIUM_PRICES.POST_7_DAYS.POINTS, days: 7, label: "7 Dias" },
    { points: PREMIUM_PRICES.POST_14_DAYS.POINTS, days: 14, label: "14 Dias" },
    { points: PREMIUM_PRICES.POST_30_DAYS.POINTS, days: 30, label: "30 Dias" },
  ];

  // Detectar vídeos do YouTube
  const youtubeVideos = detectYouTubeUrls(editedPost.description || "");
  const firstVideo = youtubeVideos.length > 0 ? youtubeVideos[0] : null;
  const hasMultipleVideos = youtubeVideos.length > 1;

  // Contador de caracteres
  const charCount = editedPost.description.length;
  const maxChars = 2200;

  // Ref para controlar se já processamos múltiplos vídeos
  const hasProcessedMultipleVideos = useRef(false);

  // Processar múltiplos vídeos
  useEffect(() => {
    if (
      hasMultipleVideos &&
      youtubeVideos.length > 1 &&
      !hasProcessedMultipleVideos.current
    ) {
      // Pegar apenas o primeiro vídeo
      const firstVideoUrl = youtubeVideos[0].url;

      // Remover todos os outros vídeos da descrição
      const otherVideoUrls = youtubeVideos.slice(1).map((v) => v.url);
      let cleanedDescription = editedPost.description;

      otherVideoUrls.forEach((videoUrl) => {
        // Escapar caracteres especiais da URL para usar em regex
        const escapedUrl = videoUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        cleanedDescription = cleanedDescription
          .replace(new RegExp(escapedUrl, "g"), "")
          .trim();
      });
      // Limpar espaços múltiplos e quebras de linha
      cleanedDescription = cleanedDescription.replace(/\s+/g, " ").trim();

      // Atualizar descrição apenas se mudou e ainda não processamos
      if (
        cleanedDescription !== editedPost.description &&
        cleanedDescription.length > 0
      ) {
        hasProcessedMultipleVideos.current = true;
        setEditedPost((prev) => ({ ...prev, description: cleanedDescription }));

        // Mostrar aviso apenas uma vez
        toast.warning(`${youtubeVideos.length - 1} vídeo(s) removido(s)`, {
          description:
            "Apenas um vídeo por post é permitido. Apenas o primeiro vídeo será mantido.",
        });
      }
    }

    // Resetar o flag se não há múltiplos vídeos
    if (!hasMultipleVideos) {
      hasProcessedMultipleVideos.current = false;
    }
  }, [hasMultipleVideos, youtubeVideos.length, editedPost.description]);

  // Atualizar o estado quando o post mudar
  useEffect(() => {
    setEditedPost({
      description: post.description || "",
      images: post.images || [],
      service: post.service || "",
    });
  }, [post]);

  // Scroll automático para manter campos visíveis no mobile quando teclado aparecer
  useEffect(() => {
    const wrapper = textareaWrapperRef.current;
    if (!wrapper) return;

    const handleFocusIn = () => {
      if (window.innerWidth < 768) {
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

  const handleSave = async () => {
    if (!editedPost.description.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      // Remover URLs do YouTube da descrição antes de salvar
      const cleanedDescription = removeYouTubeUrls(
        editedPost.description.trim(),
      );

      await onSave(post.id, {
        description: cleanedDescription,
        images: editedPost.images,
        service: editedPost.service,
        location_country: selectedCountry,
        location_state: selectedState,
        location_city: selectedCity,
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar post:", error);
      toast.error("Erro ao salvar post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
      fullContent={false}
      showCloseButton={false}
    >
      {/* HEADER FIXO */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-[var(--cl-surface)] flex-shrink-0 z-10">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          disabled={isLoading}
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate px-2">
          Editar Post
        </h2>
        <LoadingButton
          onClick={handleSave}
          disabled={!editedPost.description.trim() || isLoading}
          isLoading={isLoading}
          size="sm"
          className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-[var(--cl-cta)] dark:text-[var(--cl-on-cta)] dark:hover:brightness-110 min-w-[80px] transition-colors"
        >
          {isLoading ? "Salvando..." : "Salvar"}
        </LoadingButton>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-6">
        <div className="space-y-4" ref={textareaWrapperRef}>
          {/* DESCRIÇÃO COM CONTADOR */}
          <div className="relative">
            <MentionInput
              value={editedPost.description}
              onChange={(v) =>
                setEditedPost((prev) => ({ ...prev, description: v }))
              }
              placeholder={
                isProfessional
                  ? "Descreva o trabalho, materiais, tempo, desafios..."
                  : "Conte sua experiência, o que mais gostou..."
              }
              disabled={isLoading}
              className="pr-16 min-h-24 resize-none text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-[var(--cl-surface)] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              minHeight="96px"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <span
                className={`text-xs ${charCount > maxChars * 0.9 ? "text-error-500" : "text-gray-400"}`}
              >
                {charCount}/{maxChars}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Info className="h-3 w-3 text-success-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Use @ para mencionar • Cole um link do YouTube para adicionar
                vídeo
              </p>
            </div>

            {/* Aviso sobre vídeos do YouTube */}
            {firstVideo && (
              <div className="mt-1.5 p-1.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                <div className="flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-primary-800 dark:text-primary-300 font-medium">
                      Vídeo do YouTube detectado
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">
                      O vídeo será exibido acima da descrição no post
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* IMAGENS - CARROSSEL GRANDE */}
        <div>
          <ImageUploadFeed
            currentImages={editedPost.images}
            onImagesUpload={(images) =>
              setEditedPost((prev) => ({ ...prev, images }))
            }
            maxImages={5}
            className="rounded-xl overflow-hidden"
          />
          {editedPost.images.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 text-center">
              {editedPost.images.length}/5 fotos • Arraste para reordenar
            </p>
          )}
        </div>

        {/* SERVIÇO */}
        <div className="pb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-1.5">
            Serviço{" "}
            <span className="text-gray-500 font-normal">(opcional)</span>
          </label>
          <ServiceAutocomplete
            value={editedPost.service}
            onChange={(v) => setEditedPost((prev) => ({ ...prev, service: v }))}
            placeholder="Selecione um serviço..."
            disabled={isLoading}
          />
        </div>
        {/* LOCALIZAÇÃO */}
        <div className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              Localização{" "}
              <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <button
              onClick={() => setShowLocation(!showLocation)}
              className="text-xs text-primary-600 font-medium hover:underline"
            >
              {showLocation ? "Ocultar" : "Alterar"}
            </button>
          </div>
          {!showLocation && (selectedCity || selectedState) && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>
                {selectedCity ? `${selectedCity}, ` : ""}
                {selectedState || selectedCountry}
              </span>
            </div>
          )}
          {showLocation && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <LocationComboboxesMultiCountry
                country={selectedCountry}
                stateCode={selectedStateSigla}
                city={selectedCity}
                onStateChange={async (stateCode) => {
                  setSelectedStateSigla(stateCode);
                  if (selectedCountry === "US") {
                    try {
                      const service = new LocationService(
                        selectedCountry as "BR" | "US",
                      );
                      const states = await service.getStates();
                      const state = states.find((s) => s.code === stateCode);
                      if (state) setSelectedState(state.name);
                      else setSelectedState(stateCode);
                    } catch (e) {
                      setSelectedState(stateCode);
                    }
                  } else {
                    setSelectedState(stateCode);
                  }
                  setSelectedCity("");
                }}
                onCityChange={(c) => setSelectedCity(c)}
                onCountryChange={(c) => {
                  setSelectedCountry(c);
                  setSelectedStateSigla("");
                  setSelectedState("");
                  setSelectedCity("");
                }}
              />
            </div>
          )}
        </div>

        {/* TORNAR PREMIUM (Se não for premium) */}
        {!post.is_premium && onMakePremium && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 pb-2">
            {!showPremiumOptions ? (
              <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800/50 rounded-lg p-3 flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="bg-warning-100 dark:bg-warning-800 p-1.5 rounded-full flex-shrink-0">
                    <Crown className="h-4 w-4 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-[13px] font-semibold text-gray-900 dark:text-white leading-tight">
                      Post Premium
                    </h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight mt-0.5">
                      Alcançar mais clientes
                    </p>
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPremiumOptions(true);
                    setSelectedPremiumOption(1);
                  }}
                  size="sm"
                  variant="outline"
                  className="h-8 text-[11px] font-semibold px-2 hover:bg-warning-50 hover:text-warning-700 dark:hover:bg-warning-900/30 dark:hover:text-warning-300 border-warning-200 dark:border-warning-700 text-warning-600 dark:text-warning-400 shadow-none whitespace-nowrap rounded-md flex-shrink-0"
                >
                  Ver Planos
                  <ChevronRight className="h-3 w-3 ml-0.5" />
                </Button>
              </div>
            ) : (
              <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800/50 rounded-lg p-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-warning-600 dark:text-warning-400" />
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      Escolha a duração
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 bg-[var(--cl-surface)] px-2 py-1 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm">
                    <Coins className="h-3 w-3 text-warning-500" />
                    <span className="font-medium">
                      {balance?.balance || 0} pts saldo
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {premiumOptions.map((opt) => (
                    <button
                      key={opt.days}
                      onClick={(e) => {
                        e.preventDefault();
                        if (opt.points <= (balance?.balance || 0)) {
                          setSelectedPremiumOption(opt.days);
                        }
                      }}
                      className={`p-1.5 flex flex-col items-center justify-center rounded-lg border text-center transition-colors ${selectedPremiumOption === opt.days ? "bg-warning-500 text-white border-warning-600 shadow-sm" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-warning-400 text-gray-700 dark:text-gray-300"} ${opt.points > (balance?.balance || 0) ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900" : ""}`}
                      disabled={opt.points > (balance?.balance || 0)}
                    >
                      <span className="block text-xs font-bold leading-tight">
                        {opt.days}d
                      </span>
                      <span className="block text-[10px] opacity-90 leading-tight mt-0.5">
                        {opt.points}pts
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-1/3 h-8 text-[11px] px-2 bg-[var(--cl-surface)]"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPremiumOptions(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    className="w-2/3 h-8 text-[11px] font-semibold bg-warning-500 hover:bg-warning-600 text-white border-0 shadow-sm"
                    disabled={!selectedPremiumOption || isLoading}
                    onClick={(e) => {
                      e.preventDefault();
                      const opt = premiumOptions.find(
                        (o) => o.days === selectedPremiumOption,
                      );
                      if (opt && opt.points <= (balance?.balance || 0)) {
                        onClose();
                        onMakePremium?.(opt.points, opt.days);
                      }
                    }}
                  >
                    <Zap className="h-3.5 w-3.5 mr-1" />
                    Destacar Agora
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
}
