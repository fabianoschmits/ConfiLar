/**
 * Quick suggestions for help chat
 */

"use client";

import React from "react";
import { Lock, CreditCard, LogIn, Info } from "lucide-react";
import type { QuickSuggestion } from "@/types/help";

interface HelpSuggestionsProps {
  onSuggestionClick: (query: string) => void;
}

const SUGGESTIONS: QuickSuggestion[] = [
  {
    id: "1",
    label: "Esqueci minha senha",
    query: "esqueci minha senha",
    icon: "lock",
  },
  {
    id: "2",
    label: "Problemas com pagamento",
    query: "problemas com pagamento",
    icon: "credit-card",
  },
  {
    id: "3",
    label: "Não consigo acessar",
    query: "não consigo acessar minha conta",
    icon: "log-in",
  },
  {
    id: "4",
    label: "Como funciona o sistema",
    query: "como funciona o sistema",
    icon: "info",
  },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  lock: Lock,
  "credit-card": CreditCard,
  "log-in": LogIn,
  info: Info,
};

export default function HelpSuggestions({
  onSuggestionClick,
}: HelpSuggestionsProps) {
  return (
    <div className="p-4 space-y-3">
      <p className="text-sm text-muted-foreground text-center">
        Como posso te ajudar hoje? 😊
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTIONS.map((suggestion) => {
          const Icon = iconMap[suggestion.icon || "info"];

          return (
            <button
              key={suggestion.id}
              onClick={() => onSuggestionClick(suggestion.query)}
              className="flex items-center gap-3 p-3 rounded-lg
                       bg-gradient-to-br from-background/80 to-background/40
                       backdrop-blur-sm border border-border/50
                       hover:border-primary/50 hover:from-primary/5 hover:to-primary/10
                       transition-all duration-300
                       text-left group"
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full
                            bg-primary/10 flex items-center justify-center
                            group-hover:bg-primary/20 transition-colors"
              >
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground">
                {suggestion.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
