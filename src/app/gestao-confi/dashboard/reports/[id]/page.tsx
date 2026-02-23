"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { reportService } from "@/modules/reports/services/reportService";
import { NotificationService } from "@/services/NotificationService";
import type {
  Report,
  ReportStatus,
  ReportPriority,
} from "@/modules/reports/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Shield,
  MessageSquare,
  Flag,
  Calendar,
  ShieldAlert,
  ExternalLink,
  Ban,
  Archive,
  Play,
  Eye,
  Trash2,
  Send,
} from "lucide-react";
import { PostCard } from "@/components/timeline/PostCard";
import { ClassifiedsCard } from "@/components/classifieds/ClassifiedsCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { BanUserModal } from "@/components/gestao-confi/BanUserModal";
import { AdminReportedChatModal } from "@/components/gestao-confi/AdminReportedChatModal";

const FEEDBACK_TEMPLATES = [
  {
    label: "Conteúdo removido",
    message:
      "Sua denúncia foi analisada e o conteúdo foi removido. Agradecemos por ajudar a manter nossa comunidade segura.",
  },
  {
    label: "Usuário advertido",
    message:
      "O usuário denunciado foi advertido e as medidas cabíveis foram tomadas.",
  },
  {
    label: "Sem violação",
    message:
      "Após análise, não identificamos violações diretas aos nossos Termos de Uso no conteúdo reportado.",
  },
  {
    label: "Banimento aplicado",
    message: "Sua denúncia resultou no banimento do usuário envolvido.",
  },
];

const mapReportToClassifiedAd = (report: Report): any => {
  if (!report.reported_classified) return null;
  return {
    id: report.reported_classified_id,
    created_at:
      report.reported_classified.created_at || new Date().toISOString(),
    user_id: report.reported_user_id || "",
    user_name: report.reported_user?.full_name || "Usuário Denunciado",
    user_avatar: report.reported_user?.avatar_url,
    title: report.reported_classified.title || "",
    description: report.reported_classified.description || "",
    images: report.reported_classified.images || [],
    ad_type: report.reported_classified.ad_type || "oferecer",
    location_city: report.reported_classified.location_city || "",
    is_premium: report.reported_classified.is_premium || false,
    price_range: report.reported_classified.price_range || "",
  };
};

export default function AdminReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [resolution, setResolution] = useState("");
  const [status, setStatus] = useState<ReportStatus>("pending");
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState<any[]>([]);

  useEffect(() => {
    loadReport();

    // Atualizar dados quando a janela ganhar foco
    const handleFocus = () => {
      loadReport();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [reportId]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await reportService.getReportById(reportId);
      setReport(data);
      setResolution(data.resolution || "");
      setStatus(data.status);

      const history = await reportService.getReportFeedbackHistory(reportId);
      setFeedbackHistory(history);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar detalhes da denúncia");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (
    newStatus: ReportStatus,
    newResolution?: string,
  ) => {
    setIsUpdating(true);
    try {
      await reportService.updateReportStatus(
        reportId,
        newStatus,
        newResolution || resolution,
      );

      // Enviar notificação se houver uma mensagem de resolução/feedback
      if ((newResolution || resolution) && report?.reporter_id) {
        try {
          await NotificationService.createNotification({
            user_id: report.reporter_id,
            type: "follow", // Usando um tipo permitido como fallback
            title: "Sua denúncia foi atualizada",
            message: newResolution || resolution,
            priority: "normal",
            metadata: {
              report_id: reportId,
              type: "report_feedback",
            },
          });
        } catch (notifyError) {
          console.error("Erro ao enviar notificação de feedback:", notifyError);
        }
      }

      toast.success("Status atualizado com sucesso");
      loadReport();
      // Recarregar o histórico após o envio de mensagem
      const history = await reportService.getReportFeedbackHistory(reportId);
      setFeedbackHistory(history);
      setResolution(""); // Limpar o campo após o envio
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar denúncia");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteReport = async () => {
    if (
      !confirm("Tem certeza que deseja EXCLUIR permanentemente esta denúncia?")
    )
      return;
    setIsUpdating(true);
    try {
      await reportService.deleteReport(reportId);
      toast.success("Denúncia excluída permanentemente");
      router.push("/gestao-confi/dashboard/reports");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir denúncia");
      setIsUpdating(false);
    }
  };

  const handleBanUser = async (
    userId: string,
    data: { reason: string; ban_type: string; duration_days?: number },
  ) => {
    try {
      const response = await fetch("/api/gestao-confi/bans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao banir usuário");
      }

      toast.success("Usuário banido com sucesso");
      setIsBanModalOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">
          Carregando detalhes...
        </p>
      </div>
    );
  }

  if (!report) return null;

  const getPreviewContent = () => {
    switch (report.type) {
      case "post":
        return {
          title: "Postagem no Feed",
          content: report.reported_post?.content,
          image: report.reported_post?.images?.[0],
          link: `/feed?post=${report.reported_post_id}`,
        };
      case "story":
        return {
          title: "Story / Momento",
          content: "Conteúdo visual temporário",
          image: report.reported_story?.image_url,
          link: `/stories/${report.reported_story_id}`,
        };
      case "classified":
        return {
          title: "Anúncio nos Classificados",
          content: report.reported_classified?.title,
          image: report.reported_classified?.images?.[0],
          link: `/classificados/${report.reported_classified_id}`,
        };
      case "message":
        return {
          title: "Mensagem no Chat",
          content: report.reported_message?.content,
          image: null,
          link: null,
        };
      default:
        return null;
    }
  };

  const preview = getPreviewContent();

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4 sm:p-5 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">Detalhes</h1>
              <Badge
                variant="outline"
                className="font-mono text-[9px] bg-muted/50 border-primary/20 px-1.5 py-0"
              >
                #{report.id.slice(0, 8)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3 text-primary/60" />
              Recebida em{" "}
              {format(new Date(report.created_at), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <Button
            variant="ghost"
            onClick={handleDeleteReport}
            disabled={isUpdating}
            className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 font-bold uppercase text-[10px] tracking-widest h-8"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Excluir
          </Button>

          {/* Phases / Status Stepper */}
          <div className="flex items-center bg-muted/30 p-1.5 rounded-full border border-border/50">
            {[
              { id: "pending", label: "Pendente", icon: Clock },
              { id: "reviewing", label: "Em Análise", icon: Eye },
              { id: "resolved", label: "Resolvido", icon: CheckCircle2 },
            ].map((step, idx) => {
              const isActive = report.status === step.id;
              const isPast =
                (report.status === "reviewing" && step.id === "pending") ||
                (report.status === "resolved" &&
                  (step.id === "pending" || step.id === "reviewing"));
              const Icon = step.icon;

              return (
                <React.Fragment key={step.id}>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${isActive ? "bg-primary text-primary-foreground shadow-sm" : isPast ? "text-primary/60" : "text-muted-foreground/60"}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
                      {step.label}
                    </span>
                  </div>
                  {idx < 2 && <div className="w-4 h-[1px] bg-border mx-1" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Users Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Reporter Card */}
        <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-primary/10 rounded-lg">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  Denunciante
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-primary/10 p-0.5 bg-background shadow-sm shrink-0">
                {report.reporter?.avatar_url ? (
                  <img
                    src={report.reporter.avatar_url}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm truncate">
                  {report.reporter?.full_name || "Usuário"}
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate mb-1">
                  {report.reporter?.email}
                </p>
                <Link
                  href={`/perfil/${report.reporter_id}`}
                  className="text-[9px] font-bold text-primary flex items-center gap-1 hover:underline"
                >
                  Ver Perfil <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reported User Card */}
        <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-background to-red-50/10 dark:to-red-950/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                  <Ban className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-red-600/70 dark:text-red-400/70">
                  Denunciado
                </span>
              </div>
            </div>
            {report.reported_user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-red-100 dark:border-red-900/10 p-0.5 bg-background shadow-sm shrink-0">
                  {report.reported_user.avatar_url ? (
                    <img
                      src={report.reported_user.avatar_url}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-950/20 text-red-400">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">
                    {report.reported_user.full_name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate mb-1">
                    {report.reported_user.email}
                  </p>
                  <Link
                    href={`/perfil/${report.reported_user_id}`}
                    className="text-[9px] font-bold text-red-500 flex items-center gap-1 hover:underline"
                  >
                    Ver Perfil <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-10 flex items-center italic text-[10px] text-muted-foreground">
                Conteúdo sem usuário específico.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reason & Description */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-2 border-b bg-muted/5 p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Motivo & Descrição
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-3">
            <Badge
              variant="secondary"
              className="bg-primary/5 text-primary border-primary/10 px-3 py-1 rounded-lg font-bold text-[10px] uppercase"
            >
              {report.reason ||
                (report.type === "message"
                  ? "Mensagem imprópria"
                  : "Denúncia de conteúdo")}
            </Badge>
            <div className="bg-muted/30 p-4 rounded-2xl border border-dashed border-border/50 relative">
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
                {report.description}
              </p>
              <p className="text-[9px] text-muted-foreground mt-3 italic opacity-70">
                Enviado em:{" "}
                {format(
                  new Date(report.created_at),
                  "dd 'de' MMMM 'às' HH:mm",
                  { locale: ptBR },
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reported Content Preview (Miniature) */}
      {preview && (
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-2 border-b bg-muted/5 p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Conteúdo Denunciado
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {report.type === "post" && report.reported_post ? (
              <div className="max-w-lg mx-auto flex flex-col gap-4">
                <PostCard
                  post={{
                    ...report.reported_post,
                    user: report.reported_user || {
                      id: report.reported_user_id,
                      full_name: "Usuário Denunciado",
                      avatar_url: report.reported_user?.avatar_url,
                    },
                  }}
                  onLike={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
                {preview.link && (
                  <Link href={preview.link} className="self-center">
                    <Button
                      variant="outline"
                      className="rounded-xl border-blue-600/30 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 bg-background shadow-sm h-8 px-3 gap-1.5 font-bold text-[11px] sm:text-xs transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver Post Original
                    </Button>
                  </Link>
                )}
              </div>
            ) : report.type === "classified" && report.reported_classified ? (
              <div className="max-w-[280px] sm:max-w-xs mx-auto flex flex-col gap-4 text-xs">
                <div className="h-[400px]">
                  <ClassifiedsCard ad={mapReportToClassifiedAd(report)} />
                </div>
                {preview.link && (
                  <Link href={preview.link} className="self-center mt-2">
                    <Button
                      variant="outline"
                      className="rounded-xl border-blue-600/30 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 bg-background shadow-sm h-8 px-3 gap-1.5 font-bold text-[11px] sm:text-xs transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver Anúncio Original
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-muted/10 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 relative group border border-border/30">
                {/* Miniatura Box */}
                <div className="w-full sm:w-28 sm:h-28 h-auto aspect-square bg-background rounded-2xl border flex items-center justify-center p-2 shrink-0 shadow-sm overflow-hidden relative">
                  {preview.image ? (
                    <img
                      src={preview.image}
                      alt="Miniatura"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                      Sem Miniatura
                    </span>
                  )}
                </div>

                {/* Text Info */}
                <div className="flex-1 flex flex-col justify-start pt-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                    {preview.title}
                  </span>
                  <p className="text-sm italic leading-relaxed text-foreground/80 line-clamp-3">
                    "{preview.content || "Nenhum texto disponível."}"
                  </p>
                </div>

                {/* Action Link */}
                {report.type === "message" &&
                report.reported_message?.conversation_id ? (
                  <div className="sm:absolute sm:bottom-4 sm:right-4 shrink-0 sm:self-end mt-3 sm:mt-0">
                    <Button
                      onClick={() => setIsChatModalOpen(true)}
                      className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-8 px-4 gap-1.5 font-bold text-[11px] sm:text-xs transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Ver Conversa Completa
                    </Button>
                  </div>
                ) : preview.link ? (
                  <div className="sm:absolute sm:bottom-4 sm:right-4 shrink-0 sm:self-end mt-3 sm:mt-0">
                    <Link href={preview.link}>
                      <Button
                        variant="outline"
                        className="rounded-xl border-blue-600/30 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 bg-background shadow-sm h-8 px-3 gap-1.5 font-bold text-[11px] sm:text-xs transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver Conteúdo Original
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Moderator Feedback Section */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-2 border-b bg-muted/5 p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Feedback para o Denunciante
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {FEEDBACK_TEMPLATES.map((tmpl) => (
              <Button
                key={tmpl.label}
                variant="outline"
                size="sm"
                onClick={() => setResolution(tmpl.message)}
                className="text-[10px] h-7 px-2.5 rounded-lg border-muted-foreground/20 hover:bg-primary/5 hover:text-primary transition-all font-bold"
              >
                {tmpl.label}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="resolution"
              className="text-[10px] font-bold uppercase text-muted-foreground/80 px-1"
            >
              Mensagem de Resolução
            </Label>
            <div className="flex gap-2">
              <Textarea
                id="resolution"
                placeholder="Descreva o que foi feito ou o motivo da decisão..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="flex-1 min-h-[100px] resize-none rounded-2xl border-muted bg-muted/20 focus:bg-background transition-colors p-3 text-[13px]"
              />
              <Button
                onClick={() => handleUpdate(report.status, resolution)}
                disabled={isUpdating || !resolution.trim()}
                className="self-end rounded-xl h-10 px-4 gap-2 bg-primary text-primary-foreground font-bold shadow-sm"
                title="Apenas enviar mensagem sem mudar status"
              >
                <Send className="w-4 h-4" />
                Enviar Mensagem
              </Button>
            </div>
          </div>

          {/* Histórico de Mensagens */}
          {feedbackHistory.length > 0 && (
            <div className="mt-8 pt-8 border-t border-border/50 space-y-4">
              <div className="flex items-center gap-2 px-1">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Histórico de Mensagens enviadas ao Denunciante
                </h4>
              </div>

              <div className="space-y-3">
                {feedbackHistory.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    className="bg-muted/30 border border-border/50 rounded-2xl p-3 animate-in fade-in slide-in-from-left-2 duration-300"
                  >
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <Badge
                        variant="outline"
                        className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider bg-background/50"
                      >
                        Feedback
                      </Badge>
                      <span className="text-[9px] text-muted-foreground font-medium">
                        {format(new Date(msg.created_at), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <p className="text-[12px] text-foreground leading-relaxed italic">
                      "{msg.message}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Desktop Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-background/90 backdrop-blur-xl border-t border-border/50 flex justify-center z-50 animate-in slide-in-from-bottom-full duration-700 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => handleUpdate("reviewing")}
            disabled={isUpdating || report.status === "reviewing"}
            className="rounded-xl h-10 px-4 sm:px-5 gap-1.5 font-bold uppercase text-[10px] sm:text-xs tracking-widest hover:bg-primary/5 border-muted"
          >
            <Play className="w-3.5 h-3.5" />
            Iniciar Análise
          </Button>
          <Button
            variant="outline"
            onClick={() => handleUpdate("dismissed")}
            disabled={isUpdating || report.status === "dismissed"}
            className="rounded-xl h-10 px-4 sm:px-5 gap-1.5 font-bold uppercase text-[10px] sm:text-xs tracking-widest hover:bg-muted"
          >
            <Archive className="w-3.5 h-3.5" />
            Arquivar
          </Button>
          <div className="w-[1px] h-6 bg-border mx-1 hidden sm:block" />
          <Button
            onClick={() => handleUpdate("resolved")}
            disabled={isUpdating || report.status === "resolved"}
            className="rounded-xl h-10 px-6 gap-1.5 bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/20 font-black uppercase text-[10px] sm:text-xs tracking-widest"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolver
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsBanModalOpen(true)}
            disabled={isUpdating || !report.reported_user}
            className="rounded-xl h-10 px-6 gap-1.5 shadow-md shadow-red-600/20 font-black uppercase text-[10px] sm:text-xs tracking-widest"
          >
            <Ban className="w-3.5 h-3.5" />
            Banir
          </Button>
        </div>
      </div>

      <BanUserModal
        isOpen={isBanModalOpen}
        onOpenChange={setIsBanModalOpen}
        user={report.reported_user as any}
        onBan={handleBanUser}
      />

      {report.type === "message" &&
        report.reported_message?.conversation_id && (
          <AdminReportedChatModal
            isOpen={isChatModalOpen}
            onClose={() => setIsChatModalOpen(false)}
            conversationId={report.reported_message.conversation_id}
            reportedMessageId={report.reported_message.id || ""}
          />
        )}
    </div>
  );
}
