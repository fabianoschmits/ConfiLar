import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UnifiedUpload } from "@/components/ui/UnifiedUpload";
import { updateReferralMilestone } from "@/hooks/useReferralTracking";

interface VerificationHistoryItem {
  id: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  admin_notes?: string | null;
}

export function IdentityVerificationForm() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [status, setStatus] = useState<string>("not_started");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationHistory, setVerificationHistory] = useState<
    VerificationHistoryItem[]
  >([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      setFetchingStatus(true);

      // 1. Fetch Profile Status
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("verification_status")
        .eq("id", user?.id)
        .single();

      if (profileError) throw profileError;

      if (profile) {
        setStatus(profile.verification_status || "not_started");
      }

      // 2. Fetch History (All past verifications)
      const { data: verifications, error: historyError } = await supabase
        .from("professional_verifications")
        .select("id, status, rejection_reason, created_at, admin_notes")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (historyError) throw historyError;

      if (verifications && verifications.length > 0) {
        setVerificationHistory(verifications);

        // If current status is rejected, grab the latest reason
        if (profile.verification_status === "rejected") {
          // The first one in the list should be the latest due to order desc
          const latest = verifications[0];
          if (latest && latest.status === "rejected") {
            setRejectionReason(latest.rejection_reason);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar status de verificação:", error);
    } finally {
      setFetchingStatus(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Selecione pelo menos um documento.");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${user?.id}/${Date.now()}_${i}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from("verification-documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        if (data) {
          uploadedUrls.push(filePath);
        }

        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      // Insert new verification record (Insert, not Upsert to keep history)
      const { error: dbError } = await supabase
        .from("professional_verifications")
        .insert({
          user_id: user?.id,
          document_urls: uploadedUrls,
          status: "pending",
        });

      if (dbError) throw dbError;

      // Update Profile Status
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ verification_status: "pending" })
        .eq("id", user?.id);

      if (profileError) throw profileError;

      setStatus("pending");
      setSelectedFiles([]);
      setRejectionReason(null); // Clear rejection reason
      fetchVerificationStatus(); // Refresh history

      toast.success(
        "Documentos enviados com sucesso! A análise pode demorar até 48 horas.",
      );
    } catch (error: any) {
      console.error("Erro no upload de documentos:", error);
      toast.error(`Erro ao enviar documentos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 1. Remove pending request
      const { error: deleteError } = await supabase
        .from("professional_verifications")
        .delete()
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (deleteError) throw deleteError;

      // 2. Reset profile status
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ verification_status: "not_started" })
        .eq("id", user.id);

      if (profileError) throw profileError;

      setStatus("not_started");
      fetchVerificationStatus();
      toast.success("Solicitação de verificação cancelada com sucesso.");
    } catch (error: any) {
      console.error("Erro ao cancelar verificação:", error);
      toast.error(`Erro ao cancelar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingStatus) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-500">
          Carregando status de verificação...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[var(--cl-mist)] dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-[var(--cl-teal)] dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              Verificação de Identidade
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Aumente sua credibilidade na plataforma e tenha o selo de perfil
              verificado.
            </p>
          </div>
        </div>
      </div>

      {status === "approved" && (
        <div className="flex flex-col items-center justify-center p-12 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-3xl text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Perfil Verificado!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Seu perfil foi verificado com sucesso. Agora você tem o selo de
              confiança da ConfiLar.
            </p>
          </div>
          <Badge className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 text-sm rounded-full">
            Verificado
          </Badge>
        </div>
      )}

      {status === "pending" && (
        <div className="flex flex-col items-center justify-center p-12 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-3xl text-center space-y-4">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Documentação em Análise
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Seus documentos foram recebidos e estão sendo analisados pela
              nossa equipe. Esse processo pode demorar até 48 horas.
            </p>
          </div>
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 text-sm rounded-full">
            Pendente de Análise
          </Badge>

          <div className="pt-4 w-full max-w-xs mx-auto">
            <LoadingButton
              variant="outline"
              onClick={handleCancel}
              isLoading={loading}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl"
            >
              Cancelar Solicitação
            </LoadingButton>
            <p className="text-xs text-gray-500 mt-2">
              Você poderá enviar novos documentos após cancelar.
            </p>
          </div>
        </div>
      )}

      {(status === "not_started" || status === "rejected") && (
        <div className="space-y-6">
          {status === "rejected" && (
            <Alert
              variant="destructive"
              className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-2xl"
            >
              <AlertCircle className="h-5 w-5" />
              <div className="ml-2 w-full">
                <p className="font-bold">Verificação Reprovada</p>
                <p className="text-sm mt-1">
                  {rejectionReason ||
                    "Os documentos enviados não foram aceitos. Por favor, verifique o histórico abaixo e reenvie."}
                </p>
              </div>
            </Alert>
          )}

          <div className="space-y-4">
            <UnifiedUpload
              selectedFiles={selectedFiles}
              onFilesSelected={(files) =>
                setSelectedFiles((prev) => [...prev, ...files])
              }
              onRemoveFile={removeFile}
              maxFiles={10}
              accept="image/*,.pdf"
              title="Clique para enviar seus documentos"
              description="Envie foto do seu RG/CNH (frente e verso)"
              subDescription="JPG, PNG ou PDF até 5MB"
              isLoading={loading}
            />

            <div className="pt-4">
              <LoadingButton
                onClick={handleUpload}
                isLoading={loading}
                disabled={selectedFiles.length === 0}
                className="w-full bg-[var(--cl-cta)] hover:brightness-110 text-[var(--cl-on-cta)] rounded-xl h-12 text-base font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? "Enviando..." : "Enviar para Verificação"}
              </LoadingButton>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 px-4">
                Ao clicar em enviar, você declara que os documentos anexados são
                autênticos e pertencem a você.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Histórico de Verificações */}
      {verificationHistory.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full text-left mb-4 group"
          >
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <History className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <h4 className="font-semibold text-sm group-hover:text-blue-500 transition-colors">
                Histórico de Verificações
              </h4>
            </div>
            {showHistory ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showHistory && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {verificationHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {item.status === "approved" && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">
                          Aprovado
                        </Badge>
                      )}
                      {item.status === "rejected" && (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">
                          Reprovado
                        </Badge>
                      )}
                      {item.status === "pending" && (
                        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0">
                          Pendente
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {format(new Date(item.created_at), "dd 'de' MMMM, yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  {item.status === "rejected" && item.rejection_reason && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/20">
                      <span className="font-semibold">Motivo:</span>{" "}
                      {item.rejection_reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
