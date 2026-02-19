/**
 * Help Chat Context - State management for help chat
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { HelpMessage, HelpChatState } from "@/types/help";

interface HelpChatContextType extends HelpChatState {
  openChat: () => void;
  closeChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  addBotMessage: (content: string, article?: any) => void;
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;
  startSupportTicket: () => Promise<void>;
  isSupportMode: boolean;
}

const HelpChatContext = createContext<HelpChatContextType | undefined>(
  undefined,
);

export function HelpChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const [state, setState] = useState<HelpChatState>({
    isOpen: false,
    isMinimized: false,
    messages: [],
    isLoading: false,
  });
  const [isSupportMode, setIsSupportMode] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const openChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true, isMinimized: false }));
  }, []);

  const closeChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const minimizeChat = useCallback(() => {
    setState((prev) => ({ ...prev, isMinimized: true }));
  }, []);

  const maximizeChat = useCallback(() => {
    setState((prev) => ({ ...prev, isMinimized: false }));
  }, []);

  const addBotMessage = useCallback((content: string, article?: any) => {
    const newMessage: HelpMessage = {
      id: Date.now().toString(),
      type: "bot",
      content,
      timestamp: new Date(),
      article,
    };
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  }, []);

  // Monitorar mensagens em tempo real se estiver em modo suporte
  useEffect(() => {
    if (!conversationId || !isSupportMode) return;

    const channel = supabase
      .channel(`support_messages_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          if (newMessage.sender_id !== user?.id) {
            const helpMessage: HelpMessage = {
              id: newMessage.id,
              type: "bot", // Admin aparece como bot no chat de ajuda simplificado
              content: newMessage.content,
              timestamp: new Date(newMessage.created_at),
            };
            setState((prev) => ({
              ...prev,
              messages: [...prev.messages, helpMessage],
            }));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, isSupportMode, user?.id]);

  const startSupportTicket = useCallback(async () => {
    if (!user) return;

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const ADMIN_ID = "f7444305-a3bd-4d71-874a-bb95fd27f96a";

      // 1. Verificar ticket aberto
      const { data: existingTicket } = await supabase
        .from("support_tickets")
        .select("id, conversation_id")
        .eq("user_id", user.id)
        .eq("status", "open")
        .maybeSingle();

      let currentConversationId = existingTicket?.conversation_id;

      if (!existingTicket) {
        // 2. Criar conversa se não existir
        const { data: convData } = await supabase
          .from("conversations")
          .insert({
            client_id: user.id,
            professional_id: ADMIN_ID,
            status: "active",
          })
          .select()
          .single();

        currentConversationId = convData.id;

        // 3. Criar ticket
        const { data: ticketData } = await supabase
          .from("support_tickets")
          .insert({
            user_id: user.id,
            conversation_id: currentConversationId,
            subject: "Suporte via Central de Ajuda",
          })
          .select()
          .single();

        setActiveTicketId(ticketData.id);
      } else {
        setActiveTicketId(existingTicket.id);
      }

      setConversationId(currentConversationId);
      setIsSupportMode(true);

      // Carregar mensagens anteriores se houver
      const { data: oldMessages } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", currentConversationId)
        .order("created_at", { ascending: true });

      if (oldMessages && oldMessages.length > 0) {
        const formattedMessages: HelpMessage[] = oldMessages.map((m) => ({
          id: m.id,
          type: m.sender_id === user.id ? "user" : "bot",
          content: m.content,
          timestamp: new Date(m.created_at),
        }));
        setState((prev) => ({ ...prev, messages: formattedMessages }));
      } else {
        // Se for uma conversa nova, dar as boas vindas sem o disclaimer ainda
        addBotMessage(
          "Olá! Você agora está conectado com nosso suporte. Como posso te ajudar hoje?",
        );
      }
    } catch (error) {
      console.error("Error starting support ticket:", error);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [user, addBotMessage]);

  const sendMessage = useCallback(
    async (content: string) => {
      // Add user message localmente
      const userMessage: HelpMessage = {
        id: Date.now().toString(),
        type: "user",
        content,
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: !isSupportMode, // Loading apenas para bot
      }));

      if (isSupportMode && conversationId && user) {
        try {
          const ADMIN_ID = "f7444305-a3bd-4d71-874a-bb95fd27f96a";

          // Verificar se esta é a primeira mensagem do usuário nesta sessão de suporte
          // para enviar a mensagem automática sobre o prazo
          const userMessageCount = state.messages.filter(
            (m) => m.type === "user",
          ).length;

          await supabase.from("messages").insert({
            conversation_id: conversationId,
            sender_id: user.id,
            receiver_id: ADMIN_ID,
            content,
          });

          // Se for a primeira mensagem, enviar a resposta automática do sistema
          if (userMessageCount === 0) {
            setTimeout(() => {
              addBotMessage(
                "Entendido. Um moderador foi notificado e analisará sua solicitação o quanto antes. 😊\n\n*Nota: O moderador pode levar algumas horas para responder, com um prazo máximo de 48 horas.*",
              );
            }, 1000);
          }

          // Notificar admin via notificação do sistema
          await supabase.from("notifications").insert({
            user_id: ADMIN_ID,
            title: "Nova mensagem de suporte",
            message: `${user.email || "Um usuário"} enviou uma mensagem no ticket.`,
            type: "chat",
            action_url: `/chat?id=${conversationId}`,
            category: "admin",
          });
        } catch (error) {
          console.error("Error sending support message:", error);
        }
        return;
      }

      try {
        // Search for help article (Modo Bot)
        const response = await fetch("/api/help/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: content }),
        });

        const data = await response.json();

        // Tempo de espera baseado no tamanho da resposta (mínimo 1s, máximo 3s)
        const messageLength =
          data.success && data.result ? data.result.article.answer.length : 100;
        const delay = Math.min(Math.max(messageLength * 10, 1000), 3000);

        setTimeout(() => {
          if (data.success && data.result) {
            // Add bot response with article
            addBotMessage(data.result.article.answer, data.result.article);
          } else {
            // Add fallback message
            addBotMessage(
              "Não encontrei uma solução exata para isso 😕\n\nVocê pode falar com um moderador clicando na opção de suporte!",
            );
          }
          setState((prev) => ({ ...prev, isLoading: false }));
        }, delay);
      } catch (error) {
        console.error("Error sending message:", error);
        addBotMessage(
          "Desculpe, ocorreu um erro. Por favor, tente novamente ou fale com um moderador.",
        );
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [addBotMessage, isSupportMode, conversationId, user],
  );

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, messages: [] }));
    setIsSupportMode(false);
    setConversationId(null);
    setActiveTicketId(null);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  useEffect(() => {
    // Verificar se deve abrir o chat automaticamente (parametro de URL para deep-linking de notificações)
    const checkDeepLink = async () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("open") === "chat") {
          openChat();

          if (user?.id) {
            const { data: checkSupport } = await supabase
              .from("support_tickets")
              .select("id")
              .eq("user_id", user.id)
              .eq("status", "open")
              .maybeSingle();

            if (checkSupport) {
              startSupportTicket();
            }
          }
        }
      }
    };

    checkDeepLink();
  }, [openChat, startSupportTicket, user?.id]);

  const value: HelpChatContextType = {
    ...state,
    openChat,
    closeChat,
    minimizeChat,
    maximizeChat,
    sendMessage,
    addBotMessage,
    clearHistory,
    setLoading,
    startSupportTicket,
    isSupportMode,
  };

  return (
    <HelpChatContext.Provider value={value}>
      {children}
    </HelpChatContext.Provider>
  );
}

export function useHelpChat() {
  const context = useContext(HelpChatContext);
  if (!context) {
    throw new Error("useHelpChat must be used within HelpChatProvider");
  }
  return context;
}
