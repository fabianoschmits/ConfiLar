"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNotifications } from "@/components/notifications/NotificationProviderSimple";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type?: string;
  reply_to_id?: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type?: string;
  };
}

export interface Conversation {
  id: string;
  client_id: string;
  professional_id: string;
  ad_id?: string;
  last_message_at: string | null;
  last_message_preview?: string;
  unread_count_client?: number;
  unread_count_professional?: number;
  status?: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type?: string;
    phone?: string | null;
  };
  professional?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type?: string;
    phone?: string | null;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count?: number;
  ad?: {
    title: string;
    category: string;
  };
}


export function useMessages() {
  const { user, profile } = useAuthContext();
  const { addNotification } = useNotifications();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] =
    useState<RealtimeChannel | null>(null);

  // Carregar conversas do usuário
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          id,
          client_id,
          professional_id,
          last_message_at,
          created_at,
          updated_at,
          deleted_by_client,
          deleted_by_professional,
          deleted_at_client,
          deleted_at_professional,
          client:client_id(id, full_name, avatar_url, user_type, phone),
          professional:professional_id(id, full_name, avatar_url, user_type, phone)
        `,
        )
        .or(`client_id.eq.${user.id},professional_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false })
        .limit(20); // Limitar a 20 conversas por vez

      if (error) throw error;

      // Filtrar conversas que NÃO foram deletadas pelo usuário atual
      const activeConversations = (data || []).filter((conversation) => {
        const isClient = conversation.client_id === user.id;
        const isProfessional = conversation.professional_id === user.id;

        // Se é cliente e deletou, não mostrar
        if (isClient && conversation.deleted_by_client) return false;
        // Se é profissional e deletou, não mostrar
        if (isProfessional && conversation.deleted_by_professional)
          return false;

        return true;
      });

      // Buscar última mensagem e contador de não lidas para cada conversa
      const conversationsWithMessages = await Promise.all(
        activeConversations.map(async (conversation) => {
          // Determinar se deve filtrar mensagens antigas
          const isClient = conversation.client_id === user.id;
          const isProfessional = conversation.professional_id === user.id;
          const deletedAt = isClient
            ? conversation.deleted_at_client
            : isProfessional
              ? conversation.deleted_at_professional
              : null;

          // Última mensagem (respeitando soft delete)
          let lastMessageQuery = supabase
            .from("messages")
            .select("content, created_at, sender_id")
            .eq("conversation_id", conversation.id)
            .or("is_deleted.is.null,is_deleted.eq.false"); // Filtrar apenas mensagens não deletadas

          // Se foi deletada, buscar apenas mensagens depois da deleção
          if (deletedAt) {
            lastMessageQuery = lastMessageQuery.gt("created_at", deletedAt);
          }

          const { data: lastMessage } = await lastMessageQuery
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          // Contador de mensagens não lidas (respeitando soft delete)
          let unreadQuery = supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conversation.id)
            .eq("receiver_id", user.id)
            .eq("is_read", false);

          // Se foi deletada, contar apenas mensagens depois da deleção
          if (deletedAt) {
            unreadQuery = unreadQuery.gt("created_at", deletedAt);
          }

          const { count: unreadCount } = await unreadQuery;

          return {
            ...conversation,
            // Garantir que client e professional sejam objetos únicos, não arrays
            client: Array.isArray(conversation.client)
              ? conversation.client[0]
              : conversation.client,
            professional: Array.isArray(conversation.professional)
              ? conversation.professional[0]
              : conversation.professional,
            last_message: lastMessage,
            unread_count: unreadCount || 0,
          };
        }),
      );

      setConversations(conversationsWithMessages);
    } catch (err) {
      console.error("❌ Erro ao buscar conversas:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [user?.id, supabase]);

  // Carregar mensagens de uma conversa (otimizado)
  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Buscar informações da conversa para verificar soft delete
        const { data: conversation, error: convError } = await supabase
          .from("conversations")
          .select(
            "client_id, professional_id, deleted_at_client, deleted_at_professional",
          )
          .eq("id", conversationId)
          .maybeSingle();

        if (convError) throw convError;

        // Consulta de mensagens com campos específicos
        // Filtrar apenas mensagens não deletadas (is_deleted pode ser false ou null)
        const { data, error } = await supabase
          .from("messages")
          .select(
            `
          id,
          conversation_id,
          sender_id,
          receiver_id,
          content,
          message_type,
          reply_to_id,
          created_at,
          updated_at,
          is_read
        `,
          )
          .eq("conversation_id", conversationId)
          .or("is_deleted.is.null,is_deleted.eq.false") // Filtrar apenas mensagens não deletadas
          .order("created_at", { ascending: false }) // Buscar as mais recentes primeiro
          .limit(100); // Buscar mais mensagens para garantir que pegamos as mais recentes

        if (error) throw error;

        const newMessages = (data || []).reverse(); // Reverter para ordem cronológica (mais antiga -> mais recente)

        // SEMPRE fazer merge para preservar mensagens enviadas recentemente
        setMessages((prev) => {
          // Se não há mensagens anteriores ou é uma conversa diferente, retornar as novas
          if (
            prev.length === 0 ||
            (prev[0]?.conversation_id &&
              prev[0].conversation_id !== conversationId)
          ) {
            return newMessages;
          }

          // Se é a mesma conversa, fazer merge inteligente preservando mensagens recentes
          // Criar um mapa de IDs das mensagens novas do banco
          const newMessageIds = new Set(newMessages.map((m) => m.id));

          // Preservar mensagens recentes (últimos 60 segundos) que podem ainda não estar no banco
          // Aumentado para 60 segundos para garantir que mensagens enviadas não sejam perdidas
          const sixtySecondsAgo = new Date(Date.now() - 60000).toISOString();
          const oldMessagesToKeep = prev.filter((m) => {
            // Se a mensagem já está no banco (está nas novas), não precisa preservar
            if (newMessageIds.has(m.id)) {
              return false;
            }

            // Preservar mensagens muito recentes que podem ainda não estar no banco
            const isVeryRecent =
              new Date(m.created_at).toISOString() > sixtySecondsAgo;
            return isVeryRecent;
          });

          // Combinar mensagens antigas preservadas com as novas do banco
          // Remover duplicatas por ID (priorizando as novas do banco)
          const uniqueMap = new Map<string, Message>();

          // Primeiro adicionar mensagens antigas preservadas
          oldMessagesToKeep.forEach((msg) => {
            uniqueMap.set(msg.id, msg);
          });

          // Depois adicionar/sobrescrever com as novas do banco (que são a fonte da verdade)
          newMessages.forEach((msg) => {
            uniqueMap.set(msg.id, msg);
          });

          const unique = Array.from(uniqueMap.values());

          // Ordenar por created_at (ascendente para exibir do mais antigo ao mais recente)
          const sorted = unique.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          );

          // Pegar apenas as últimas 50 mensagens (as mais recentes) para exibição
          // Isso garante que mesmo que haja muitas mensagens, mostramos as 50 mais recentes
          const limited = sorted.slice(-50);

          return limited;
        });
      } catch (err) {
        console.error("❌ Erro ao buscar mensagens:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  // Enviar notificação de nova conversa
  const sendNewConversationNotification = useCallback(
    async (conversation: Conversation) => {
      try {
        const otherUserId =
          user?.id === conversation.client_id
            ? conversation.professional_id
            : conversation.client_id;

        const senderName = (profile as any)?.full_name || "Alguém";

        await supabase.from("notifications").insert({
          user_id: otherUserId,
          title: "Nova conversa iniciada",
          message: `${senderName} iniciou uma conversa com você.`,
          type: "message",
          priority: "normal",
          metadata: {
            conversation_id: conversation.id,
            sender_id: user?.id,
            sender_name: senderName,
          },
        });
      } catch (err) {
        console.error("❌ Erro ao enviar notificação de nova conversa:", err);
      }
    },
    [user?.id, profile],
  );



  // Enviar mensagem
  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      if (!user?.id) return false;

      try {
        setSending(true);
        setError(null);

        // Buscar conversa do banco (pode não estar na lista se foi deletada)
        const { data: conversationData, error: convError } = await supabase
          .from("conversations")
          .select(
            "id, client_id, professional_id, deleted_by_client, deleted_by_professional",
          )
          .eq("id", conversationId)
          .maybeSingle();

        if (convError) {
          console.error("❌ Erro ao buscar conversa:", convError);
          throw new Error(`Erro ao buscar conversa: ${convError.message}`);
        }

        if (!conversationData) {
          console.error("❌ Conversa não encontrada:", conversationId);
          throw new Error("Conversa não encontrada");
        }

        const conversation = conversationData;
        const isClient = conversation.client_id === user.id;
        const isProfessional = conversation.professional_id === user.id;

        // REATIVAR conversa se foi deletada pelo usuário atual
        const wasDeleted =
          (isClient && conversation.deleted_by_client) ||
          (isProfessional && conversation.deleted_by_professional);

        if (wasDeleted) {
          const reactivateData: any = {
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (isClient) {
            reactivateData.deleted_by_client = false;
            reactivateData.deleted_at_client = null;
          } else if (isProfessional) {
            reactivateData.deleted_by_professional = false;
            reactivateData.deleted_at_professional = null;
          }

          await supabase
            .from("conversations")
            .update(reactivateData)
            .eq("id", conversationId);
        }

        const receiverId =
          conversation.client_id === user.id
            ? conversation.professional_id
            : conversation.client_id;

        const { data, error } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            receiver_id: receiverId,
            content: content.trim(),
            is_read: false,
            is_deleted: false, // Garantir explicitamente que não está deletada
          })
          .select(
            `
          id,
          conversation_id,
          sender_id,
          receiver_id,
          content,
          message_type,
          reply_to_id,
          created_at,
          updated_at,
          is_read
        `,
          )
          .single();

        if (error) {
          console.error("❌ Erro ao inserir mensagem:", error);
          throw new Error(`Erro ao inserir mensagem: ${error.message}`);
        }

        // Atualizar last_message_at na conversa (se não foi atualizado ao reativar)
        if (!wasDeleted) {
          await supabase
            .from("conversations")
            .update({ last_message_at: new Date().toISOString() })
            .eq("id", conversationId);
        }

        // Adicionar mensagem ao estado local imediatamente (optimistic update)
        setMessages((prev) => {
          // Verificar se a mensagem já existe para evitar duplicação
          const exists = prev.some((m) => m.id === data.id);
          if (exists) {
            return prev;
          }
          // Ordenar mensagens por created_at após adicionar
          const updated = [...prev, data];
          return updated.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          );
        });

        // Recarregar conversas para atualizar a lista
        await loadConversations();

        // NÃO recarregar mensagens automaticamente - a mensagem já foi adicionada
        // O realtime vai sincronizar quando a mensagem for inserida no banco

        return true;
      } catch (err) {
        // Registrar tentativa falhada

        console.error("❌ Erro ao enviar mensagem:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        return false;
      } finally {
        setSending(false);
      }
    },
    [user?.id, conversations, loadMessages],
  );

  // Marcar mensagens como lidas
  const markMessagesAsRead = useCallback(
    async (conversationId: string) => {
      if (!user?.id) return;

      try {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .eq("receiver_id", user.id)
          .eq("is_read", false);

        // Recarregar conversas para atualizar contadores
        await loadConversations();
      } catch (err) {
        console.error("❌ Erro ao marcar mensagens como lidas:", err);
      }
    },
    [user?.id, loadConversations],
  );

  // Buscar acordos de contato

  // Criar ou encontrar conversa
  const createOrFindConversation = useCallback(
    async (clientId: string, professionalId: string, adId?: string) => {
      if (!user?.id) return null;

      try {
        // Verificar se já existe conversa (incluindo campos de soft delete)
        const { data: existingConversation } = await supabase
          .from("conversations")
          .select(
            "id, deleted_by_client, deleted_by_professional, client_id, professional_id, deleted_at_client, deleted_at_professional",
          )
          .or(
            `and(client_id.eq.${clientId},professional_id.eq.${professionalId}),and(client_id.eq.${professionalId},professional_id.eq.${clientId})`,
          )
          .maybeSingle();

        if (existingConversation) {
          const isClient = existingConversation.client_id === user.id;
          const isProfessional =
            existingConversation.professional_id === user.id;
          const wasDeleted =
            (isClient && existingConversation.deleted_by_client) ||
            (isProfessional && existingConversation.deleted_by_professional);

          // Se foi deletada pelo usuário atual, REATIVAR para que apareça na lista
          if (wasDeleted) {
            const reactivateData: any = {
              updated_at: new Date().toISOString(),
              last_message_at: new Date().toISOString(),
            };

            if (isClient) {
              reactivateData.deleted_by_client = false;
              reactivateData.deleted_at_client = null;
            } else if (isProfessional) {
              reactivateData.deleted_by_professional = false;
              reactivateData.deleted_at_professional = null;
            }

            const { error: updateError } = await supabase
              .from("conversations")
              .update(reactivateData)
              .eq("id", existingConversation.id);

            if (updateError) {
              console.error("❌ Erro ao reativar conversa:", updateError);
            } else {
              // Recarregar conversas para atualizar a lista
              await loadConversations();
            }
          }

          return existingConversation.id;
        }

        // Criar nova conversa
        const { data, error } = await supabase
          .from("conversations")
          .insert({
            client_id: clientId,
            professional_id: professionalId,
            ad_id: adId,
            deleted_by_client: false,
            deleted_by_professional: false,
          })
          .select()
          .single();

        if (error) throw error;

        // Recarregar conversas para incluir a nova
        await loadConversations();

        return data.id;
      } catch (err) {
        console.error("❌ Erro ao criar/encontrar conversa:", err);
        return null;
      }
    },
    [user?.id, loadConversations],
  );

  // Deletar conversa (soft delete - remove apenas para o usuário atual)
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (!user?.id) {
        console.error("❌ Erro: Usuário não autenticado");
        setError("Você precisa estar logado para deletar conversas");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        // Verificar se o usuário tem permissão para deletar a conversa
        const { data: conversation, error: fetchError } = await supabase
          .from("conversations")
          .select(
            "client_id, professional_id, deleted_by_client, deleted_by_professional",
          )
          .eq("id", conversationId)
          .maybeSingle();

        if (fetchError) {
          console.error("❌ Erro ao buscar conversa:", fetchError);
          throw new Error(`Erro ao buscar conversa: ${fetchError.message}`);
        }

        if (!conversation) {
          console.error("❌ Conversa não encontrada:", conversationId);
          throw new Error("Conversa não encontrada");
        }

        // Verificar se o usuário é participante da conversa
        const isClient = conversation.client_id === user.id;
        const isProfessional = conversation.professional_id === user.id;

        if (!isClient && !isProfessional) {
          console.error("❌ Usuário não tem permissão:", {
            userId: user.id,
            conversation,
          });
          throw new Error("Você não tem permissão para deletar esta conversa");
        }

        // Marcar como deletada apenas para o usuário atual (soft delete)
        const deletedAt = new Date().toISOString();
        const updateData: any = {
          updated_at: deletedAt,
        };

        if (isClient) {
          updateData.deleted_by_client = true;
          updateData.deleted_at_client = deletedAt;
        } else if (isProfessional) {
          updateData.deleted_by_professional = true;
          updateData.deleted_at_professional = deletedAt;
        }

        const { error: updateError } = await supabase
          .from("conversations")
          .update(updateData)
          .eq("id", conversationId);

        if (updateError) {
          console.error("❌ Erro ao atualizar conversa:", updateError);
          throw new Error(`Erro ao remover conversa: ${updateError.message}`);
        }

        // Verificar se ambos os usuários deletaram - nesse caso, deletar completamente
        const bothDeleted =
          (isClient && conversation.deleted_by_professional) ||
          (isProfessional && conversation.deleted_by_client);

        if (bothDeleted) {
          // Deletar mensagens
          await supabase
            .from("messages")
            .delete()
            .eq("conversation_id", conversationId);


          // Deletar conversa
          await supabase
            .from("conversations")
            .delete()
            .eq("id", conversationId);
        }

        // Recarregar lista de conversas
        await loadConversations();

        return true;
      } catch (err) {
        console.error("❌ Erro ao deletar conversa:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erro desconhecido ao deletar conversa";
        setError(errorMessage);

        return false;
      } finally {
        setLoading(false);
      }
    },
    [user?.id, loadConversations],
  );

  // Deletar mensagem
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!user?.id) return false;

      try {
        setLoading(true);
        setError(null);

        // Verificar se a mensagem existe e se o usuário é o remetente
        const { data: message, error: messageError } = await supabase
          .from("messages")
          .select("id, sender_id, conversation_id")
          .eq("id", messageId)
          .maybeSingle();

        if (messageError) throw messageError;

        if (!message) {
          throw new Error("Mensagem não encontrada");
        }

        // Verificar se o usuário é o remetente da mensagem
        if (message.sender_id !== user.id) {
          throw new Error("Você só pode deletar suas próprias mensagens");
        }

        // Deletar a mensagem
        const { error: deleteError } = await supabase
          .from("messages")
          .delete()
          .eq("id", messageId);

        if (deleteError) throw deleteError;

        // Recarregar mensagens da conversa
        await loadMessages(message.conversation_id);

        return true;
      } catch (err) {
        console.error("❌ Erro ao deletar mensagem:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user?.id, loadMessages],
  );

  // Editar mensagem
  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!user?.id) return false;

      try {
        setLoading(true);
        setError(null);

        // Verificar se a mensagem existe e se o usuário é o remetente
        const { data: message, error: messageError } = await supabase
          .from("messages")
          .select("id, sender_id, conversation_id, content")
          .eq("id", messageId)
          .maybeSingle();

        if (messageError) throw messageError;

        if (!message) {
          throw new Error("Mensagem não encontrada");
        }

        // Verificar se o usuário é o remetente da mensagem
        if (message.sender_id !== user.id) {
          throw new Error("Você só pode editar suas próprias mensagens");
        }

        // Validar novo conteúdo
        if (!newContent || newContent.trim().length === 0) {
          throw new Error("O conteúdo da mensagem não pode estar vazio");
        }

        if (newContent.length > 1000) {
          throw new Error("A mensagem não pode ter mais de 1000 caracteres");
        }

        // Atualizar a mensagem
        const { error: updateError } = await supabase
          .from("messages")
          .update({
            content: newContent.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", messageId);

        if (updateError) throw updateError;

        // Recarregar mensagens para mostrar a atualização
        await loadMessages(message.conversation_id);

        return true;
      } catch (err) {
        console.error("❌ Erro ao editar mensagem:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user?.id, loadMessages],
  );

  // Carregar dados iniciais (SEM REALTIME TEMPORARIAMENTE)
  useEffect(() => {
    if (!user?.id) return;

    // Carregar dados iniciais apenas uma vez
    loadConversations();

    // Verificar mensagens não lidas periodicamente
    const checkUnreadMessages = async () => {
      try {
        // Verificar se a tabela messages existe primeiro
        const { data: testData, error: testError } = await supabase
          .from("messages")
          .select("id")
          .limit(1);

        if (testError) {
          return;
        }

        const { data: unreadMessages, error } = await supabase
          .from("messages")
          .select(
            `
            id,
            conversation_id,
            sender_id,
            receiver_id,
            content,
            created_at
          `,
          )
          .eq("receiver_id", user.id)
          .eq("is_read", false)
          .neq("sender_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          return;
        }
      } catch (error) {
        // Erro ao verificar mensagens não lidas - silencioso
      }
    };

    // Configurar realtime para mensagens
    const setupRealtime = () => {
      if (!user?.id) return;

      const channel = supabase
        .channel("messages-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("💬 Nova mensagem recebida via realtime:", payload.new);
            const newMessage = payload.new as Message;

            // Verificar se a mensagem não foi deletada
            if ((newMessage as any).is_deleted === true) {
              console.log("⏭️ Mensagem deletada, ignorando:", newMessage.id);
              return;
            }

            // Adicionar mensagem ao estado local se for da conversa atual
            setMessages((prev) => {
              // Verificar se a mensagem já existe para evitar duplicação
              const exists = prev.some((m) => m.id === newMessage.id);
              if (exists) {
                console.log(
                  "⏭️ Mensagem já existe no estado (realtime sender), ignorando:",
                  newMessage.id,
                );
                return prev;
              }

              // Se não há mensagens no estado, adicionar diretamente
              if (prev.length === 0) {
                console.log(
                  "📥 Adicionando primeira mensagem via realtime (sender):",
                  newMessage.id,
                  "conversation:",
                  newMessage.conversation_id,
                );
                return [newMessage];
              }

              // Adicionar apenas se for da mesma conversa que está sendo visualizada
              const currentConversationId = prev[0]?.conversation_id;
              if (currentConversationId === newMessage.conversation_id) {
                console.log(
                  "📥 Adicionando mensagem via realtime (sender):",
                  newMessage.id,
                  "conversation:",
                  newMessage.conversation_id,
                );
                // Ordenar mensagens por created_at após adicionar
                const updated = [...prev, newMessage];
                return updated.sort(
                  (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime(),
                );
              } else {
                console.log(
                  "⏭️ Mensagem de conversa diferente (realtime sender), ignorando:",
                  newMessage.id,
                  "current:",
                  currentConversationId,
                  "new:",
                  newMessage.conversation_id,
                );
              }
              return prev;
            });

            // Recarregar conversas para atualizar contadores
            loadConversations();
          },
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `sender_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("💬 Nova mensagem enviada via realtime:", payload.new);
            const newMessage = payload.new as Message;

            // Verificar se a mensagem não foi deletada
            if ((newMessage as any).is_deleted === true) {
              console.log("⏭️ Mensagem deletada, ignorando:", newMessage.id);
              return;
            }

            // Adicionar mensagem ao estado local se for da conversa atual
            setMessages((prev) => {
              // Verificar se a mensagem já existe para evitar duplicação
              const exists = prev.some((m) => m.id === newMessage.id);
              if (exists) {
                return prev;
              }
              // Adicionar apenas se for da mesma conversa que está sendo visualizada
              const currentConversationId =
                prev.length > 0 ? prev[0]?.conversation_id : null;
              if (currentConversationId === newMessage.conversation_id) {
                // Ordenar mensagens por created_at após adicionar
                const updated = [...prev, newMessage];
                return updated.sort(
                  (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime(),
                );
              }
              return prev;
            });
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("💬 Mensagem atualizada via realtime:", payload.new);
            // Recarregar conversas para atualizar contadores
            loadConversations();
          },
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "conversations",
            filter: `client_id=eq.${user.id},professional_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("💬 Nova conversa criada via realtime:", payload.new);
            // Recarregar conversas para mostrar nova conversa
            loadConversations();
          },
        )
        .subscribe();

      setRealtimeChannel(channel);
    };

    // Configurar realtime
    setupRealtime();

    // Verificar imediatamente
    checkUnreadMessages();

    // Verificar a cada 5 minutos (reduzido de 30 segundos)
    const interval = setInterval(checkUnreadMessages, 5 * 60 * 1000);

    // Cleanup
    return () => {
      clearInterval(interval);
      if (realtimeChannel) {
        realtimeChannel.unsubscribe();
        setRealtimeChannel(null);
      }
    };
  }, [user?.id, loadConversations]);

  // Calcular total de mensagens não lidas
  const getTotalUnreadCount = useCallback(() => {
    return conversations.reduce((total, conversation) => {
      if (conversation.unread_count) {
        return total + conversation.unread_count;
      }
      return total;
    }, 0);
  }, [conversations]);

  return {
    conversations,
    messages,
    loading,
    sending,
    error,
    loadConversations,
    loadMessages,
    sendMessage,
    markMessagesAsRead,
    createConversation: createOrFindConversation,
    createOrFindConversation,
    deleteConversation,
    deleteMessage,
    editMessage,
    getTotalUnreadCount,
    sendNewConversationNotification,
  };
}
