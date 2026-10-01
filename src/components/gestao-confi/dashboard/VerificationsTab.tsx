"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  User as UserIcon,
  FileText,
  Shield,
  Eye,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { updateReferralMilestone } from "@/hooks/useReferralTracking";
import { ResponsiveTable } from "@/components/gestao-confi/ResponsiveTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface VerificationRequest {
  id: string;
  user_id: string;
  document_urls: string[];
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  created_at: string;
  signed_document_urls?: string[];
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string;
    user_type: string;
  };
}

const REJECTION_REASONS = [
  "Documentos ilegíveis",
  "Informações do documento não conferem com o perfil",
  "Documento expirado ou inválido",
  "Selfie não coincide com o documento",
  "Faltam documentos obrigatórios",
  "Outro (especificar nas notas)",
];

export function VerificationsTab() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("pending");

  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("professional_verifications")
        .select(
          `
          *,
          profiles:user_id!inner (
            full_name,
            email,
            avatar_url,
            user_type
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;

      const requestsWithSignedUrls = await Promise.all(
        (data || []).map(async (req) => {
          if (!req.document_urls || req.document_urls.length === 0) return req;

          const signedUrls = await Promise.all(
            req.document_urls.map(async (url: string) => {
              const path = url.includes("public/verification-documents/")
                ? url.split("public/verification-documents/")[1]
                : url;

              const { data: signedData, error: signedError } =
                await supabase.storage
                  .from("verification-documents")
                  .createSignedUrl(path, 3600);

              return signedError ? url : signedData.signedUrl;
            }),
          );

          return { ...req, signed_document_urls: signedUrls };
        }),
      );

      setRequests(requestsWithSignedUrls);
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
      toast.error("Erro ao carregar solicitações.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      const { error: verError } = await supabase
        .from("professional_verifications")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      if (verError) throw verError;

      const { error: profError } = await supabase
        .from("profiles")
        .update({
          is_verified: true,
          verification_status: "approved",
        })
        .eq("id", selectedRequest.user_id);

      if (profError) throw profError;

      await supabase.from("notifications").insert({
        user_id: selectedRequest.user_id,
        title: "Perfil Verificado! 🎉",
        message: "Sua identidade foi confirmada com sucesso.",
        type: "success",
        priority: "high",
      });

      await updateReferralMilestone(
        selectedRequest.user_id,
        "profile_completed",
      );

      toast.success("Aprovado com sucesso!");
      setIsDetailOpen(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      toast.error("Erro ao processar aprovação.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) return;
    setIsProcessing(true);
    try {
      const { error: verError } = await supabase
        .from("professional_verifications")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      if (verError) throw verError;

      await supabase.from("notifications").insert({
        user_id: selectedRequest.user_id,
        title: "Verificação não aprovada ⚠️",
        message: `Motivo: ${rejectionReason}`,
        type: "warning",
        priority: "normal",
        action_url: "/editarperfil",
      });

      toast.success("Rejeitado.");
      setIsRejectOpen(false);
      setIsDetailOpen(false);
      fetchRequests();
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      toast.error("Erro ao processar rejeição.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      req.profiles?.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      header: "Usuário",
      cell: (req: VerificationRequest) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={req.profiles?.avatar_url} />
            <AvatarFallback>
              {req.profiles?.full_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-sm truncate">
              {req.profiles?.full_name || "Sem nome"}
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              {req.profiles?.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Data",
      cell: (req: VerificationRequest) => (
        <span className="text-[11px] font-medium opacity-70">
          {format(new Date(req.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
        </span>
      ),
    },
    {
      header: "Ações",
      cell: (req: VerificationRequest) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 rounded-xl border-border/50 font-bold text-[10px] uppercase"
          onClick={() => {
            setSelectedRequest(req);
            setIsDetailOpen(true);
          }}
        >
          Analisar
        </Button>
      ),
      className: "text-right",
    },
  ];

  const renderMobileCard = (req: VerificationRequest) => (
    <div className="bg-[var(--cl-surface)]/40 border border-border/40 rounded-2xl p-3 sm:p-5 space-y-3 shadow-sm group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9 border border-border/50 shadow-sm">
            <AvatarImage src={req.profiles?.avatar_url} />
            <AvatarFallback>
              {req.profiles?.full_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-[13px] text-gray-900 dark:text-white leading-tight">
              {req.profiles?.full_name || "Sem nome"}
            </h3>
            <p className="text-[9px] text-muted-foreground font-medium opacity-60">
              {format(new Date(req.created_at), "dd MMM yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[8px] uppercase font-black px-1.5 py-0.5 h-4.5 rounded-md border-0",
            req.status === "pending"
              ? "bg-amber-50 text-amber-700"
              : "bg-[var(--cl-mist)] text-blue-700",
          )}
        >
          {req.status}
        </Badge>
      </div>
      <Button
        variant="outline"
        className="w-full h-9 rounded-xl border-border/50 font-black text-[9px] uppercase tracking-wider"
        onClick={() => {
          setSelectedRequest(req);
          setIsDetailOpen(true);
        }}
      >
        Analisar Documentação
      </Button>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm p-3 sm:p-4 rounded-2xl sm:rounded-[28px] border border-border/50 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
          <Input
            placeholder="Buscar..."
            className="pl-9 h-9 bg-white/50 dark:bg-black/20 border-border/40 rounded-xl text-xs sm:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 rounded-xl border-border/40 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="rejected">Rejeitados</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ResponsiveTable
        data={filteredRequests}
        columns={columns}
        keyExtractor={(req) => req.id}
        renderMobileCard={renderMobileCard}
        isLoading={loading}
        emptyMessage="Nenhuma solicitação encontrada."
      />

      {/* Modern PDF/Image Viewer Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[95vh] overflow-y-auto p-4 sm:p-6 rounded-[32px]">
          <DialogHeader className="sm:text-left">
            <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase">
              <ShieldCheck className="w-6 h-6 text-[var(--cl-teal)]" />
              Verificação
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="bg-muted/30 p-5 rounded-[24px] space-y-4 border border-border/30">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Perfil
                  </h4>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-white dark:border-gray-800 shadow-md">
                      <AvatarImage src={selectedRequest.profiles.avatar_url} />
                      <AvatarFallback>
                        {selectedRequest.profiles.full_name
                          ?.substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-base leading-none">
                        {selectedRequest.profiles.full_name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 opacity-70">
                        {selectedRequest.profiles.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full h-10 rounded-xl font-bold uppercase text-[10px] tracking-wide"
                  >
                    <Link
                      href={`/perfil/${selectedRequest.user_id}`}
                      target="_blank"
                    >
                      Abrir Perfil Completo
                    </Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Documentos
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      selectedRequest.signed_document_urls ||
                      selectedRequest.document_urls
                    ).map((url, idx) => {
                      const isPdf = url.toLowerCase().includes(".pdf");
                      return (
                        <div
                          key={idx}
                          className="relative group border border-border/40 rounded-[20px] overflow-hidden aspect-square bg-muted/20"
                        >
                          {isPdf ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                              <FileText className="w-8 h-8 text-red-500" />
                              <span className="text-[8px] font-black uppercase tracking-tighter">
                                PDF Docs
                              </span>
                            </div>
                          ) : (
                            <img
                              src={url}
                              alt="Doc"
                              className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                              onClick={() => setViewerUrl(url)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50/20 dark:bg-indigo-900/5 p-6 rounded-[24px] border border-indigo-100/50 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2">
                    Instruções
                  </h4>
                  <p className="text-xs font-medium leading-relaxed opacity-80">
                    Valide se o nome nos documentos coincide com o perfil.
                    Marque como rejeitado se houver borrões ou se o documento
                    parecer editado.
                  </p>
                </div>

                {selectedRequest.rejection_reason && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100">
                    <h5 className="text-[10px] font-black text-red-600 uppercase mb-1">
                      Última Rejeição
                    </h5>
                    <p className="text-xs font-medium opacity-70">
                      {selectedRequest.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
            {selectedRequest?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="rounded-2xl h-12 flex-1 border-red-100 text-red-600 hover:bg-red-50 font-black uppercase text-[11px] tracking-wider"
                  onClick={() => setIsRejectOpen(true)}
                  disabled={isProcessing}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reprovar
                </Button>
                <LoadingButton
                  className="rounded-2xl h-12 flex-1 bg-[var(--cl-cta)] hover:bg-blue-500 font-black uppercase text-[11px] tracking-wider shadow-lg shadow-blue-500/20"
                  onClick={handleApprove}
                  isLoading={isProcessing}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Aprovar
                </LoadingButton>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="font-black uppercase text-xl">
              Rejeitar Verificação
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-60">
                Padrão de Rejeição
              </label>
              <Select
                value={rejectionReason}
                onValueChange={setRejectionReason}
              >
                <SelectTrigger className="rounded-2xl h-12">
                  <SelectValue placeholder="Selecione o motivo..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {REJECTION_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Notas internas..."
              className="rounded-2xl min-h-[100px]"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <LoadingButton
              variant="destructive"
              className="w-full h-12 rounded-2xl font-black uppercase tracking-wider"
              onClick={handleReject}
              isLoading={isProcessing}
              disabled={!rejectionReason}
            >
              Confirmar Rejeição
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Viewer Dialog */}
      <Dialog open={!!viewerUrl} onOpenChange={() => setViewerUrl(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden bg-black/95 border-none rounded-[24px]">
          <div className="absolute top-4 right-4 z-50">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full h-10 w-10 p-0"
              onClick={() => setViewerUrl(null)}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={viewerUrl || ""}
              className="max-w-full max-h-full object-contain"
              alt="Viewer"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
