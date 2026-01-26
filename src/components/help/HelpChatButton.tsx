/**
 * Help Chat Button - Icon button to open help chat
 */

"use client";

import React from "react";
import { HelpCircle } from "lucide-react";
import { useHelpChat } from "@/contexts/HelpChatContext";

export default function HelpChatButton() {
  const { openChat } = useHelpChat();

  return (
    <button
      onClick={openChat}
      className="fixed z-[9997] group
                 /* Mobile: ao lado direito do menu rápido, quase translúcido */
                 right-4 bottom-20 md:right-6 md:bottom-24
                 /* Desktop: acima do chat flutuante */
                 lg:right-6 lg:bottom-24"
      aria-label="Abrir ajuda"
      title="Precisa de ajuda?"
    >
      <div
        className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full
                    /* Mobile: mais translúcido */
                    bg-gradient-to-br from-primary/5 to-primary/3 md:from-primary/10 md:to-primary/5
                    backdrop-blur-md border border-primary/10 md:border-primary/20
                    hover:border-primary/40 hover:from-primary/20 hover:to-primary/10
                    transition-all duration-300 ease-out
                    shadow-lg shadow-primary/5 hover:shadow-primary/20"
      >
        <HelpCircle className="w-6 h-6 md:w-7 md:h-7 text-primary/70 md:text-primary group-hover:scale-110 transition-transform duration-300" />
      </div>

      {/* Pulse animation */}
      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-0 group-hover:opacity-75" />
    </button>
  );
}
