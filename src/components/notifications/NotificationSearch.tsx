"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NotificationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotificationSearch({
  value,
  onChange,
}: NotificationSearchProps) {
  return (
    <div className="relative w-full md:max-w-xs">
      <div className="absolute left-2.5 top-2.5 text-muted-foreground">
        <Search className="w-4 h-4" />
      </div>
      <Input
        type="text"
        placeholder="Buscar notificações..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9 h-9 w-full bg-background border-input focus:ring-1 focus:ring-primary transition-all rounded-full"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-7 w-7 rounded-full hover:bg-muted"
          onClick={() => onChange("")}
        >
          <X className="w-3 h-3 text-muted-foreground" />
          <span className="sr-only">Limpar busca</span>
        </Button>
      )}
    </div>
  );
}
