"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface FloatingChatContextType {
  isOpen: boolean;
  selectedConversationId?: string;
  targetUserId?: string;
  targetUserName?: string;
  openChat: (userIdOrConversationId?: string, userName?: string) => void;
  closeChat: () => void;
  selectConversation: (conversationId?: string) => void;
}

const FloatingChatContext = createContext<FloatingChatContextType | undefined>(
  undefined,
);

export function FloatingChatProviderSimple({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >();
  const [targetUserId, setTargetUserId] = useState<string | undefined>();
  const [targetUserName, setTargetUserName] = useState<string | undefined>();

  // Função para criar ou encontrar conversa
  const createOrFindConversation = useCallback(
    async (clientId: string, professionalId: string) => {
      if (!user?.id) {
        console.error("❌ Usuário não autenticado");
        return null;
      }

      try {
        console.log(
          "🔍 Verificando se já existe conversa entre:",
          clientId,
          "e",
          professionalId,
        );
        console.log("🔍 Usuário atual:", user.id);

        // Verificar se já existe conversa (incluindo campos de soft delete)
        const { data: existingConversation, error: checkError } = await supabase
          .from("conversations")
          .select(
            "id, deleted_by_client, deleted_by_professional, client_id, professional_id",
          )
          .or(
            `and(client_id.eq.${clientId},professional_id.eq.${professionalId}),and(client_id.eq.${professionalId},professional_id.eq.${clientId})`,
          )
          .maybeSingle();

        if (checkError) {
          console.error("❌ Erro ao verificar conversa existente:", checkError);
          console.error("❌ Detalhes do erro:", {
            message: checkError.message,
            details: checkError.details,
            hint: checkError.hint,
            code: checkError.code,
          });
          throw checkError;
        }

        if (existingConversation) {
          console.log(
            "✅ Conversa existente encontrada:",
            existingConversation.id,
          );

          // Verificar se foi deletada pelo usuário atual
          const isClient = existingConversation.client_id === user.id;
          const isProfessional =
            existingConversation.professional_id === user.id;
          const wasDeleted =
            (isClient && existingConversation.deleted_by_client) ||
            (isProfessional && existingConversation.deleted_by_professional);

          // Se foi deletada, REATIVAR
          if (wasDeleted) {
            console.log("🔄 Conversa foi deletada, reativando...");

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
              console.log("✅ Conversa reativada com sucesso!");
            }
          }

          return existingConversation.id;
        }

        console.log(
          "🆕 Criando nova conversa entre:",
          clientId,
          "e",
          professionalId,
        );
        console.log("🆕 Dados da inserção:", {
          client_id: clientId,
          professional_id: professionalId,
        });

        // Criar nova conversa
        const { data, error } = await supabase
          .from("conversations")
          .insert({
            client_id: clientId,
            professional_id: professionalId,
            deleted_by_client: false,
            deleted_by_professional: false,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error("❌ Erro ao criar conversa:", error);
          console.error("❌ Detalhes do erro:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw error;
        }

        console.log("✅ Nova conversa criada:", data.id);

        // Disparar notificação de nova conversa (opcional, se NotificationProvider estiver disponível)
        // Como o context não tem acesso direto ao hook useMessages de forma simples,
        // a primeira mensagem enviada já disparará notificações via setupRealtime no hook useMessages.
        // No entanto, para o toast/banner imediato no recebedor, o hook useMessages já trata isso via realtime se ele estiver montado.

        return data.id;
      } catch (err) {
        console.error("❌ Erro ao criar/encontrar conversa:", err);
        console.error(
          "❌ Stack trace:",
          err instanceof Error ? err.stack : "No stack trace",
        );
        return null;
      }
    },
    [user?.id],
  );

  const openChat = useCallback(
    async (userIdOrConversationId?: string, userName?: string) => {
      console.log("💬 Abrindo chat:", { userIdOrConversationId, userName });

      if (!userIdOrConversationId) {
        // Abrir lista de conversas
        setIsOpen(true);
        setSelectedConversationId(undefined);
        setTargetUserId(undefined);
        setTargetUserName(undefined);
        return;
      }

      // Verificar se é um ID de conversa (UUID) ou ID de usuário
      // Para distinguir, vamos assumir que se não há userName, é um conversationId
      // Se há userName, é um userId que precisa criar conversa
      const isConversationId =
        !userName &&
        userIdOrConversationId.includes("-") &&
        userIdOrConversationId.length === 36;

      if (isConversationId) {
        // Abrir conversa existente
        console.log("💬 Abrindo conversa existente:", userIdOrConversationId);
        setSelectedConversationId(userIdOrConversationId);
        setTargetUserId(undefined);
        setTargetUserName(undefined);
        setIsOpen(true);
      } else {
        // Criar nova conversa
        console.log(
          "🆕 Criando nova conversa com userId:",
          userIdOrConversationId,
          "userName:",
          userName,
        );
        setTargetUserId(userIdOrConversationId);
        setTargetUserName(userName);
        setIsOpen(true);

        try {
          if (!user?.id) {
            console.error("❌ Usuário não autenticado");
            return;
          }

          console.log(
            "🔐 Criando conversa entre:",
            user.id,
            "e",
            userIdOrConversationId,
          );
          const newConversationId = await createOrFindConversation(
            user.id,
            userIdOrConversationId,
          );

          if (newConversationId) {
            console.log("✅ Conversa criada/encontrada:", newConversationId);
            setSelectedConversationId(newConversationId);
            // Manter targetUserId e targetUserName como fallback até que a conversa carregue no UI
            // Eles serão limpos ao fechar o chat ou selecionar outra conversa da lista
          } else {
            console.error("❌ Falha ao criar/encontrar conversa");
          }
        } catch (error) {
          console.error("❌ Erro ao criar conversa:", error);
        }
      }
    },
    [user?.id, createOrFindConversation],
  );

  const closeChat = useCallback(() => {
    console.log("💬 Fechando chat");
    setIsOpen(false);
    setSelectedConversationId(undefined);
    setTargetUserId(undefined);
    setTargetUserName(undefined);
  }, []);

  const selectConversation = useCallback((conversationId?: string) => {
    console.log("💬 Selecionando conversa:", conversationId);
    setSelectedConversationId(conversationId);
    setTargetUserId(undefined);
    setTargetUserName(undefined);
  }, []);

  const value: FloatingChatContextType = {
    isOpen,
    selectedConversationId,
    targetUserId,
    targetUserName,
    openChat,
    closeChat,
    selectConversation,
  };

  return (
    <FloatingChatContext.Provider value={value}>
      {children}
    </FloatingChatContext.Provider>
  );
}

export function useFloatingChat() {
  const context = useContext(FloatingChatContext);
  if (context === undefined) {
    throw new Error(
      "useFloatingChat deve ser usado dentro de um FloatingChatProvider",
    );
  }
  return context;
}
