"use client";

import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Report } from "../types";
import {
  ArrowLeft,
  Shield,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
} from "lucide-react";

interface ReportDetailsProps {
  report: Report;
  onBack: () => void;
  currentUser: { id: string };
}

const statusMap: Record<string, { label: string; variant: any; icon: any }> = {
  pending: { label: "Pendente", variant: "warning", icon: Clock },
  reviewing: { label: "Em Análise", variant: "default", icon: Clock },
  resolved: { label: "Resolvido", variant: "success", icon: CheckCircle2 },
  dismissed: { label: "Descartado", variant: "outline", icon: AlertTriangle },
};

export function ReportDetails({
  report,
  onBack,
  currentUser,
}: ReportDetailsProps) {
  const status = statusMap[report.status] || {
    label: report.status,
    variant: "outline",
    icon: Clock,
  };
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col h-[500px] sm:h-[600px] bg-background/50 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden animate-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-muted/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h4 className="text-[13px] sm:text-sm font-bold truncate leading-none mb-1">
              {report.reason || "Denúncia de Conteúdo"}
            </h4>
            <div className="flex items-center gap-2">
              <Badge
                variant={status.variant}
                className="text-[8px] sm:text-[9px] font-bold h-3.5 sm:h-4 px-1.5"
              >
                {status.label}
              </Badge>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest leading-none">
                #{report.id.slice(0, 8)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-muted">
        {/* Original Report Message */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center">
            <div className="bg-muted/30 border border-border/50 rounded-full px-4 py-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
              Denúncia aberta em{" "}
              {format(new Date(report.created_at), "dd/MM/yyyy HH:mm", {
                locale: ptBR,
              })}
            </div>
          </div>

          <div className="flex justify-start items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="max-w-[85%] flex flex-col items-start text-left">
              <div className="bg-muted border border-border/50 text-foreground px-4 py-2.5 rounded-2xl rounded-bl-sm text-[13px] leading-relaxed shadow-sm italic">
                "{report.description}"
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground mt-1 px-1">
                Sua descrição
              </span>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        {(report.reported_post ||
          report.reported_story ||
          report.reported_classified ||
          report.reported_message) && (
          <div className="p-3 bg-muted/20 border border-border/30 rounded-2xl space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
              Conteúdo Denunciado
            </p>
            <div className="flex gap-3 items-start">
              {(report.reported_post?.images?.[0] ||
                report.reported_story?.image_url ||
                report.reported_classified?.images?.[0]) && (
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border/50 bg-background">
                  <img
                    src={
                      report.reported_post?.images?.[0] ||
                      report.reported_story?.image_url ||
                      report.reported_classified?.images?.[0]
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate">
                  {report.reported_classified?.title ||
                    (report.type === "post"
                      ? "Postagem no Feed"
                      : report.type === "story"
                        ? "Story"
                        : "Mensagem")}
                </p>
                <p className="text-[11px] text-muted-foreground line-clamp-2 italic">
                  "
                  {report.reported_post?.content ||
                    report.reported_classified?.description ||
                    report.reported_message?.content ||
                    "Conteúdo visual"}
                  "
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Response / Resolution */}
        {report.status === "pending" ? (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center gap-3 text-center max-w-[250px]">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h5 className="text-sm font-bold">Aguardando Avaliação</h5>
                <p className="text-xs text-muted-foreground">
                  Nossa equipe de moderação está analisando sua denúncia. Você
                  receberá uma atualização em breve.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-end items-end gap-2 animate-in slide-in-from-right-4">
            <div className="max-w-[85%] flex flex-col items-end text-right">
              <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-br-sm text-[13px] leading-relaxed shadow-sm">
                {report.resolution ||
                  (report.status === "dismissed"
                    ? "Denúncia analisada e descartada pela moderação."
                    : "Denúncia resolvida com sucesso.")}
                {report.admin_notes && (
                  <p className="mt-2 pt-2 border-t border-primary-foreground/20 text-[11px] opacity-90">
                    Nota do Admin: {report.admin_notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1 px-1">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Suporte ConfiLar
                </span>
                <ShieldCheck className="w-3 h-3 text-primary" />
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
          </div>
        )}

        {report.status === "resolved" && (
          <div className="flex justify-center pt-4">
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
              <p className="text-[11px] font-medium text-green-800 dark:text-green-300">
                Agradecemos sua colaboração para manter o ConfiLar seguro!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-border/30 bg-muted/20 text-center">
        <p className="text-[10px] text-muted-foreground">
          {report.status === "pending" || report.status === "reviewing"
            ? "O tempo de resposta médio para denúncias é de 12 horas."
            : "Esta denúncia foi encerrada."}
        </p>
      </div>
    </div>
  );
}
