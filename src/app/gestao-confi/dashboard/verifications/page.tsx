"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminPageHeader } from "@/components/gestao-confi/AdminPageHeader";
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  User as UserIcon,
  FileText,
  AlertCircle,
  Shield,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Download,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface VerificationRequest {
  id: string;
  user_id: string;
  document_urls: string[];
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  created_at: string;
  signed_document_urls?: string[]; // Para visualização segura
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

export default function VerificationsPage() {
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

      // Gerar signed URLs para as solicitações pendentes de visualização
      const requestsWithSignedUrls = await Promise.all(
        (data || []).map(async (req) => {
          if (!req.document_urls || req.document_urls.length === 0) return req;

          const signedUrls = await Promise.all(
            req.document_urls.map(async (url: string) => {
              // Extrair o path se for uma URL completa ou usar o path direto
              const path = url.includes("public/verification-documents/")
                ? url.split("public/verification-documents/")[1]
                : url;

              const { data: signedData, error: signedError } =
                await supabase.storage
                  .from("verification-documents")
                  .createSignedUrl(path, 3600); // 1 hora de acesso

              return signedError ? url : signedData.signedUrl;
            }),
          );

          return { ...req, signed_document_urls: signedUrls };
        }),
      );

      setRequests(requestsWithSignedUrls);
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
      toast.error("Erro ao carregar solicitações de verificação.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      // 1. Atualizar tabela de verificação específica
      const { error: verError } = await supabase
        .from("professional_verifications")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      if (verError) throw verError;

      // 2. Atualizar perfil do usuário
      const { error: profError } = await supabase
        .from("profiles")
        .update({
          is_verified: true,
          verification_status: "approved",
        })
        .eq("id", selectedRequest.user_id);

      if (profError) throw profError;

      // 3. Criar notificação para o usuário
      await supabase.from("notifications").insert({
        user_id: selectedRequest.user_id,
        title: "Perfil Verificado! 🎉",
        message:
          "Sua identidade foi confirmada com sucesso. Agora seu perfil exibe o selo de confiança ConfiLar.",
        type: "success",
        priority: "high",
      });

      toast.success("Profissional aprovado com sucesso!");

      // Limpar estados e recarregar
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
    if (!selectedRequest || !rejectionReason) {
      toast.error("Selecione um motivo para a rejeição.");
      return;
    }
    setIsProcessing(true);
    try {
      // 1. Atualizar tabela de verificação
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

      // 2. Atualizar perfil do usuário
      const { error: profError } = await supabase
        .from("profiles")
        .update({
          verification_status: "rejected",
        })
        .eq("id", selectedRequest.user_id);

      if (profError) throw profError;

      // 3. Criar notificação para o usuário
      await supabase.from("notifications").insert({
        user_id: selectedRequest.user_id,
        title: "Verificação não aprovada ⚠️",
        message: `Sua verificação de identidade foi negada pelo seguinte motivo: ${rejectionReason}. Você pode reenviar seus documentos corrigidos.`,
        type: "warning",
        priority: "normal",
        action_url: "/editarperfil",
      });

      toast.success("Verificação rejeitada.");
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Verificações de Identidade"
        description="Gerencie as solicitações de verificação de profissionais."
      >
        <Badge
          variant="outline"
          className="text-blue-500 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20"
        >
          <ShieldCheck className="w-3 h-3 mr-1" />
          {requests.filter((r) => r.status === "pending").length} pendentes
        </Badge>
      </AdminPageHeader>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="rejected">Rejeitados</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-8 ml-auto bg-muted animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-muted-foreground"
                >
                  Nenhuma solicitação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {req.profiles?.full_name || "Usuário sem nome"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {req.profiles?.email || "E-mail não disponível"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="capitalize text-[10px] sm:text-xs"
                    >
                      {req.profiles?.user_type === "professional"
                        ? "Profissional"
                        : "Cliente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {format(new Date(req.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        req.status === "pending"
                          ? "outline"
                          : req.status === "approved"
                            ? "default"
                            : "destructive"
                      }
                      className={cn(
                        req.status === "pending" &&
                          "text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20",
                        req.status === "approved" &&
                          "bg-green-500 hover:bg-green-600",
                        req.status === "rejected" &&
                          "bg-red-500 hover:bg-red-600",
                      )}
                    >
                      {req.status === "pending"
                        ? "Pendente"
                        : req.status === "approved"
                          ? "Aprovado"
                          : "Rejeitado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(req);
                        setIsDetailOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Analisar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="sm:text-left">
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              Análise de Documentação
            </DialogTitle>
            <DialogDescription>
              Verifique os documentos e compare com as informações do perfil.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-xl space-y-3">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <UserIcon className="w-4 h-4" /> Dados do Perfil
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="font-medium">
                      {selectedRequest.profiles.full_name}
                    </span>
                    <span className="text-muted-foreground">E-mail:</span>
                    <span className="font-medium truncate">
                      {selectedRequest.profiles.email}
                    </span>
                    <span className="text-muted-foreground">Tipo:</span>
                    <Badge variant="outline" className="w-fit capitaliza">
                      {selectedRequest.profiles.user_type}
                    </Badge>
                  </div>
                  <Button
                    asChild
                    variant="link"
                    size="sm"
                    className="px-0 h-auto"
                  >
                    <Link
                      href={`/perfil/${selectedRequest.user_id}`}
                      target="_blank"
                      className="flex items-center gap-1"
                    >
                      Ver perfil completo <ExternalLink className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Documentos Enviados
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(
                      selectedRequest.signed_document_urls ||
                      selectedRequest.document_urls
                    ).map((url, idx) => {
                      const isPdf = url.toLowerCase().includes(".pdf");
                      return (
                        <div
                          key={idx}
                          className="relative group border border-border rounded-xl overflow-hidden bg-muted/20"
                        >
                          {isPdf ? (
                            <div className="h-40 flex flex-col items-center justify-center gap-2 p-4">
                              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-full text-red-500">
                                <FileText className="w-6 h-6" />
                              </div>
                              <span className="text-xs font-medium">
                                Documento PDF
                              </span>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                              >
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />{" "}
                                  Abrir PDF
                                </a>
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div
                                className="h-40 overflow-hidden cursor-zoom-in"
                                onClick={() => {
                                  setViewerUrl(url);
                                  setZoom(1);
                                  setRotation(0);
                                }}
                              >
                                <img
                                  src={url}
                                  alt={`Documento ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="rounded-full h-8 w-8 p-0"
                                  onClick={() => {
                                    setViewerUrl(url);
                                    setZoom(1);
                                    setRotation(0);
                                  }}
                                >
                                  <Maximize2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="rounded-full h-8 w-8 p-0"
                                  asChild
                                >
                                  <a
                                    href={url}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-muted/20 p-6 rounded-xl border border-border">
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" /> Histórico e Instruções
                </h4>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-xs leading-relaxed text-blue-800 dark:text-blue-300">
                    <p className="font-bold flex items-center gap-1 mb-1">
                      <Shield className="w-3 h-3" /> Verificação Profissional
                    </p>
                    Compare o nome do documento com o nome do perfil. A data de
                    nascimento deve coincidir se fornecida. Procure por sinais
                    de edição digital.
                  </div>

                  {selectedRequest.rejection_reason && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg text-xs">
                      <p className="font-bold text-red-600 mb-1">
                        Última Rejeição:
                      </p>
                      <p className="text-red-700 dark:text-red-400">
                        {selectedRequest.rejection_reason}
                      </p>
                    </div>
                  )}

                  <div className="text-[10px] text-muted-foreground flex flex-col gap-1">
                    <span>ID da Solicitação: {selectedRequest.id}</span>
                    <span>
                      Enviado em:{" "}
                      {format(new Date(selectedRequest.created_at), "PPP", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {selectedRequest?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => setIsRejectOpen(true)}
                  disabled={isProcessing}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reprovar
                </Button>
                <LoadingButton
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApprove}
                  isLoading={isProcessing}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Aprovar Usuário
                </LoadingButton>
              </>
            )}
            <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Rejeição */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprovar Verificação</DialogTitle>
            <DialogDescription>
              Informe o motivo para que o profissional possa corrigir a
              situação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo Principal</label>
              <Select
                value={rejectionReason}
                onValueChange={setRejectionReason}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um motivo..." />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Notas de Auditoria (Interno)
              </label>
              <Textarea
                placeholder="Observações adicionais para a equipe..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRejectOpen(false)}>
              Cancelar
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={handleReject}
              isLoading={isProcessing}
              disabled={!rejectionReason}
            >
              Confirmar Reprovação
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visualizador de Documentos com Zoom */}
      <Dialog open={!!viewerUrl} onOpenChange={() => setViewerUrl(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] md:h-[95vh] p-0 overflow-hidden bg-black/95 border-none">
          <DialogHeader className="absolute top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md p-4 flex-row items-center justify-between space-y-0 text-white border-b border-white/10">
            <DialogTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 sm:w-4 h-4" /> Visualizador
            </DialogTitle>
            <div className="flex items-center gap-1 sm:gap-2 pr-2 sm:pr-8">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                onClick={() => setZoom((prev) => Math.max(0.25, prev - 0.25))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs font-mono w-10 sm:w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                onClick={() => setZoom((prev) => Math.min(5, prev + 0.25))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                asChild
              >
                <a
                  href={viewerUrl || ""}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="w-4 h-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-8 w-8 p-0 ml-2 border border-white/20"
                onClick={() => setViewerUrl(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="w-full h-full flex items-center justify-center p-4 pt-16">
            {viewerUrl && (
              <div
                className="relative transition-transform duration-200 cursor-move"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              >
                <img
                  src={viewerUrl}
                  alt="Documento ampliado"
                  className="max-w-full max-h-full shadow-2xl rounded-sm pointer-events-none"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
