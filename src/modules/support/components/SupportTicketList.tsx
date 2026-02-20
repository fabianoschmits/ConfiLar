"use client";

import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SupportTicket } from "../types";
import { ChevronRight, Clock, AlertTriangle } from "lucide-react";

interface SupportTicketListProps {
  tickets: SupportTicket[];
  onSelect: (ticket: SupportTicket) => void;
}

const statusMap: Record<string, { label: string; variant: any }> = {
  aberto: { label: "Aberto", variant: "warning" },
  em_andamento: { label: "Em Andamento", variant: "default" },
  aguardando_usuario: { label: "Aguardando Vc", variant: "secondary" },
  resolvido: { label: "Resolvido", variant: "success" },
  fechado: { label: "Fechado", variant: "outline" },
};

const priorityMap: Record<string, { label: string; icon: any; color: string }> =
  {
    baixa: { label: "Baixa", icon: Clock, color: "text-blue-500" },
    media: { label: "Média", icon: Clock, color: "text-amber-500" },
    alta: { label: "Alta", icon: AlertTriangle, color: "text-orange-500" },
    urgente: { label: "Urgente", icon: AlertTriangle, color: "text-red-500" },
  };

export function SupportTicketList({
  tickets,
  onSelect,
}: SupportTicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 px-4 animate-in fade-in duration-700">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Nenhum ticket encontrado
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Você ainda não abriu nenhum ticket de suporte. Clique em "Novo Ticket"
          para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {tickets.map((ticket) => {
        const status = statusMap[ticket.status] || {
          label: ticket.status,
          variant: "outline",
        };
        const priority = priorityMap[ticket.priority] || {
          label: ticket.priority,
          icon: Clock,
          color: "text-muted-foreground",
        };
        const PriorityIcon = priority.icon;

        return (
          <Card
            key={ticket.id}
            onClick={() => onSelect(ticket)}
            className="group p-4 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={status.variant}
                    className="text-[10px] uppercase tracking-wider font-bold"
                  >
                    {status.label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                    <PriorityIcon className={`w-3 h-3 ${priority.color}`} />
                    {priority.label}
                  </span>
                </div>
                <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                  {ticket.subject}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {ticket.category} • Aberto em{" "}
                  {format(
                    new Date(ticket.created_at),
                    "dd/MM/yyyy 'às' HH:mm",
                    { locale: ptBR },
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
