"use client";

import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Report } from "../types";
import {
  ChevronRight,
  Clock,
  AlertTriangle,
  Shield,
  MessageSquare,
  Image,
  Star,
  Megaphone,
} from "lucide-react";

interface ReportListProps {
  reports: Report[];
  onSelect: (report: Report) => void;
}

const statusMap: Record<string, { label: string; variant: any }> = {
  pending: { label: "Pendente", variant: "warning" },
  reviewing: { label: "Em Análise", variant: "default" },
  resolved: { label: "Resolvido", variant: "success" },
  dismissed: { label: "Resolvido", variant: "success" },
};

const typeIconMap: Record<string, any> = {
  user: Shield,
  post: MessageSquare,
  message: MessageSquare,
  review: Star,
  classified: Megaphone,
  story: Image,
  other: AlertTriangle,
};

export function ReportList({ reports, onSelect }: ReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-12 px-4 animate-in fade-in duration-700">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Nenhuma denúncia encontrada
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Você ainda não fez nenhuma denúncia. Use o botão "Denunciar" em perfis
          ou posts para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {reports.map((report) => {
        const status = statusMap[report.status] || {
          label: report.status,
          variant: "outline",
        };
        const Icon = typeIconMap[report.type] || typeIconMap.other;

        return (
          <Card
            key={report.id}
            onClick={() => onSelect(report)}
            className="group p-4 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={status.variant}
                    className="text-[8px] sm:text-[10px] uppercase tracking-wider font-bold px-1 h-3.5 sm:h-4"
                  >
                    {status.label}
                  </Badge>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                    <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {report.type === "user"
                      ? "Usuário"
                      : report.type === "post"
                        ? "Post"
                        : report.type}
                  </span>
                </div>
                <h4 className="text-[13px] sm:text-sm font-semibold truncate group-hover:text-primary transition-colors">
                  {report.reason || "Denúncia de conteúdo"}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 truncate">
                  {report.description}
                </p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
                  {format(
                    new Date(report.created_at),
                    "dd/MM/yyyy 'às' HH:mm",
                    {
                      locale: ptBR,
                    },
                  )}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
