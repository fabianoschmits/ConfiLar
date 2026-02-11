"use client";

import React, { useState } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ban, Calendar } from "lucide-react";
import { toast } from "sonner";
import { type Profile } from "./ReportDetailsModal";

interface BanUserModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: Profile | null;
  onBan: (
    userId: string,
    data: { reason: string; ban_type: string; duration_days?: number },
  ) => Promise<void>;
}

export function BanUserModal({
  isOpen,
  onOpenChange,
  user,
  onBan,
}: BanUserModalProps) {
  const [reason, setReason] = useState("");
  const [banType, setBanType] = useState("temporary");
  const [durationDays, setDurationDays] = useState("7");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Por favor, informe o motivo do banimento.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onBan(user.id, {
        reason,
        ban_type: banType,
        duration_days:
          banType === "temporary" ? parseInt(durationDays) : undefined,
      });
      onOpenChange(false);
      setReason("");
    } catch (error) {
      // Error handled by parent or toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Banir Usuário"
      description="Configure as restrições para o acesso deste usuário."
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 w-full gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processando..." : "Confirmar Banimento"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* User Preview */}
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url || ""} />
            <AvatarFallback>
              {user.full_name?.substring(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {user.full_name || "Usuário"}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {user.email || "-"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ban-type">Tipo de Banimento</Label>
            <Select value={banType} onValueChange={setBanType}>
              <SelectTrigger id="ban-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temporary">Temporário</SelectItem>
                <SelectItem value="permanent">Permanente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {banType === "temporary" && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (dias)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  className="pl-10"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo do Banimento</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Violação dos termos de uso, Spam, Comportamento inapropriado..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}
