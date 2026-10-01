"use client";

// Desabilitar SSG para esta página
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EstadoCombobox,
  CidadeCombobox,
} from "@/components/ui/LocationComboboxes";
import { Combobox } from "@/components/ui/Combobox";
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Filter,
  Package,
  Clock,
  LayoutGrid,
  List,
  MessageSquare,
  MoreVertical,
  Trash2,
  X,
  Tag,
  Briefcase,
  User,
  Star,
  Eye,
  Camera,
  Heart,
  Calendar,
  Phone,
  Mail,
  Share2,
  Maximize2,
  Download,
  AlertCircle,
  HelpCircle,
  LogOut,
  Settings,
  Bell,
  Menu,
  ChevronRight,
  Shield,
  CreditCard,
  Gift,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
  TrendingUp,
  Users,
  Grid3X3,
  ChevronLeft,
  Edit,
  Flag,
  HandHeart,
  ShoppingCart,
  Crown,
  Sparkles,
  Loader2,
  MessageCircle,
  Pencil,
  ArrowUpDown,
} from "lucide-react";
import { FeedFilterModal } from "@/components/feed/FeedFilterModal";
import { useIBGE } from "@/hooks/useIBGE";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { useClassifiedSearch } from "@/hooks/useClassifiedSearch";
import { usePremiumNotifications } from "@/hooks/usePremiumNotifications";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ValidationUtils } from "@/lib/validation";
import { ShareAdModal } from "@/components/classifieds/ShareAdModal";
import { services } from "@/data/services";
import { ClassifiedsListSkeleton } from "@/components/ui/skeleton";
import { ClassifiedsCard } from "@/components/classifieds/ClassifiedsCard";
import { ClassifiedAdDetailModal } from "@/components/classifieds/ClassifiedAdDetailModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClientOnly } from "@/components/ClientOnly";
import { SmartSearchBar } from "@/components/search/SmartSearchBar";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefresh } from "@/components/ui/PullToRefresh";

import { RenewPremiumAdForm } from "@/components/classifieds/RenewPremiumAdForm";
import { PremiumTimeRemaining } from "@/components/classifieds/PremiumTimeRemaining";
import { ReportButton } from "@/components/ReportButton";
import { useTranslations } from "next-intl";
import { UnifiedCreateAdForm } from "@/components/classifieds/UnifiedCreateAdForm";
import { ClassifiedsLocationSelector } from "@/components/classifieds/ClassifiedsLocationSelector";
import { useIsSuperAdmin } from "@/hooks/useAdmin";
import { useClassifiedEngagement } from "@/hooks/useClassifiedEngagement";

type AdType = "all" | "offers" | "requests";

export default function ClassificadosPage() {
  const t = useTranslations("classifieds");
  const tCommon = useTranslations("common");
  const tLocation = useTranslations("location");
  const { isSuperAdmin } = useIsSuperAdmin();
  const [mounted, setMounted] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [showRenewPremiumDialog, setShowRenewPremiumDialog] = useState(false);
  const [renewingAdId, setRenewingAdId] = useState<string | null>(null);
  const [isCreatingAd, setIsCreatingAd] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditingAd, setIsEditingAd] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [selectedDetailAd, setSelectedDetailAd] = useState<any>(null);
  const [focusDetailComment, setFocusDetailComment] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedUserProfiles, setExpandedUserProfiles] = useState<
    Record<string, boolean>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [activeTab, setActiveTab] = useState<
    "all" | "offers" | "requests" | "featured" | "recent"
  >("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingAdIsOwner, setDeletingAdIsOwner] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const resultsTopRef = useRef<HTMLDivElement>(null);

  // Hook para busca de classificados
  const {
    classifiedAds,
    filteredAds,
    loading,
    stats,
    filters,
    setLocationFilter,
    setSearchQuery,
    setCategoryFilter,
    setAdTypeFilter,
    loadClassifiedAds,
  } = useClassifiedSearch();
  const { getEngagement, toggleLike, changeCommentsCount, isLikePending } =
    useClassifiedEngagement(classifiedAds);

  const { containerRef, isPulling, isRefreshing, pullDistance } =
    usePullToRefresh({
      onRefresh: async () => {
        await loadClassifiedAds();
      },
    });

  // Estados do formulário de criação
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location_state: "",
    location_city: "",
    price_range: "",
    urgency_level: "normal",
    ad_type: "offer" as "offer" | "request",
  });

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [adToShare, setAdToShare] = useState<any>(null);

  const searchParams = useSearchParams();
  const highlightAdId = searchParams.get("ad");

  useEffect(() => {
    if (highlightAdId && mounted) {
      setTimeout(() => {
        const el = document.getElementById(`ad-${highlightAdId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 800);
    }
  }, [highlightAdId, mounted]);

  const { estados, cidades, loading: loadingIBGE, loadCidades } = useIBGE();
  const { openChat } = useFloatingChat();

  // Verificar notificações premium automaticamente
  usePremiumNotifications();

  // Opções de categorias para o Combobox
  const categoryOptions = services.map((service) => ({
    value: service.name,
    label: `${service.icon} ${service.name}`, // Adicionar ícone para melhor visualização
  }));

  // Função para validar se a categoria é válida
  const isValidCategory = (category: string): boolean => {
    return services.some((service) => service.name === category);
  };

  // Função para obter o ícone da categoria
  const getCategoryIcon = (category: string): string => {
    const service = services.find((service) => service.name === category);
    return service?.icon || "🔧";
  };

  useEffect(() => {
    if (
      activeTab === "offers" ||
      activeTab === "requests" ||
      activeTab === "all"
    ) {
      setAdTypeFilter(activeTab);
    } else {
      setAdTypeFilter("all");
    }
  }, [activeTab, setAdTypeFilter]);

  const { user, profile } = useAuthContext();

  // useEffect para mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Inicializar formulário com dados do usuário
  useEffect(() => {
    if (profile && profile.location_state && profile.location_city) {
      console.log("🏠 Inicializando formulário com dados do usuário:", {
        state: profile.location_state,
        city: profile.location_city,
      });

      // Carregar cidades do estado do usuário primeiro
      if (profile.location_state) {
        console.log(
          "🔄 Carregando cidades para o estado:",
          profile.location_state,
        );
        loadCidades(profile.location_state).then(() => {
          // Após carregar as cidades, definir o formulário
          setFormData((prev) => ({
            ...prev,
            location_state: profile.location_state,
            location_city: profile.location_city,
          }));
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          location_state: profile.location_state,
          location_city: profile.location_city,
        }));
      }
    }
  }, [profile, loadCidades]);

  // Resetar página quando itemsPerPage mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  if (!mounted) {
    return null;
  }

  // Ordenação / abas extras (Destaques, Mais recentes)
  const displayAds = (() => {
    let ads = [...filteredAds];
    if (activeTab === "featured") {
      ads = ads.filter((ad) => {
        const premiumExpired = ad.premium_expires_at
          ? new Date(ad.premium_expires_at) < new Date()
          : false;
        return (ad.is_premium && !premiumExpired) || ad.is_featured;
      });
    }
    if (activeTab === "recent") {
      ads.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }
    return ads;
  })();

  // Paginação
  const totalPages = Math.ceil(displayAds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAds = displayAds.slice(startIndex, endIndex);

  // Função para atualizar filtros (compatibilidade)
  const updateFilters = (
    newFilters: Partial<{ searchTerm: string; category: string }>,
  ) => {
    if (newFilters.searchTerm !== undefined)
      setSearchQuery(newFilters.searchTerm);
    if (newFilters.category !== undefined)
      setCategoryFilter(newFilters.category);
    setCurrentPage(1);
  };

  // Limpar filtros
  const clearFilters = () => {
    setSearchQuery("");
    setLocationFilter({ type: "all" });
    setCategoryFilter("all");
    setAdTypeFilter("all");
    setCurrentPage(1);
  };

  // Criar novo anúncio
  // Função para abrir o diálogo de criação
  const handleOpenCreateDialog = () => {
    // Inicializar com dados do usuário se disponíveis
    if (profile && profile.location_state && profile.location_city) {
      console.log("🏠 Abrindo diálogo com dados do usuário:", {
        state: profile.location_state,
        city: profile.location_city,
      });

      // Carregar cidades do estado do usuário primeiro
      if (profile.location_state) {
        console.log(
          "🔄 Carregando cidades para o estado:",
          profile.location_state,
        );
        loadCidades(profile.location_state).then(() => {
          // Após carregar as cidades, definir o formulário
          setFormData((prev) => ({
            ...prev,
            location_state: profile.location_state,
            location_city: profile.location_city,
          }));
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          location_state: profile.location_state,
          location_city: profile.location_city,
        }));
      }
    }
    setShowCreateDialog(true);
  };

  // Nova função unificada para criar anúncio
  const handleCreateUnifiedAd = async (data: {
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
  }) => {
    if (!user) {
      toast.error("Você precisa estar logado para publicar um anúncio");
      return;
    }

    setIsCreatingAd(true);
    try {
      if (data.isPremium) {
        // Usar a nova API Route segura para criar anúncio premium
        const response = await fetch("/api/classifieds/premium", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: data.title,
            description: data.description,
            category: data.category,
            ad_type: data.ad_type,
            price: data.price,
            images: data.images,
            durationDays: data.durationDays,
            pointsToSpend: data.pointsToSpend || 0,
            useCreditType: data.useCreditType,
            location_country: data.location_country,
            location_state: data.location_state,
            location_city: data.location_city,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Erro ao criar anúncio premium");
        }

        console.log("✅ Anúncio premium criado via API:", result.ad);
      } else {
        // Fluxo normal para anúncios não-premium
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, user_type, contact_phone")
          .eq("id", user.id)
          .single();

        const { data: newAd, error: adError } = await supabase
          .from("classified_ads")
          .insert({
            user_id: user.id,
            user_name: profile?.full_name || "Usuário",
            user_type: profile?.user_type || "client",
            title: data.title,
            description: data.description,
            category: data.category,
            location_city: data.location_city,
            location_state: data.location_state,
            location_country: data.location_country || "BR",
            ad_type: data.ad_type === "offer" ? "oferecer" : "procurar",
            price_range: data.price ? data.price.toString() : null,
            contact_phone: profile?.contact_phone || null,
            contact_email: user.email || null,
            images: data.images || [],
            is_active: true,
            is_premium: false,
          })
          .select()
          .single();

        if (adError) throw adError;
      }

      toast.success(
        data.isPremium
          ? "Anúncio Premium criado com sucesso!"
          : "Anúncio criado com sucesso!",
      );

      setShowCreateDialog(false);
      await loadClassifiedAds();
    } catch (error: any) {
      console.error("❌ Erro ao criar anúncio:", error);
      toast.error("Erro ao criar anúncio", {
        description: error?.message || "Tente novamente.",
      });
    } finally {
      setIsCreatingAd(false);
    }
  };

  // Abrir chat com usuário
  const handleContactUser = (userId: string, userName?: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para entrar em contato");
      return;
    }

    if (userId === user.id) {
      toast.error("Você não pode entrar em contato consigo mesmo");
      return;
    }

    // Abrir chat flutuante
    openChat(userId, userName || "Usuário");
    toast.success("Iniciando conversa...");
  };

  // Abrir diálogo de confirmação de deleção
  const handleDeleteClick = async (adId: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para deletar anúncios");
      return;
    }

    // Buscar anúncio para verificar se é o dono
    const { data: adData } = await supabase
      .from("classified_ads")
      .select("user_id")
      .eq("id", adId)
      .single();

    const isOwner = adData?.user_id === user.id;
    setDeletingAdIsOwner(isOwner);
    setDeletingAdId(adId);
    setShowDeleteDialog(true);
  };

  // Deletar anúncio
  const handleDeleteAd = async () => {
    if (!deletingAdId || !user) {
      return;
    }

    const adId = deletingAdId;
    setIsDeleting(true);

    try {
      // Buscar anúncio para verificar se é o dono
      const { data: adData } = await supabase
        .from("classified_ads")
        .select("user_id")
        .eq("id", adId)
        .single();

      const isOwner = adData?.user_id === user.id;
      const isSuperAdminCheck = isSuperAdmin;

      if (!isOwner && !isSuperAdminCheck) {
        toast.error("Você não tem permissão para deletar este anúncio");
        setShowDeleteDialog(false);
        setDeletingAdId(null);
        setIsDeleting(false);
        return;
      }

      if (isSuperAdminCheck) {
        // Usar API de admin para deletar
        const response = await fetch(
          `/api/gestao-confi/classified-ads/${adId}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Erro desconhecido" }));
          throw new Error(
            errorData.error || `Erro ao deletar anúncio: ${response.status}`,
          );
        }

        toast.success(
          "Anúncio deletado com sucesso (como Super Administrador)!",
        );
      } else {
        // Deletar normalmente (só o dono)
        const { error } = await supabase
          .from("classified_ads")
          .delete()
          .eq("id", adId)
          .eq("user_id", user.id); // Garantir que só o dono pode deletar

        if (error) throw error;

        toast.success("Anúncio deletado com sucesso!");
      }

      // Recarregar anúncios
      await loadClassifiedAds();

      setShowDeleteDialog(false);
      setDeletingAdId(null);
    } catch (error) {
      console.error("Erro ao deletar anúncio:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao deletar anúncio",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Editar anúncio
  const handleEditAd = (ad: any) => {
    setSelectedAd(ad); // Use selectedAd to store the full object being edited
    setEditingAdId(ad.id);
    setFormData({
      title: ad.title,
      description: ad.description,
      category: ad.category,
      location_state: ad.location_state,
      location_city: ad.location_city,
      price_range: ad.price_range || "",
      urgency_level: "normal",
      ad_type: ad.ad_type === "oferecer" ? "offer" : "request",
    });
    setShowEditDialog(true);
  };

  // Salvar edição do anúncio
  const handleSaveEdit = async () => {
    if (!user || !editingAdId) {
      toast.error("Erro ao editar anúncio");
      return;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.ad_type
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setIsEditingAd(true);

      const updateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location_state: formData.location_state,
        location_city: formData.location_city,
        ad_type: formData.ad_type === "offer" ? "oferecer" : "procurar",
      };

      const { error } = await supabase
        .from("classified_ads")
        .update(updateData)
        .eq("id", editingAdId)
        .eq("user_id", user.id); // Garantir que só o dono pode editar

      if (error) throw error;

      toast.success("Anúncio atualizado com sucesso!");
      setShowEditDialog(false);
      setEditingAdId(null);
      setFormData({
        title: "",
        description: "",
        category: "",
        location_state: "",
        location_city: "",
        price_range: "",
        urgency_level: "normal",
        ad_type: "offer",
      });

      // Recarregar anúncios
      await loadClassifiedAds();
    } catch (error) {
      console.error("Erro ao editar anúncio:", error);
      toast.error("Erro ao editar anúncio");
    } finally {
      setIsEditingAd(false);
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hoje";
    if (diffDays === 2) return "Ontem";
    if (diffDays <= 7) return `${diffDays} dias atrás`;

    return date.toLocaleDateString("pt-BR");
  };

  // Função para mudar página
  const goToPage = (page: number) => {
    setCurrentPage(page);
    setTimeout(() => {
      if (resultsTopRef.current) {
        const top =
          resultsTopRef.current.getBoundingClientRect().top +
          window.scrollY -
          80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <ClientOnly>
      <MainLayout requireAuth={false}>
        <div className="classifieds-page min-h-screen">
          <div className="max-w-[720px] mx-auto px-3 sm:px-4 py-3 sm:py-4 pb-28">
            <div className="mb-3">
              <SmartSearchBar
                onSearch={(query, newFilters) => {
                  updateFilters({
                    searchTerm: query,
                    category: newFilters.service,
                  });
                  setAdTypeFilter(
                    newFilters.adType === "oferecer"
                      ? "offers"
                      : newFilters.adType === "solicitar"
                        ? "requests"
                        : "all",
                  );
                  setLocationFilter({
                    type:
                      newFilters.state && newFilters.city
                        ? "custom"
                        : newFilters.state
                          ? "state"
                          : "all",
                    state: newFilters.state,
                    city: newFilters.city,
                  });
                }}
                onFiltersChange={(newFilters) => {
                  updateFilters({
                    searchTerm: newFilters.searchTerm,
                    category: newFilters.service,
                  });
                  setAdTypeFilter(
                    newFilters.adType === "oferecer"
                      ? "offers"
                      : newFilters.adType === "solicitar"
                        ? "requests"
                        : "all",
                  );
                  setLocationFilter({
                    type:
                      newFilters.state && newFilters.city
                        ? "custom"
                        : newFilters.state
                          ? "state"
                          : "all",
                    state: newFilters.state,
                    city: newFilters.city,
                  });
                }}
                initialFilters={{
                  searchTerm: filters.searchTerm,
                  state: filters.location.state || "",
                  city: filters.location.city || "",
                  service: filters.category,
                  rating: "all",
                  availability: "all",
                  userType: "all",
                  adType: filters.adType || "all",
                }}
                showAdvancedFilters={true}
                mode="classifieds"
                placeholder="O que você precisa?"
              />
            </div>

            {/* A localidade passa a ser contexto direto da busca, sem disputar o topo da página. */}
            <div className="mb-3 flex items-center">
              <ClassifiedsLocationSelector
                className="classifieds-location-context"
                location={filters.location}
                onChange={(next) => {
                  setLocationFilter(next);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Chips cápsula — elongated pills (não círculos) */}
            <div className="mb-4 -mx-1 px-1">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {[
                  { id: "all" as const, label: "Todos" },
                  { id: "offers" as const, label: "Serviços" },
                  { id: "requests" as const, label: "Pedidos" },
                  { id: "featured" as const, label: "Destaques" },
                  {
                    id: "recent" as const,
                    label: "Mais recentes",
                    sort: true,
                  },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setCurrentPage(1);
                      }}
                      className={
                        isActive
                          ? "classifieds-chip classifieds-chip--active"
                          : "classifieds-chip classifieds-chip--idle"
                      }
                    >
                      {tab.label}
                      {"sort" in tab && tab.sort && (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controles secundários discretos */}
            <div className="mb-3 hidden items-center justify-between gap-2 sm:flex">
              <div className="flex items-center gap-2">
                {!loading && displayAds.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <label
                      htmlFor="itemsPerPage"
                      className="text-xs text-[var(--cl-muted)] whitespace-nowrap"
                    >
                      {t("porPagina")}
                    </label>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) =>
                        setItemsPerPage(parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-14 h-8 text-xs rounded-[12px] bg-[var(--cl-surface)] border-[var(--cl-border)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9">9</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {user && (
                <>
                  <ResponsiveModal
                    isOpen={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                    fullContent={true}
                    showCloseButton={false}
                  >
                    <UnifiedCreateAdForm
                      onSubmit={handleCreateUnifiedAd}
                      onCancel={() => setShowCreateDialog(false)}
                      isLoading={isCreatingAd}
                    />
                  </ResponsiveModal>

                  <ResponsiveModal
                    isOpen={showRenewPremiumDialog}
                    onOpenChange={setShowRenewPremiumDialog}
                    title={
                      <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                        <span>Renovar Anúncio Premium</span>
                      </div>
                    }
                  >
                    {renewingAdId && (
                      <RenewPremiumAdForm
                        adId={renewingAdId}
                        adTitle={
                          selectedAd?.title ||
                          classifiedAds.find((ad) => ad.id === renewingAdId)
                            ?.title ||
                          "Anúncio"
                        }
                        onSubmit={() => {
                          setShowRenewPremiumDialog(false);
                          setRenewingAdId(null);
                          setSelectedAd(null);
                          loadClassifiedAds();
                        }}
                        onCancel={() => {
                          setShowRenewPremiumDialog(false);
                          setRenewingAdId(null);
                        }}
                      />
                    )}
                  </ResponsiveModal>

                  <ResponsiveModal
                    isOpen={showEditDialog}
                    onOpenChange={setShowEditDialog}
                    fullContent={true}
                    showCloseButton={false}
                  >
                    <UnifiedCreateAdForm
                      initialData={{
                        title: selectedAd?.title,
                        description: selectedAd?.description,
                        category: selectedAd?.category,
                        ad_type:
                          selectedAd?.ad_type === "oferecer"
                            ? "offer"
                            : "request",
                        price: selectedAd?.price_range,
                        images: selectedAd?.images,
                        location_state: selectedAd?.location_state,
                        location_city: selectedAd?.location_city,
                        isPremium: selectedAd?.is_premium,
                      }}
                      onSubmit={async (data) => {
                        if (!user || !editingAdId) return;
                        try {
                          setIsEditingAd(true);

                          if (data.isPremium && !selectedAd?.is_premium) {
                            const response = await fetch(
                              "/api/classifieds/premium",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                credentials: "include",
                                body: JSON.stringify({
                                  adId: editingAdId,
                                  title: data.title,
                                  description: data.description,
                                  category: data.category,
                                  ad_type: data.ad_type,
                                  price: data.price,
                                  images: data.images,
                                  durationDays: data.durationDays,
                                  pointsToSpend: data.pointsToSpend || 0,
                                  useCreditType: data.useCreditType,
                                  location_country: "BR",
                                  location_state: data.location_state,
                                  location_city: data.location_city,
                                }),
                              },
                            );

                            const result = await response.json();

                            if (!response.ok) {
                              throw new Error(
                                result.error ||
                                  "Erro ao fazer upgrade para premium",
                              );
                            }

                            toast.success("Upgrade para Premium concluído!");
                          } else {
                            const updateData = {
                              title: data.title,
                              description: data.description,
                              category: data.category,
                              location_state: data.location_state,
                              location_city: data.location_city,
                              ad_type:
                                data.ad_type === "offer"
                                  ? "oferecer"
                                  : "procurar",
                              images: data.images,
                              price_range: data.price
                                ? data.price.toString()
                                : null,
                            };

                            const { error } = await supabase
                              .from("classified_ads")
                              .update(updateData)
                              .eq("id", editingAdId)
                              .eq("user_id", user.id);

                            if (error) throw error;
                            toast.success("Anúncio atualizado com sucesso!");
                          }

                          setShowEditDialog(false);
                          setEditingAdId(null);
                          setSelectedAd(null);
                          await loadClassifiedAds();
                        } catch (error: any) {
                          console.error("Erro ao editar anúncio:", error);
                          toast.error("Erro ao editar anúncio", {
                            description: error?.message,
                          });
                        } finally {
                          setIsEditingAd(false);
                        }
                      }}
                      onCancel={() => setShowEditDialog(false)}
                      isLoading={isEditingAd}
                    />
                  </ResponsiveModal>
                </>
              )}
            </div>

            <div
              ref={(el) => {
                // @ts-ignore
                resultsTopRef.current = el;
                // @ts-ignore
                containerRef.current = el;
              }}
              className="relative min-h-[400px]"
            >
              <PullToRefresh
                isPulling={isPulling}
                isRefreshing={isRefreshing}
                pullDistance={pullDistance}
                shouldRefresh={pullDistance >= 80}
              />

              {loading ? (
                <ClassifiedsListSkeleton viewMode="list" />
              ) : paginatedAds.length === 0 ? (
                <EmptyState
                  icon={<Search className="h-12 w-12 text-gray-400" />}
                  title={t("noResults")}
                  description={
                    filters.searchTerm ||
                    filters.location.state ||
                    filters.location.city ||
                    filters.category !== "all" ||
                    activeTab === "featured"
                      ? t("noResultsDescription")
                      : t("noAdsDescription")
                  }
                  action={
                    filters.searchTerm ||
                    filters.location.state ||
                    filters.location.city ||
                    filters.category !== "all"
                      ? {
                          label: t("clearFilters"),
                          onClick: clearFilters,
                        }
                      : undefined
                  }
                />
              ) : (
                <div className="flex flex-col gap-3.5">
                  {paginatedAds.map((ad) => {
                    const engagement = getEngagement(ad);

                    return (
                      <div key={ad.id} id={"ad-" + ad.id}>
                        <ClassifiedsCard
                          ad={ad}
                          onEdit={handleEditAd}
                          onDelete={handleDeleteClick}
                          onRenewPremium={(adId) => {
                            setRenewingAdId(adId);
                            setShowRenewPremiumDialog(true);
                          }}
                          isDeleting={isDeleting && deletingAdId === ad.id}
                          isHighlighted={ad.id === highlightAdId}
                          onShare={(sharedAd) => {
                            setAdToShare(sharedAd);
                            setShareModalOpen(true);
                          }}
                          onOpenDetails={(detailAd, focusComments = false) => {
                            setSelectedDetailAd(detailAd);
                            setFocusDetailComment(focusComments);
                          }}
                          onToggleLike={toggleLike}
                          isLiked={engagement.isLiked}
                          isLikePending={isLikePending(ad.id)}
                          likesCount={engagement.likesCount}
                          commentsCount={engagement.commentsCount}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center mt-8 space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 rounded-xl"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => {
                      const shouldShow =
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 2 &&
                          pageNumber <= currentPage + 2);

                      if (!shouldShow) {
                        if (
                          pageNumber === currentPage - 3 ||
                          pageNumber === currentPage + 3
                        ) {
                          return (
                            <span
                              key={pageNumber}
                              className="px-2 text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={
                            currentPage === pageNumber ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => goToPage(pageNumber)}
                          className={`px-3 rounded-xl ${
                            currentPage === pageNumber
                              ? "bg-[var(--cl-cta)] text-[var(--cl-on-cta)] hover:brightness-110"
                              : ""
                          }`}
                        >
                          {pageNumber}
                        </Button>
                      );
                    },
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 rounded-xl"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {!loading && displayAds.length > 0 && (
                <div className="text-center mt-4 text-sm text-slate-500 dark:text-zinc-400">
                  {t("mostrando")} {startIndex + 1} a{" "}
                  {Math.min(endIndex, displayAds.length)} {t("de")}{" "}
                  {displayAds.length} {t("resultadosPlural")}
                </div>
              )}
            </div>

            {user && (
              <button
                id="create-ad-button"
                type="button"
                onClick={handleOpenCreateDialog}
                className="classifieds-fab fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 h-14 w-14 flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Novo anúncio"
              >
                <Pencil className="h-5 w-5" />
              </button>
            )}

            <AlertDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
            >
              <AlertDialogContent className="bg-[var(--cl-surface)] border border-[var(--cl-border)]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[var(--cl-ink)]">
                    {isSuperAdmin && !deletingAdIsOwner
                      ? "Deletar Anúncio (Super Admin)"
                      : "Deletar Anúncio"}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[var(--cl-ink-secondary)]">
                    {isSuperAdmin && !deletingAdIsOwner ? (
                      <>
                        Você está deletando este anúncio como{" "}
                        <strong>Super Administrador</strong>. Esta ação não pode
                        ser desfeita. O anúncio será removido permanentemente.
                      </>
                    ) : (
                      <>
                        Tem certeza que deseja deletar este anúncio? Esta ação
                        não pode ser desfeita. O anúncio será removido
                        permanentemente.
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    disabled={isDeleting}
                    className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700"
                  >
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAd}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deletando...
                      </>
                    ) : (
                      "Deletar"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {adToShare && (
              <ShareAdModal
                isOpen={shareModalOpen}
                onClose={() => {
                  setShareModalOpen(false);
                  setAdToShare(null);
                }}
                adId={adToShare.id}
                adTitle={adToShare.title}
              />
            )}

            {selectedDetailAd && (
              <ClassifiedAdDetailModal
                ad={selectedDetailAd}
                isOpen={Boolean(selectedDetailAd)}
                onOpenChange={(open) => {
                  if (!open) {
                    setSelectedDetailAd(null);
                    setFocusDetailComment(false);
                  }
                }}
                isLiked={getEngagement(selectedDetailAd).isLiked}
                likesCount={getEngagement(selectedDetailAd).likesCount}
                commentsCount={getEngagement(selectedDetailAd).commentsCount}
                onToggleLike={() => void toggleLike(selectedDetailAd)}
                onCommentsCountChange={(change) =>
                  changeCommentsCount(selectedDetailAd.id, change)
                }
                focusCommentInput={focusDetailComment}
              />
            )}
          </div>
        </div>
      </MainLayout>
    </ClientOnly>
  );
}
