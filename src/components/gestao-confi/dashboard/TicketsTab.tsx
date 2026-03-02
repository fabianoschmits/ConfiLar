"use client";

import React, { useState, useEffect } from "react";
import { supportService } from "@/modules/support/services/supportService";
import type {
  SupportTicket,
  SupportTicketStatus,
} from "@/modules/support/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MessageSquare,
  User as UserIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";

export function TicketsTab() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await supportService.getAllTicketsForAdmin();
      setTickets(data);
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.profiles?.full_name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? ticket.status !== "fechado"
        : ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusStyles: Record<
    string,
    { variant: any; icon: any; label?: string }
  > = {
    aberto: { variant: "warning", icon: AlertCircle },
    em_andamento: { variant: "default", icon: Clock },
    aguardando_usuario: { variant: "secondary", icon: UserIcon },
    resolvido: { variant: "success", icon: CheckCircle2 },
    fechado: { variant: "outline", icon: CheckCircle2, label: "Arquivado" },
    reaberto: { variant: "destructive", icon: AlertCircle },
  };

  const getSLAInfo = (ticket: SupportTicket) => {
    if (
      ticket.status === "resolvido" ||
      ticket.status === "fechado" ||
      !ticket.sla_deadline
    )
      return null;

    const now = new Date();
    const deadline = new Date(ticket.sla_deadline);
    const diffMs = deadline.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 0)
      return { label: "Atrasado", variant: "destructive", icon: AlertCircle };
    if (diffHours < 2)
      return { label: "Vence em breve", variant: "warning", icon: Clock };
    return {
      label: `SLA: ${format(deadline, "HH:mm")}`,
      variant: "outline",
      icon: Clock,
    };
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "Não Arquivados" },
            { id: "aberto", label: "Abertos" },
            { id: "em_andamento", label: "Em Andamento" },
            { id: "aguardando_usuario", label: "Aguardando" },
            { id: "resolvido", label: "Resolvidos" },
          ].map((status) => (
            <Button
              key={status.id}
              variant={statusFilter === status.id ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status.id)}
              className="capitalize text-[10px] sm:text-[11px] h-8 px-3 rounded-lg font-bold"
            >
              {status.label}
              <Badge
                variant="secondary"
                className="text-[9px] px-1 py-0 h-4 ml-1.5 opacity-70"
              >
                {status.id === "all"
                  ? tickets.filter((t) => t.status !== "fechado").length
                  : tickets.filter((t) => t.status === status.id).length}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs rounded-lg"
          />
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Clock className="w-8 h-8 animate-spin text-primary opacity-20" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground text-sm font-medium">
                Nenhum ticket encontrado.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => {
            const style = statusStyles[ticket.status] || statusStyles.aberto;
            const StatusIcon = style.icon;
            const sla = getSLAInfo(ticket);

            return (
              <Card
                key={ticket.id}
                className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer group rounded-xl border-border/50 shadow-sm"
                onClick={() =>
                  router.push(`/gestao-confi/dashboard/tickets/${ticket.id}`)
                }
              >
                <div className="flex items-center p-2.5 sm:p-4 gap-2.5 sm:gap-4">
                  <div className="relative shrink-0">
                    {ticket.profiles?.avatar_url ? (
                      <img
                        src={ticket.profiles.avatar_url}
                        alt={ticket.profiles.full_name || "Usuário"}
                        className="w-9 h-9 sm:w-12 sm:h-12 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground border">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge
                        variant={style.variant}
                        className="text-[9px] uppercase font-black px-1.5 h-4 rounded-md"
                      >
                        {ticket.status === "fechado"
                          ? "Arquivado"
                          : ticket.status.replace("_", " ")}
                      </Badge>
                      {sla && (
                        <Badge
                          variant={sla.variant as any}
                          className="text-[9px] gap-1 px-1.5 h-4 rounded-md"
                        >
                          <sla.icon className="w-2.5 h-2.5" />
                          {sla.label}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-bold text-[13px] sm:text-sm truncate">
                      {ticket.subject}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                      {format(new Date(ticket.created_at), "dd MMM", {
                        locale: ptBR,
                      })}{" "}
                      •{" "}
                      <span className="text-foreground font-semibold">
                        {ticket.profiles?.full_name || "Usuário"}
                      </span>
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
