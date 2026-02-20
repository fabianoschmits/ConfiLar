import { useState, useCallback, useEffect } from "react";
import { supportService } from "../services/supportService";
import type {
  SupportTicket,
  SupportTicketMessage,
  CreateTicketDTO,
} from "../types";
import { supabase } from "@/lib/supabase";

export function useSupportTickets(userId?: string) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<SupportTicket | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserTickets = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await supportService.getUserTickets(userId);
      setTickets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchTicketDetails = useCallback(async (ticketId: string) => {
    setIsLoading(true);
    try {
      const data = await supportService.getTicketById(ticketId);
      setCurrentTicket(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTicket = useCallback(
    async (data: CreateTicketDTO) => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const ticket = await supportService.createTicket(userId, data);
        await fetchUserTickets();
        return ticket;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, fetchUserTickets],
  );

  const sendMessage = useCallback(
    async (ticketId: string, message: string) => {
      if (!userId) return;
      try {
        const newMessage = await supportService.sendMessage(
          ticketId,
          userId,
          "user",
          message,
        );
        if (currentTicket && currentTicket.id === ticketId) {
          setCurrentTicket((prev) =>
            prev
              ? {
                  ...prev,
                  messages: [...(prev.messages || []), newMessage],
                }
              : null,
          );
        }
        return newMessage;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [userId, currentTicket],
  );

  // Realtime subscription for messages
  useEffect(() => {
    if (!currentTicket?.id) return;

    const channel = supabase
      .channel(`ticket_messages_${currentTicket.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_ticket_messages",
          filter: `ticket_id=eq.${currentTicket.id}`,
        },
        (payload) => {
          const newMessage = payload.new as SupportTicketMessage;
          // Only add if not from current user (to avoid duplicates if manual update already happened)
          // But for safety with multiple devices, deduplicate by ID
          setCurrentTicket((prev) => {
            if (!prev) return null;
            if (prev.messages?.some((m) => m.id === newMessage.id)) return prev;
            return {
              ...prev,
              messages: [...(prev.messages || []), newMessage],
            };
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTicket?.id]);

  return {
    tickets,
    currentTicket,
    isLoading,
    error,
    fetchUserTickets,
    fetchTicketDetails,
    createTicket,
    sendMessage,
  };
}
