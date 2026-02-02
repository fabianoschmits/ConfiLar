import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            Detalhes da Denúncia
          </DialogTitle>
          <DialogDescription>
            Protocolo: <span className="font-mono">{report.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
                  href={`/perfil/${report.reporter?.id}`}
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
                    href={`/perfil/${report.reported_user.id}`}
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

        <div className="space-y-2 mt-4">
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

        <DialogFooter className="flex-col sm:flex-row gap-2 border-t pt-4 mt-4">
          <div className="flex flex-wrap gap-2 w-full">
            {/* Primary Workflow Actions */}
            {report.status === "pending" && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onUnderReview(report.id)}
              >
                <Clock className="mr-2 h-4 w-4" /> Iniciar Análise
              </Button>
            )}

            {(report.status === "pending" ||
              report.status === "under_review") && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onDismiss(report.id)}
                  className="flex-1"
                >
                  <Archive className="mr-2 h-4 w-4" /> Ignorar/Arquivar
                </Button>
                <Button
                  onClick={() => onResolve(report.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Resolver
                </Button>
              </>
            )}

            {/* Revert Action */}
            {(report.status === "under_review" ||
              report.status === "resolved" ||
              report.status === "dismissed") && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onRevert(report.id)}
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> Reverter
              </Button>
            )}

            {/* Ban Action - Only if reported user exists */}
            {report.reported_user?.id && onBan && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => onBan(report.reported_user!.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Banir
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
