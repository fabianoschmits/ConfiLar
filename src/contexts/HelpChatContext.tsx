/**
 * Help Chat Context - State management for help chat
 */

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
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
}

const HelpChatContext = createContext<HelpChatContextType | undefined>(
  undefined,
);

export function HelpChatProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HelpChatState>({
    isOpen: false,
    isMinimized: false,
    messages: [],
    isLoading: false,
  });

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

  const sendMessage = useCallback(
    async (content: string) => {
      // Add user message
      const userMessage: HelpMessage = {
        id: Date.now().toString(),
        type: "user",
        content,
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
      }));

      try {
        // Search for help article
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
              "Não encontrei uma solução exata para isso 😕\n\nVocê pode entrar em contato com nosso suporte pelo e-mail suporte@confilar.com.br que a gente te ajuda rapidinho!",
              { action_type: "email", action_value: "suporte@confilar.com.br" },
            );
          }
          setState((prev) => ({ ...prev, isLoading: false }));
        }, delay);
      } catch (error) {
        console.error("Error sending message:", error);
        addBotMessage(
          "Desculpe, ocorreu um erro. Por favor, tente novamente ou entre em contato com suporte@confilar.com.br",
        );
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [addBotMessage],
  );

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, messages: [] }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

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
