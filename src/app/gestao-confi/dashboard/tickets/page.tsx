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
      (ticket as any).profiles?.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusStyles: Record<string, { variant: any; icon: any }> = {
    aberto: { variant: "warning", icon: AlertCircle },
    em_andamento: { variant: "default", icon: Clock },
    aguardando_usuario: { variant: "secondary", icon: UserIcon },
    resolvido: { variant: "success", icon: CheckCircle2 },
    fechado: { variant: "outline", icon: CheckCircle2 },
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
    <div className="space-y-6 p-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestão de Tickets
          </h1>
          <p className="text-muted-foreground">
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
            className="gap-2"
          >
            <TrendingUp className="w-4 h-4" /> Analytics
          </Button>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar assunto ou usuário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
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
            className="capitalize text-[11px] h-8"
          >
            {status === "all" ? "Todos" : status.replace("_", " ")}
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
                <div className="flex items-center p-4 gap-4">
                  <div
                    className={`p-3 rounded-full bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors`}
                  >
                    <StatusIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={style.variant}
                        className="text-[10px] uppercase font-bold"
                      >
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">
                        {ticket.category}
                      </span>
                      {sla && (
                        <Badge
                          variant={sla.variant as any}
                          className="text-[9px] gap-1 px-1.5 h-4"
                        >
                          <sla.icon className="w-2.5 h-2.5" />
                          {sla.label}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm truncate">
                      {ticket.subject}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Por{" "}
                      <span className="font-medium text-foreground">
                        {(ticket as any).profiles?.full_name ||
                          "Usuário desconhecido"}
                      </span>{" "}
                      •
                      {format(new Date(ticket.created_at), " dd/MM HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
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
