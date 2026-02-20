"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSupportTickets } from "./hooks/useSupportTickets";
import { SupportTicketForm } from "./components/SupportTicketForm";
import { SupportTicketList } from "./components/SupportTicketList";
import { SupportTicketChat } from "./components/SupportTicketChat";
import { SupportTicket } from "./types";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function SupportModule({
  initialTicketId,
}: {
  initialTicketId?: string | null;
}) {
  const { user } = useAuthContext();
  const {
    tickets,
    currentTicket,
    isLoading,
    fetchUserTickets,
    fetchTicketDetails,
    createTicket,
    sendMessage,
  } = useSupportTickets(user?.id);

  const [view, setView] = useState<"list" | "form" | "chat">("list");

  useEffect(() => {
    if (user?.id) {
      fetchUserTickets();
    }
  }, [user?.id, fetchUserTickets]);

  useEffect(() => {
    if (initialTicketId) {
      fetchTicketDetails(initialTicketId).then(() => {
        setView("chat");
      });
    }
  }, [initialTicketId, fetchTicketDetails]);

  const handleSelectTicket = async (ticket: SupportTicket) => {
    await fetchTicketDetails(ticket.id);
    setView("chat");
  };

  const handleCreateTicket = async (data: any) => {
    try {
      const ticket = await createTicket(data);
      if (ticket) {
        await handleSelectTicket(ticket);
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Dynamic Header based on view */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          {view === "list" && "Meus Tickets de Suporte"}
          {view === "form" && "Novo Chamado"}
          {view === "chat" && "Conversa Suporte"}
        </h3>
        {view === "list" && (
          <Button size="sm" onClick={() => setView("form")} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Novo Ticket
          </Button>
        )}
        {view === "form" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("list")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && view === "list" && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {view === "list" && !isLoading && (
          <SupportTicketList tickets={tickets} onSelect={handleSelectTicket} />
        )}

        {view === "form" && (
          <SupportTicketForm
            onSubmit={handleCreateTicket}
            isLoading={isLoading}
          />
        )}

        {view === "chat" && currentTicket && (
          <SupportTicketChat
            ticket={currentTicket}
            onSendMessage={(msg) => sendMessage(currentTicket.id, msg)}
            onBack={() => {
              setView("list");
              fetchUserTickets();
            }}
            currentUser={{ id: user.id }}
          />
        )}
      </div>
    </div>
  );
}
