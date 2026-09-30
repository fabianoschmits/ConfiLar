"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
  user_type: "professional" | "client";
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  minHeight?: string;
}

export const MentionInput = React.forwardRef<any, MentionInputProps>(
  (
    {
      value,
      onChange,
      placeholder = "Digite @ para mencionar alguém...",
      className = "",
      disabled = false,
      onKeyPress,
      minHeight = "80px",
    },
    ref,
  ) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentionStart, setMentionStart] = useState<number | null>(null);
    const [mentionQuery, setMentionQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Expor métodos através da ref
    React.useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    // Ajustar altura automaticamente conforme o conteúdo
    const adjustTextareaHeight = useCallback(() => {
      if (textareaRef.current) {
        // Resetar altura para calcular o scrollHeight corretamente
        textareaRef.current.style.height = "auto";
        // Definir altura baseada no conteúdo, mas respeitando minHeight
        const scrollHeight = textareaRef.current.scrollHeight;
        const minHeightValue =
          minHeight === "auto" ? 24 : parseInt(minHeight) || 48;
        textareaRef.current.style.height = `${Math.max(scrollHeight, minHeightValue)}px`;
      }
    }, [minHeight]);

    // Buscar usuários baseado na query
    const searchUsers = useCallback(async (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, user_type")
          .ilike("full_name", `%${query}%`)
          .order("full_name")
          .limit(10);

        if (error) {
          console.error("Erro ao buscar usuários:", error);
          setSuggestions([]);
        } else {
          setSuggestions(data || []);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, []);

    // Detectar menções no texto
    const detectMention = useCallback(
      (text: string, cursorPosition: number) => {
        const beforeCursor = text.substring(0, cursorPosition);
        // Regex para detectar @ seguido de [ e nome (formato: @[nome)
        const mentionMatch = beforeCursor.match(
          /@\[?([a-zA-ZÀ-ÿ]+(?:\s+[a-zA-ZÀ-ÿ]+)?)$/,
        );

        if (mentionMatch) {
          const start = beforeCursor.lastIndexOf("@");
          setMentionStart(start);
          setMentionQuery(mentionMatch[1]);
          setShowSuggestions(true);
          setSelectedIndex(0);
          searchUsers(mentionMatch[1]);
        } else {
          setShowSuggestions(false);
          setMentionStart(null);
          setMentionQuery("");
        }
      },
      [searchUsers],
    );

    // Lidar com mudanças no texto
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPosition = e.target.selectionStart;

      onChange(newValue);
      detectMention(newValue, cursorPosition);

      // Ajustar altura após mudança
      setTimeout(() => adjustTextareaHeight(), 0);
    };

    // Ajustar altura quando o valor mudar externamente
    useEffect(() => {
      adjustTextareaHeight();
    }, [value, adjustTextareaHeight]);

    // Lidar com seleção de usuário
    const handleUserSelect = (user: User) => {
      if (mentionStart === null) return;

      const beforeMention = value.substring(0, mentionStart);
      const afterMention = value.substring(
        mentionStart + 1 + mentionQuery.length,
      );
      // Inserir apenas @nome (limpo e simples)
      const newValue = `${beforeMention}@${user.full_name} ${afterMention}`;

      onChange(newValue);
      setShowSuggestions(false);
      setMentionStart(null);
      setMentionQuery("");
      setSelectedIndex(0);

      // Focar no textarea após a seleção
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPosition =
            beforeMention.length + user.full_name.length + 2;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            newCursorPosition,
            newCursorPosition,
          );
        }
      }, 0);
    };

    // Lidar com navegação por teclado
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!showSuggestions) {
        onKeyPress?.(e);
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            handleUserSelect(suggestions[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setShowSuggestions(false);
          setMentionStart(null);
          setMentionQuery("");
          setSelectedIndex(0);
          break;
        default:
          onKeyPress?.(e);
      }
    };

    // Renderizar texto com menções destacadas
    const renderTextWithMentions = (text: string) => {
      const parts = text.split(/(@\w+)/g);
      return parts.map((part, index) => {
        if (part.startsWith("@")) {
          return (
            <span
              key={index}
              className="text-[var(--cl-teal)] font-medium bg-[var(--cl-mist)] px-1 rounded"
            >
              {part}
            </span>
          );
        }
        return part;
      });
    };

    // Calcular posição das sugestões
    const getSuggestionsPosition = () => {
      if (!textareaRef.current || !showSuggestions) return {};

      const rect = textareaRef.current.getBoundingClientRect();
      return {
        position: "absolute" as const,
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      };
    };

    // Renderizar sugestões usando portal
    const renderSuggestions = () => {
      if (!showSuggestions) return null;

      const position = getSuggestionsPosition();

      return createPortal(
        <div
          ref={suggestionsRef}
          className="fixed bg-[var(--cl-surface)] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto z-[99999]"
          style={position}
        >
          {isLoading ? (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--cl-teal)] dark:border-blue-400 mx-auto"></div>
              <span className="text-xs ml-2">Buscando usuários...</span>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((user, index) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                  index === selectedIndex
                    ? "bg-[var(--cl-mist)] dark:bg-blue-900/30"
                    : ""
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={user.avatar_url}
                    alt={`Avatar de ${user.full_name}`}
                  />
                  <AvatarFallback>
                    {user.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {user.full_name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user.user_type === "professional"
                      ? "Profissional"
                      : "Cliente"}
                  </div>
                </div>
              </button>
            ))
          ) : mentionQuery ? (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
              <span className="text-sm">
                Nenhum usuário encontrado para "{mentionQuery}"
              </span>
            </div>
          ) : null}
        </div>,
        document.body,
      );
    };

    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full resize-none focus:outline-none transition-all duration-200 overflow-hidden ${className}`}
          style={{
            minHeight: minHeight === "auto" ? "24px" : minHeight,
            height: "auto",
          }}
          rows={1}
        />

        {/* Sugestões de menções renderizadas via portal */}
        {renderSuggestions()}
      </div>
    );
  },
);

MentionInput.displayName = "MentionInput";
