"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleTable } from "@/components/admin/shared/SimpleTable";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  AlertTriangle,
  AlertCircle,
  User,
  MessageCircle,
  FileText,
  Flag,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Ban,
  Shield,
  Trash2,
  UserX,
  Star,
  ShoppingBag,
  Key,
} from "lucide-react";

interface Report {
  id: string;
  type: "user" | "post" | "message" | "review" | "classified" | "other";
  reason: string;
  description: string;
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "urgent";
  reporter_id: string;
  reported_user_id?: string;
  reported_post_id?: string;
  reported_message_id?: string;
  reported_classified_id?: string;
  admin_notes?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
  reporter?: {
    id: string;
    full_name: string;
    email: string;
    user_type: string;
    avatar_url?: string;
  };
  reported_user?: {
    id: string;
    full_name: string;
    email: string;
    user_type: string;
    avatar_url?: string;
  };
  reported_post?: {
    id: string;
    title: string;
    content: string;
    professional_id: string;
  };
  classified_ad?: {
    id: string;
    title: string;
    description: string;
    user_name: string;
    user_id: string;
  };
  conversation_messages?: Array<{
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    profiles: {
      full_name: string;
      avatar_url?: string;
    };
  }>;
  review_details?: {
    id: string;
    rating_person: number;
    comment: string;
    created_at: string;
    reviewer_id: string;
    reviewed_id: string;
    profiles: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

interface ReportStats {
  total: number;
  pending: number;
  resolved: number;
  dismissed: number;
  last24h: number;
  byType: any;
  byPriority: any;
}

interface Ban {
  id: string;
  user_id: string;
  reason: string;
  ban_type: string;
  duration_days?: number;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function ModerationPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("reports");

  // Credentials state
  const [serviceRoleKey, setServiceRoleKey] = useState<string>("");
  const [showServiceRoleKey, setShowServiceRoleKey] = useState(false);
  const [adminSupabase, setAdminSupabase] = useState<SupabaseClient | null>(
    null,
  );

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    priority: "all",
    search: "",
  });
  const [adminNotes, setAdminNotes] = useState("");
  const [resolution, setResolution] = useState("");
  const [expandedReports, setExpandedReports] = useState<Set<string>>(
    new Set(),
  );
  const [expandedBans, setExpandedBans] = useState<Set<string>>(new Set());
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [reportToResolve, setReportToResolve] = useState<Report | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");

  // Bans state
  const [bans, setBans] = useState<Ban[]>([]);
  const [loadingBans, setLoadingBans] = useState(false);
  const [searchQueryBans, setSearchQueryBans] = useState("");
  const [statusFilterBans, setStatusFilterBans] = useState<string>("all");
  const [showBanModal, setShowBanModal] = useState(false);
  const [banForm, setBanForm] = useState({
    user_id: "",
    reason: "",
    ban_type: "temporary" as "temporary" | "permanent",
    duration_days: 7,
    related_report_id: null as string | null,
  });

  // ⚠️ SEGURANÇA: Esta funcionalidade aceita Service Role Key do frontend
  // TODO: Migrar todas as queries para APIs que usam withAdminAuth
  // Por enquanto, mantido com validação rigorosa e avisos de segurança
  useEffect(() => {
    if (serviceRoleKey.trim()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        // Validar formato básico da key (JWT tem formato específico)
        const trimmedKey = serviceRoleKey.trim();

        // Validação mais rigorosa
        if (trimmedKey.length < 100) {
          toast.error("Credencial inválida");
          setAdminSupabase(null);
          return;
        }

        // Validar formato JWT básico (deve ter 3 partes separadas por ponto)
        const jwtParts = trimmedKey.split(".");
        if (jwtParts.length !== 3) {
          toast.error("Formato de credencial inválido");
          setAdminSupabase(null);
          return;
        }

        // ⚠️ AVISO: Service Role Key nunca deve ser compartilhada ou commitada
        // Esta é uma medida temporária até migrar para APIs seguras
        const adminClient = createClient(supabaseUrl, trimmedKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
        setAdminSupabase(adminClient);
      }
    } else {
      setAdminSupabase(null);
    }

    // Cleanup: limpar cliente quando componente desmontar ou key mudar
    return () => {
      setAdminSupabase(null);
    };
  }, [serviceRoleKey]);

  // Fetch reports
  useEffect(() => {
    if (activeTab === "reports" && adminSupabase) {
      fetchReports();
      fetchReportStats();
    }
  }, [activeTab, adminSupabase]);

  // Fetch bans
  useEffect(() => {
    if (activeTab === "bans") {
      fetchBans();
    }
  }, [statusFilterBans, activeTab]);

  const fetchReports = async () => {
    if (!adminSupabase) {
      toast.error("Credenciais necessárias", {
        description:
          "Por favor, insira suas credenciais para acessar as denúncias.",
      });
      setLoadingReports(false);
      return;
    }

    setLoadingReports(true);
    try {
      // Buscar denúncias usando adminSupabase para bypass RLS
      const { data: reportsData, error } = await adminSupabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Enriquecer com informações dos usuários e contexto
      const enrichedReports = await Promise.all(
        (reportsData || []).map(async (report) => {
          let reporter = null;
          let reportedUser = null;
          let reportedPost = null;
          let classifiedAd = null;
          let conversationMessages = null;
          let reviewDetails = null;

          // Buscar informações do denunciante
          if (report.reporter_id) {
            const { data: reporterData } = await adminSupabase
              .from("profiles")
              .select("id, full_name, email, user_type, avatar_url")
              .eq("id", report.reporter_id)
              .single();
            reporter = reporterData;
          }

          // Buscar informações do usuário denunciado
          if (report.reported_user_id) {
            const { data: reportedUserData } = await adminSupabase
              .from("profiles")
              .select("id, full_name, email, user_type, avatar_url")
              .eq("id", report.reported_user_id)
              .single();
            reportedUser = reportedUserData;
          }

          // Buscar informações do post denunciado
          if (report.reported_post_id) {
            const { data: reportedPostData } = await adminSupabase
              .from("feed_posts")
              .select("id, title, content, professional_id")
              .eq("id", report.reported_post_id)
              .single();
            reportedPost = reportedPostData;
          }

          // Buscar informações do anúncio classificado denunciado
          if (report.reported_classified_id) {
            const { data: classifiedAdData } = await adminSupabase
              .from("classified_ads")
              .select("id, title, description, user_name, user_id")
              .eq("id", report.reported_classified_id)
              .single();
            classifiedAd = classifiedAdData;
          }

          // Para denúncias de conversa, buscar mensagens
          if (
            report.type === "other" &&
            report.description?.includes("conversa")
          ) {
            const { data: messagesData } = await adminSupabase
              .from("messages")
              .select(
                `
                id,
                content,
                created_at,
                updated_at,
                sender_id,
                conversation_id,
                profiles!messages_sender_id_fkey(full_name, avatar_url)
              `,
              )
              .or(
                `sender_id.eq.${report.reporter_id},sender_id.eq.${report.reported_user_id}`,
              )
              .order("created_at", { ascending: true })
              .limit(50);

            conversationMessages = messagesData;
          }

          // Para denúncias de avaliação, buscar detalhes da avaliação
          // Nota: reported_message_id pode conter o ID da review, mas também pode ser null
          if (report.type === "review" && report.reported_message_id) {
            // Validar se reported_message_id é um UUID válido antes de buscar
            const uuidRegex =
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(report.reported_message_id)) {
              try {
                const { data: reviewData } = await adminSupabase
                  .from("reviews")
                  .select(
                    `
                    id,
                    rating_person,
                    comment,
                    created_at,
                    reviewer_id,
                    reviewed_id,
                    profiles!reviews_reviewer_id_fkey(full_name, avatar_url)
                  `,
                  )
                  .eq("id", report.reported_message_id)
                  .single();

                reviewDetails = reviewData;
              } catch (reviewError) {
                // Ignorar erro se review não for encontrado
                reviewDetails = null;
              }
            }
          }

          return {
            ...report,
            reporter,
            reported_user: reportedUser,
            reported_post: reportedPost,
            classified_ad: classifiedAd,
            conversation_messages: conversationMessages,
            review_details: reviewDetails,
          };
        }),
      );

      setReports(enrichedReports);
    } catch (error) {
      // Não logar detalhes do erro em produção para evitar exposição de informações
      if (process.env.NODE_ENV === "development") {
        console.error("Erro ao buscar denúncias:", error);
      }
      toast.error("Erro ao carregar denúncias");
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchReportStats = async () => {
    if (!adminSupabase) {
      return;
    }

    try {
      // Buscar estatísticas usando adminSupabase
      const { data: allReports } = await adminSupabase
        .from("reports")
        .select("status, type, priority, created_at");

      if (!allReports) {
        setReportStats({
          total: 0,
          pending: 0,
          resolved: 0,
          dismissed: 0,
          last24h: 0,
          byType: {},
          byPriority: {},
        });
        return;
      }

      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const stats = {
        total: allReports.length,
        pending: allReports.filter((r) => r.status === "pending").length,
        resolved: allReports.filter((r) => r.status === "resolved").length,
        dismissed: allReports.filter((r) => r.status === "dismissed").length,
        last24h: allReports.filter((r) => new Date(r.created_at) >= last24h)
          .length,
        byType: allReports.reduce((acc: any, r) => {
          acc[r.type] = (acc[r.type] || 0) + 1;
          return acc;
        }, {}),
        byPriority: allReports.reduce((acc: any, r) => {
          acc[r.priority] = (acc[r.priority] || 0) + 1;
          return acc;
        }, {}),
      };

      setReportStats(stats);
    } catch (error) {
      // Não logar detalhes do erro em produção
      if (process.env.NODE_ENV === "development") {
        console.error("Erro ao buscar estatísticas:", error);
      }
    }
  };

  const fetchBans = async () => {
    if (!adminSupabase) {
      toast.error("Credenciais necessárias", {
        description:
          "Por favor, insira suas credenciais para acessar os banimentos.",
      });
      setLoadingBans(false);
      return;
    }

    setLoadingBans(true);
    try {
      let query = adminSupabase
        .from("user_bans")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilterBans === "active") {
        query = query.eq("is_active", true);
      } else if (statusFilterBans === "inactive") {
        query = query.eq("is_active", false);
      }

      const { data: bansData, error } = await query;

      if (error) {
        if (
          error.code === "PGRST116" ||
          error.code === "PGRST205" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist")
        ) {
          console.warn(
            "Tabela user_bans não existe ou não há permissão para acessar",
          );
          setBans([]);
          return;
        }
        throw error;
      }

      const bansWithUsers = await Promise.all(
        (bansData || []).map(async (ban) => {
          const { data: profile } = await adminSupabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", ban.user_id)
            .single();

          return {
            ...ban,
            profiles: profile || {
              full_name: "Usuário não encontrado",
              email: "",
            },
          };
        }),
      );

      setBans(bansWithUsers);
    } catch (error) {
      console.error("Erro ao buscar banimentos:", error);
      toast.error("Erro ao carregar banimentos");
    } finally {
      setLoadingBans(false);
    }
  };

  const updateReportStatus = async (
    reportId: string,
    status: string,
    notes?: string,
    resolution?: string,
    sendNotification?: boolean,
    notificationMessage?: string,
    reporterId?: string,
  ) => {
    if (!adminSupabase) {
      toast.error("Credenciais necessárias", {
        description:
          "Por favor, insira suas credenciais para atualizar denúncias.",
      });
      return;
    }

    // Validar UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(reportId)) {
      toast.error("ID de denúncia inválido");
      return;
    }

    // Validar status
    const validStatuses = ["pending", "reviewing", "resolved", "dismissed"];
    if (!validStatuses.includes(status)) {
      toast.error("Status inválido");
      return;
    }

    // Sanitizar notas e resolução
    const sanitizedNotes = notes ? notes.trim().substring(0, 5000) : undefined;
    const sanitizedResolution = resolution
      ? resolution.trim().substring(0, 5000)
      : undefined;

    try {
      // Atualizar usando adminSupabase
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (sanitizedNotes) updateData.admin_notes = sanitizedNotes;
      if (sanitizedResolution) updateData.resolution = sanitizedResolution;

      const { error } = await adminSupabase
        .from("reports")
        .update(updateData)
        .eq("id", reportId);

      if (error) {
        throw error;
      }

      // Se deve enviar notificação ao denunciante
      if (sendNotification && notificationMessage && reporterId) {
        try {
          await sendNotificationToReporter(
            reporterId,
            notificationMessage,
            reportId,
          );
        } catch (notifError) {
          console.error("Erro ao enviar notificação:", notifError);
          // Não falha a operação se a notificação falhar
        }
      }

      toast.success("Denúncia atualizada com sucesso");
      fetchReports();
      fetchReportStats();
      setShowReportModal(false);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Erro ao atualizar denúncia:", error);
      }
      toast.error("Erro ao atualizar denúncia");
    }
  };

  const sendNotificationToReporter = async (
    reporterId: string,
    message: string,
    reportId: string,
  ) => {
    // Validar UUIDs
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(reporterId) || !uuidRegex.test(reportId)) {
      toast.error("IDs inválidos");
      throw new Error("IDs inválidos");
    }

    // Validar e sanitizar mensagem
    const sanitizedMessage = message.trim().substring(0, 2000); // Limitar tamanho
    if (!sanitizedMessage) {
      toast.error("Mensagem não pode estar vazia");
      throw new Error("Mensagem vazia");
    }

    try {
      const response = await fetch("/api/admin/reports/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reporterId,
          message: sanitizedMessage,
          reportId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao enviar notificação");
      }

      toast.success("Notificação enviada ao denunciante");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Erro ao enviar notificação:", error);
      }
      throw error;
    }
  };

  const handleResolveReport = (report: Report) => {
    setReportToResolve(report);
    setSelectedTemplate("");
    setCustomMessage("");
    setShowResolveModal(true);
  };

  const getTemplateMessage = (template: string) => {
    const templates: Record<string, string> = {
      resolved_action_taken:
        "Sua denúncia foi analisada e as medidas apropriadas foram tomadas. Agradecemos sua colaboração em manter nossa comunidade segura.",
      resolved_no_violation:
        "Analisamos sua denúncia e não encontramos violação de nossas políticas. Caso tenha mais informações, por favor, entre em contato.",
      resolved_content_removed:
        "Sua denúncia foi analisada e o conteúdo denunciado foi removido. Obrigado por nos ajudar a manter a qualidade da plataforma.",
      resolved_user_warned:
        "Sua denúncia foi analisada e o usuário foi advertido sobre o comportamento inadequado. Continuaremos monitorando a situação.",
      resolved_user_banned:
        "Sua denúncia foi analisada e o usuário foi banido da plataforma devido à violação de nossas políticas. Obrigado por reportar.",
      resolved_under_review:
        "Sua denúncia está sendo analisada em mais detalhes. Entraremos em contato se precisarmos de mais informações.",
      resolved_thanks:
        "Agradecemos sua denúncia. Nossa equipe de moderação analisou o caso e tomou as medidas necessárias.",
    };
    return templates[template] || "";
  };

  const confirmResolveReport = async () => {
    if (!reportToResolve) return;

    const templateMessage = selectedTemplate
      ? getTemplateMessage(selectedTemplate)
      : "";
    const finalMessage =
      customMessage.trim() ||
      templateMessage ||
      "Sua denúncia foi analisada e resolvida pela nossa equipe de moderação.";

    await updateReportStatus(
      reportToResolve.id,
      "resolved",
      reportToResolve.admin_notes,
      reportToResolve.resolution,
      true, // sendNotification
      finalMessage,
      reportToResolve.reporter_id,
    );

    setShowResolveModal(false);
    setReportToResolve(null);
    setSelectedTemplate("");
    setCustomMessage("");
  };

  const deleteReport = async (reportId: string) => {
    if (!adminSupabase) {
      toast.error("Credenciais necessárias", {
        description:
          "Por favor, insira suas credenciais para deletar denúncias.",
      });
      return;
    }

    // Validar UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(reportId)) {
      toast.error("ID de denúncia inválido");
      return;
    }

    try {
      const { error } = await adminSupabase
        .from("reports")
        .delete()
        .eq("id", reportId);

      if (error) {
        throw error;
      }

      toast.success("Denúncia deletada com sucesso");
      fetchReports();
      fetchReportStats();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Erro ao deletar denúncia:", error);
      }
      toast.error("Erro ao deletar denúncia");
    }
  };

  const createBan = async () => {
    if (!adminSupabase) {
      toast.error("Credenciais necessárias", {
        description:
          "Por favor, insira suas credenciais para criar banimentos.",
      });
      return;
    }

    if (!banForm.user_id || !banForm.reason) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    // Validar UUID do usuário
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(banForm.user_id.trim())) {
      toast.error("ID do usuário inválido. Por favor, insira um UUID válido.");
      return;
    }

    // Validar tipo de banimento
    if (banForm.ban_type !== "temporary" && banForm.ban_type !== "permanent") {
      toast.error("Tipo de banimento inválido");
      return;
    }

    // Validar duração se for temporário
    if (
      banForm.ban_type === "temporary" &&
      (!banForm.duration_days || banForm.duration_days < 1)
    ) {
      toast.error("Duração deve ser maior que 0 dias");
      return;
    }

    // Sanitizar motivo
    const sanitizedReason = banForm.reason.trim().substring(0, 1000);

    try {
      const expiresAt =
        banForm.ban_type === "temporary"
          ? new Date(
              Date.now() + banForm.duration_days * 24 * 60 * 60 * 1000,
            ).toISOString()
          : null;

      // Obter ID do admin atual
      if (!user?.id) {
        toast.error("Erro: Usuário não autenticado");
        return;
      }

      const insertData: any = {
        user_id: banForm.user_id.trim(),
        banned_by: user.id, // Campo obrigatório
        reason: sanitizedReason,
        ban_type: banForm.ban_type,
        is_active: true,
      };

      // Só adicionar duration_days e expires_at se for temporário
      if (banForm.ban_type === "temporary") {
        insertData.duration_days = banForm.duration_days;
        insertData.expires_at = expiresAt;
      } else {
        // Para permanente, garantir que duration_days e expires_at sejam null
        insertData.duration_days = null;
        insertData.expires_at = null;
      }

      // Adicionar related_report_id se houver
      if (banForm.related_report_id) {
        insertData.related_report_id = banForm.related_report_id;
      }

      const { error } = await adminSupabase
        .from("user_bans")
        .insert(insertData);

      if (error) {
        if (
          error.code === "PGRST116" ||
          error.code === "PGRST205" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist")
        ) {
          toast.error(
            "Tabela user_bans não existe. Configure o banco de dados primeiro.",
          );
          return;
        }

        // Tratar erro de constraint (usuário já banido, etc)
        if (
          error.code === "23505" ||
          error.message?.includes("duplicate") ||
          error.message?.includes("unique")
        ) {
          toast.error("Este usuário já possui um banimento ativo");
          return;
        }

        if (process.env.NODE_ENV === "development") {
          console.error("Erro ao banir usuário:", error);
        }
        toast.error(
          `Erro ao banir usuário: ${error.message || "Erro desconhecido"}`,
        );
        return;
      }

      toast.success("Usuário banido com sucesso");
      setShowBanModal(false);
      setBanForm({
        user_id: "",
        reason: "",
        ban_type: "temporary",
        duration_days: 7,
        related_report_id: null,
      });
      fetchBans();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Erro ao banir usuário:", error);
      }
      toast.error("Erro ao banir usuário");
    }
  };

  const toggleBanStatus = async (banId: string, currentStatus: boolean) => {
    if (!adminSupabase) {
      toast.error("Credenciais necessárias", {
        description:
          "Por favor, insira suas credenciais para alterar o status do banimento.",
      });
      return;
    }

    try {
      const { error } = await adminSupabase
        .from("user_bans")
        .update({ is_active: !currentStatus })
        .eq("id", banId);

      if (error) throw error;

      toast.success(`Banimento ${!currentStatus ? "ativado" : "desativado"}`);
      fetchBans();
    } catch (error) {
      console.error("Erro ao alterar status do banimento:", error);
      toast.error("Erro ao alterar status");
    }
  };

  const createTestReports = async () => {
    if (!adminSupabase) {
      toast.error("Credenciais necessárias", {
        description:
          "Por favor, insira suas credenciais para criar denúncias de teste.",
      });
      return;
    }

    const clientToUse = adminSupabase;

    try {
      // Buscar alguns usuários para usar como denunciantes e denunciados
      const { data: users } = await clientToUse
        .from("profiles")
        .select("id")
        .limit(5);

      if (!users || users.length < 2) {
        toast.error(
          "É necessário ter pelo menos 2 usuários no sistema para criar denúncias de teste",
        );
        return;
      }

      const reporterId = users[0].id;
      const reportedUserId = users[1].id;

      // Buscar um post para denúncia de post
      const { data: posts } = await clientToUse
        .from("feed_posts")
        .select("id")
        .limit(1);

      // Buscar um classificado para denúncia de classificado
      const { data: classifieds } = await clientToUse
        .from("classified_ads")
        .select("id")
        .limit(1);

      const testReports = [
        {
          type: "user",
          reason: "Comportamento inadequado",
          description:
            "[TESTE] Denúncia de teste: Usuário com comportamento inadequado. Este é um teste do sistema de moderação.",
          priority: "high",
          reporter_id: reporterId,
          reported_user_id: reportedUserId,
          status: "pending",
        },
        {
          type: "post",
          reason: "Conteúdo inapropriado",
          description:
            "[TESTE] Denúncia de teste: Post com conteúdo inapropriado. Este é um teste do sistema de moderação.",
          priority: "urgent",
          reporter_id: reporterId,
          reported_post_id: posts?.[0]?.id || null,
          status: "pending",
        },
        {
          type: "message",
          reason: "Mensagem ofensiva",
          description:
            "[TESTE] Denúncia de teste: Mensagem com conteúdo ofensivo. Este é um teste do sistema de moderação.",
          priority: "medium",
          reporter_id: reporterId,
          reported_user_id: reportedUserId,
          status: "pending",
        },
        {
          type: "review",
          reason: "Avaliação falsa",
          description:
            "[TESTE] Denúncia de teste: Avaliação falsa ou enganosa. Este é um teste do sistema de moderação.",
          priority: "low",
          reporter_id: reporterId,
          reported_user_id: reportedUserId,
          status: "pending",
        },
        {
          type: "classified",
          reason: "Anúncio enganoso",
          description:
            "[TESTE] Denúncia de teste: Anúncio classificado enganoso ou com informações falsas. Este é um teste do sistema de moderação.",
          priority: "high",
          reporter_id: reporterId,
          reported_classified_id: classifieds?.[0]?.id || null,
          status: "pending",
        },
        {
          type: "other",
          reason: "Outro motivo",
          description:
            "[TESTE] Denúncia de teste: Outro tipo de denúncia. Este é um teste do sistema de moderação.",
          priority: "medium",
          reporter_id: reporterId,
          status: "pending",
        },
      ];

      // Criar denúncias de teste
      const { error } = await clientToUse.from("reports").insert(testReports);

      if (error) {
        console.error("Erro ao criar denúncias de teste:", error);
        toast.error("Erro ao criar denúncias de teste: " + error.message);
        return;
      }

      toast.success("6 denúncias de teste criadas com sucesso!");
      fetchReports();
      fetchReportStats();
    } catch (error) {
      console.error("Erro ao criar denúncias de teste:", error);
      toast.error("Erro ao criar denúncias de teste");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400";
      case "reviewing":
        return "bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400";
      case "resolved":
        return "bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400";
      case "dismissed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "medium":
        return "bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400";
      case "low":
        return "bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />;
      case "post":
        return <FileText className="h-4 w-4" />;
      case "message":
        return <MessageCircle className="h-4 w-4" />;
      case "review":
        return <Star className="h-4 w-4" />;
      case "classified":
        return <ShoppingBag className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "user":
        return "Usuário";
      case "post":
        return "Post";
      case "message":
        return "Mensagem";
      case "review":
        return "Avaliação";
      case "classified":
        return "Classificado";
      default:
        return "Outro";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "reviewing":
        return "Em Revisão";
      case "resolved":
        return "Resolvida";
      case "dismissed":
        return "Descartada";
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgente";
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return priority;
    }
  };

  const filteredReports = reports.filter((report) => {
    if (filters.status !== "all" && report.status !== filters.status)
      return false;
    if (filters.type !== "all" && report.type !== filters.type) return false;
    if (filters.priority !== "all" && report.priority !== filters.priority)
      return false;
    if (
      filters.search &&
      !report.description.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  const filteredBans = bans.filter((ban) => {
    if (!searchQueryBans) return true;
    const query = searchQueryBans.toLowerCase();
    return (
      ban.reason?.toLowerCase().includes(query) ||
      ban.profiles?.full_name?.toLowerCase().includes(query) ||
      ban.profiles?.email?.toLowerCase().includes(query)
    );
  });

  // Agrupar banimentos por usuário
  const groupedBans = filteredBans.reduce(
    (acc, ban) => {
      const userId = ban.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user: ban.profiles,
          userId: userId,
          bans: [],
        };
      }
      acc[userId].bans.push(ban);
      return acc;
    },
    {} as Record<
      string,
      {
        user: { full_name: string; email: string };
        userId: string;
        bans: Ban[];
      }
    >,
  );

  const groupedBansArray = Object.values(groupedBans).map((group) => ({
    ...group,
    activeBans: group.bans.filter((b) => b.is_active).length,
    totalBans: group.bans.length,
    latestBan: group.bans.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Moderação
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Gerencie denúncias e banimentos de usuários
        </p>
      </div>

      {/* Campo de Credenciais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Credenciais de Execução
          </CardTitle>
          <CardDescription>
            Insira suas credenciais para executar operações de moderação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credentials">Credenciais</Label>
              <div className="relative">
                <Input
                  id="credentials"
                  type={showServiceRoleKey ? "text" : "password"}
                  placeholder="Insira suas credenciais aqui..."
                  value={serviceRoleKey}
                  onChange={(e) => setServiceRoleKey(e.target.value)}
                  className="pr-10 font-mono text-sm"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowServiceRoleKey(!showServiceRoleKey)}
                  aria-label={
                    showServiceRoleKey
                      ? "Ocultar credenciais"
                      : "Mostrar credenciais"
                  }
                >
                  {showServiceRoleKey ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                As credenciais não são armazenadas e serão usadas apenas durante
                a sessão.
              </p>
            </div>
            {serviceRoleKey && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-medium">
                    Credenciais configuradas. As operações de moderação estão
                    prontas.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger
            value="reports"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3"
          >
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Denúncias</span>
            <span className="sm:hidden">Denúncias</span>
            {reportStats && reportStats.pending > 0 && (
              <Badge
                variant="destructive"
                className="ml-1 sm:ml-2 text-xs px-1 sm:px-2"
              >
                {reportStats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="bans"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3"
          >
            <Ban className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Banimentos</span>
            <span className="sm:hidden">Banimentos</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab de Denúncias */}
        <TabsContent value="reports" className="space-y-4">
          {!adminSupabase && (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 text-yellow-700 dark:text-yellow-300">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Credenciais necessárias</p>
                    <p>
                      Para acessar e gerenciar denúncias, você precisa inserir
                      suas credenciais no campo acima.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Estatísticas */}
          {reportStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {reportStats.total}
                      </p>
                    </div>
                    <Flag className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Pendentes
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {reportStats.pending}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Resolvidas
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {reportStats.resolved}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Últimas 24h
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {reportStats.last24h}
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="status-filter" className="text-xs sm:text-sm">
                    Status
                  </Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="reviewing">Em Revisão</SelectItem>
                      <SelectItem value="resolved">Resolvidas</SelectItem>
                      <SelectItem value="dismissed">Descartadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type-filter" className="text-xs sm:text-sm">
                    Tipo
                  </Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) =>
                      setFilters({ ...filters, type: value })
                    }
                  >
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="message">Mensagem</SelectItem>
                      <SelectItem value="review">Avaliação</SelectItem>
                      <SelectItem value="classified">Classificado</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="priority-filter"
                    className="text-xs sm:text-sm"
                  >
                    Prioridade
                  </Label>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) =>
                      setFilters({ ...filters, priority: value })
                    }
                  >
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="search" className="text-xs sm:text-sm">
                    Buscar
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Buscar por descrição..."
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                      className="pl-10 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Denúncias */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Denúncias ({filteredReports.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createTestReports}
                    disabled={!adminSupabase}
                    title="Criar denúncias de teste para validar o sistema"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Criar Testes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      fetchReports();
                      fetchReportStats();
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingReports ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-8">
                  <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma denúncia encontrada</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredReports.map((report) => {
                    const isExpanded = expandedReports.has(report.id);
                    return (
                      <Card key={report.id} className="overflow-hidden">
                        <div
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                          onClick={() => {
                            const newExpanded = new Set(expandedReports);
                            if (isExpanded) {
                              newExpanded.delete(report.id);
                            } else {
                              newExpanded.add(report.id);
                            }
                            setExpandedReports(newExpanded);
                          }}
                        >
                          <CardContent className="py-1 px-2 sm:py-1.5 sm:px-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                {getTypeIcon(report.type)}
                                <span className="font-medium text-xs truncate">
                                  {getTypeLabel(report.type)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0 hidden sm:block">
                                <p
                                  className="text-xs truncate"
                                  title={report.description}
                                >
                                  {report.description.substring(0, 60)}...
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <Badge
                                  className={getPriorityColor(report.priority)}
                                >
                                  <span className="text-xs">
                                    {getPriorityLabel(report.priority)}
                                  </span>
                                </Badge>
                                <Badge
                                  className={getStatusColor(report.status)}
                                >
                                  <span className="text-xs">
                                    {getStatusLabel(report.status)}
                                  </span>
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1.5 justify-end flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-1.5 sm:px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReport(report);
                                    setAdminNotes(report.admin_notes || "");
                                    setResolution(report.resolution || "");
                                    setShowReportModal(true);
                                  }}
                                  title="Ver detalhes"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Select
                                  onValueChange={(value) => {
                                    if (value === "delete") {
                                      if (
                                        confirm(
                                          "Tem certeza que deseja deletar esta denúncia?",
                                        )
                                      ) {
                                        deleteReport(report.id);
                                      }
                                    } else if (
                                      value === "ban" &&
                                      report.reported_user_id
                                    ) {
                                      // Validar UUID antes de abrir modal
                                      const uuidRegex =
                                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                                      if (
                                        uuidRegex.test(report.reported_user_id)
                                      ) {
                                        setBanForm({
                                          user_id: report.reported_user_id,
                                          reason: `Banido devido à denúncia: ${report.reason || "Denúncia de conteúdo"}`,
                                          ban_type: "temporary",
                                          duration_days: 7,
                                          related_report_id: report.id, // Vincular à denúncia
                                        });
                                        setShowBanModal(true);
                                      } else {
                                        toast.error("ID do usuário inválido");
                                      }
                                    } else if (value === "resolved") {
                                      handleResolveReport(report);
                                    } else {
                                      updateReportStatus(report.id, value);
                                    }
                                  }}
                                >
                                  <SelectTrigger
                                    className="h-7 w-20 sm:w-28 text-xs px-1.5 sm:px-2"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <SelectValue placeholder="Ações" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="reviewing">
                                      Revisar
                                    </SelectItem>
                                    <SelectItem value="resolved">
                                      Resolver
                                    </SelectItem>
                                    <SelectItem value="dismissed">
                                      Descartar
                                    </SelectItem>
                                    {report.reported_user_id && (
                                      <SelectItem value="ban">
                                        Banir Usuário
                                      </SelectItem>
                                    )}
                                    <SelectItem
                                      value="delete"
                                      className="text-red-600"
                                    >
                                      Deletar
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </div>

                        {/* Conteúdo expandido */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                            <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                              <div>
                                <Label className="text-xs sm:text-sm font-medium mb-1.5 block">
                                  Descrição Completa
                                </Label>
                                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                  {report.description}
                                </p>
                              </div>

                              {/* Informações do denunciante e denunciado */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs sm:text-sm font-medium mb-1.5 block">
                                    Denunciante
                                  </Label>
                                  <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg">
                                    <div className="font-medium text-xs sm:text-sm">
                                      {report.reporter?.full_name || "N/A"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {report.reporter?.email}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                      Tipo:{" "}
                                      {report.reporter?.user_type || "N/A"}
                                    </div>
                                  </div>
                                </div>
                                {report.reported_user && (
                                  <div>
                                    <Label className="text-xs sm:text-sm font-medium mb-1.5 block">
                                      Denunciado
                                    </Label>
                                    <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg">
                                      <div className="font-medium text-xs sm:text-sm">
                                        {report.reported_user.full_name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {report.reported_user.email}
                                      </div>
                                      <div className="text-xs text-gray-400 mt-0.5">
                                        Tipo: {report.reported_user.user_type}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Contexto específico baseado no tipo */}
                              {report.reported_post && (
                                <div className="bg-green-50 dark:bg-green-900/20 p-2 sm:p-3 rounded-lg">
                                  <Label className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-300 mb-1.5 block">
                                    📝 Post Denunciado
                                  </Label>
                                  <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg">
                                    <div className="font-medium text-xs sm:text-sm">
                                      {report.reported_post.title}
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                                      {report.reported_post.content}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {report.classified_ad && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-3 rounded-lg">
                                  <Label className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-300 mb-1.5 block">
                                    🛍️ Classificado Denunciado
                                  </Label>
                                  <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg">
                                    <div className="font-medium text-xs sm:text-sm">
                                      {report.classified_ad.title}
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                                      {report.classified_ad.description}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Informações adicionais */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-xs">
                                <div>
                                  <Label className="text-gray-500 text-xs">
                                    Data de Criação
                                  </Label>
                                  <div className="font-medium mt-0.5">
                                    {new Date(report.created_at).toLocaleString(
                                      "pt-BR",
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-gray-500 text-xs">
                                    Última Atualização
                                  </Label>
                                  <div className="font-medium mt-0.5">
                                    {new Date(report.updated_at).toLocaleString(
                                      "pt-BR",
                                    )}
                                  </div>
                                </div>
                                {report.admin_notes && (
                                  <div className="col-span-2">
                                    <Label className="text-gray-500 text-xs">
                                      Notas do Admin
                                    </Label>
                                    <div className="font-medium mt-0.5">
                                      {report.admin_notes}
                                    </div>
                                  </div>
                                )}
                                {report.resolution && (
                                  <div className="col-span-2">
                                    <Label className="text-gray-500 text-xs">
                                      Resolução
                                    </Label>
                                    <div className="font-medium mt-0.5">
                                      {report.resolution}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Banimentos */}
        <TabsContent value="bans" className="space-y-4">
          {!adminSupabase && (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 text-yellow-700 dark:text-yellow-300">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Credenciais necessárias</p>
                    <p>
                      Para acessar e gerenciar banimentos, você precisa inserir
                      suas credenciais no campo acima.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar banimentos..."
                    value={searchQueryBans}
                    onChange={(e) => setSearchQueryBans(e.target.value)}
                    className="pl-10 text-xs sm:text-sm"
                  />
                </div>
              </div>
              <Select
                value={statusFilterBans}
                onValueChange={setStatusFilterBans}
              >
                <SelectTrigger className="w-full sm:w-[200px] text-xs sm:text-sm">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
              <Dialog
                open={showBanModal}
                onOpenChange={(open) => {
                  setShowBanModal(open);
                  if (!open) {
                    // Limpar formulário quando fechar
                    setBanForm({
                      user_id: "",
                      reason: "",
                      ban_type: "temporary",
                      duration_days: 7,
                      related_report_id: null,
                    });
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    disabled={!adminSupabase}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Ban className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Novo Banimento</span>
                    <span className="sm:hidden">Novo</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Banir Usuário</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="user_id">ID do Usuário</Label>
                      <Input
                        id="user_id"
                        value={banForm.user_id}
                        onChange={(e) =>
                          setBanForm({ ...banForm, user_id: e.target.value })
                        }
                        placeholder="UUID do usuário"
                        className="font-mono text-xs sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Cole o UUID do usuário que será banido
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="reason">Motivo do Banimento</Label>
                      <Textarea
                        id="reason"
                        value={banForm.reason}
                        onChange={(e) =>
                          setBanForm({ ...banForm, reason: e.target.value })
                        }
                        placeholder="Descreva o motivo do banimento"
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ban_type">Tipo de Banimento</Label>
                      <Select
                        value={banForm.ban_type}
                        onValueChange={(value: "temporary" | "permanent") => {
                          setBanForm({
                            ...banForm,
                            ban_type: value,
                            duration_days:
                              value === "temporary" ? banForm.duration_days : 7,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="temporary">
                            <div className="flex flex-col">
                              <span>Temporário</span>
                              <span className="text-xs text-gray-500">
                                O banimento expira após um período
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="permanent">
                            <div className="flex flex-col">
                              <span>Permanente</span>
                              <span className="text-xs text-gray-500">
                                O banimento não expira
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {banForm.ban_type === "temporary" && (
                      <div>
                        <Label htmlFor="duration_days">
                          Duração do Banimento (dias)
                        </Label>
                        <Input
                          id="duration_days"
                          type="number"
                          value={banForm.duration_days}
                          onChange={(e) => {
                            const days = parseInt(e.target.value) || 1;
                            setBanForm({
                              ...banForm,
                              duration_days: Math.max(1, days),
                            });
                          }}
                          min={1}
                          max={3650}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          O banimento expirará automaticamente após{" "}
                          {banForm.duration_days} dia
                          {banForm.duration_days !== 1 ? "s" : ""}
                        </p>
                      </div>
                    )}
                    {banForm.ban_type === "permanent" && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-red-800 dark:text-red-300">
                            <strong>Atenção:</strong> Um banimento permanente
                            não expira automaticamente. O usuário precisará ser
                            desbanido manualmente por um administrador.
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowBanModal(false);
                          setBanForm({
                            user_id: "",
                            reason: "",
                            ban_type: "temporary",
                            duration_days: 7,
                            related_report_id: null,
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={createBan}
                        disabled={!banForm.user_id || !banForm.reason}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Banir Usuário
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Lista de Banimentos Agrupados */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Ban className="h-4 w-4 sm:h-5 sm:w-5" />
                  Banimentos ({groupedBansArray.length} usuários,{" "}
                  {filteredBans.length} banimentos)
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchBans()}
                  className="text-xs sm:text-sm"
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Atualizar</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingBans ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : groupedBansArray.length === 0 ? (
                <div className="text-center py-8">
                  <Ban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum banimento encontrado</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {groupedBansArray.map((group) => {
                    const isExpanded = expandedBans.has(group.userId);
                    const activeBan =
                      group.bans.find((b) => b.is_active) || group.latestBan;

                    return (
                      <Card
                        key={group.userId}
                        className={
                          activeBan.is_active
                            ? "border-l-4 border-l-red-500"
                            : "border-l-4 border-l-gray-300"
                        }
                      >
                        <div
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                          onClick={() => {
                            const newExpanded = new Set(expandedBans);
                            if (isExpanded) {
                              newExpanded.delete(group.userId);
                            } else {
                              newExpanded.add(group.userId);
                            }
                            setExpandedBans(newExpanded);
                          }}
                        >
                          <CardContent className="py-1 px-2 sm:py-1.5 sm:px-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <UserX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <div className="min-w-0">
                                  <div className="font-medium text-xs truncate">
                                    {group.user.full_name || "N/A"}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {group.user.email}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <Badge
                                  variant={
                                    activeBan.is_active
                                      ? "destructive"
                                      : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {activeBan.is_active ? "Ativo" : "Inativo"}
                                </Badge>
                                {group.totalBans > 1 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {group.totalBans} banimentos
                                  </Badge>
                                )}
                                {activeBan.ban_type && (
                                  <Badge
                                    variant={
                                      activeBan.ban_type === "permanent"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {activeBan.ban_type === "permanent"
                                      ? "Permanente"
                                      : "Temporário"}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 justify-end flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-1.5 sm:px-2"
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <a
                                    href={`/perfil/${group.userId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </a>
                                </Button>
                                <Button
                                  variant={
                                    activeBan.is_active
                                      ? "destructive"
                                      : "default"
                                  }
                                  size="sm"
                                  className="h-7 px-1.5 sm:px-2 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (activeBan.is_active) {
                                      if (
                                        confirm(
                                          `Tem certeza que deseja desativar o banimento de ${group.user.full_name}?`,
                                        )
                                      ) {
                                        toggleBanStatus(
                                          activeBan.id,
                                          activeBan.is_active,
                                        );
                                      }
                                    } else {
                                      toggleBanStatus(
                                        activeBan.id,
                                        activeBan.is_active,
                                      );
                                    }
                                  }}
                                >
                                  {activeBan.is_active ? (
                                    <UserX className="h-3.5 w-3.5" />
                                  ) : (
                                    <Ban className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>

                        {/* Conteúdo expandido */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                            <CardContent className="p-3 sm:p-4 space-y-3">
                              <div>
                                <Label className="text-xs sm:text-sm font-medium mb-1.5 block">
                                  Informações do Usuário
                                </Label>
                                <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg">
                                  <div className="font-medium text-xs sm:text-sm">
                                    {group.user.full_name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {group.user.email}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <Label className="text-xs sm:text-sm font-medium mb-1.5 block">
                                  Histórico de Banimentos ({group.totalBans})
                                </Label>
                                <div className="space-y-2">
                                  {group.bans.map((ban) => (
                                    <div
                                      key={ban.id}
                                      className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                                    >
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Badge
                                              variant={
                                                ban.is_active
                                                  ? "destructive"
                                                  : "outline"
                                              }
                                              className="text-xs"
                                            >
                                              {ban.is_active
                                                ? "Ativo"
                                                : "Inativo"}
                                            </Badge>
                                            <Badge
                                              variant={
                                                ban.ban_type === "permanent"
                                                  ? "destructive"
                                                  : "secondary"
                                              }
                                              className="text-xs"
                                            >
                                              {ban.ban_type === "permanent"
                                                ? "Permanente"
                                                : "Temporário"}
                                            </Badge>
                                          </div>
                                          <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1">
                                            <strong>Motivo:</strong>{" "}
                                            {ban.reason}
                                          </div>
                                          <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                                            {ban.duration_days && (
                                              <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {ban.duration_days} dias
                                              </span>
                                            )}
                                            {ban.expires_at && (
                                              <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Expira:{" "}
                                                {new Date(
                                                  ban.expires_at,
                                                ).toLocaleDateString("pt-BR")}
                                              </span>
                                            )}
                                            <span>
                                              Criado em:{" "}
                                              {new Date(
                                                ban.created_at,
                                              ).toLocaleDateString("pt-BR")}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                          <Button
                                            variant={
                                              ban.is_active
                                                ? "destructive"
                                                : "default"
                                            }
                                            size="sm"
                                            className="h-7 px-2 text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (ban.is_active) {
                                                if (
                                                  confirm(
                                                    `Tem certeza que deseja desativar este banimento?`,
                                                  )
                                                ) {
                                                  toggleBanStatus(
                                                    ban.id,
                                                    ban.is_active,
                                                  );
                                                }
                                              } else {
                                                toggleBanStatus(
                                                  ban.id,
                                                  ban.is_active,
                                                );
                                              }
                                            }}
                                          >
                                            {ban.is_active ? (
                                              <>
                                                <UserX className="h-3 w-3 mr-1" />
                                                Desbanir
                                              </>
                                            ) : (
                                              <>
                                                <Ban className="h-3 w-3 mr-1" />
                                                Reativar
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes da denúncia */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Denúncia</DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getTypeLabel(selectedReport.type)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedReport.status)}>
                    {getStatusLabel(selectedReport.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Prioridade</Label>
                  <Badge className={getPriorityColor(selectedReport.priority)}>
                    {getPriorityLabel(selectedReport.priority)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(selectedReport.created_at).toLocaleString(
                      "pt-BR",
                    )}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedReport.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Denunciante</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedReport.reporter?.full_name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedReport.reporter?.email}
                  </p>
                </div>
                {selectedReport.reported_user && (
                  <div>
                    <Label className="text-sm font-medium">Denunciado</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedReport.reported_user.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedReport.reported_user.email}
                    </p>
                  </div>
                )}
              </div>

              {selectedReport.reported_post && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <Label className="text-sm font-medium">Post Denunciado</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedReport.reported_post.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedReport.reported_post.content}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="admin_notes">Notas do Admin</Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adicione notas sobre esta denúncia..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="resolution">Resolução</Label>
                <Textarea
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Descreva a resolução desta denúncia..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReportModal(false)}
                >
                  Fechar
                </Button>
                <Button
                  onClick={() =>
                    updateReportStatus(
                      selectedReport.id,
                      selectedReport.status,
                      adminNotes,
                      resolution,
                    )
                  }
                >
                  Salvar Alterações
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (
                      confirm("Tem certeza que deseja deletar esta denúncia?")
                    ) {
                      deleteReport(selectedReport.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Resolver Denúncia com Notificação */}
      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg break-words">
              Resolver Denúncia e Notificar Denunciante
            </DialogTitle>
          </DialogHeader>

          {reportToResolve && (
            <div className="space-y-3 sm:space-y-4 overflow-x-hidden">
              <div className="bg-gray-50 dark:bg-gray-900 p-2 sm:p-3 rounded-lg overflow-x-hidden">
                <Label className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">
                  Informações da Denúncia
                </Label>
                <div className="text-xs sm:text-sm space-y-1 break-words overflow-wrap-anywhere">
                  <div className="break-words overflow-wrap-anywhere">
                    <strong>Tipo:</strong> {getTypeLabel(reportToResolve.type)}
                  </div>
                  <div className="break-words overflow-wrap-anywhere">
                    <strong>Denunciante:</strong>{" "}
                    {reportToResolve.reporter?.full_name || "N/A"}
                  </div>
                  <div className="break-words overflow-wrap-anywhere">
                    <strong>Motivo:</strong> {reportToResolve.reason}
                  </div>
                </div>
              </div>

              <div className="overflow-x-hidden">
                <Label
                  htmlFor="template"
                  className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block break-words"
                >
                  Mensagem Padrão (Opcional)
                </Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger className="text-xs sm:text-sm w-full max-w-full overflow-hidden">
                    <SelectValue
                      placeholder="Selecione uma mensagem padrão..."
                      className="truncate"
                    />
                  </SelectTrigger>
                  <SelectContent className="max-w-[calc(95vw-2rem)] sm:max-w-md">
                    <SelectItem
                      value="resolved_action_taken"
                      className="text-xs sm:text-sm break-words whitespace-normal overflow-wrap-anywhere"
                    >
                      Sua denúncia foi analisada e as medidas apropriadas foram
                      tomadas. Agradecemos sua colaboração em manter nossa
                      comunidade segura.
                    </SelectItem>
                    <SelectItem
                      value="resolved_no_violation"
                      className="text-xs sm:text-sm break-words whitespace-normal overflow-wrap-anywhere"
                    >
                      Analisamos sua denúncia e não encontramos violação de
                      nossas políticas. Caso tenha mais informações, por favor,
                      entre em contato.
                    </SelectItem>
                    <SelectItem
                      value="resolved_content_removed"
                      className="text-xs sm:text-sm break-words whitespace-normal overflow-wrap-anywhere"
                    >
                      Sua denúncia foi analisada e o conteúdo denunciado foi
                      removido. Obrigado por nos ajudar a manter a qualidade da
                      plataforma.
                    </SelectItem>
                    <SelectItem
                      value="resolved_user_warned"
                      className="text-xs sm:text-sm break-words whitespace-normal overflow-wrap-anywhere"
                    >
                      Sua denúncia foi analisada e o usuário foi advertido sobre
                      o comportamento inadequado. Continuaremos monitorando a
                      situação.
                    </SelectItem>
                    <SelectItem
                      value="resolved_user_banned"
                      className="text-xs sm:text-sm break-words whitespace-normal overflow-wrap-anywhere"
                    >
                      Sua denúncia foi analisada e o usuário foi banido da
                      plataforma devido à violação de nossas políticas. Obrigado
                      por reportar.
                    </SelectItem>
                    <SelectItem
                      value="resolved_under_review"
                      className="text-xs sm:text-sm break-words whitespace-normal overflow-wrap-anywhere"
                    >
                      Sua denúncia está sendo analisada em mais detalhes.
                      Entraremos em contato se precisarmos de mais informações.
                    </SelectItem>
                    <SelectItem
                      value="resolved_thanks"
                      className="text-xs sm:text-sm break-words whitespace-normal overflow-wrap-anywhere"
                    >
                      Agradecemos sua denúncia. Nossa equipe de moderação
                      analisou o caso e tomou as medidas necessárias.
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-hidden">
                <Label
                  htmlFor="custom_message"
                  className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block break-words"
                >
                  Mensagem Personalizada
                </Label>
                <Textarea
                  id="custom_message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Digite uma mensagem personalizada para o denunciante (opcional). Se preenchida, esta mensagem será enviada em vez da mensagem padrão."
                  rows={4}
                  className="resize-none text-xs sm:text-sm min-h-[80px] sm:min-h-[100px] w-full max-w-full overflow-x-hidden break-words overflow-wrap-anywhere"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words overflow-wrap-anywhere">
                  Se você preencher uma mensagem personalizada, ela terá
                  prioridade sobre a mensagem padrão selecionada.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg overflow-x-hidden">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 flex-1 min-w-0 overflow-x-hidden">
                    <strong className="block mb-1.5 sm:mb-2 break-words">
                      Pré-visualização da mensagem:
                    </strong>
                    <div className="mt-1 sm:mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-800 break-words whitespace-pre-wrap overflow-wrap-anywhere text-xs sm:text-sm overflow-x-hidden">
                      {customMessage.trim() ||
                        (selectedTemplate
                          ? getTemplateMessage(selectedTemplate)
                          : "Sua denúncia foi analisada e resolvida pela nossa equipe de moderação.")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 sm:pt-4 border-t overflow-x-hidden">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResolveModal(false);
                    setReportToResolve(null);
                    setSelectedTemplate("");
                    setCustomMessage("");
                  }}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmResolveReport}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-xs sm:text-sm"
                >
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">
                    Resolver e Enviar Notificação
                  </span>
                  <span className="sm:hidden">Resolver</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
