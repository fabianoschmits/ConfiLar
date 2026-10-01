"use client";

// Desabilitar SSG para esta página
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Handshake,
  CheckCircle,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Users,
  Star,
  ArrowLeft,
  Timer,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgreementDetails {
  id: string;
  client_id: string;
  professional_id: string;
  conversation_id: string;
  service_description: string;
  agreed_price?: number;
  proposed_date?: string;
  proposed_time?: string;
  estimated_duration?: number;
  notes?: string;
  status: "accepted" | "pending" | "rejected";
  proposed_by: string;
  created_at: string;
  updated_at: string;
  contacts_revealed_at?: string;
  currency: string;
  client: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type: string;
  };
  professional: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type: string;
  };
}

export default function AgreementPage() {
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuthContext();
  const [agreement, setAgreement] = useState<AgreementDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeUntilReview, setTimeUntilReview] = useState<string>("");
  const [canReview, setCanReview] = useState(false);

  const agreementId = params.id as string;

  useEffect(() => {
    if (agreementId && profile?.id) {
      loadAgreement();
    }
  }, [agreementId, profile?.id]);

  useEffect(() => {
    if (agreement?.contacts_revealed_at) {
      updateTimeUntilReview();
      const interval = setInterval(updateTimeUntilReview, 1000);
      return () => clearInterval(interval);
    }
  }, [agreement]);

  if (!mounted) {
    return null;
  }

  const loadAgreement = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("contact_agreements")
        .select(
          `
          *,
          client:profiles!contact_agreements_client_id_fkey(
            id, full_name, avatar_url, user_type
          ),
          professional:profiles!contact_agreements_professional_id_fkey(
            id, full_name, avatar_url, user_type
          )
        `,
        )
        .eq("id", agreementId)
        .single();

      if (error) {
        console.error("Erro ao carregar acordo:", error);
        toast.error("Erro ao carregar acordo");
        router.push("/mensagens");
        return;
      }

      // Verificar se o usuário atual faz parte do acordo
      if (
        data.client_id !== profile?.id &&
        data.professional_id !== profile?.id
      ) {
        toast.error("Você não tem acesso a este acordo");
        router.push("/mensagens");
        return;
      }

      setAgreement(data);
    } catch (error) {
      console.error("Erro ao carregar acordo:", error);
      toast.error("Erro ao carregar acordo");
      router.push("/mensagens");
    } finally {
      setLoading(false);
    }
  };

  const updateTimeUntilReview = () => {
    if (!agreement?.contacts_revealed_at) return;

    const revealedDate = new Date(agreement.contacts_revealed_at);
    const reviewDate = new Date(revealedDate.getTime() + 20 * 60 * 60 * 1000); // 20 horas
    const now = new Date();

    if (now >= reviewDate) {
      setTimeUntilReview("Vocês já podem se avaliar!");
      setCanReview(true);
    } else {
      const diff = reviewDate.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilReview(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
      setCanReview(false);
    }
  };

  const handleGoToReviews = () => {
    router.push("/avaliacoes");
  };

  const handleGoToChat = () => {
    router.push(`/mensagens?conversation=${agreement?.conversation_id}`);
  };

  if (loading) {
    return (
      <MainLayout requireAuth={true}>
        <div className="app-page">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2 bg-[var(--cl-surface)] border border-[var(--cl-border)] rounded-2xl shadow-[var(--cl-shadow)] p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--cl-teal)] border-t-transparent"></div>
              <span className="font-semibold text-[var(--cl-ink)]">
                CARREGANDO ACORDO...
              </span>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!agreement) {
    return (
      <MainLayout requireAuth={true}>
        <div className="app-page">
          <div className="text-center">
            <div className="bg-[var(--cl-surface)] border border-[var(--cl-border)] rounded-2xl shadow-[var(--cl-shadow)] p-6 inline-block">
              <h1 className="text-2xl font-semibold text-[var(--cl-ink)] mb-4">
                ACORDO NÃO ENCONTRADO
              </h1>
              <Button onClick={() => router.push("/feed")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                VOLTAR PARA MENSAGENS
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const otherUser =
    agreement.client_id === profile?.id
      ? agreement.professional
      : agreement.client;

  const currentUserRole =
    agreement.client_id === profile?.id ? "client" : "professional";

  return (
    <MainLayout requireAuth={true}>
      <div className="app-page">
        {/* Header */}
        <PageHeader
          title="Acordo de serviço"
          description="Confira os detalhes e participantes do acordo aceito."
          icon={FileText}
          actions={
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              Aceito
            </Badge>
          }
          backHref="/feed"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Informações do Acordo */}
          <div className="space-y-6">
            {/* Detalhes do Serviço */}
            <Card className="bg-[var(--cl-surface)] border border-[var(--cl-border)] rounded-2xl shadow-[var(--cl-shadow)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-[var(--cl-ink)]" />
                  <h2 className="text-xl font-semibold text-[var(--cl-ink)]">
                    DETALHES DO SERVIÇO
                  </h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-[var(--cl-ink)]">
                      SERVIÇO:
                    </span>
                    <p className="text-[var(--cl-ink)] font-bold">
                      {agreement.service_description}
                    </p>
                  </div>

                  {agreement.agreed_price && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-[var(--cl-ink)]" />
                      <span className="text-sm font-semibold text-[var(--cl-ink)]">
                        VALOR:
                      </span>
                      <span className="text-[var(--cl-ink)] font-bold">
                        R$ {agreement.agreed_price}
                      </span>
                    </div>
                  )}

                  {agreement.proposed_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[var(--cl-ink)]" />
                      <span className="text-sm font-semibold text-[var(--cl-ink)]">
                        DATA:
                      </span>
                      <span className="text-[var(--cl-ink)] font-bold">
                        {new Date(agreement.proposed_date).toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                    </div>
                  )}

                  {agreement.proposed_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[var(--cl-ink)]" />
                      <span className="text-sm font-semibold text-[var(--cl-ink)]">
                        HORÁRIO:
                      </span>
                      <span className="text-[var(--cl-ink)] font-bold">
                        {agreement.proposed_time}
                      </span>
                    </div>
                  )}

                  {agreement.estimated_duration && (
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-[var(--cl-ink)]" />
                      <span className="text-sm font-semibold text-[var(--cl-ink)]">
                        DURAÇÃO ESTIMADA:
                      </span>
                      <span className="text-[var(--cl-ink)] font-bold">
                        {agreement.estimated_duration} horas
                      </span>
                    </div>
                  )}

                  {agreement.notes && (
                    <div>
                      <span className="text-sm font-semibold text-[var(--cl-ink)]">
                        OBSERVAÇÕES:
                      </span>
                      <p className="text-[var(--cl-ink)] font-bold">
                        {agreement.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações dos Participantes */}
            <Card className="bg-[var(--cl-surface)] border border-[var(--cl-border)] rounded-2xl shadow-[var(--cl-shadow)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-6 w-6 text-[var(--cl-ink)]" />
                  <h2 className="text-xl font-semibold text-[var(--cl-ink)]">
                    PARTICIPANTES
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-100 border-2 border-black">
                    <div>
                      <p className="font-semibold text-[var(--cl-ink)]">
                        CLIENTE
                      </p>
                      <p className="text-[var(--cl-ink)] font-bold">
                        {agreement.client.full_name}
                      </p>
                    </div>
                    <Badge className="bg-blue-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-semibold">
                      CLIENTE
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-100 border-2 border-black">
                    <div>
                      <p className="font-semibold text-[var(--cl-ink)]">
                        PROFISSIONAL
                      </p>
                      <p className="text-[var(--cl-ink)] font-bold">
                        {agreement.professional.full_name}
                      </p>
                    </div>
                    <Badge className="bg-green-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-semibold">
                      PROFISSIONAL
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status e Ações */}
          <div className="space-y-6">
            {/* Contador de Tempo */}
            <Card className="bg-yellow-400 border border-[var(--cl-border)] rounded-2xl shadow-[var(--cl-shadow)]">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Timer className="h-8 w-8 text-[var(--cl-ink)]" />
                    <h2 className="text-xl font-semibold text-[var(--cl-ink)]">
                      TEMPO PARA AVALIAÇÃO
                    </h2>
                  </div>

                  <div className="bg-black text-yellow-400 border border-[var(--cl-border)] rounded-2xl shadow-[var(--cl-shadow)] p-6 mb-4">
                    <div className="text-4xl font-semibold mb-2">
                      {canReview ? "✅" : "⏰"}
                    </div>
                    <div className="text-2xl font-semibold">
                      {canReview ? "PODE AVALIAR!" : timeUntilReview}
                    </div>
                  </div>

                  <p className="text-[var(--cl-ink)] font-bold mb-4">
                    {canReview
                      ? "Vocês já podem se avaliar mutuamente!"
                      : "Aguarde 20 horas após o acordo para poder avaliar"}
                  </p>

                  <Button
                    onClick={handleGoToReviews}
                    disabled={!canReview}
                    className="bg-black text-yellow-400 border border-[var(--cl-border)] rounded-2xl shadow-[var(--cl-shadow)] hover:opacity-90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {canReview ? "AVALIAR USUÁRIO" : "AGUARDANDO TEMPO"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card className="bg-[var(--cl-surface)] border border-[var(--cl-border)] rounded-2xl shadow-[var(--cl-shadow)]">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-[var(--cl-ink)] mb-4">
                  AÇÕES RÁPIDAS
                </h2>

                <div className="space-y-3">
                  <Button
                    onClick={handleGoToChat}
                    className="w-full bg-blue-500 text-white border border-[var(--cl-border)] rounded-2xl shadow-[var(--cl-shadow)] hover:opacity-90 transition-all font-semibold"
                  >
                    <Handshake className="h-4 w-4 mr-2" />
                    CONTINUAR CONVERSA
                  </Button>

                  <Button
                    onClick={handleGoToReviews}
                    className="w-full bg-green-500 text-white border border-[var(--cl-border)] rounded-2xl shadow-[var(--cl-shadow)] hover:opacity-90 transition-all font-semibold"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    VER AVALIAÇÕES
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Acordo */}
            <Card className="bg-gray-100 border border-[var(--cl-border)] rounded-2xl shadow-[var(--cl-shadow)]">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-[var(--cl-ink)] mb-4">
                  INFORMAÇÕES
                </h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[var(--cl-ink)]">
                      ACORDO ID:
                    </span>
                    <span className="font-bold text-[var(--cl-ink)]">
                      {agreement.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[var(--cl-ink)]">
                      CRIADO EM:
                    </span>
                    <span className="font-bold text-[var(--cl-ink)]">
                      {format(
                        new Date(agreement.created_at),
                        "dd/MM/yyyy HH:mm",
                        { locale: ptBR },
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[var(--cl-ink)]">
                      ACEITO EM:
                    </span>
                    <span className="font-bold text-[var(--cl-ink)]">
                      {format(
                        new Date(
                          agreement.contacts_revealed_at ||
                            agreement.updated_at,
                        ),
                        "dd/MM/yyyy HH:mm",
                        { locale: ptBR },
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
