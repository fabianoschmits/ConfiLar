"use client";

import React, { useState, useEffect } from "react";
import { supportService } from "@/modules/support/services/supportService";
import type {
  SupportTicket,
  SupportTicketStatus,
} from "@/modules/support/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  MessageSquare,
  User as UserIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";

export default function AdminTicketsPage() {
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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Gestão de Tickets
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Monitore e responda chamados de suporte.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push("/gestao-confi/dashboard/tickets/metrics")
            }
            className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-[11px] sm:text-xs px-2 sm:px-3"
          >
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Analytics
          </Button>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 sm:h-9 text-[11px] sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-2">
        {[
          "all",
          "aberto",
          "em_andamento",
          "aguardando_usuario",
          "reaberto",
          "resolvido",
          "fechado",
        ].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="capitalize text-[10px] sm:text-[11px] h-7 sm:h-8 px-2 sm:px-3"
          >
            {status === "all"
              ? "Todos"
              : status === "fechado"
                ? "Arquivados"
                : status.replace("_", " ")}
            <Badge
              variant="secondary"
              className="text-[9px] px-1 py-0 h-4 bg-muted text-muted-foreground ml-1.5"
            >
              {status === "all"
                ? tickets.filter((t) => t.status !== "fechado").length
                : tickets.filter((t) => t.status === status).length}
            </Badge>
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Clock className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm font-medium">
                Nenhum ticket encontrado para estes filtros.
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
                className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() =>
                  router.push(`/gestao-confi/dashboard/tickets/${ticket.id}`)
                }
              >
                <div className="flex items-center p-3 sm:p-4 gap-3 sm:gap-4">
                  <div className="relative shrink-0">
                    {ticket.profiles?.avatar_url ? (
                      <img
                        src={ticket.profiles.avatar_url}
                        alt={ticket.profiles.full_name || "Usuário"}
                        className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover shadow-sm border border-border"
                      />
                    ) : (
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground border border-border shadow-sm">
                        <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <Badge
                        variant={style.variant}
                        className="text-[8px] sm:text-[10px] uppercase font-bold px-1.5 h-3.5 sm:h-4"
                      >
                        {ticket.status === "fechado"
                          ? "Arquivado"
                          : ticket.status.replace("_", " ")}
                      </Badge>
                      <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-medium">
                        {ticket.category}
                      </span>
                      {sla && (
                        <Badge
                          variant={sla.variant as any}
                          className="text-[8px] sm:text-[9px] gap-1 px-1.5 h-3.5 sm:h-4"
                        >
                          <sla.icon className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                          {sla.label}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-bold text-[13px] sm:text-sm truncate">
                      {ticket.subject}
                    </h4>
                    <div className="flex flex-wrap flex-col gap-0.5 mt-0.5">
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                        Por{" "}
                        <span className="font-medium text-foreground">
                          {ticket.profiles?.full_name || "Usuário"}
                        </span>{" "}
                        •{" "}
                        {format(new Date(ticket.created_at), "dd/MM", {
                          locale: ptBR,
                        })}
                      </p>
                      {ticket.profiles?.user_type && (
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] font-bold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                            {ticket.profiles.user_type === "professional"
                              ? "Prof"
                              : "Cli"}
                          </span>
                          {ticket.profiles.is_pro && (
                            <span className="text-[8px] font-bold uppercase bg-gradient-to-r from-amber-200 to-amber-500 text-amber-900 px-1.5 py-0.5 rounded-sm shadow-sm">
                              PRO
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <Badge
                      variant={
                        ticket.priority === "urgente" ||
                        ticket.priority === "alta"
                          ? "destructive"
                          : "outline"
                      }
                      className="text-[9px]"
                    >
                      {ticket.priority.toUpperCase()}
                    </Badge>
                    {ticket.assigned_to && (
                      <span className="text-[9px] text-primary font-bold">
                        ATRIBUÍDO
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
