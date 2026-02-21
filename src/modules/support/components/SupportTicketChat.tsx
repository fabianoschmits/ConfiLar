"use client";

import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SupportTicket, SupportTicketMessage } from "../types";
import {
  Send,
  User,
  ShieldCheck,
  Clock,
  ArrowLeft,
  Search,
  Star,
  MessageSquare,
} from "lucide-react";
import { supportService } from "../services/supportService";

interface SupportTicketChatProps {
  ticket: SupportTicket;
  onSendMessage: (message: string) => Promise<any>;
  onBack: () => void;
  currentUser: { id: string };
  isAdmin?: boolean;
}

export function SupportTicketChat({
  ticket,
  onSendMessage,
  onBack,
  currentUser,
  isAdmin = false,
}: SupportTicketChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    setIsSending(true);
    try {
      await onSendMessage(inputValue.trim());
      setInputValue("");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmitRating = async () => {
    try {
      await supportService.submitRating(ticket.id, rating, feedback);
      setIsRatingSubmitted(true);
      setRating(0);
      setFeedback("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleReopen = async () => {
    try {
      await supportService.updateTicketStatus(
        ticket.id,
        currentUser.id,
        "reaberto",
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ticket.messages]);

  const filteredMessages = ticket.messages?.filter((msg) =>
    msg.message.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-[500px] sm:h-[600px] bg-background/50 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden animate-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-muted/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {!isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8 rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="min-w-0">
            <h4 className="text-[13px] sm:text-sm font-bold truncate leading-none mb-1">
              {ticket.subject}
            </h4>
            <div className="flex items-center gap-2">
              <Badge
                variant={ticket.status === "fechado" ? "outline" : "default"}
                className="text-[8px] sm:text-[9px] font-bold h-3.5 sm:h-4 px-1.5"
              >
                {ticket.status.replace("_", " ")}
              </Badge>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest leading-none">
                #{ticket.id.slice(0, 8)}
              </p>
            </div>
          </div>
        </div>

        <div className="relative w-24 sm:w-48">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 h-7 sm:h-8 text-[10px] sm:text-[11px] bg-background/30 rounded-full"
          />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted"
      >
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="bg-muted/30 border border-border/50 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider text-center max-w-[90%] sm:max-w-[80%]">
            Ticket iniciado em{" "}
            {format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </div>
        </div>

        {filteredMessages?.map((msg, index) => {
          const isMe = msg.sender_id === currentUser.id;
          const isModerator = msg.sender_type === "moderator";

          const msgDate = new Date(msg.created_at);
          const showDateSeparator =
            index === 0
              ? false
              : format(msgDate, "yyyy-MM-dd") !==
                format(
                  new Date(filteredMessages[index - 1].created_at),
                  "yyyy-MM-dd",
                );

          return (
            <React.Fragment key={msg.id}>
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <div className="bg-muted/30 border border-border/50 rounded-full px-4 py-1 text-[10px] text-muted-foreground uppercase tracking-wider text-center max-w-[80%]">
                    {format(msgDate, "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </div>
                </div>
              )}
              <div
                className={`flex items-end gap-2 mb-2 ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                      isModerator
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isModerator ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : ticket.profiles?.avatar_url ? (
                      <img
                        src={ticket.profiles.avatar_url}
                        alt="Usuário"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm text-[12.5px] sm:text-sm leading-relaxed ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                        : "bg-muted border border-border/50 text-foreground rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    {msg.message}
                  </div>

                  <div
                    className={`flex flex-col mt-1 ${isMe ? "text-right" : "text-left"}`}
                  >
                    <span className="text-[10.5px] font-semibold text-muted-foreground">
                      {isMe
                        ? "Você"
                        : isModerator
                          ? "Suporte ConfiLar"
                          : ticket.profiles?.full_name || "Usuário"}
                    </span>
                    <span className="text-[9px] text-muted-foreground/80 -mt-0.5">
                      {format(new Date(msg.created_at), "HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>

                {isMe && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                      isModerator
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isModerator ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : ticket.profiles?.avatar_url ? (
                      <img
                        src={ticket.profiles.avatar_url}
                        alt="Usuário"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
        {ticket.status === "resolvido" && !isAdmin && !isRatingSubmitted && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-6 text-center space-y-3 sm:space-y-4 my-4 sm:my-6 animate-in slide-in-from-bottom-4">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-full w-fit mx-auto">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-primary fill-primary" />
            </div>
            <div>
              <h5 className="font-bold text-sm">Este ticket foi resolvido!</h5>
              <p className="text-xs text-muted-foreground">
                Como foi seu atendimento?
              </p>
            </div>
            <div className="flex justify-center gap-0.5 sm:gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors ${
                      rating >= s
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground/20 stroke-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="space-y-3 animate-in fade-in zoom-in-95">
                <Input
                  placeholder="Conte-nos mais (opcional)..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="text-xs h-8"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    className="w-full sm:flex-1 h-8 sm:h-9 text-[10px] sm:text-xs"
                    onClick={handleSubmitRating}
                  >
                    Enviar Avaliação
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto h-8 sm:h-9 text-[10px] sm:text-xs"
                    onClick={handleReopen}
                  >
                    Ainda tenho dúvidas
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      {ticket.status !== "fechado" && ticket.status !== "resolvido" ? (
        <div className="p-4 border-t border-border/30 bg-muted/5 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua mensagem..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-background/50 border-border/50 focus:border-primary/50"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-border/30 bg-muted/20 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            {ticket.status === "resolvido"
              ? "Este ticket foi marcado como resolvido."
              : "Este ticket foi encerrado."}
          </p>
          {ticket.status === "resolvido" && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] gap-1"
              onClick={handleReopen}
            >
              <ArrowLeft className="w-3 h-3" /> Reabrir Ticket
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
