"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SupportTicketPriority } from "../types";
import { supportService } from "../services/supportService";
import { Loader2, Info } from "lucide-react";

interface SupportTicketFormProps {
  onSubmit: (data: {
    subject: string;
    category: string;
    priority: SupportTicketPriority;
    initial_message: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export function SupportTicketForm({
  onSubmit,
  isLoading,
}: SupportTicketFormProps) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<SupportTicketPriority>("media");
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  React.useEffect(() => {
    supportService.getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message || (!category && categories.length > 0)) return;

    await onSubmit({
      subject,
      category: category || categories[0]?.name || "Geral",
      priority,
      initial_message: message,
    });
  };

  const slaInfo = {
    baixa: "Até 48h úteis",
    media: "Até 24h úteis",
    alta: "Até 8h úteis",
    urgente: "Até 2h (Crítico)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              placeholder="Ex: Problema com pagamento"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="bg-background/50 border-border/50 focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="Geral">Geral</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as SupportTicketPriority)}
          >
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa ({slaInfo.baixa})</SelectItem>
              <SelectItem value="media">Média ({slaInfo.media})</SelectItem>
              <SelectItem value="alta">Alta ({slaInfo.alta})</SelectItem>
              <SelectItem value="urgente">
                Urgente ({slaInfo.urgente})
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" /> Prazos baseados em dias úteis e
            horários comerciais.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Descrição do problema</Label>
          <Textarea
            id="message"
            placeholder="Descreva detalhadamente o que está acontecendo..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            className="bg-background/50 border-border/50 focus:border-primary/50 resize-none"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando ticket...
          </>
        ) : (
          "Abrir Ticket de Suporte"
        )}
      </Button>
    </form>
  );
}
