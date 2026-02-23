"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supportService } from "@/modules/support/services/supportService";
import {
  SupportTicket,
  SupportTicketStatus,
  SupportTicketPriority,
} from "@/modules/support/types";
import { useAuthContext } from "@/contexts/AuthContext";
import { SupportTicketChat } from "@/modules/support/components/SupportTicketChat";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  UserPlus,
  AlertTriangle,
  History,
  Zap,
  Clock,
  MessageSquare,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";

export default function AdminTicketDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuthContext();
  const router = useRouter();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [macros, setMacros] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "logs">("chat");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [ticketData, macrosData] = await Promise.all([
        supportService.getTicketById(id),
        supportService.getMacros(),
      ]);
      setTicket(ticketData);
      setMacros(macrosData);

      // Fetch logs separately for clarity
      const { data: logsData } = await (supabase as any)
        .from("support_ticket_logs")
        .select("*")
        .eq("ticket_id", id)
        .order("created_at", { ascending: false });
      setLogs(logsData || []);
    } catch (error) {
      console.error("Error loading ticket data:", error);
      if (!silent) toast.error("Erro ao carregar dados.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`admin_ticket_updates_${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_ticket_messages",
          filter: `ticket_id=eq.${id}`,
        },
        () => {
          loadData(true);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_tickets",
          filter: `id=eq.${id}`,
        },
        () => {
          loadData(true);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSendMessage = async (message: string) => {
    if (!user || !ticket) return;
    try {
      await supportService.sendMessage(
        ticket.id,
        user.id,
        "moderator",
        message,
      );
      if (ticket.status === "aberto") {
        await handleStatusChange("em_andamento");
      } else {
        await loadData();
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem.");
    }
  };

  const handleStatusChange = async (newStatus: SupportTicketStatus) => {
    if (!ticket || !user) return;
    try {
      await supportService.updateTicketStatus(ticket.id, user.id, newStatus);
      toast.success(`Status alterado para ${newStatus.replace("_", " ")}`);
      await loadData();
    } catch (error) {
      toast.error("Erro ao alterar status.");
    }
  };

  const handlePriorityChange = async (newPriority: SupportTicketPriority) => {
    if (!ticket || !user) return;
    try {
      await supportService.updateTicketPriority(
        ticket.id,
        user.id,
        newPriority,
      );
      toast.success(`Prioridade alterada para ${newPriority}`);
      await loadData();
    } catch (error) {
      toast.error("Erro ao alterar prioridade.");
    }
  };

  const handleAssignToMe = async () => {
    if (!user || !ticket) return;
    try {
      await supportService.assignTicket(ticket.id, user.id);
      toast.success("Ticket atribuído a você!");
      await loadData();
    } catch (error) {
      toast.error("Erro ao atribuir ticket.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Carregando detalhes do ticket...
        </p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Ticket não encontrado.</h2>
        <Button onClick={() => router.back()} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 w-full xs:w-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full h-8 w-8 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight truncate">
              Gerenciar Ticket
            </h1>
            <p className="text-[10px] sm:text-sm text-muted-foreground break-all">
              ID: {ticket.id}
            </p>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2 w-full xs:w-auto">
          <Button
            variant={activeTab === "chat" ? "default" : "outline"}
            onClick={() => setActiveTab("chat")}
            size="sm"
            className="flex-1 xs:flex-none gap-1 sm:gap-2 h-7 sm:h-9 text-[10px] sm:text-xs px-2 sm:px-3"
          >
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden min-[380px]:inline">Conversa</span>
            <span className="inline min-[380px]:hidden">Chat</span>
          </Button>
          <Button
            variant={activeTab === "logs" ? "default" : "outline"}
            onClick={() => setActiveTab("logs")}
            size="sm"
            className="flex-1 xs:flex-none gap-1 sm:gap-2 h-7 sm:h-9 text-[10px] sm:text-xs px-2 sm:px-3"
          >
            <History className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden min-[380px]:inline">Histórico</span>
            <span className="inline min-[380px]:hidden">Logs</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Section */}
        <div className="lg:col-span-2">
          {activeTab === "chat" ? (
            <div className="space-y-4">
              <Card className="bg-muted/30 border-dashed p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[9px] sm:text-[11px] font-bold uppercase flex items-center gap-1 sm:gap-2">
                    <Zap className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-500" />{" "}
                    Macros
                  </Label>
                  <Select onValueChange={(v) => handleSendMessage(v)}>
                    <SelectTrigger className="w-[120px] sm:w-[200px] h-6 sm:h-8 text-[9px] sm:text-[11px]">
                      <SelectValue placeholder="Responder..." />
                    </SelectTrigger>
                    <SelectContent>
                      {macros.map((m) => (
                        <SelectItem key={m.id} value={m.content}>
                          {m.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
              <SupportTicketChat
                ticket={ticket}
                onSendMessage={handleSendMessage}
                onBack={() => router.back()}
                currentUser={{ id: user?.id || "" }}
                isAdmin={true}
              />
            </div>
          ) : (
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase">
                  Registro de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-4">
                {logs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10">
                    Nenhuma atividade registrada.
                  </p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex gap-3 text-sm border-l-2 border-primary/20 pl-4 py-1"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-primary">
                          {log.action_type === "status_change" &&
                            `Status alterado de "${log.old_value}" para "${log.new_value}"`}
                          {log.action_type === "priority_change" &&
                            `Prioridade alterada de "${log.old_value}" para "${log.new_value}"`}
                          {log.action_type === "assigned" && `Ticket atribuído`}
                          {log.action_type === "reopened" && `Ticket reaberto`}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Executado em{" "}
                          {format(
                            new Date(log.created_at),
                            "dd/MM/yyyy HH:mm",
                            { locale: ptBR },
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col items-center gap-2 sm:gap-3 mb-4">
                <Link
                  href={`/perfil/${ticket.user_id}`}
                  className="transition-transform hover:scale-105 active:scale-95"
                >
                  {ticket.profiles?.avatar_url ? (
                    <img
                      src={ticket.profiles.avatar_url}
                      alt={ticket.profiles?.full_name || "Usuário"}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shadow-sm border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center shadow-sm border border-border">
                      <User className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                    </div>
                  )}
                </Link>
                <div className="text-center">
                  <Link
                    href={`/perfil/${ticket.user_id}`}
                    className="hover:text-primary transition-colors"
                  >
                    <h3 className="font-bold text-[13px] sm:text-sm">
                      {ticket.profiles?.full_name || "Usuário"}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-muted border border-border/50 px-1.5 py-0.5 rounded-sm">
                      {ticket.profiles?.user_type === "professional"
                        ? "Prof"
                        : "Cli"}
                    </span>
                    {ticket.profiles?.is_pro && (
                      <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest bg-gradient-to-r from-amber-200 to-amber-500 text-amber-900 px-1.5 py-0.5 rounded-sm shadow-sm">
                        PRO
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-t border-border/50 pt-4">
                Infos do Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">
                  Status Atual
                </Label>
                <div className="flex gap-2">
                  <Badge className="font-bold text-[9px] sm:text-[10px]">
                    {ticket.status === "fechado"
                      ? "Arquivado"
                      : ticket.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">
                  Métricas SLA
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Prazo Final:
                    </span>
                    <span className="font-medium">
                      {ticket.sla_deadline
                        ? format(new Date(ticket.sla_deadline), "dd/MM HH:mm")
                        : "N/A"}
                    </span>
                  </div>
                  {ticket.first_response_at && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-success" /> 1ª
                        Resposta em:
                      </span>
                      <span className="font-medium">
                        {format(
                          new Date(ticket.first_response_at),
                          "dd/MM HH:mm",
                        )}
                      </span>
                    </div>
                  )}
                  {ticket.resolved_at && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-success" />{" "}
                        Resolvido em:
                      </span>
                      <span className="font-medium">
                        {format(new Date(ticket.resolved_at), "dd/MM HH:mm")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">
                  Atribuído a
                </Label>
                <p className="text-sm font-medium">
                  {ticket.assigned_to ? "Moderador Ativo" : "Não atribuído"}
                </p>
                {!ticket.assigned_to && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2 gap-2"
                    onClick={handleAssignToMe}
                  >
                    <UserPlus className="w-4 h-4" /> Atribuir a mim
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Controles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Alterar Status</Label>
                <Select
                  value={ticket.status}
                  onValueChange={(v) =>
                    handleStatusChange(v as SupportTicketStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Novo Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="aguardando_usuario">
                      Aguardando Usuário
                    </SelectItem>
                    <SelectItem value="reaberto">Reaberto</SelectItem>
                    <SelectItem value="resolvido">Resolvido</SelectItem>
                    <SelectItem value="fechado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Alterar Prioridade</Label>
                <Select
                  value={ticket.priority}
                  onValueChange={(v) =>
                    handlePriorityChange(v as SupportTicketPriority)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
