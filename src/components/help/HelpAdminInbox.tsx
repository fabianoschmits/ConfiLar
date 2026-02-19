/**
 * Help Admin Inbox - Full ticket list for moderators inside Help Center
 */

"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useHelpChat } from "@/contexts/HelpChatContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MessageSquare,
  RefreshCw,
  Clock,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export default function HelpAdminInbox() {
  const {
    adminTickets,
    selectTicket,
    fetchAdminTickets,
    deleteTicketForAdmin,
  } = useHelpChat();

  // Refresh tickets on mount
  useEffect(() => {
    fetchAdminTickets();
  }, [fetchAdminTickets]);

  const openTickets = adminTickets.filter((t) => t.status === "open");
  const inProgressTickets = adminTickets.filter(
    (t) => t.status === "in_progress",
  );
  const resolvedTickets = adminTickets.filter(
    (t) => t.status === "resolved" || t.status === "closed",
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Section header */}
      <div className="px-4 py-3 border-b border-border/50 bg-muted/20 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            Tickets de Usuários
          </h4>
          {openTickets.length > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {openTickets.length}
            </span>
          )}
        </div>
        <button
          onClick={() => fetchAdminTickets()}
          className="w-7 h-7 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors"
          title="Atualizar tickets"
        >
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {adminTickets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <MessageSquare className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground/70">
            Nenhum chamado aberto
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Todos os usuários estão sendo atendidos 👍
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-border/30">
          {/* Open tickets */}
          {openTickets.length > 0 && (
            <div>
              <div className="px-4 py-1.5 bg-muted/10">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  Abertos
                </p>
              </div>
              {openTickets.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={() => selectTicket(ticket.conversation_id)}
                  onDelete={() => deleteTicketForAdmin(ticket.id)}
                />
              ))}
            </div>
          )}

          {/* In Progress tickets */}
          {inProgressTickets.length > 0 && (
            <div>
              <div className="px-4 py-1.5 bg-primary/5">
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  Em Atendimento
                </p>
              </div>
              {inProgressTickets.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={() => selectTicket(ticket.conversation_id)}
                  onDelete={() => deleteTicketForAdmin(ticket.id)}
                />
              ))}
            </div>
          )}

          {/* Resolved tickets */}
          {resolvedTickets.length > 0 && (
            <div>
              <div className="px-4 py-1.5 bg-muted/10">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Resolvidos
                </p>
              </div>
              {resolvedTickets.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={() => selectTicket(ticket.conversation_id)}
                  onDelete={() => deleteTicketForAdmin(ticket.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TicketRow({
  ticket,
  onSelect,
  onDelete,
}: {
  ticket: any;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const lastMessage = Array.isArray(ticket.last_message)
    ? ticket.last_message[0]
    : ticket.last_message;

  return (
    <div className="relative group">
      <button
        onClick={onSelect}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
      >
        {/* Avatar */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border/50 bg-muted flex-shrink-0">
          {ticket.user?.avatar_url ? (
            <Image
              src={ticket.user.avatar_url}
              alt={ticket.user.full_name || "Usuário"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
              {ticket.user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          {/* Status dot */}
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${
              ticket.status === "open"
                ? "bg-amber-500"
                : ticket.status === "in_progress"
                  ? "bg-primary"
                  : "bg-emerald-500"
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="font-semibold text-sm truncate">
              {ticket.user?.full_name || "Usuário"}
            </span>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2 flex-shrink-0">
              {formatDistanceToNow(
                new Date(ticket.updated_at || ticket.created_at),
                { addSuffix: true, locale: ptBR },
              )}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {lastMessage?.content || "Iniciou um chamado de suporte..."}
          </p>
        </div>
      </button>

      {/* Delete button - shows on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (confirm("Deseja ocultar este chamado da sua lista?")) {
            onDelete();
          }
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-background border border-border/50 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
        title="Ocultar chamado"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
