"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { useImageCompression } from "@/hooks/useImageCompression";
import { toast } from "sonner";
import { UnifiedUpload } from "./UnifiedUpload";
import { cn } from "@/lib/utils";

interface ImageUploadFeedProps {
  onImagesUpload: (imageUrls: string[]) => void;
  currentImages: string[];
  maxImages?: number;
  className?: string;
}

export function ImageUploadFeed({
  onImagesUpload,
  currentImages = [],
  maxImages = 5,
  className = "",
}: ImageUploadFeedProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [tempFiles, setTempFiles] = useState<File[]>([]);
  const fileInputId = useRef(
    `file-upload-${Math.random().toString(36).substring(2, 9)}`,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthContext();
  const { compressImage, isCompressing, compressionProgress } =
    useImageCompression();

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    if (!user) {
      toast.error("Você precisa estar logado para fazer upload de imagens");
      return;
    }

    // Verificar limite de imagens
    if (currentImages.length + files.length > maxImages) {
      toast.error(`Você pode adicionar no máximo ${maxImages} imagens.`);
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // ⚠️ SEGURANÇA: Validação completa de arquivo (tipo, tamanho e magic bytes)
        const { validateImageFile } = await import("@/lib/fileValidation");
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        const validation = await validateImageFile(file, {
          allowedTypes,
          maxSizeMB: 10,
          validateMagicBytes: true,
        });

        if (!validation.valid) {
          toast.error(validation.error || "Arquivo inválido");
          continue;
        }

        // O UnifiedUpload já comprime, então aqui confiamos na compressão feita lá.
        const compressedFile = file;

        const fileExt = file.name.split(".").pop();
        const fileName = `feed/${Date.now()}-${Math.random().toString(36).substring(2)}-${i}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("feed-images")
          .upload(fileName, compressedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("feed-images").getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      const allImages = [...currentImages, ...uploadedUrls];
      onImagesUpload(allImages);
      // Limpa os arquivos temporários após o upload
      setTempFiles([]);
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error(
        `Erro ao fazer upload das imagens: ${error?.message || "Tente novamente."}`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  const canAddMore = currentImages.length < maxImages;

  return (
    <div className={`space-y-3 ${className}`}>
      <UnifiedUpload
        selectedFiles={tempFiles}
        onFilesSelected={(files) => {
          setTempFiles(files);
          handleFileUpload(files);
        }}
        onRemoveFile={(index) =>
          setTempFiles((prev) => prev.filter((_, i) => i !== index))
        }
        existingUrls={currentImages}
        onRemoveExisting={(index) => {
          const newImages = currentImages.filter((_, i) => i !== index);
          onImagesUpload(newImages);
        }}
        maxFiles={maxImages}
        title="O que você está pensando?"
        description="Adicione fotos ao seu post"
        subDescription={`Até ${maxImages} imagens (JPG, PNG, WEBP)`}
        isLoading={isUploading}
      />

      {/* Barra de Progresso de Carregamento (quando já tem imagens) */}
      {isUploading || isCompressing ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-50/50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 animate-pulse">
          <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
          <span className="text-xs font-medium text-primary-700 dark:text-primary-400">
            {isCompressing
              ? `Otimizando novas fotos... ${compressionProgress}%`
              : "Subindo fotos selecionadas..."}
          </span>
        </div>
      ) : null}

      {/* Mensagem quando limite atingido */}
      {!canAddMore && (
        <div className="text-center">
          <p className="text-yellow-600 text-xs">
            Máximo de {maxImages} imagens atingido
          </p>
        </div>
      )}
    </div>
  );
}
