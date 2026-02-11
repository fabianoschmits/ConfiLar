"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface RefundDialogProps {
  purchaseId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RefundDialog({
  purchaseId,
  open,
  onClose,
  onSuccess,
}: RefundDialogProps) {
  const [reason, setReason] = useState("");
  const [deductPoints, setDeductPoints] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Por favor, informe o motivo do reembolso");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/purchases/${purchaseId}/refund`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: reason.trim(),
            deduct_points: deductPoints,
          }),
        },
      );

      if (response.ok) {
        toast.success("Reembolso processado com sucesso!");
        setReason("");
        setDeductPoints(true);
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao processar reembolso");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("Erro ao processar reembolso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Processar Reembolso</DialogTitle>
          <DialogDescription>
            Esta ação irá reembolsar a compra e atualizar o status para
            "reembolsado".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="refund-reason">Motivo do Reembolso *</Label>
            <Textarea
              id="refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explique o motivo do reembolso..."
              rows={4}
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="deduct-points"
              checked={deductPoints}
              onCheckedChange={(checked) => setDeductPoints(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="deduct-points"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Deduzir pontos do saldo do usuário
              </label>
              <p className="text-sm text-muted-foreground">
                Se marcado, os pontos creditados serão removidos do saldo do
                usuário.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-900 dark:text-yellow-100 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Atenção:</strong> Esta ação não pode ser desfeita. O
                reembolso será registrado permanentemente no histórico da
                compra.
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
          >
            {loading ? "Processando..." : "Confirmar Reembolso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
