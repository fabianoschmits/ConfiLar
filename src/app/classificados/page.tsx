"use client";

// Desabilitar SSG para esta página
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
import { useIBGE } from "@/hooks/useIBGE";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { useClassifiedSearch } from "@/hooks/useClassifiedSearch";
import { usePremiumNotifications } from "@/hooks/usePremiumNotifications";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { services } from "@/data/services";
import { ClassifiedsListSkeleton } from "@/components/ui/skeleton";
import { ClassifiedsCard } from "@/components/classifieds/ClassifiedsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Search,
  MapPin,
  Calendar,
  MessageCircle,
  Plus,
  Filter,
  Star,
  Briefcase,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  TrendingUp,
  Users,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreVertical,
  Edit,
  Flag,
  HandHeart,
  ShoppingCart,
  Crown,
  Sparkles,
  Shield,
  Loader2,
} from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";

import { RenewPremiumAdForm } from "@/components/classifieds/RenewPremiumAdForm";
import { PremiumTimeRemaining } from "@/components/classifieds/PremiumTimeRemaining";
import { ReportButton } from "@/components/ReportButton";
import { useTranslations } from "next-intl";
import { UnifiedCreateAdForm } from "@/components/classifieds/UnifiedCreateAdForm";
import { useIsSuperAdmin } from "@/hooks/useAdmin";

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
  const [showAdModal, setShowAdModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedUserProfiles, setExpandedUserProfiles] = useState<
    Record<string, boolean>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [activeTab, setActiveTab] = useState<"all" | "offers" | "requests">(
    "all",
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingAdIsOwner, setDeletingAdIsOwner] = useState(false);

  // Estados para filtros
  const [filters, setFilters] = useState({
    searchTerm: "",
    state: "",
    city: "",
    category: "all",
    adType: "all" as AdType,
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

  const { estados, cidades, loading: loadingIBGE, loadCidades } = useIBGE();
  const { openChat } = useFloatingChat();

  // Hook para busca de classificados
  const {
    classifiedAds,
    filteredAds,
    loading,
    stats,
    executeSearch,
    loadClassifiedAds,
  } = useClassifiedSearch();

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

  // Executar busca inicial
  useEffect(() => {
    executeSearch(filters);
  }, [executeSearch, filters]);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    const updatedFilters = {
      ...filters,
      adType: activeTab,
    };
    executeSearch(updatedFilters);
  }, [filters, activeTab, executeSearch]);

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

  // Paginação
  const totalPages = Math.ceil(filteredAds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAds = filteredAds.slice(startIndex, endIndex);

  // Função para atualizar filtros
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    console.log("🔄 Atualizando filtros:", { newFilters, updatedFilters });
    setFilters(updatedFilters);
    setCurrentPage(1); // Reset para primeira página
    executeSearch(updatedFilters);
  };

  // Limpar filtros
  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: "",
      state: "",
      city: "",
      category: "all",
      adType: "all" as AdType,
    };
    console.log("🧹 Limpando filtros:", clearedFilters);
    setFilters(clearedFilters);
    setCurrentPage(1);
    executeSearch(clearedFilters);
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
    console.log("🔍 Debug - Iniciando criação de anúncio unificado:", data);

    if (!user || !profile) {
      toast.error("Login necessário", {
        description: "Você precisa estar logado para criar anúncios.",
      });
      return;
    }

    try {
      setIsCreatingAd(true);

      // Calcular expiração se premium
      let premiumData: any = {
        is_premium: false,
        premium_expires_at: null,
      };

      if (data.isPremium && data.durationDays) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + data.durationDays);
        premiumData = {
          is_premium: true,
          premium_expires_at: expiryDate.toISOString(),
          // premium_type could be added if schema supports it
        };
      }

      // 1. Inserir Anúncio
      const adPayload = {
        user_id: user.id,
        user_name: profile.full_name || user.email?.split("@")[0] || "Usuário",
        user_type: profile.user_type || "client",
        title: data.title,
        description: data.description,
        category: data.category,
        location_state: data.location_state,
        location_city: data.location_city,
        ad_type: data.ad_type === "offer" ? "oferecer" : "procurar",
        images: data.images, // Array de strings
        price_range: data.price ? data.price.toString() : null, // Schema uses price_range string usually
        // price: data.price || null, // REMOVED: Column does not exist in DB
        is_active: true,
        ...premiumData,
      };

      console.log("📝 Payload do anúncio:", adPayload);

      const { data: newAd, error: adError } = await supabase
        .from("classified_ads")
        .insert([adPayload])
        .select()
        .single();

      if (adError) throw adError;

      // 2. Se Premium
      if (data.isPremium) {
        if (data.useCreditType) {
          // CONSUMIR CRÉDITO
          console.log(`🎟️ Usando crédito de anúncio: ${data.useCreditType}`);

          // Decrementar crédito corretor
          const updateField =
            data.useCreditType === "1d"
              ? "credits_ad_premium_1d"
              : "credits_ad_premium_7d";
          // Usar RPC atomicamente seria melhor, mas update simples serve:
          // Precisamos ler valor atual? Na verdade, podemos usar sql decrement?
          // Supabase não tem syntax atomic decrement direta via cliente js 'update' sem saber valor anterior ou usar rpc.
          // Mas sabemos que profile tem o valor.
          // Melhor: criar um RPC decrement_credit?
          // Ou apenas ler profile atual e dar update.
          // Vamos confiar no profile do context/db?

          // Buscar valor atual garantido para evitar race condition
          const { data: currentProfile } = await supabase
            .from("profiles")
            .select(updateField)
            .eq("id", user.id)
            .single();
          const specificKey = updateField as keyof typeof currentProfile; // Type assertion

          if (currentProfile && (currentProfile[specificKey] as number) > 0) {
            await supabase
              .from("profiles")
              .update({
                [updateField]: (currentProfile[specificKey] as number) - 1,
              })
              .eq("id", user.id);

            toast.success(
              `Crédito de ${data.useCreditType === "1d" ? "1 dia" : "7 dias"} utilizado com sucesso!`,
            );
          } else {
            console.error(
              "❌ Falha ao consumir crédito: Saldo insuficiente no servidor",
            );
            // Não vamos falhar a criação do anúncio, mas avisar? Ou falhar?
            // Como o anúncio já foi criado como premium... seria injusto.
            // Deveríamos ter validado ANTES de criar o anúncio?
            // Sim. Mas para simplificar, assumimos sucesso.
          }
        } else if (data.pointsToSpend) {
          // Deduzir pontos
          const { error: txError } = await supabase
            .from("point_transactions")
            .insert({
              user_id: user.id,
              amount: -data.pointsToSpend, // Negative amount
              type: "spend", // Assuming 'spend' is a valid type
              source: "premium_ad_purchase", // New source added
              description: `Destaque de anúncio "${data.title}" por ${data.durationDays} dias`,
              metadata: {
                ad_id: newAd.id,
                duration_days: data.durationDays,
              },
            });

          if (txError) {
            console.error("❌ Erro ao deduzir pontos:", txError);
            toast.error(
              "Anúncio criado, mas houve erro ao descontar pontos. Contate o suporte.",
            );
          }
        }
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

      // Se não for o dono, verificar se é super_admin
      let isSuperAdminCheck = false;
      if (!isOwner) {
        const { data: adminData } = await supabase
          .from("admins")
          .select("role")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        isSuperAdminCheck = adminData?.role === "super_admin";

        if (!isSuperAdminCheck) {
          toast.error("Você não tem permissão para deletar este anúncio");
          setShowDeleteDialog(false);
          setDeletingAdId(null);
          setIsDeleting(false);
          return;
        }
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

  // Abrir modal do anúncio
  const handleOpenAdModal = (ad: any) => {
    setSelectedAd(ad);
    setShowAdModal(true);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ClientOnly>
      <MainLayout requireAuth={false}>
        <div className="min-h-screen bg-gray-50 dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
            {/* Estatísticas Compactas */}
            {/* Estatísticas - Card Compacto */}

            {/* Barra de Busca com Filtros de Localização */}
            <div className="mb-6">
              <div className="flex gap-2">
                {/* Campo de busca */}
                <div className="relative flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      value={filters.searchTerm}
                      onChange={(e) => {
                        const newFilters = {
                          ...filters,
                          searchTerm: e.target.value,
                        };
                        setFilters(newFilters);
                        executeSearch(newFilters);
                      }}
                      placeholder={t("searchPlaceholder")}
                      className="pl-8 pr-4 h-10 text-sm border border-gray-300 focus:border-primary-500 rounded-lg"
                    />
                  </div>

                  {/* Sugestões de serviços */}
                  {filters.searchTerm.length > 1 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {services
                        .filter((service) =>
                          service.name
                            .toLowerCase()
                            .includes(filters.searchTerm.toLowerCase()),
                        )
                        .slice(0, 8)
                        .map((service) => (
                          <button
                            key={service.name}
                            onClick={() => {
                              const newFilters = {
                                ...filters,
                                searchTerm: service.name,
                              };
                              setFilters(newFilters);
                              executeSearch(newFilters);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-sm dark:text-gray-300"
                          >
                            <span className="text-sm">{service.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {service.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {service.description}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Botão de filtro de localização */}
                <div className="relative">
                  <Button
                    id="ad-filters"
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-10 px-3 flex items-center gap-2 ${
                      filters.state || filters.city
                        ? "bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-400"
                        : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {filters.city
                        ? filters.city
                        : filters.state
                          ? filters.state
                          : t("location")}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>

                  {/* Dropdown de filtros de localização */}
                  {showFilters && (
                    <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 w-80 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {t("location")}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFilters(false)}
                          className="h-5 w-5 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {/* Estado */}
                        <div>
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            {tLocation("state")}
                          </label>
                          <EstadoCombobox
                            value={filters.state}
                            onValueChange={(newState) => {
                              console.log("🏛️ Estado selecionado:", newState);
                              const newFilters = {
                                ...filters,
                                state: newState,
                                city: "",
                              };
                              setFilters(newFilters);
                              executeSearch(newFilters);
                              if (newState) {
                                console.log(
                                  "🔄 Carregando cidades para o estado:",
                                  newState,
                                );
                                loadCidades(newState);
                              }
                            }}
                            placeholder={tLocation("selectState")}
                            className="w-full"
                          />
                        </div>

                        {/* Cidade */}
                        <div>
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            {tLocation("city")}
                          </label>
                          <CidadeCombobox
                            value={filters.city}
                            onValueChange={(newCity) => {
                              console.log("🏙️ Cidade selecionada:", newCity);
                              const newFilters = { ...filters, city: newCity };
                              setFilters(newFilters);
                              executeSearch(newFilters);
                            }}
                            estadoSigla={filters.state}
                            placeholder={tLocation("selectCity")}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex justify-between gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newFilters = {
                              ...filters,
                              state: "",
                              city: "",
                            };
                            setFilters(newFilters);
                            executeSearch(newFilters);
                          }}
                          className="text-gray-600 dark:text-gray-400 text-xs h-6 px-2"
                        >
                          {t("clearFilters")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setShowFilters(false)}
                          className="bg-primary-600 hover:bg-primary-700 text-xs h-6 px-3"
                        >
                          {t("applyFilters")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sistema de Abas */}
            <div className="mb-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{t("offers")}:</span>{" "}
                  Profissionais oferecendo serviços •
                  <span className="font-medium"> {t("requests")}:</span>{" "}
                  Clientes procurando serviços
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === "all"
                        ? "border-gray-500 dark:border-gray-400 text-gray-900 dark:text-white"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Grid3X3 className="h-4 w-4" />
                      Todos ({stats.total})
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("offers")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === "offers"
                        ? "border-primary-500 dark:border-primary-400 text-primary-700 dark:text-primary-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <HandHeart className="h-4 w-4" />
                      {t("offers")} ({stats.offers})
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("requests")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === "requests"
                        ? "border-success-500 dark:border-success-400 text-success-700 dark:text-success-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-success-600 dark:hover:text-success-400 hover:border-success-300 dark:hover:border-success-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      {t("requests")} ({stats.requests})
                    </div>
                  </button>
                </nav>
              </div>
            </div>

            {/* Controles de Visualização e Botão Novo Anúncio */}
            <div className="flex justify-between items-center mb-6 gap-1 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-4">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {filteredAds.length}{" "}
                  {filteredAds.length !== 1
                    ? t("resultadosPlural")
                    : t("resultados")}
                </span>

                {/* Seletor de itens por página - Mobile e Desktop */}
                {!loading && filteredAds.length > 0 && (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <label
                      htmlFor="itemsPerPage"
                      className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap"
                    >
                      {t("porPagina")}
                    </label>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) =>
                        setItemsPerPage(parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-14 sm:w-20 h-7 sm:h-8 text-xs sm:text-sm">
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

                {/* Botões Grid/List - Apenas Desktop */}
                <div className="hidden sm:flex border border-gray-200 dark:border-gray-700 rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none h-8 w-8 p-0"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-4">
                {user && (
                  <>
                    <Button
                      id="create-ad-button"
                      size="sm"
                      variant="outline"
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 text-[10px] sm:text-xs px-2 py-1.5 sm:px-3 sm:py-2 h-7 sm:h-8 whitespace-nowrap"
                      onClick={handleOpenCreateDialog}
                    >
                      <Plus className="h-3 w-3 sm:mr-1 text-gray-700 dark:text-gray-300" />
                      <span className="hidden sm:inline text-gray-900 dark:text-gray-100">
                        Novo Anúncio
                      </span>
                      <span className="sm:hidden ml-0.5 text-gray-900 dark:text-gray-100">
                        Novo
                      </span>
                    </Button>
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

                    {/* Modal de Renovar Premium */}
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
                            // Recarregar anúncios
                            loadClassifiedAds();
                          }}
                          onCancel={() => {
                            setShowRenewPremiumDialog(false);
                            setRenewingAdId(null);
                          }}
                        />
                      )}
                    </ResponsiveModal>
                  </>
                )}

                {/* Dialog de Edição */}
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
                    }}
                    onSubmit={async (data) => {
                      if (!user || !editingAdId) return;
                      try {
                        setIsEditingAd(true);
                        const updateData = {
                          title: data.title,
                          description: data.description,
                          category: data.category,
                          location_state: data.location_state,
                          location_city: data.location_city,
                          ad_type:
                            data.ad_type === "offer" ? "oferecer" : "procurar",
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
                        setShowEditDialog(false);
                        setEditingAdId(null);
                        setSelectedAd(null);
                        await loadClassifiedAds();
                      } catch (error) {
                        console.error("Erro ao editar anúncio:", error);
                        toast.error("Erro ao editar anúncio");
                      } finally {
                        setIsEditingAd(false);
                      }
                    }}
                    onCancel={() => setShowEditDialog(false)}
                    isLoading={isEditingAd}
                  />
                </ResponsiveModal>

                {/* Modal de Visualização do Anúncio */}
                <ResponsiveModal
                  isOpen={showAdModal}
                  onOpenChange={setShowAdModal}
                  title={selectedAd?.title}
                  footer={
                    selectedAd && (
                      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4 w-full border-t border-gray-200 dark:border-gray-700 pt-3 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowAdModal(false)}
                          className="w-full sm:w-auto order-2 sm:order-1 text-sm"
                        >
                          Fechar
                        </Button>
                        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto order-1 sm:order-2">
                          {/* Menu de ações com 3 pontinhos */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                              >
                                <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* Ações do dono do anúncio */}
                              {user && selectedAd.user_id === user.id && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setShowAdModal(false);
                                      setEditingAdId(selectedAd.id);
                                      setFormData({
                                        title: selectedAd.title,
                                        description: selectedAd.description,
                                        category: selectedAd.category,
                                        location_state:
                                          selectedAd.location_state,
                                        location_city: selectedAd.location_city,
                                        price_range: "",
                                        urgency_level: "normal",
                                        ad_type:
                                          selectedAd.ad_type === "oferecer"
                                            ? "offer"
                                            : "request",
                                      });
                                      setShowEditDialog(true);
                                    }}
                                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    {t("editAd")}
                                  </DropdownMenuItem>

                                  {/* Botão de renovar premium se o anúncio expirou */}
                                  {selectedAd.is_premium &&
                                    selectedAd.premium_expires_at &&
                                    new Date(selectedAd.premium_expires_at) <
                                      new Date() && (
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setShowAdModal(false);
                                          setRenewingAdId(selectedAd.id);
                                          setShowRenewPremiumDialog(true);
                                        }}
                                        className="text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
                                      >
                                        <Crown className="h-4 w-4 mr-2" />
                                        {t("renewPremium")}
                                      </DropdownMenuItem>
                                    )}

                                  <DropdownMenuItem
                                    onClick={() => {
                                      setShowAdModal(false);
                                      handleDeleteClick(selectedAd.id);
                                    }}
                                    className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t("deleteAd")}
                                  </DropdownMenuItem>
                                </>
                              )}

                              {/* Ações para super_admin (mesmo quando não são donos) */}
                              {user &&
                                isSuperAdmin &&
                                selectedAd.user_id !== user.id && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setShowAdModal(false);
                                      handleDeleteClick(selectedAd.id);
                                    }}
                                    className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Deletar Anúncio (Super Admin)
                                  </DropdownMenuItem>
                                )}

                              {/* Botão de denunciar (para usuários que não são donos do anúncio e não são super_admin) */}
                              {user &&
                                selectedAd.user_id !== user.id &&
                                !isSuperAdmin && (
                                  <DropdownMenuItem asChild>
                                    <ReportButton
                                      type="classified"
                                      targetId={selectedAd.id}
                                      targetName={selectedAd.title}
                                      asDropdownItem={true}
                                      className="w-full justify-start text-gray-700 hover:text-error-600 hover:bg-error-50"
                                    />
                                  </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            onClick={() => {
                              setShowAdModal(false);
                              handleContactUser(
                                selectedAd.user_id,
                                selectedAd.user_name,
                              );
                            }}
                            className={`flex-1 sm:flex-initial text-xs sm:text-sm px-3 py-2 sm:px-4 h-8 sm:h-9 ${
                              selectedAd.ad_type === "oferecer"
                                ? "bg-gray-700 hover:bg-gray-800"
                                : "bg-gray-500 hover:bg-gray-600"
                            } text-white`}
                          >
                            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                            <span className="hidden sm:inline">
                              {t("contact")}
                            </span>
                            <span className="sm:hidden">{t("contact")}</span>
                          </Button>
                        </div>
                      </div>
                    )
                  }
                >
                  {selectedAd && (
                    <div className="space-y-3 sm:space-y-6 py-4">
                      {/* Header com Avatar e Info do Usuário */}
                      <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-4 p-2.5 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="self-center sm:self-start">
                          <Link href={`/perfil/${selectedAd.user_id}`}>
                            <UserAvatar
                              src={selectedAd.user_avatar_url}
                              alt={selectedAd.user_name}
                              fallback={selectedAd.user_name
                                .charAt(0)
                                .toUpperCase()}
                              size="md"
                              userId={selectedAd.user_id}
                              showReferralBadge={true}
                              className="w-12 h-12 sm:w-16 sm:h-16 ring-2 ring-white shadow-md hover:ring-blue-500 transition-all duration-200 cursor-pointer"
                            />
                          </Link>
                        </div>
                        <div className="flex-1 w-full text-center sm:text-left">
                          <Link
                            href={`/perfil/${selectedAd.user_id}`}
                            className="block"
                          >
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-pointer">
                              {selectedAd.user_name}
                            </h3>
                          </Link>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                selectedAd.ad_type === "oferecer"
                                  ? "border-gray-400 text-gray-800 bg-gray-100"
                                  : "border-gray-300 text-gray-600 bg-gray-50"
                              }`}
                            >
                              {selectedAd.ad_type === "oferecer"
                                ? "Oferta"
                                : "Solicitação"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                selectedAd.ad_type === "oferecer"
                                  ? "border-gray-400 text-gray-800 bg-gray-100"
                                  : "border-gray-300 text-gray-600 bg-gray-50"
                              }`}
                            >
                              {getCategoryIcon(selectedAd.category)}{" "}
                              {selectedAd.category}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start text-xs sm:text-sm text-gray-600">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {selectedAd.location_city},{" "}
                            {selectedAd.location_state}
                          </div>
                        </div>
                      </div>

                      {/* Descrição Completa */}
                      <div className="space-y-2 sm:space-y-3">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                          Descrição
                        </h4>
                        <div className="prose max-w-none">
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {selectedAd.description}
                          </p>
                        </div>
                      </div>

                      {/* Galeria de Imagens */}
                      {selectedAd.images && selectedAd.images.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                            Fotos do Serviço
                          </h4>
                          {expandedImage ? (
                            /* Imagem Expandida - Centralizada */
                            <div
                              className="fixed inset-0 z-50 bg-black/90 dark:bg-black/95 flex items-center justify-center p-4"
                              onClick={() => setExpandedImage(null)}
                            >
                              <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedImage(null);
                                  }}
                                  className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-sm transition-all"
                                >
                                  <X className="h-6 w-6" />
                                </button>
                                <img
                                  src={expandedImage}
                                  alt={`${selectedAd.title} - Imagem expandida`}
                                  className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                          ) : (
                            /* Grid de Miniaturas */
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                              {selectedAd.images.map(
                                (image: string, index: number) => (
                                  <div
                                    key={index}
                                    className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-600 transition-all"
                                    onClick={() => setExpandedImage(image)}
                                  >
                                    <img
                                      src={image}
                                      alt={`${selectedAd.title} - Foto ${index + 1}`}
                                      className="w-full h-32 sm:h-40 object-cover hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                                      <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                                        Clique para expandir
                                      </span>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Informações de Contato (apenas para premium) */}
                      {selectedAd.is_premium &&
                        !(selectedAd.premium_expires_at
                          ? new Date(selectedAd.premium_expires_at) < new Date()
                          : false) &&
                        (selectedAd.contact_phone ||
                          selectedAd.contact_email) && (
                          <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <h4 className="text-sm sm:text-base font-semibold text-amber-900 dark:text-amber-200 mb-2">
                              Informações de Contato
                            </h4>
                            <div className="space-y-2">
                              {selectedAd.contact_phone && (
                                <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
                                  <span className="font-semibold">
                                    📞 Telefone:
                                  </span>
                                  <span>{selectedAd.contact_phone}</span>
                                </div>
                              )}
                              {selectedAd.contact_email && (
                                <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
                                  <span className="font-semibold">
                                    ✉️ Email:
                                  </span>
                                  <span>{selectedAd.contact_email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Faixa de Preço (se houver) */}
                      {selectedAd.price_range && (
                        <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold mr-2">
                              💰 Faixa de Preço:
                            </span>
                            <span>{selectedAd.price_range}</span>
                          </div>
                        </div>
                      )}

                      {/* Informações do Anunciante */}
                      {(selectedAd as any).user_profile && (
                        <div className="p-3 sm:p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                          <h4 className="text-sm sm:text-base font-semibold text-primary-900 dark:text-primary-200 mb-3">
                            📋 Sobre o Anunciante
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                            {(selectedAd as any).user_profile.idade && (
                              <div className="flex items-center gap-2 text-primary-800 dark:text-primary-300">
                                <span className="font-semibold">Idade:</span>
                                <span>
                                  {(selectedAd as any).user_profile.idade} anos
                                </span>
                              </div>
                            )}
                            {(selectedAd as any).user_profile.escolaridade && (
                              <div className="flex items-center gap-2 text-primary-800 dark:text-primary-300">
                                <span className="font-semibold">
                                  Escolaridade:
                                </span>
                                <span>
                                  {(selectedAd as any).user_profile
                                    .escolaridade ===
                                  "ensino_fundamental_incompleto"
                                    ? "Ensino Fundamental Incompleto"
                                    : (selectedAd as any).user_profile
                                          .escolaridade ===
                                        "ensino_fundamental_completo"
                                      ? "Ensino Fundamental Completo"
                                      : (selectedAd as any).user_profile
                                            .escolaridade ===
                                          "ensino_medio_incompleto"
                                        ? "Ensino Médio Incompleto"
                                        : (selectedAd as any).user_profile
                                              .escolaridade ===
                                            "ensino_medio_completo"
                                          ? "Ensino Médio Completo"
                                          : (selectedAd as any).user_profile
                                                .escolaridade ===
                                              "ensino_superior_incompleto"
                                            ? "Ensino Superior Incompleto"
                                            : (selectedAd as any).user_profile
                                                  .escolaridade ===
                                                "ensino_superior_completo"
                                              ? "Ensino Superior Completo"
                                              : (selectedAd as any).user_profile
                                                    .escolaridade ===
                                                  "pos_graduacao"
                                                ? "Pós-Graduação"
                                                : (selectedAd as any)
                                                      .user_profile
                                                      .escolaridade ===
                                                    "mestrado"
                                                  ? "Mestrado"
                                                  : (selectedAd as any)
                                                        .user_profile
                                                        .escolaridade ===
                                                      "doutorado"
                                                    ? "Doutorado"
                                                    : (selectedAd as any)
                                                        .user_profile
                                                        .escolaridade}
                                </span>
                              </div>
                            )}
                            {(selectedAd as any).user_profile.estado_civil && (
                              <div className="flex items-center gap-2 text-primary-800 dark:text-primary-300">
                                <span className="font-semibold">
                                  Estado Civil:
                                </span>
                                <span>
                                  {(selectedAd as any).user_profile
                                    .estado_civil === "solteiro"
                                    ? "Solteiro(a)"
                                    : (selectedAd as any).user_profile
                                          .estado_civil === "casado"
                                      ? "Casado(a)"
                                      : (selectedAd as any).user_profile
                                            .estado_civil === "divorciado"
                                        ? "Divorciado(a)"
                                        : (selectedAd as any).user_profile
                                              .estado_civil === "viuvo"
                                          ? "Viúvo(a)"
                                          : (selectedAd as any).user_profile
                                                .estado_civil ===
                                              "uniao_estavel"
                                            ? "União Estável"
                                            : (selectedAd as any).user_profile
                                                  .estado_civil === "outro"
                                              ? "Outro"
                                              : (selectedAd as any).user_profile
                                                  .estado_civil}
                                </span>
                              </div>
                            )}
                            {(selectedAd as any).user_profile.filhos !==
                              undefined &&
                              (selectedAd as any).user_profile.filhos > 0 && (
                                <div className="flex items-center gap-2 text-primary-800 dark:text-primary-300">
                                  <span className="font-semibold">Filhos:</span>
                                  <span>
                                    {(selectedAd as any).user_profile.filhos}{" "}
                                    {(selectedAd as any).user_profile.filhos ===
                                    1
                                      ? "filho"
                                      : "filhos"}
                                  </span>
                                </div>
                              )}
                            {(selectedAd as any).user_profile.user_type ===
                              "professional" && (
                              <>
                                {(selectedAd as any).user_profile
                                  .turno_trabalho && (
                                  <div className="flex items-center gap-2 text-primary-800 dark:text-primary-300">
                                    <span className="font-semibold">
                                      Turno de Trabalho:
                                    </span>
                                    <span>
                                      {(selectedAd as any).user_profile
                                        .turno_trabalho === "manha"
                                        ? "Manhã"
                                        : (selectedAd as any).user_profile
                                              .turno_trabalho === "tarde"
                                          ? "Tarde"
                                          : (selectedAd as any).user_profile
                                                .turno_trabalho === "noite"
                                            ? "Noite"
                                            : (selectedAd as any).user_profile
                                                  .turno_trabalho === "integral"
                                              ? "Turno Integral"
                                              : (selectedAd as any).user_profile
                                                    .turno_trabalho ===
                                                  "flexivel"
                                                ? "Horário Flexível"
                                                : (selectedAd as any)
                                                    .user_profile
                                                    .turno_trabalho}
                                    </span>
                                  </div>
                                )}
                                {(selectedAd as any).user_profile
                                  .professional_experience_years !==
                                  undefined &&
                                  (selectedAd as any).user_profile
                                    .professional_experience_years !== null &&
                                  (selectedAd as any).user_profile
                                    .professional_experience_years > 0 && (
                                    <div className="flex items-center gap-2 text-primary-800 dark:text-primary-300">
                                      <span className="font-semibold">
                                        Experiência:
                                      </span>
                                      <span>
                                        {
                                          (selectedAd as any).user_profile
                                            .professional_experience_years
                                        }{" "}
                                        {(selectedAd as any).user_profile
                                          .professional_experience_years === 1
                                          ? "ano"
                                          : "anos"}
                                      </span>
                                    </div>
                                  )}
                                {(selectedAd as any).user_profile
                                  .referencia_profissional && (
                                  <div className="sm:col-span-2 mt-2">
                                    <p className="text-xs font-semibold text-primary-900 dark:text-primary-200 mb-1">
                                      Referência Profissional:
                                    </p>
                                    <p className="text-xs text-primary-800 dark:text-primary-300 leading-relaxed">
                                      {
                                        (selectedAd as any).user_profile
                                          .referencia_profissional
                                      }
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Informações Adicionais */}
                      <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          <span>
                            Publicado em {formatDate(selectedAd.created_at)}
                          </span>
                        </div>
                        {/* Duração do anúncio premium (apenas para o criador) */}
                        {user &&
                          selectedAd.user_id === user.id &&
                          selectedAd.is_premium &&
                          selectedAd.premium_expires_at && (
                            <div className="mt-2">
                              {new Date(selectedAd.premium_expires_at) <
                              new Date() ? (
                                <div className="p-2 bg-error-50 dark:bg-error-900/20 rounded-lg border border-error-200 dark:border-error-800">
                                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">
                                    ⚠️ Seu anúncio premium expirou. Renove para
                                    continuar em destaque!
                                  </p>
                                </div>
                              ) : (
                                <PremiumTimeRemaining
                                  expiresAt={selectedAd.premium_expires_at}
                                  isOwner={true}
                                />
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </ResponsiveModal>
              </div>
            </div>

            {/* Lista de Anúncios */}
            {loading ? (
              <ClassifiedsListSkeleton viewMode={viewMode} />
            ) : paginatedAds.length === 0 ? (
              <EmptyState
                icon={<Search className="h-12 w-12 text-gray-400" />}
                title={t("noResults")}
                description={
                  filters.searchTerm ||
                  filters.state ||
                  filters.city ||
                  filters.category !== "all"
                    ? t("noResultsDescription")
                    : t("noAdsDescription")
                }
                action={
                  filters.searchTerm ||
                  filters.state ||
                  filters.city ||
                  filters.category !== "all"
                    ? {
                        label: t("clearFilters"),
                        onClick: clearFilters,
                      }
                    : undefined
                }
              />
            ) : (
              <div
                className={`grid gap-5 sm:gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
              >
                {paginatedAds.map((ad, index) => (
                  <ClassifiedsCard
                    key={ad.id}
                    ad={ad}
                    onEdit={handleEditAd}
                    onDelete={handleDeleteClick}
                    onRenewPremium={(adId) => {
                      setRenewingAdId(adId);
                      setShowRenewPremiumDialog(true);
                    }}
                    isDeleting={isDeleting && deletingAdId === ad.id}
                  />
                ))}
              </div>
            )}

            {/* Paginação */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-1">
                {/* Botão Anterior */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Números das páginas */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNumber) => {
                    // Mostrar no máximo 7 números: atual, 2 antes, 2 depois, primeira e última
                    const shouldShow =
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 2 &&
                        pageNumber <= currentPage + 2);

                    if (!shouldShow) {
                      // Mostrar reticências apenas entre intervalos
                      if (
                        pageNumber === currentPage - 3 ||
                        pageNumber === currentPage + 3
                      ) {
                        return (
                          <span key={pageNumber} className="px-2 text-gray-500">
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
                        className={`px-3 ${
                          currentPage === pageNumber
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : ""
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  },
                )}

                {/* Botão Próximo */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Info da paginação */}
            {!loading && filteredAds.length > 0 && (
              <div className="text-center mt-4 text-sm text-gray-600">
                {t("mostrando")} {startIndex + 1} a{" "}
                {Math.min(endIndex, filteredAds.length)} {t("de")}{" "}
                {filteredAds.length} {t("resultadosPlural")}
              </div>
            )}
          </div>
        </div>
      </MainLayout>

      {/* AlertDialog para confirmação de deleção */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-black border border-gray-200 dark:border-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">
              {isSuperAdmin && !deletingAdIsOwner
                ? "Deletar Anúncio (Super Admin)"
                : "Deletar Anúncio"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {isSuperAdmin && !deletingAdIsOwner ? (
                <>
                  Você está deletando este anúncio como{" "}
                  <strong>Super Administrador</strong>. Esta ação não pode ser
                  desfeita. O anúncio será removido permanentemente.
                </>
              ) : (
                <>
                  Tem certeza que deseja deletar este anúncio? Esta ação não
                  pode ser desfeita. O anúncio será removido permanentemente.
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
    </ClientOnly>
  );
}
