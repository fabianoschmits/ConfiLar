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
import { ReportType, ReportPriority } from "../types";
import {
  Loader2,
  AlertTriangle,
  Shield,
  Megaphone,
  Star,
  MessageSquare,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReportFormProps {
  onSubmit: (data: {
    type: ReportType;
    reason: string;
    description: string;
    priority: ReportPriority;
    targetId: string;
  }) => Promise<void>;
  isLoading: boolean;
  initialData?: {
    type?: ReportType;
    targetId?: string;
    targetName?: string;
  };
}

export function ReportForm({
  onSubmit,
  isLoading,
  initialData,
}: ReportFormProps) {
  const [type, setType] = useState<ReportType>(initialData?.type || "other");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<ReportPriority>("medium");
  const [targetId, setTargetId] = useState(initialData?.targetId || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !targetId) return;

    await onSubmit({
      type,
      reason: reason || `Denúncia de ${type}`,
      description,
      priority,
      targetId,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="space-y-4">
        {initialData?.targetName && (
          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Você está denunciando o item:{" "}
              <span className="font-bold text-foreground">
                {initialData.targetName}
              </span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!initialData?.type && (
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Denúncia</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as ReportType)}
              >
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="post">Postagem</SelectItem>
                  <SelectItem value="classified">Anúncio</SelectItem>
                  <SelectItem value="review">Avaliação</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="priority">Urgência</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as ReportPriority)}
            >
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="Selecione a urgência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Motivo Breve (Opcional)</Label>
          <Input
            id="reason"
            placeholder="Ex: Conteúdo impróprio, Golpe, etc."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-background/50 border-border/50 focus:border-primary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição detalhada</Label>
          <Textarea
            id="description"
            placeholder="Descreva detalhadamente o problema encontrado..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="bg-background/50 border-border/50 focus:border-primary/50 resize-none"
          />
        </div>
      </div>

      <Alert className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/50">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-[10px] sm:text-xs">
          <strong>Importante:</strong> Denúncias falsas são violações dos termos
          de uso e podem resultar em suspensão da conta.
        </AlertDescription>
      </Alert>

      <Button
        type="submit"
        className="w-full h-9 sm:h-10 text-sm bg-red-600 hover:bg-red-700 text-white"
        disabled={isLoading || !description}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          "Enviar Denúncia para Moderação"
        )}
      </Button>
    </form>
  );
}
