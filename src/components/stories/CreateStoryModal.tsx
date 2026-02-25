"use client";

import { useState, useRef } from "react";
import { X, Camera, Loader2, Upload } from "lucide-react";
import { UnifiedUpload } from "@/components/ui/UnifiedUpload";
import { useStories } from "@/hooks/useStories";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated?: () => void;
}

export function CreateStoryModal({
  isOpen,
  onClose,
  onStoryCreated,
}: CreateStoryModalProps) {
  const { user } = useAuthContext();
  const { createStory, isCreating } = useStories();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (files: File[]) => {
    const file = files[0];
    if (file) {
      setSelectedFiles([file]);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFiles([]);
    setPreviewUrl(null);
  };

  const handleUpload = async () => {
    if (!previewUrl || selectedFiles.length === 0 || !user?.id) {
      toast.error("Por favor, selecione a foto novamente.");
      return;
    }

    const file = selectedFiles[0];

    console.log("📤 Iniciando upload do story...", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: user.id,
    });

    setIsUploading(true);

    try {
      // Upload da imagem para o Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `stories/${fileName}`;

      console.log("📁 Caminho do arquivo:", filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("feed-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Erro no upload:", uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log("✅ Upload bem-sucedido:", uploadData);

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("feed-images").getPublicUrl(filePath);

      console.log("🔗 URL pública:", publicUrl);

      // Criar story
      console.log("💾 Criando story no banco...");
      const storyData = await createStory(publicUrl);
      console.log("✅ Story criado:", storyData);

      toast.success("Story publicado com sucesso!");
      setSelectedFiles([]);
      setPreviewUrl(null);
      onStoryCreated?.();
      onClose();
    } catch (error: any) {
      console.error("❌ Erro completo ao criar story:", error);
      const errorMessage =
        error?.message ||
        error?.toString() ||
        "Erro desconhecido ao criar story";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Criar Story"
    >
      <div className="space-y-4">
        {!previewUrl ? (
          <UnifiedUpload
            selectedFiles={selectedFiles}
            onFilesSelected={handleFilesSelected}
            onRemoveFile={removeFile}
            multiple={false}
            maxFiles={1}
            title="Compartilhe seu momento"
            description="Selecione uma foto para o seu story"
            subDescription="PNG, JPG ou WEBP até 10MB"
            isLoading={isUploading}
          />
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative group w-full max-h-[600px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={removeFile}
                className="absolute top-1 right-1 p-1 text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                type="button"
              >
                <X className="h-5 w-5" strokeWidth={3} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleUpload}
                disabled={isUploading || isCreating}
                className="flex-1 px-6 py-3 bg-brand hover:bg-brand/90 text-white rounded-xl font-bold shadow-lg shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isUploading || isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Publicar
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
}
