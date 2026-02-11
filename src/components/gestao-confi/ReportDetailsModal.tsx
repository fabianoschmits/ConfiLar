"use client";

import React, { useState } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User as UserIcon,
  MessageSquare,
  CheckCircle,
  EyeOff,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Send,
  Clock,
  RefreshCcw,
  Archive,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface Profile {
  id: string;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

export interface Report {
  id: string;
  reason: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  created_at: string;
  reporter_id?: string;
  reported_user_id?: string;
  reported_post_id?: string;
  reported_classified_id?: string;
  reported_message_id?: string;
  reported_comment_id?: string;
  reported_content?: {
    text?: string;
    media?: string;
    link?: string;
    type?: "post" | "ad" | "review" | "message";
  };
  admin_notes?: string;
  resolution?: string;
  reporter?: Profile;
  reported_user?: Profile;
}

interface ReportDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report | null;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
  onUnderReview: (id: string) => void;
  onRevert: (id: string) => void;
  onBan?: (userId: string) => void;
  onDelete?: (id: string) => void;
  onSendFeedback: (userId: string, message: string) => Promise<void>;
}

export function ReportDetailsModal({
  isOpen,
  onOpenChange,
  report,
  onResolve,
  onDismiss,
  onUnderReview,
  onRevert,
  onBan,
  onDelete,
  onSendFeedback,
}: ReportDetailsModalProps) {
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!report) return null;

  const handleSendFeedback = async () => {
    if (!report.reporter?.id || !feedbackMessage.trim()) return;
    setIsSending(true);
    try {
      await onSendFeedback(report.reporter.id, feedbackMessage);
      setFeedbackMessage("");
    } finally {
      setIsSending(false);
    }
  };

  const predefinedMessages = [
    "Recebemos sua denúncia e estamos analisando.",
    "Sua denúncia foi aceita e medidas foram tomadas.",
    "Agradecemos o alerta, continuaremos monitorando.",
  ];

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Detalhes da Denúncia"
      description={`Protocolo: ${report.id} `}
      className="max-w-2xl"
      footer={
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
          {/* Primary Workflow Actions */}
          {report.status === "pending" && (
            <Button
              variant="outline"
              onClick={() => onUnderReview(report.id)}
              className="w-full text-xs sm:text-sm px-2"
            >
              <Clock className="mr-1.5 h-4 w-4 shrink-0" /> Iniciar Análise
            </Button>
          )}

          {(report.status === "pending" || report.status === "reviewing") && (
            <>
              <Button
                variant="outline"
                onClick={() => onDismiss(report.id)}
                className="w-full text-xs sm:text-sm px-2"
              >
                <Archive className="mr-1.5 h-4 w-4 shrink-0" /> Arquivar
              </Button>
              <Button
                onClick={() => onResolve(report.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm px-2"
              >
                <CheckCircle className="mr-1.5 h-4 w-4 shrink-0" /> Resolver
              </Button>
            </>
          )}

          {/* Revert Action */}
          {(report.status === "reviewing" ||
            report.status === "resolved" ||
            report.status === "dismissed") && (
            <Button
              variant="outline"
              onClick={() => onRevert(report.id)}
              className="w-full text-xs sm:text-sm px-2"
            >
              <RefreshCcw className="mr-1.5 h-4 w-4 shrink-0" /> Reverter
            </Button>
          )}

          {/* Ban Action - Only if reported user exists */}
          {report.reported_user?.id && onBan && (
            <Button
              variant="destructive"
              onClick={() => onBan(report.reported_user!.id)}
              className="w-full text-xs sm:text-sm px-2"
            >
              <Trash2 className="mr-1.5 h-4 w-4 shrink-0" /> Banir
            </Button>
          )}

          {/* Delete Action - Only for archived/resolved reports */}
          {(report.status === "resolved" || report.status === "dismissed") &&
            onDelete && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (
                    confirm(
                      "Tem certeza que deseja DELETAR permanentemente esta denúncia? Esta ação não pode ser desfeita.",
                    )
                  ) {
                    onDelete(report.id);
                  }
                }}
                className="w-full text-xs sm:text-sm px-2 bg-red-700 hover:bg-red-800"
              >
                <Trash2 className="mr-1.5 h-4 w-4 shrink-0" /> Deletar
              </Button>
            )}
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reporter Info */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <UserIcon className="h-4 w-4" /> Denunciante
            </h4>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={report.reporter?.avatar_url || ""} />
                <AvatarFallback>
                  {report.reporter?.full_name?.substring(0, 2).toUpperCase() ||
                    "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {report.reporter?.full_name || "Desconhecido"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {report.reporter?.email}
                </p>
                <a
                  href={`/ perfil / ${report.reporter?.id} `}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 flex items-center gap-1 mt-1 hover:underline"
                >
                  Ver Perfil <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Reported User Info */}
          <div className="space-y-3 p-4 border rounded-lg bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-red-700 dark:text-red-400">
              <EyeOff className="h-4 w-4" /> Denunciado
            </h4>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={report.reported_user?.avatar_url || ""} />
                <AvatarFallback>
                  {report.reported_user?.full_name
                    ?.substring(0, 2)
                    .toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {report.reported_user?.full_name || "N/A"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {report.reported_user?.email}
                </p>
                {report.reported_user?.id && (
                  <a
                    href={`/ perfil / ${report.reported_user.id} `}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 flex items-center gap-1 mt-1 hover:underline"
                  >
                    Ver Perfil <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Motivo & Descrição</h4>
          <div className="bg-muted p-4 rounded-md space-y-2">
            <Badge variant="outline" className="mb-2">
              {report.reason}
            </Badge>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {report.description}
            </p>
            <p className="text-xs text-muted-foreground pt-2 border-t mt-2">
              Enviado em:{" "}
              {format(new Date(report.created_at), "dd 'de' MMMM 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>

        {/* --- PRÉVIA DO CONTEÚDO --- */}
        {(report.reported_content ||
          report.reported_post_id ||
          report.reported_classified_id ||
          report.reported_message_id) && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
              {report.reported_content ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              {report.reported_content
                ? "Conteúdo Denunciado"
                : "Conteúdo Indisponível"}
            </h4>

            {report.reported_content ? (
              <div className="flex gap-4 p-4 border rounded-xl bg-slate-50 dark:bg-slate-900/10 border-slate-100 dark:border-slate-800">
                {report.reported_content.media && (
                  <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border bg-white">
                    <img
                      src={report.reported_content.media}
                      alt="Miniatura"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-primary/70 mb-1 tracking-wider">
                      {report.reported_content.type === "post"
                        ? "Postagem no Feed"
                        : report.reported_content.type === "ad"
                          ? "Anúncio de Classificado"
                          : report.reported_content.type === "message"
                            ? "Mensagem no Chat"
                            : "Avaliação / Comentário"}
                    </p>
                    <p className="text-sm line-clamp-2 italic text-gray-700 dark:text-gray-300">
                      "
                      {report.reported_content.text || "Sem descrição textual."}
                      "
                    </p>
                  </div>
                  {report.reported_content.link && (
                    <div className="mt-2 text-right">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-blue-600 font-bold text-xs hover:text-blue-700"
                        onClick={() =>
                          window.open(report.reported_content!.link, "_blank")
                        }
                      >
                        <ExternalLink className="mr-1 h-3 w-3" /> Ver Conteúdo
                        Original
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-xl bg-gray-50/50 dark:bg-gray-900/10">
                <p className="text-xs text-muted-foreground italic">
                  O conteúdo original não pôde ser encontrado. Pode ter sido
                  removido ou o ID está inválido.
                </p>
              </div>
            )}
          </div>
        )}

        <Separator className="my-4" />

        {/* Feedback Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Feedback para o Denunciante
          </h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {predefinedMessages.map((msg, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => setFeedbackMessage(msg)}
              >
                {msg}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="Digite uma mensagem para o usuário..."
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              className="resize-none h-20 text-sm"
            />
            <Button
              className="h-20"
              disabled={!feedbackMessage.trim() || isSending}
              onClick={handleSendFeedback}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}
