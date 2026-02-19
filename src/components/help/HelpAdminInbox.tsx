/**
 * Help Admin Inbox - List of support tickets for moderators
 */

"use client";

import React from "react";
import Image from "next/image";
import { useHelpChat } from "@/contexts/HelpChatContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HelpAdminInbox() {
  const { adminTickets, selectTicket } = useHelpChat();

  if (adminTickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
        <p>Nenhum chamado de suporte aberto no momento. 👍</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 border-b border-border/50 bg-muted/20">
        <h4 className="text-sm font-semibold text-foreground/80">
          Tickets de Suporte
        </h4>
      </div>
      <div className="divide-y divide-border/30">
        {adminTickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => selectTicket(ticket.conversation_id)}
            className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left group"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border/50 bg-muted">
              {ticket.user?.avatar_url ? (
                <Image
                  src={ticket.user.avatar_url}
                  alt={ticket.user.full_name || "Usuário"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                  {ticket.user?.full_name?.charAt(0) || "U"}
                </div>
              )}
              {ticket.status === "open" && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm truncate">
                  {ticket.user?.full_name || "Usuário"}
                </span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(ticket.updated_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {ticket.last_message?.[0]?.content || "Iniciou um chamado..."}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
