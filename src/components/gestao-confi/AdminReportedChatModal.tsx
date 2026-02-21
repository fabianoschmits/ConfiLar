"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Loader2 } from "lucide-react";

interface AdminReportedChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  reportedMessageId: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender?: {
    full_name: string;
    avatar_url: string;
  };
}

export function AdminReportedChatModal({
  isOpen,
  onClose,
  conversationId,
  reportedMessageId,
}: AdminReportedChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && conversationId) {
      loadMessages();
    }
  }, [isOpen, conversationId]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
                    id, 
                    content, 
                    created_at, 
                    sender_id,
                    sender:sender_id(full_name, avatar_url)
                `,
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data as any);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to the reported message after loading
  useEffect(() => {
    if (!isLoading && messages.length > 0 && reportedMessageId) {
      setTimeout(() => {
        const element = document.getElementById(`msg-${reportedMessageId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  }, [isLoading, messages, reportedMessageId]);

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Conversa Completa"
      description="Histórico completo da conversa relacionada a esta denúncia."
    >
      <div className="flex flex-col h-[60vh] sm:h-[500px] -mx-4 sm:mx-0">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Carregando Histórico...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground p-6 text-center italic text-sm">
            Nenhuma mensagem encontrada neste histórico. O chat pode ter sido
            deletado permanentemente.
          </div>
        ) : (
          <ScrollArea className="flex-1 px-4 sm:px-2">
            <div className="space-y-4 pb-6 pt-2">
              {messages.map((msg, index) => {
                const isReported = msg.id === reportedMessageId;
                // Simple grouping logic: check if previous message was from same sender
                const showAvatar =
                  index === 0 ||
                  messages[index - 1].sender_id !== msg.sender_id;

                return (
                  <div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    className={`flex flex-col gap-1 transition-all duration-500 ${isReported ? "bg-red-500/10 -mx-2 px-2 py-3 rounded-xl border border-red-500/20 shadow-sm" : ""}`}
                  >
                    {isReported && (
                      <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase tracking-widest mb-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Mensagem Denunciada
                      </div>
                    )}

                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-8 shrink-0 flex justify-center">
                        {showAvatar && (
                          <Avatar className="w-8 h-8 border border-border/50">
                            <AvatarImage src={msg.sender?.avatar_url} />
                            <AvatarFallback className="text-[10px] bg-muted font-bold text-muted-foreground">
                              {msg.sender?.full_name
                                ?.substring(0, 2)
                                .toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        {showAvatar && (
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xs font-bold truncate">
                              {msg.sender?.full_name || "Usuário Desconhecido"}
                            </span>
                            <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                              {format(new Date(msg.created_at), "dd/MM HH:mm", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                        )}

                        <div
                          className={`text-sm leading-relaxed p-3 rounded-2xl break-words w-fit max-w-[90%] sm:max-w-[85%] ${
                            isReported
                              ? "bg-red-100 dark:bg-red-950/40 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-900/50"
                              : "bg-muted/50 border border-border/50"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </ResponsiveModal>
  );
}
