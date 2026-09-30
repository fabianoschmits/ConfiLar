"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface SearchAutocompleteProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  recentSearches?: string[];
  className?: string;
}

export function SearchAutocomplete({
  onSearch,
  placeholder = "Buscar...",
  suggestions = [],
  recentSearches = [],
  className,
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Filtrar sugestões baseadas na query
  const filteredSuggestions = suggestions
    .filter((s) => s.toLowerCase().includes(debouncedQuery.toLowerCase()))
    .slice(0, 5);

  // Combinar sugestões e buscas recentes
  const allSuggestions = [
    ...filteredSuggestions.map((s) => ({
      type: "suggestion" as const,
      text: s,
    })),
    ...(debouncedQuery === ""
      ? recentSearches
          .slice(0, 3)
          .map((s) => ({ type: "recent" as const, text: s }))
      : []),
  ];

  useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, allSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(allSuggestions[focusedIndex].text);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectSuggestion = (text: string) => {
    setQuery(text);
    onSearch(text);
    setShowDropdown(false);

    // Salvar no histórico
    const recent = JSON.parse(localStorage.getItem("search-history") || "[]");
    const updated = [text, ...recent.filter((s: string) => s !== text)].slice(
      0,
      10,
    );
    localStorage.setItem("search-history", JSON.stringify(updated));
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      {/* Input de Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-sm"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown de Sugestões */}
      {showDropdown && allSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-[var(--cl-surface)] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {allSuggestions.map((item, index) => (
            <button
              key={`${item.type}-${item.text}`}
              onClick={() => handleSelectSuggestion(item.text)}
              className={cn(
                "w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors",
                focusedIndex === index
                  ? "bg-primary-50 dark:bg-primary-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800",
              )}
            >
              {item.type === "recent" ? (
                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
              ) : (
                <TrendingUp className="h-4 w-4 text-primary-500 flex-shrink-0" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {item.text}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
