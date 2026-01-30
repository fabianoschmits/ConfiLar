"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "./button";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { useImageCompression } from "@/hooks/useImageCompression";
import { toast } from "sonner";

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
  const [dragActive, setDragActive] = useState(false);
  const fileInputId = useRef(
    `file-upload-${Math.random().toString(36).substring(2, 9)}`,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthContext();
  const { compressImage, isCompressing, compressionProgress } =
    useImageCompression();

  const handleFileUpload = async (files: FileList) => {
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
          maxSizeMB: 10, // 10MB máximo antes da compressão
          validateMagicBytes: true,
        });

        if (!validation.valid) {
          toast.error(validation.error || "Arquivo inválido");
          continue;
        }

        // Comprimir imagem antes do upload
        const compressedFile = await compressImage(file, {
          maxSizeMB: 1, // 1MB máximo após compressão
          maxWidthOrHeight: 1080, // 1080px máximo
        });

        // Gerar nome único para o arquivo
        const fileExt = file.name.split(".").pop();
        const fileName = `feed/${Date.now()}-${Math.random().toString(36).substring(2)}-${i}.${fileExt}`;

        // Upload para o bucket de imagens do feed
        const { data, error } = await supabase.storage
          .from("feed-images")
          .upload(fileName, compressedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Erro no upload do Supabase:", error);
          throw error;
        }

        // Obter URL pública da imagem
        const {
          data: { publicUrl },
        } = supabase.storage.from("feed-images").getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      // Adicionar novas imagens às existentes
      const allImages = [...currentImages, ...uploadedUrls];
      onImagesUpload(allImages);
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast.error(
        `Erro ao fazer upload das imagens: ${error?.message || "Tente novamente."}`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(files);
      // Reset do input para permitir selecionar o mesmo arquivo novamente
      event.target.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    onImagesUpload(newImages);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const canAddMore = currentImages.length < maxImages;

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        id={fileInputId.current}
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview das imagens atuais - Grid Premium */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {currentImages.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md"
            >
              <img
                src={imageUrl}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                className="absolute top-1 right-1 p-1 text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                title="Remover"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>
          ))}

          {/* Slot de Adição Rápida (Estilo Card) */}
          {canAddMore && !isUploading && !isCompressing && (
            <label
              htmlFor={fileInputId.current}
              className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all cursor-pointer group"
            >
              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                <Camera className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
              </div>
              <span className="mt-2 text-[10px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Adicionar
              </span>
            </label>
          )}
        </div>
      )}

      {currentImages.length === 0 && (
        <div className="w-full">
          {isUploading || isCompressing ? (
            <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
              <div className="relative">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary-600">
                  {compressionProgress > 0 ? `${compressionProgress}%` : ""}
                </div>
              </div>
              <span className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                {isCompressing
                  ? "Otimizando imagens..."
                  : "Enviando para o servidor..."}
              </span>
            </div>
          ) : (
            <label
              htmlFor={fileInputId.current}
              className="group flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-900/5 transition-all cursor-pointer bg-white dark:bg-gray-950"
            >
              <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-900 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-all duration-300">
                <ImageIcon className="w-7 h-7 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Clique para selecionar fotos
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Arraste e solte até {maxImages} imagens aqui
                </p>
              </div>
              <div className="mt-4">
                <span className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white text-xs font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95">
                  <Camera className="w-4 h-4 mr-2" />
                  Selecionar Fotos
                </span>
              </div>
            </label>
          )}
        </div>
      )}

      {/* Barra de Progresso de Carregamento (quando já tem imagens) */}
      {currentImages.length > 0 && (isUploading || isCompressing) && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-50/50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 animate-pulse">
          <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
          <span className="text-xs font-medium text-primary-700 dark:text-primary-400">
            {isCompressing
              ? `Otimizando novas fotos... ${compressionProgress}%`
              : "Subindo fotos selecionadas..."}
          </span>
        </div>
      )}

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
