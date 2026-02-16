"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function IdentityVerificationForm() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [status, setStatus] = useState<string>("not_started");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      setFetchingStatus(true);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("verification_status")
        .eq("id", user?.id)
        .single();

      if (profileError) throw profileError;

      if (profile) {
        setStatus(profile.verification_status || "not_started");
      }

      if (profile.verification_status === "rejected") {
        const { data: verification } = await supabase
          .from("professional_verifications")
          .select("rejection_reason")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (verification) {
          setRejectionReason(verification.rejection_reason);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar status de verificação:", error);
    } finally {
      setFetchingStatus(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
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
          // Salvar apenas o path para gerar signed URLs dinâmicas posteriormente
          uploadedUrls.push(filePath);
        }

        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      // Salvar na tabela de verificação
      const { error: dbError } = await supabase
        .from("professional_verifications")
        .upsert({
          user_id: user?.id,
          document_urls: uploadedUrls,
          status: "pending",
          updated_at: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      // Atualizar status no perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ verification_status: "pending" })
        .eq("id", user?.id);

      if (profileError) throw profileError;

      setStatus("pending");
      setSelectedFiles([]);
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
      // 1. Remover a solicitação pendente
      const { error: deleteError } = await supabase
        .from("professional_verifications")
        .delete()
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (deleteError) throw deleteError;

      // 2. Resetar o status no perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ verification_status: "not_started" })
        .eq("id", user.id);

      if (profileError) throw profileError;

      setStatus("not_started");
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
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              Verificação de Identidade
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Aumente sua credibilidade na plataforma e tenha o selo de perfil
              verificado. Essa etapa é opcional mas recomendada para todos.
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
            <p className="text-[10px] text-gray-500 mt-2">
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
              <div className="ml-2">
                <p className="font-bold">Verificação Reprovada</p>
                <p className="text-sm mt-1">
                  {rejectionReason ||
                    "Os documentos enviados não foram aceitos. Por favor, reenvie seus documentos atualizados."}
                </p>
              </div>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center bg-gray-50/50 dark:bg-gray-900/30">
              <input
                type="file"
                id="document-upload"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,.pdf"
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer group flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ring-1 ring-gray-100 dark:ring-gray-700">
                  <UploadCloud className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  Clique para enviar seus documentos
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Envie foto do seu RG/CNH (frente e verso)
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG ou PDF até 5MB
                </p>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Arquivos selecionados ({selectedFiles.length})
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <LoadingButton
                onClick={handleUpload}
                isLoading={loading}
                disabled={selectedFiles.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-base font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
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
    </div>
  );
}
