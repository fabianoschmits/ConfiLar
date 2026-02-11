import { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  DollarSign,
  User,
  Package,
  CreditCard,
  Calendar,
  AlertCircle,
  RefreshCw,
  Info,
  History,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { RefundDialog } from "@/components/gestao-confi/RefundDialog";
import { cn } from "@/lib/utils";

interface PurchaseDetailModalProps {
  purchaseId: string;
  open: boolean;
  onClose: () => void;
}

export function PurchaseDetailModal({
  purchaseId,
  open,
  onClose,
}: PurchaseDetailModalProps) {
  const [purchase, setPurchase] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  useEffect(() => {
    if (open && purchaseId) {
      fetchPurchaseDetails();
    }
  }, [open, purchaseId]);

  const fetchPurchaseDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gestao-confi/purchases/${purchaseId}`);
      if (response.ok) {
        const data = await response.json();
        setPurchase(data.purchase);
        setUserBalance(data.userBalance);
        setAdminNote(data.purchase.admin_note || "");
      } else {
        toast.error("Erro ao carregar detalhes da compra");
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
      toast.error("Erro ao carregar detalhes");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/gestao-confi/purchases/${purchaseId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "approve",
            admin_note: adminNote,
          }),
        },
      );

      if (response.ok) {
        toast.success("Compra aprovada com sucesso!");
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao aprovar compra");
      }
    } catch (error) {
      console.error("Error approving purchase:", error);
      toast.error("Erro ao aprovar compra");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!adminNote.trim()) {
      toast.error("Por favor, adicione uma nota explicando a rejeição");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/gestao-confi/purchases/${purchaseId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reject",
            admin_note: adminNote,
          }),
        },
      );

      if (response.ok) {
        toast.success("Compra rejeitada");
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao rejeitar compra");
      }
    } catch (error) {
      console.error("Error rejecting purchase:", error);
      toast.error("Erro ao rejeitar compra");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      pending: { label: "Pendente", variant: "outline" },
      approved: { label: "Aprovado", variant: "default" },
      rejected: { label: "Rejeitado", variant: "destructive" },
      expired: { label: "Expirado", variant: "secondary" },
      refunded: { label: "Reembolsado", variant: "secondary" },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "outline" as const,
    };
    return (
      <Badge variant={config.variant} className="px-3 py-1 text-xs">
        {config.label}
      </Badge>
    );
  };

  if (loading || !purchase) {
    return (
      <ResponsiveModal
        isOpen={open}
        onOpenChange={(isOpen) => !isOpen && onClose()}
        title="Detalhes da Compra"
      >
        <div className="space-y-4 py-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </ResponsiveModal>
    );
  }

  const modalFooter = (
    <div className="flex w-full flex-col sm:flex-row gap-2 justify-end">
      {purchase.status === "pending" && (
        <>
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={actionLoading}
            className="w-full sm:w-auto mt-2 sm:mt-0"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rejeitar
          </Button>
          <Button
            onClick={handleApprove}
            disabled={actionLoading}
            className="w-full sm:w-auto"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Aprovar
          </Button>
        </>
      )}
      {purchase.status === "approved" && (
        <Button
          variant="destructive"
          onClick={() => setShowRefundDialog(true)}
          disabled={actionLoading}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reembolsar
        </Button>
      )}
      <Button
        variant="outline"
        onClick={onClose}
        className="w-full sm:w-auto sm:hidden"
      >
        Fechar
      </Button>
    </div>
  );

  return (
    <>
      <ResponsiveModal
        isOpen={open}
        onOpenChange={(isOpen) => !isOpen && onClose()}
        title={
          <div className="flex items-center gap-3">
            <span>Detalhes da Compra</span>
            {getStatusBadge(purchase.status)}
          </div>
        }
        description={
          <span className="text-xs font-mono opacity-70">
            ID: {purchase.id}
          </span>
        }
        footer={modalFooter}
        className="sm:max-w-2xl"
      >
        <div className="space-y-6 pb-6 pt-2">
          {/* Purchase Summary Card */}
          <Card className="overflow-hidden border-none shadow-sm bg-muted/30">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
                <DollarSign className="h-3.5 w-3.5" />
                Resumo Financeiro
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Valor Total
                  </p>
                  <p className="text-lg sm:text-2xl font-bold tracking-tight">
                    {formatCurrency(purchase.amount_brl)}
                  </p>
                </div>
                <div className="space-y-1 border-l sm:border-l-0 sm:pl-0 pl-4">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Pontos
                  </p>
                  <p className="text-lg sm:text-2xl font-bold tracking-tight text-primary">
                    {purchase.points_received}
                  </p>
                </div>
                <div className="space-y-1 col-span-1 border-t sm:border-t-0 sm:pt-0 pt-4">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Método
                  </p>
                  <p className="text-sm font-semibold capitalize flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" />
                    {purchase.payment_method?.replace("_", " ")}
                  </p>
                </div>
                <div className="space-y-1 col-span-1 border-t sm:border-t-0 sm:pt-0 pt-4 border-l sm:border-l-0 sm:pl-0 pl-4">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Data
                  </p>
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(purchase.created_at), "dd/MM/yy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Profile */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                Usuário
              </h3>
              <div className="flex items-center gap-4 p-4 border rounded-2xl bg-background/50">
                <Avatar className="h-14 w-14 ring-2 ring-muted ring-offset-2">
                  <AvatarImage src={purchase.user?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {purchase.user?.full_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-base truncate">
                    {purchase.user?.full_name || "Usuário desconhecido"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {purchase.user?.email || "Email não disponível"}
                  </p>
                  <p className="text-[10px] font-mono mt-1 opacity-50 break-all select-all">
                    UID: {purchase.user?.id || purchase.user_id}
                  </p>
                </div>
              </div>

              {userBalance && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 opacity-10 -mr-4 -mt-4 transform group-hover:scale-110 transition-transform duration-500">
                    <History className="h-24 w-24" />
                  </div>
                  <p className="text-xs font-semibold text-primary/70 mb-1">
                    Saldo de Pontos
                  </p>
                  <p className="text-3xl font-black text-primary tracking-tight">
                    {userBalance.balance}
                  </p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-primary/10">
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase">
                        Ganhos
                      </p>
                      <p className="text-xs font-bold text-green-600">
                        +{userBalance.total_earned}
                      </p>
                    </div>
                    <div className="flex-1 border-l pl-4 border-primary/10 text-right">
                      <p className="text-[10px] text-muted-foreground uppercase">
                        Gastos
                      </p>
                      <p className="text-xs font-bold text-muted-foreground">
                        {userBalance.total_spent}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Package className="h-3.5 w-3.5" />
                Detalhes do Pedido
              </h3>

              <div className="p-4 border rounded-2xl space-y-4 bg-background/50">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pacote</p>
                  <p className="font-bold text-base">
                    {purchase.points_package?.name || "Pacote não encontrado"}
                  </p>
                  {purchase.points_package?.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed italic">
                      "{purchase.points_package.description}"
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-2.5 rounded-xl bg-muted/30">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">
                      Pontos Base
                    </p>
                    <p className="text-sm font-bold">
                      {purchase.points_package?.points ||
                        purchase.points_received}{" "}
                      pts
                    </p>
                  </div>
                  <div
                    className={cn(
                      "p-2.5 rounded-xl border",
                      purchase.points_package &&
                        purchase.points_received >
                          purchase.points_package.points
                        ? "bg-orange-500/10 border-orange-500/20"
                        : "bg-muted/20 border-muted opacity-60",
                    )}
                  >
                    <p
                      className={cn(
                        "text-[10px] font-medium uppercase",
                        purchase.points_package &&
                          purchase.points_received >
                            purchase.points_package.points
                          ? "text-orange-600"
                          : "text-muted-foreground",
                      )}
                    >
                      Bônus Recebido
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <p
                        className={cn(
                          "text-sm font-bold",
                          purchase.points_package &&
                            purchase.points_received >
                              purchase.points_package.points
                            ? "text-orange-700"
                            : "text-muted-foreground",
                        )}
                      >
                        {purchase.points_package &&
                        purchase.points_received >
                          purchase.points_package.points
                          ? `+${purchase.points_received - purchase.points_package.points} pts`
                          : "Sem bônus"}
                      </p>
                      {purchase.points_package &&
                        purchase.points_received >
                          purchase.points_package.points && (
                          <span className="text-[10px] font-medium text-orange-600/70">
                            ({purchase.points_package.bonus_percentage || 0}%)
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {purchase.payment_id && (
                <div className="p-4 rounded-2xl border border-dashed flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold mb-1">
                      ID de Referência
                    </p>
                    <p className="text-[11px] font-mono break-all opacity-70 bg-muted/30 p-1.5 rounded">
                      {purchase.payment_id}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Interaction */}
          <div className="space-y-4 pt-2">
            <div className="space-y-2.5">
              <Label
                htmlFor="admin-note"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >
                Nota Administrativa
              </Label>
              <Textarea
                id="admin-note"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Registre aqui detalhes internos ou justificativa para aprovação/rejeição..."
                rows={3}
                className="bg-background resize-none border-muted focus-visible:ring-primary rounded-xl"
              />
            </div>

            {purchase.refund_reason && (
              <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    Evento de Reembolso
                  </p>
                  <p className="text-xs text-amber-800/80 dark:text-amber-200/80 leading-relaxed mt-1">
                    {purchase.refund_reason}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ResponsiveModal>

      <RefundDialog
        purchaseId={purchaseId}
        open={showRefundDialog}
        onClose={() => {
          setShowRefundDialog(false);
          fetchPurchaseDetails();
        }}
        onSuccess={() => {
          setShowRefundDialog(false);
          onClose();
        }}
      />
    </>
  );
}
