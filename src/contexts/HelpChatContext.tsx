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
  isAdmin: boolean;
  adminTickets: any[];
  selectTicket: (conversationId: string) => void;
  fetchAdminTickets: () => Promise<void>;
  activeTicketStatus: string | null;
  updateTicketStatus: (status: string) => Promise<void>;
  activeTicketUserId: string | null;
  deleteTicketForAdmin: (ticketId: string) => Promise<void>;
  userTickets: any[];
  fetchUserTickets: () => Promise<void>;
  selectUserTicket: (
    ticketId: string,
    conversationId: string,
    ticketStatus: string,
  ) => Promise<void>;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTickets, setAdminTickets] = useState<any[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeTicketStatus, setActiveTicketStatus] = useState<string | null>(
    null,
  );
  const [activeTicketUserId, setActiveTicketUserId] = useState<string | null>(
    null,
  );
  const [showHistory, setShowHistory] = useState(false);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  // Verificar se o usuário é admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        setIsAdminLoading(false);
        return;
      }
      setIsAdminLoading(true);
      try {
        const { data } = await supabase
          .from("admins")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .maybeSingle();
        setIsAdmin(!!data);
      } catch (err) {
        console.error("Error checking admin status:", err);
      } finally {
        setIsAdminLoading(false);
      }
    };
    checkAdmin();
  }, [user?.id]);

  const fetchUserTickets = useCallback(async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from("support_tickets")
      .select("*, messages(content, created_at)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1, { foreignTable: "messages" }); // Otimização: Pegar apenas a última mensagem para o histórico

    if (data) {
      setUserTickets(data);
    }
  }, [user?.id]);

  // Verificar se o usuário já tem um ticket ativo para persistência
  useEffect(() => {
    const checkActiveTicket = async () => {
      if (!user?.id || isAdminLoading || isAdmin) return;

      const { data: activeTicket } = await supabase
        .from("support_tickets")
        .select("id, conversation_id, status")
        .eq("user_id", user.id)
        .in("status", ["open", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeTicket) {
        setConversationId(activeTicket.conversation_id);
        setActiveTicketId(activeTicket.id);
        setActiveTicketStatus(activeTicket.status);
        setIsSupportMode(true);

        // Carregar mensagens
        const { data: messages } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", activeTicket.conversation_id)
          .order("created_at", { ascending: true });

        if (messages) {
          const formattedMessages: HelpMessage[] = messages.map((m) => ({
            id: m.id,
            type:
              m.sender_id === user.id
                ? "user"
                : m.sender_id === "BOT"
                  ? "bot"
                  : "admin",
            content: m.content,
            timestamp: new Date(m.created_at),
          }));
          setState((prev) => ({ ...prev, messages: formattedMessages }));
        }
      }

      // Carregar histórico de tickets do usuário
      fetchUserTickets();
    };

    checkActiveTicket();
  }, [user?.id, isAdmin, isAdminLoading, fetchUserTickets]);

  // Buscar tickets se for admin
  const fetchAdminTickets = useCallback(async () => {
    if (!isAdmin) {
      console.log("🎫 fetchAdminTickets: Usuário não é admin, ignorando.");
      return;
    }

    console.log("🎫 fetchAdminTickets: Iniciando busca de tickets...");
    try {
      const { data: tickets, error: ticketError } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("deleted_by_admin", false)
        .order("updated_at", { ascending: false });

      if (ticketError) throw ticketError;

      if (!tickets || tickets.length === 0) {
        console.log("🎫 fetchAdminTickets: Nenhum ticket encontrado.");
        setAdminTickets([]);
        return;
      }

      console.log(
        `🎫 fetchAdminTickets: ${tickets.length} tickets encontrados.`,
      );

      // Buscar perfis e últimas mensagens separadamente para evitar erro 400 de join complexo
      const ticketsWithData = await Promise.all(
        tickets.map(async (ticket) => {
          // Buscar perfil do usuário
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", ticket.user_id)
            .maybeSingle();

          // Buscar última mensagem
          const { data: msgData } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", ticket.conversation_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...ticket,
            user: userData,
            last_message: msgData,
          };
        }),
      );

      console.log(
        "🎫 fetchAdminTickets: Dados dos tickets carregados com sucesso.",
      );
      setAdminTickets(ticketsWithData);
    } catch (error) {
      console.error("❌ fetchAdminTickets: Erro ao buscar tickets:", error);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && state.isOpen) {
      fetchAdminTickets();
    }
  }, [isAdmin, state.isOpen, fetchAdminTickets]);

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

  // Monitorar mensagens em tempo real se houver uma conversa de suporte ativa
  useEffect(() => {
    if (!conversationId) return;

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
            setState((prev) => {
              // Deduplicação: evitar adicionar mensagem se já existir no estado
              if (prev.messages.some((m) => m.id === newMessage.id)) {
                return prev;
              }

              const helpMessage: HelpMessage = {
                id: newMessage.id,
                type: newMessage.sender_id === "BOT" ? "bot" : "admin",
                content: newMessage.content,
                timestamp: new Date(newMessage.created_at),
              };
              return {
                ...prev,
                messages: [...prev.messages, helpMessage],
              };
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id]);

  // Monitorar mudança de status do ticket em tempo real (para o usuário ver atualização ao vivo)
  useEffect(() => {
    if (!activeTicketId || isAdmin) return;

    const ticketChannel = supabase
      .channel(`ticket_status_${activeTicketId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_tickets",
          filter: `id=eq.${activeTicketId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.status) {
            setActiveTicketStatus(updated.status);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketChannel);
    };
  }, [activeTicketId, isAdmin]);

  const startSupportTicket = useCallback(async () => {
    if (!user) return;

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const ADMIN_ID = "f7444305-a3bd-4d71-874a-bb95fd27f96a";

      // 1. Verificar ticket aberto
      const { data: existingTicket } = await supabase
        .from("support_tickets")
        .select("id, conversation_id, status")
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

        // 4. Notificar admin sobre novo chamado
        await supabase.from("notifications").insert({
          user_id: ADMIN_ID,
          title: "Novo chamado de suporte",
          message: `${user.email || "Um usuário"} abriu um novo chamado.`,
          type: "support",
          action_url: `/?open=help&conversation_id=${currentConversationId}`,
          category: "admin",
        });
      } else {
        setActiveTicketId(existingTicket.id);
        setActiveTicketStatus(existingTicket.status);
      }

      setConversationId(currentConversationId);
      setIsSupportMode(true);
      if (!existingTicket) {
        setActiveTicketStatus("open");
      }

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
        // Se for uma conversa nova, dar as boas vindas
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

          if (isAdmin) {
            // === ADMIN RESPONDENDO ===
            // Buscar o user_id do ticket para saber para quem enviar
            const { data: ticketData } = await supabase
              .from("support_tickets")
              .select("user_id")
              .eq("conversation_id", conversationId)
              .maybeSingle();

            const targetUserId = ticketData?.user_id;
            if (!targetUserId) return;

            await supabase.from("messages").insert({
              conversation_id: conversationId,
              sender_id: user.id,
              receiver_id: targetUserId,
              content,
              type: "admin", // Tipo admin para mensagens de moderadores
            });

            // Notificar o usuário que recebeu resposta do suporte
            await supabase.from("notifications").insert({
              user_id: targetUserId,
              title: "Suporte ConfiLar respondeu",
              message:
                content.length > 80
                  ? content.substring(0, 80) + "..."
                  : content,
              type: "support",
              action_url: `/?open=help&conversation_id=${conversationId}`,
              category: "support",
            });
          } else {
            // === USUÁRIO ENVIANDO PARA SUPORTE ===
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
              type: "support",
              action_url: `/?open=help&conversation_id=${conversationId}`,
              category: "admin",
            });
          }
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
    setActiveTicketStatus(null);
    setActiveTicketUserId(null);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const selectTicket = useCallback(
    async (convId: string) => {
      setConversationId(convId);
      setIsSupportMode(true);
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        // Validação de Ownership (Segurança)
        const { data: ticket, error: ticketError } = await supabase
          .from("support_tickets")
          .select("id, status, user_id")
          .eq("conversation_id", convId)
          .maybeSingle();

        if (ticketError || !ticket) {
          console.error("Ticket not found or access denied");
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        // Se não for admin, validar que o ticket pertence ao usuário logado
        if (!isAdmin && ticket.user_id !== user?.id) {
          console.error(
            "🔒 Security Block: Unauthorized ticket access attempt",
          );
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        setActiveTicketId(ticket.id);
        setActiveTicketStatus(ticket.status);
        setActiveTicketUserId(ticket.user_id);

        const { data: oldMessages } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true });

        if (oldMessages) {
          const formattedMessages: HelpMessage[] = oldMessages.map((m) => ({
            id: m.id,
            type:
              m.sender_id === user?.id
                ? "user"
                : m.type === "system"
                  ? "system"
                  : m.sender_id === "BOT"
                    ? "bot"
                    : "admin",
            content: m.content,
            timestamp: new Date(m.created_at),
          }));
          setState((prev) => ({
            ...prev,
            messages: formattedMessages,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("Error selecting ticket:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [user?.id],
  );

  const updateTicketStatus = useCallback(
    async (status: string) => {
      if (!activeTicketId) return;

      try {
        await supabase
          .from("support_tickets")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", activeTicketId);

        setActiveTicketStatus(status);

        // Atualizar o ticket na lista do inbox também
        setAdminTickets((prev) =>
          prev.map((t) => (t.id === activeTicketId ? { ...t, status } : t)),
        );

        // Registrar mensagem de sistema na conversa (sem notificação push)
        if (activeTicketUserId && conversationId) {
          const statusMessages: Record<string, string> = {
            in_progress: "Seu chamado está sendo analisado pelo suporte. 🔍",
            resolved:
              "Seu chamado foi marcado como resolvido. Se precisar de mais ajuda, você pode abrir um novo chamado! ✅",
            closed: "Seu chamado foi encerrado pelo suporte.",
          };
          const msg = statusMessages[status];
          if (msg) {
            await supabase.from("messages").insert({
              conversation_id: conversationId,
              sender_id: user?.id,
              receiver_id: activeTicketUserId,
              content: msg,
              type: "system", // Marcar como mensagem de sistema
            });

            // Notificar o usuário sobre a mudança de status via notificação push tbm
            await supabase.from("notifications").insert({
              user_id: activeTicketUserId,
              title: "Atualização do seu chamado",
              message: msg,
              type: "support",
              action_url: `/?open=help&conversation_id=${conversationId}`,
              category: "support",
            });
          }
        }
      } catch (error) {
        console.error("Error updating ticket status:", error);
      }
    },
    [activeTicketId, activeTicketUserId, conversationId, user?.id],
  );

  const deleteTicketForAdmin = useCallback(
    async (ticketId: string) => {
      try {
        const { error } = await supabase
          .from("support_tickets")
          .update({ deleted_by_admin: true })
          .eq("id", ticketId);

        if (error) throw error;

        // Remover da lista local
        setAdminTickets((prev) => prev.filter((t) => t.id !== ticketId));

        // Se o ticket deletado for o ativo, limpar a seleção
        if (activeTicketId === ticketId) {
          clearHistory();
        }
      } catch (error) {
        console.error("Error deleting ticket for admin:", error);
      }
    },
    [activeTicketId, clearHistory],
  );

  useEffect(() => {
    // Verificar se deve abrir o chat automaticamente (parametro de URL para deep-linking de notificações)
    const checkDeepLink = async () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlConvId = params.get("conversation_id");

        const openParam = params.get("open");
        if (openParam === "help") {
          openChat();

          if (user?.id) {
            if (urlConvId) {
              // Se houver conversation_id direto, carregar ela
              selectTicket(urlConvId);
            } else {
              // Comportamento para o usuário final: procurar ticket aberto
              const { data: checkSupport } = await supabase
                .from("support_tickets")
                .select("id, conversation_id, user_id")
                .eq("user_id", user.id)
                .eq("status", "open")
                .maybeSingle();

              if (checkSupport) {
                // Validar ownership antes de selecionar via deep link automático
                if (!isAdmin && checkSupport.user_id !== user?.id) return;
                selectTicket(checkSupport.conversation_id);
              }
            }
          }
        }
      }
    };

    checkDeepLink();
  }, [openChat, selectTicket, user?.id]);

  const selectUserTicket = useCallback(
    async (ticketId: string, conversationId: string, ticketStatus: string) => {
      setConversationId(conversationId);
      setIsSupportMode(true);
      setActiveTicketId(ticketId);
      setActiveTicketStatus(ticketStatus);

      // Carregar mensagens
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messages) {
        const formattedMessages: HelpMessage[] = messages.map((m) => ({
          id: m.id,
          type:
            m.sender_id === user?.id
              ? "user"
              : m.type === "system"
                ? "system"
                : m.sender_id === "BOT"
                  ? "bot"
                  : "admin",
          content: m.content,
          timestamp: new Date(m.created_at),
        }));
        setState((prev) => ({ ...prev, messages: formattedMessages }));
      }
    },
    [supabase, user?.id],
  );

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
    isAdmin,
    adminTickets,
    selectTicket,
    fetchAdminTickets,
    activeTicketStatus,
    updateTicketStatus,
    activeTicketUserId,
    deleteTicketForAdmin,
    userTickets,
    fetchUserTickets,
    selectUserTicket,
    showHistory,
    setShowHistory,
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
