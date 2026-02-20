/**
 * Help Message Bubble - Individual chat message
 */

"use client";

import React from "react";
import { ExternalLink, Mail } from "lucide-react";
import type { HelpMessage } from "@/types/help";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HelpMessageBubbleProps {
  message: HelpMessage;
}

export default function HelpMessageBubble({ message }: HelpMessageBubbleProps) {
  const isUser =
    message.type === "user" || (message as any).sender_type === "user";
  const isBot =
    message.type === "bot" || (message as any).sender_type === "bot";
  const isAdminMsg =
    message.type === "admin" || (message as any).sender_type === "admin";
  const isSystem =
    message.type === "system" || (message as any).sender_type === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 animate-in fade-in duration-500">
        <div className="bg-muted/30 backdrop-blur-sm border border-border/50 rounded-full px-4 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-2 ${isUser ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
          <img
            src="/imagens/logo/Logo azul - sem fundo - Vertical.png"
            alt={isAdminMsg ? "Moderador" : "Suporte"}
            className="w-5 h-5 object-contain"
          />
        </div>
      )}
      <div
        className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "order-2" : "order-1"}`}
      >
        {!isUser && (
          <p className="text-[10px] font-semibold text-muted-foreground mb-1 ml-1 uppercase tracking-wider">
            {isAdminMsg ? "Moderador ConfiLar" : "Suporte ConfiLar"}
          </p>
        )}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm"
              : isAdminMsg
                ? "bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20 text-foreground rounded-bl-sm"
                : "bg-gradient-to-br from-muted/80 to-muted/40 backdrop-blur-sm border border-border/50 text-foreground rounded-bl-sm"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>

          {/* Action buttons */}
          {message.article &&
            (message.article.action_type === "link" ||
              message.article.action_type === "email") && (
              <div className="mt-3 pt-3 border-t border-current/10">
                {message.article.action_type === "link" && (
                  <a
                    href={message.article.action_value}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                           transition-all duration-300 ${
                             isUser
                               ? "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
                               : "bg-primary/10 hover:bg-primary/20 text-primary"
                           }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ir para a página
                  </a>
                )}

                {message.article.action_type === "email" && (
                  <a
                    href={`mailto:${message.article.action_value}`}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                           transition-all duration-300 ${
                             isUser
                               ? "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
                               : "bg-primary/10 hover:bg-primary/20 text-primary"
                           }`}
                  >
                    <Mail className="w-4 h-4" />
                    Falar com suporte
                  </a>
                )}
              </div>
            )}
        </div>

        {/* Timestamp */}
        <p
          className={`text-xs text-muted-foreground mt-1 px-2 ${isUser ? "text-right" : "text-left"}`}
        >
          {format(message.timestamp, "HH:mm", { locale: ptBR })}
        </p>
      </div>
    </div>
  );
}
