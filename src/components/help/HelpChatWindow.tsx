/**
 * Help Chat Window - Main chat interface
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  X,
  Minus,
  Send,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useHelpChat } from "@/contexts/HelpChatContext";
import HelpMessageBubble from "./HelpMessageBubble";
import HelpSuggestions from "./HelpSuggestions";
import HelpAdminInbox from "./HelpAdminInbox";

export default function HelpChatWindow() {
  const {
    isOpen,
    isMinimized,
    messages,
    isLoading,
    closeChat,
    minimizeChat,
    maximizeChat,
    sendMessage,
    isSupportMode,
    isAdmin,
    adminTickets,
    selectTicket,
    clearHistory,
    activeTicketStatus,
    updateTicketStatus,
    userTickets,
    fetchUserTickets,
    selectUserTicket,
    showHistory,
    setShowHistory,
    startSupportTicket,
    loadMoreMessages,
    hasMore,
  } = useHelpChat();

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue("");
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = async (query: string) => {
    await sendMessage(query);
  };

  const handleBackToInbox = () => {
    clearHistory(); // Reseta o estado do chat (isSupportMode, conversationId)
    setShowHistory(true); // Se for usuário, volta para o histórico
  };

  if (!isOpen) return null;

  // Determinar o que mostrar no corpo do chat
  const showAdminInbox = isAdmin && !isSupportMode;
  const showMessages =
    !showAdminInbox && (messages.length > 0 || isSupportMode);
  const showSuggestions =
    !isAdmin && !showHistory && messages.length === 0 && !isSupportMode;

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] md:hidden"
        onClick={closeChat}
      />

      {/* Chat window */}
      <div
        className={`fixed z-[9999] transition-all duration-300 ease-out ${
          isMinimized
            ? "bottom-4 right-4 w-64 h-14"
            : "bottom-4 right-4 md:w-[400px] md:h-[600px] w-[90%] h-[85vh] left-[5%] md:left-auto"
        }`}
      >
        <div
          className={`h-full flex flex-col rounded-2xl overflow-hidden
                    bg-gradient-to-br from-background/95 to-background/80
                    backdrop-blur-xl border border-border/50
                    shadow-2xl shadow-black/20 ${
                      isMinimized
                        ? ""
                        : "animate-in slide-in-from-bottom-4 duration-300"
                    }`}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-border/50
                        bg-gradient-to-r from-primary/10 to-primary/5"
          >
            <div className="flex items-center gap-3">
              {isSupportMode && (
                <button
                  onClick={handleBackToInbox}
                  className="w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center
                           transition-colors duration-200 mr-1"
                  title={
                    isAdmin ? "Voltar para Inbox" : "Voltar para Histórico"
                  }
                >
                  <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <div className="w-10 h-10 flex items-center justify-center">
                <Image
                  src="/imagens/logo/Logo azul - sem fundo - Vertical.png"
                  alt="ConfiLar"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {isAdmin
                    ? isSupportMode
                      ? "Suporte Real"
                      : "Painel Moderador"
                    : isSupportMode
                      ? "Chat com Moderador"
                      : "Central de Ajuda"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isSupportMode ? (
                    <span className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        {isAdmin
                          ? "Conversando com Usuário"
                          : "Moderador Online"}
                      </span>
                      {/* Badge de status do ticket para o usuário */}
                      {!isAdmin && activeTicketStatus && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            activeTicketStatus === "open"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                              : activeTicketStatus === "in_progress"
                                ? "bg-primary/10 text-primary border-primary/30"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          }`}
                        >
                          {activeTicketStatus === "open"
                            ? "Aguardando"
                            : activeTicketStatus === "in_progress"
                              ? "Em Atendimento"
                              : "Resolvido ✓"}
                        </span>
                      )}
                    </span>
                  ) : isAdmin ? (
                    "Gerencie chamados de suporte"
                  ) : (
                    "Estamos aqui para ajudar!"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={isMinimized ? maximizeChat : minimizeChat}
                className="w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center
                         transition-colors duration-200"
                aria-label={isMinimized ? "Maximizar" : "Minimizar"}
              >
                <Minus className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={closeChat}
                className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center
                         transition-colors duration-200 group"
                aria-label="Fechar"
              >
                <X className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {showAdminInbox && <HelpAdminInbox />}

                {/* Histórico de tickets do usuário */}
                {!isAdmin &&
                  showHistory &&
                  userTickets.length > 0 &&
                  !isSupportMode && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-muted">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-foreground">
                          Seus chamados
                        </h4>
                        <button
                          onClick={() => setShowHistory(false)}
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          Nova dúvida
                        </button>
                      </div>
                      {userTickets.map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() =>
                            selectUserTicket(
                              ticket.id,
                              ticket.conversation_id,
                              ticket.status,
                            )
                          }
                          className="w-full text-left p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-all flex flex-col gap-2 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                              #{ticket.id.substring(0, 8)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                ticket.status === "open"
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                                  : ticket.status === "in_progress"
                                    ? "bg-primary/10 text-primary border-primary/30"
                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              }`}
                            >
                              {ticket.status === "open"
                                ? "Aberto"
                                : ticket.status === "in_progress"
                                  ? "Atendimento"
                                  : "Resolvido"}
                            </span>
                          </div>
                          <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                            {ticket.messages?.[0]?.content ||
                              "Chamado sem mensagens"}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.created_at).toLocaleDateString(
                              "pt-BR",
                            )}
                          </div>
                        </button>
                      ))}

                      <button
                        onClick={async () => {
                          setShowHistory(false);
                          await startSupportTicket();
                        }}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-primary/30 text-primary font-semibold hover:bg-primary/5 transition-all text-sm mt-2"
                      >
                        + Iniciar novo atendimento
                      </button>
                    </div>
                  )}

                {showSuggestions && (
                  <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-muted">
                    <HelpSuggestions
                      onSuggestionClick={handleSuggestionClick}
                    />
                    {!isAdmin && userTickets.length > 0 && (
                      <div className="mt-4 px-4 text-center">
                        <button
                          onClick={() => setShowHistory(true)}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          Ver meus chamados anteriores
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {showMessages && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted">
                    {hasMore && (
                      <div className="flex justify-center mb-2">
                        <button
                          onClick={loadMoreMessages}
                          disabled={isLoading}
                          className="text-[10px] font-bold text-primary hover:text-primary/70 transition-colors uppercase tracking-widest py-1 px-3 rounded-full bg-primary/5 border border-primary/20"
                        >
                          {isLoading
                            ? "Carregando..."
                            : "Carregar mensagens anteriores"}
                        </button>
                      </div>
                    )}
                    {messages.map((message) => (
                      <HelpMessageBubble key={message.id} message={message} />
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div
                          className="bg-muted/50 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-3
                                      border border-border/50 flex gap-1 items-center h-10"
                        >
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Admin Action Bar */}
              {isAdmin && isSupportMode && (
                <div className="px-4 py-2 border-t border-border/30 bg-muted/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mr-1">
                      Status:
                    </span>
                    <div
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors
                        ${
                          activeTicketStatus === "open"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : activeTicketStatus === "in_progress"
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        }`}
                    >
                      {activeTicketStatus === "open"
                        ? "Aberto"
                        : activeTicketStatus === "in_progress"
                          ? "Em Progresso"
                          : "Resolvido"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeTicketStatus !== "in_progress" && (
                      <button
                        onClick={() => updateTicketStatus("in_progress")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 
                                 text-primary text-xs font-medium transition-all duration-200 border border-primary/20"
                      >
                        <Clock className="w-3 h-3" />
                        Atender
                      </button>
                    )}
                    {activeTicketStatus !== "resolved" && (
                      <button
                        onClick={() => updateTicketStatus("resolved")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white 
                                 hover:bg-emerald-600 text-xs font-semibold shadow-lg shadow-emerald-500/20 
                                 transition-all duration-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolver
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Input area (only shown when in a conversation) */}
              {(isSupportMode || (!isAdmin && messages.length > 0)) && (
                <div
                  className="p-4 border-t border-border/50 bg-gradient-to-r from-background/50 to-background/30
                              backdrop-blur-sm"
                >
                  <div className="flex items-end gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua resposta..."
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 rounded-xl
                               bg-background/80 backdrop-blur-sm
                               border border-border/50 focus:border-primary/50
                               focus:ring-2 focus:ring-primary/20
                               outline-none transition-all duration-200
                               text-sm placeholder:text-muted-foreground
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="w-12 h-12 rounded-xl
                               bg-gradient-to-br from-primary to-primary/90
                               hover:from-primary/90 hover:to-primary/80
                               disabled:from-muted disabled:to-muted
                               flex items-center justify-center
                               transition-all duration-200
                               shadow-lg shadow-primary/20 hover:shadow-primary/30
                               disabled:shadow-none disabled:cursor-not-allowed
                               group"
                      aria-label="Enviar mensagem"
                    >
                      <Send className="w-5 h-5 text-primary-foreground group-disabled:text-muted-foreground" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
