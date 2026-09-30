"use client";

// Desabilitar SSG para esta página
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import {
  Star,
  Search,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MessageCircle,
  Calendar,
  Award,
  TrendingUp,
  Eye,
  Filter,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  BarChart3,
  Target,
  Zap,
  ThumbsUp,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { ReviewListSkeleton } from "@/components/ui/skeleton";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClientOnly } from "@/components/ClientOnly";

interface UserReview {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  rating_person?: number;
  comment?: string;
  review_type: "client_to_professional" | "professional_to_client";
  created_at: string;
  reviewer: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type: "client" | "professional";
  };
  reviewed?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type: "client" | "professional";
  };
}

interface EvaluationRequest {
  id: string;
  requester_id: string;
  target_id: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  created_at: string;
  requester_name?: string;
  target_name?: string;
  requester_avatar?: string;
  target_avatar?: string;
}

export default function AvaliacoesPage() {
  const [mounted, setMounted] = useState(false);
  const { user, profile } = useAuthContext();
  const { openChat } = useFloatingChat();

  // Estados principais
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [givenReviews, setGivenReviews] = useState<UserReview[]>([]);
  const [requests, setRequests] = useState<EvaluationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados da interface
  const [activeTab, setActiveTab] = useState<"requests" | "reviews">(
    "requests",
  );
  const [requestsSubTab, setRequestsSubTab] = useState<"received" | "sent">(
    "received",
  );
  const [reviewsSubTab, setReviewsSubTab] = useState<"received" | "given">(
    "received",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "professional" | "client"
  >("all");
  const [showEditReviewDialog, setShowEditReviewDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<UserReview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para formulários
  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: "",
  });

  // Carregar dados das avaliações de forma otimizada
  const loadUserEvaluations = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Executar todas as consultas em paralelo para melhor performance
      const [
        { data: reviewsData, error: reviewsError },
        { data: givenReviewsData, error: givenReviewsError },
        { data: requestsData, error: requestsError },
      ] = await Promise.all([
        // Avaliações recebidas
        supabase
          .from("reviews")
          .select(
            `
            *,
            reviewer:profiles!reviews_reviewer_id_fkey(
              id, full_name, avatar_url, user_type
            )
          `,
          )
          .eq("reviewed_id", user.id)
          .order("created_at", { ascending: false }),

        // Avaliações feitas
        supabase
          .from("reviews")
          .select(
            `
            *,
            reviewed:profiles!reviews_reviewed_id_fkey(
              id, full_name, avatar_url, user_type
            )
          `,
          )
          .eq("reviewer_id", user.id)
          .order("created_at", { ascending: false }),

        // Solicitações de avaliação
        supabase
          .from("evaluation_requests")
          .select(
            `
            *,
            requester:profiles!evaluation_requests_requester_id_fkey(
              id, full_name, avatar_url, user_type
            ),
            target:profiles!evaluation_requests_target_id_fkey(
              id, full_name, avatar_url, user_type
            )
          `,
          )
          .or(`requester_id.eq.${user.id},target_id.eq.${user.id}`)
          .order("created_at", { ascending: false }),
      ]);

      // Verificar erros
      if (reviewsError) {
        console.error("Erro ao carregar avaliações recebidas:", reviewsError);
      }
      if (givenReviewsError) {
        console.error("Erro ao carregar avaliações feitas:", givenReviewsError);
      }
      if (requestsError) {
        console.error("Erro ao carregar solicitações:", requestsError);
      }

      // Mapear solicitações de forma mais eficiente
      const mappedRequests =
        requestsData?.map((req) => ({
          id: req.id,
          requester_id: req.requester_id,
          target_id: req.target_id,
          status: req.status,
          created_at: req.created_at || new Date().toISOString(),
          requester_name: req.requester?.full_name || "",
          target_name: req.target?.full_name || "",
          requester_avatar: req.requester?.avatar_url || "",
          target_avatar: req.target?.avatar_url || "",
        })) || [];

      // Atualizar estados de uma vez
      setReviews(reviewsData || []);
      setGivenReviews(givenReviewsData || []);
      setRequests(mappedRequests);
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
      toast.error("Erro ao carregar dados das avaliações");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Função para abrir modal de edição
  const handleEditReview = (review: UserReview) => {
    setEditingReview(review);
    setEditForm({
      rating: review.rating_person || review.rating || 5,
      comment: review.comment || "",
    });
    setShowEditReviewDialog(true);
  };

  // Função para fechar modal de edição
  const handleCloseEditDialog = () => {
    setShowEditReviewDialog(false);
    setEditingReview(null);
    setEditForm({
      rating: 5,
      comment: "",
    });
  };

  // Função para editar avaliação
  const handleEditReviewSubmit = useCallback(async () => {
    if (!editingReview || !user?.id) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from("reviews")
        .update({
          rating_person: editForm.rating,
          comment: editForm.comment.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingReview.id);

      if (error) throw error;

      toast.success("Avaliação atualizada com sucesso!");

      // Atualizar estado local
      const updateReview = (prev: UserReview[]) =>
        prev.map((review) =>
          review.id === editingReview.id
            ? {
                ...review,
                rating: editForm.rating,
                comment: editForm.comment.trim() || "",
              }
            : review,
        );

      setReviews(updateReview);
      setGivenReviews(updateReview);

      handleCloseEditDialog();
    } catch (error) {
      console.error("Erro ao atualizar avaliação:", error);
      toast.error("Erro ao atualizar avaliação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }, [editingReview, editForm, user?.id]);

  // Função para contatar usuário
  const handleContactUser = (userId: string, userName: string) => {
    if (userId === user?.id) {
      toast.error("Você não pode contatar a si mesmo");
      return;
    }
    openChat(userId, userName);
  };

  // Função otimizada para manipular solicitações
  const handleRequestAction = useCallback(
    async (requestId: string, action: "accept" | "reject" | "complete") => {
      const statusMap = {
        accept: "accepted",
        reject: "rejected",
        complete: "completed",
      };

      const messages = {
        accept: "Solicitação aceita!",
        reject: "Solicitação rejeitada",
        complete: "Solicitação concluída!",
      };

      try {
        const { error } = await supabase
          .from("evaluation_requests")
          .update({
            status: statusMap[action],
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestId);

        if (error) throw error;

        toast.success(messages[action]);

        // Atualizar estado local sem recarregar tudo
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? { ...req, status: statusMap[action] as any }
              : req,
          ),
        );
      } catch (error) {
        console.error(`Erro ao ${action} solicitação:`, error);
        toast.error(`Erro ao ${action} solicitação`);
      }
    },
    [],
  );

  // Funções específicas para cada ação
  const handleAcceptRequest = (requestId: string) =>
    handleRequestAction(requestId, "accept");
  const handleRejectRequest = (requestId: string) =>
    handleRequestAction(requestId, "reject");
  const handleCompleteRequest = (requestId: string) =>
    handleRequestAction(requestId, "complete");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.id && mounted) {
      loadUserEvaluations();
    }
  }, [user?.id, mounted, loadUserEvaluations]);

  if (!mounted) {
    return null;
  }

  if (!user) {
    return (
      <ClientOnly>
        <MainLayout requireAuth={false}>
          <div className="min-h-screen bg-[var(--cl-paper)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-8 text-center">
                  <Star className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Minhas Avaliações
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Faça login para gerenciar suas avaliações
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button asChild>
                      <a href="/auth">Entrar</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/auth?tab=register">Criar Conta</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </MainLayout>
      </ClientOnly>
    );
  }

  // Calcular estatísticas
  const stats = {
    totalReviews: reviews.length,
    givenReviews: givenReviews.length,
    receivedRequests: requests.filter((req) => req.target_id === user.id)
      .length,
    sentRequests: requests.filter((req) => req.requester_id === user.id).length,
    pendingRequests: requests.filter((req) => req.status === "pending").length,
    acceptedRequests: requests.filter((req) => req.status === "accepted")
      .length,
    completedRequests: requests.filter((req) => req.status === "completed")
      .length,
    totalRequests: requests.length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Filtrar dados baseado na busca e filtro
  const getFilteredReviews = () => {
    const reviewsToFilter =
      reviewsSubTab === "received" ? reviews : givenReviews;
    return reviewsToFilter.filter((review) => {
      const user =
        reviewsSubTab === "received" ? review.reviewer : review.reviewed;
      const matchesSearch = user?.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterType === "all" || user?.user_type === filterType;
      return matchesSearch && matchesFilter;
    });
  };

  const getFilteredRequests = () => {
    const requestsToFilter =
      requestsSubTab === "received"
        ? requests.filter((req) => req.target_id === user.id)
        : requests.filter((req) => req.requester_id === user.id);

    const filtered = requestsToFilter.filter((req) => {
      const matchesSearch =
        searchTerm === "" ||
        req.requester_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.target_name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    return filtered;
  };

  const filteredReviews = getFilteredReviews();
  const filteredRequests = getFilteredRequests();

  if (loading) {
    return (
      <ClientOnly>
        <MainLayout requireAuth={true}>
          <div className="min-h-screen bg-[var(--cl-paper)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ReviewListSkeleton count={5} />
            </div>
          </div>
        </MainLayout>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-[var(--cl-paper)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Award className="h-8 w-8 mr-3 text-gray-700" />
                    Minhas Avaliações
                  </h1>
                  <p className="text-gray-600">
                    Gerencie suas avaliações e solicitações de avaliação
                  </p>
                </div>
              </div>
            </div>

            {/* Estatísticas Compactas */}
            <Card className="mb-6 sm:mb-8 hover:shadow-xl transition-all duration-300">
              <CardContent className="py-2 px-3 sm:py-3 sm:px-4">
                <div className="flex flex-row items-center justify-around gap-1 sm:gap-2">
                  {/* Solicitações Recebidas */}
                  <div className="flex flex-col items-center min-w-0 flex-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mb-0.5" />
                    <p className="text-xs text-gray-500 text-center">
                      Recebidas
                    </p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {stats.receivedRequests}
                    </p>
                  </div>

                  {/* Solicitações Enviadas */}
                  <div className="flex flex-col items-center min-w-0 flex-1">
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mb-0.5" />
                    <p className="text-xs text-gray-500 text-center">
                      Enviadas
                    </p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {stats.sentRequests}
                    </p>
                  </div>

                  {/* Avaliações Recebidas */}
                  <div className="flex flex-col items-center min-w-0 flex-1">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mb-0.5" />
                    <p className="text-xs text-gray-500 text-center">
                      Avaliações
                    </p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {stats.totalReviews}
                    </p>
                  </div>

                  {/* Pendentes */}
                  <div className="flex flex-col items-center min-w-0 flex-1">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mb-0.5" />
                    <p className="text-xs text-gray-500 text-center">
                      Pendentes
                    </p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {stats.pendingRequests}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex flex-wrap gap-2 sm:gap-4 lg:gap-8">
                  <button
                    onClick={() => setActiveTab("requests")}
                    className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                      activeTab === "requests"
                        ? "border-gray-500 text-gray-900 dark:text-white"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Solicitações</span>
                      <span className="sm:hidden">Solic.</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                      activeTab === "reviews"
                        ? "border-gray-500 text-gray-900 dark:text-white"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Avaliações</span>
                      <span className="sm:hidden">Aval.</span>
                    </div>
                  </button>
                </nav>
              </div>
            </div>

            {/* Conteúdo das Tabs */}
            {activeTab === "requests" && (
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Solicitações
                      </CardTitle>
                      <CardDescription>
                        {requestsSubTab === "received"
                          ? `Solicitações que você recebeu (${stats.receivedRequests})`
                          : `Solicitações que você enviou (${stats.sentRequests})`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Abas de Solicitações */}
                  <div className="mb-6">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex flex-wrap gap-2 sm:gap-4 lg:gap-8">
                        <button
                          onClick={() => setRequestsSubTab("received")}
                          className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                            requestsSubTab === "received"
                              ? "border-gray-500 text-gray-900 dark:text-white"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">
                              Recebidas ({stats.receivedRequests})
                            </span>
                            <span className="sm:hidden">
                              Rec. ({stats.receivedRequests})
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={() => setRequestsSubTab("sent")}
                          className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                            requestsSubTab === "sent"
                              ? "border-gray-700 text-gray-900 dark:text-white"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">
                              Enviadas ({stats.sentRequests})
                            </span>
                            <span className="sm:hidden">
                              Env. ({stats.sentRequests})
                            </span>
                          </div>
                        </button>
                      </nav>
                    </div>
                  </div>

                  {/* Filtros */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar por nome..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {filteredRequests.length > 0 ? (
                    <div className="space-y-4">
                      {filteredRequests.map((request) => (
                        <div
                          key={request.id}
                          className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start space-x-3 sm:space-x-4">
                            <div className="flex -space-x-1 sm:-space-x-2 flex-shrink-0">
                              <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white">
                                <AvatarImage
                                  src={request.requester_avatar}
                                  alt={`Avatar de ${request.requester_name}`}
                                />
                                <AvatarFallback>
                                  {request.requester_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white">
                                <AvatarImage
                                  src={request.target_avatar}
                                  alt={`Avatar de ${request.target_name}`}
                                />
                                <AvatarFallback>
                                  {request.target_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                    {request.requester_id === user.id
                                      ? "Você"
                                      : request.requester_name}{" "}
                                    ↔️{" "}
                                    {request.target_id === user.id
                                      ? "Você"
                                      : request.target_name}
                                  </h4>
                                  <div className="flex items-center space-x-2 flex-wrap">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        request.status === "pending"
                                          ? "text-yellow-600 border-yellow-600"
                                          : request.status === "accepted"
                                            ? "text-green-600 border-green-600"
                                            : request.status === "rejected"
                                              ? "text-red-600 border-red-600"
                                              : "text-[var(--cl-teal)] border-[var(--cl-teal)]"
                                      }`}
                                    >
                                      {request.status === "pending"
                                        ? "Pendente"
                                        : request.status === "accepted"
                                          ? "Aceita"
                                          : request.status === "rejected"
                                            ? "Rejeitada"
                                            : "Concluída"}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(request.created_at)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-wrap">
                                  {request.status === "pending" &&
                                    request.target_id === user.id && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleAcceptRequest(request.id)
                                          }
                                          className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                                        >
                                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                          <span className="hidden sm:inline">
                                            Aceitar
                                          </span>
                                          <span className="sm:hidden">✓</span>
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleRejectRequest(request.id)
                                          }
                                          className="text-red-600 border-red-600 hover:bg-red-50 text-xs sm:text-sm"
                                        >
                                          <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                          <span className="hidden sm:inline">
                                            Rejeitar
                                          </span>
                                          <span className="sm:hidden">✗</span>
                                        </Button>
                                      </>
                                    )}

                                  {request.status === "accepted" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleCompleteRequest(request.id)
                                      }
                                      className="text-xs sm:text-sm"
                                    >
                                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                      <span className="hidden sm:inline">
                                        Concluir
                                      </span>
                                      <span className="sm:hidden">✓</span>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Clock className="h-16 w-16 text-gray-400" />}
                      title="Nenhuma solicitação encontrada"
                      description={
                        requestsSubTab === "received"
                          ? "Você ainda não recebeu solicitações de avaliação"
                          : "Você ainda não enviou solicitações de avaliação"
                      }
                      variant="minimal"
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "reviews" && (
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Star className="h-5 w-5 mr-2" />
                        Avaliações
                      </CardTitle>
                      <CardDescription>
                        {reviewsSubTab === "received"
                          ? `Avaliações que você recebeu (${stats.totalReviews})`
                          : `Avaliações que você fez (${stats.givenReviews})`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Abas de Avaliações */}
                  <div className="mb-6">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex flex-wrap gap-2 sm:gap-4 lg:gap-8">
                        <button
                          onClick={() => setReviewsSubTab("received")}
                          className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                            reviewsSubTab === "received"
                              ? "border-gray-500 text-gray-900 dark:text-white"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">
                              Recebidas ({stats.totalReviews})
                            </span>
                            <span className="sm:hidden">
                              Rec. ({stats.totalReviews})
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={() => setReviewsSubTab("given")}
                          className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                            reviewsSubTab === "given"
                              ? "border-gray-700 text-gray-900 dark:text-white"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">
                              Feitas ({stats.givenReviews})
                            </span>
                            <span className="sm:hidden">
                              Feitas ({stats.givenReviews})
                            </span>
                          </div>
                        </button>
                      </nav>
                    </div>
                  </div>

                  {/* Filtros */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar por nome..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select
                      value={filterType}
                      onValueChange={(
                        value: "all" | "professional" | "client",
                      ) => setFilterType(value)}
                    >
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="professional">
                          Profissionais
                        </SelectItem>
                        <SelectItem value="client">Clientes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {filteredReviews.length > 0 ? (
                    <div className="space-y-4">
                      {filteredReviews.map((review) => (
                        <div
                          key={review.id}
                          className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start space-x-3 sm:space-x-4">
                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                              <AvatarImage
                                src={
                                  reviewsSubTab === "received"
                                    ? review.reviewer.avatar_url || ""
                                    : review.reviewed?.avatar_url || ""
                                }
                                alt={`Avatar de ${reviewsSubTab === "received" ? review.reviewer.full_name : review.reviewed?.full_name}`}
                              />
                              <AvatarFallback className="bg-blue-100 text-[var(--cl-teal)]">
                                {(reviewsSubTab === "received"
                                  ? review.reviewer.full_name
                                  : review.reviewed?.full_name || ""
                                ).charAt(0)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                                    {reviewsSubTab === "received"
                                      ? review.reviewer.full_name
                                      : review.reviewed?.full_name || ""}
                                  </h4>
                                  <div className="flex items-center space-x-2 flex-wrap">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {(reviewsSubTab === "received"
                                        ? review.reviewer.user_type
                                        : review.reviewed?.user_type ||
                                          "client") === "professional"
                                        ? "Profissional"
                                        : "Cliente"}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(review.created_at)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-wrap">
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                          star <=
                                          (review.rating_person ||
                                            review.rating ||
                                            0)
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                    <span className="ml-1 text-xs sm:text-sm text-gray-600">
                                      {review.rating_person ||
                                        review.rating ||
                                        0}
                                      /5
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 flex-wrap">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleContactUser(
                                          reviewsSubTab === "received"
                                            ? review.reviewer.id
                                            : review.reviewed?.id || "",
                                          reviewsSubTab === "received"
                                            ? review.reviewer.full_name
                                            : review.reviewed?.full_name || "",
                                        )
                                      }
                                      className="text-xs sm:text-sm"
                                    >
                                      <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                      <span className="hidden sm:inline">
                                        Contatar
                                      </span>
                                      <span className="sm:hidden">Chat</span>
                                    </Button>
                                    {reviewsSubTab === "given" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEditReview(review)}
                                        className="text-[var(--cl-teal)] border-[var(--cl-teal)] hover:bg-[var(--cl-mist)] text-xs sm:text-sm"
                                      >
                                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                        <span className="hidden sm:inline">
                                          Editar
                                        </span>
                                        <span className="sm:hidden">Ed.</span>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {review.comment && (
                                <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 rounded-md mt-2 break-words">
                                  "{review.comment}"
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {searchTerm || filterType !== "all"
                          ? "Nenhuma avaliação encontrada"
                          : "Nenhuma avaliação ainda"}
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm || filterType !== "all"
                          ? "Tente ajustar os filtros de busca"
                          : reviewsSubTab === "received"
                            ? "Você ainda não recebeu avaliações de outros usuários"
                            : "Você ainda não fez avaliações para outros usuários"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Modal de Edição de Avaliação */}
        {showEditReviewDialog && editingReview && (
          <ResponsiveModal
            isOpen={showEditReviewDialog}
            onOpenChange={setShowEditReviewDialog}
            title="Editar Avaliação"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-rating">Avaliação (1-5 estrelas)</Label>
                <div className="flex items-center space-x-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setEditForm((prev) => ({ ...prev, rating: star }))
                      }
                      className={`p-1 rounded-full transition-colors ${
                        star <= editForm.rating
                          ? "text-yellow-400 hover:text-yellow-500"
                          : "text-gray-300 hover:text-gray-400"
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {editForm.rating} de 5 estrelas
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-comment">Comentário (opcional)</Label>
                <Textarea
                  id="edit-comment"
                  value={editForm.comment}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  placeholder="Deixe um comentário sobre sua experiência (opcional)..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCloseEditDialog}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditReviewSubmit}
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </ResponsiveModal>
        )}
      </MainLayout>
    </ClientOnly>
  );
}
