"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import { useImageCompression } from "@/hooks/useImageCompression";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onImageUploaded?: (urls: string[]) => void;
  currentImageUrl?: string | string[] | null;
  multiple?: boolean;
  maxFiles?: number;
  bucket?: "avatars" | "service-images" | "feed-images";
  folder?: string;
  maxSize?: number; // em MB
  acceptedTypes?: string[];
  title?: string;
  description?: string;
}

export function ImageUpload({
  onImageUploaded,
  currentImageUrl,
  multiple = false,
  maxFiles = 5,
  bucket = "avatars",
  folder = "avatars",
  maxSize = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"],
  title = "Upload de Imagem",
  description = "Clique para selecionar ou arraste uma imagem",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    Array.isArray(currentImageUrl)
      ? currentImageUrl
      : currentImageUrl
        ? [currentImageUrl]
        : [],
  );
  const fileInputId = useRef(
    `image-upload-${Math.random().toString(36).substring(2, 9)}`,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuthContext();
  const { compressImage, isCompressing, compressionProgress } =
    useImageCompression();

  const handleFilesSelect = async (files: FileList) => {
    if (files.length === 0) return;

    if (!profile?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    if (previewUrls.length + files.length > (multiple ? maxFiles : 1)) {
      toast.error(
        `Você pode selecionar no máximo ${multiple ? maxFiles : 1} imagem(ns).`,
      );
      return;
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      const { validateImageFile } = await import("@/lib/fileValidation");

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // ⚠️ SEGURANÇA: Validação completa de arquivo (tipo, tamanho e magic bytes)
        const validation = await validateImageFile(file, {
          allowedTypes: acceptedTypes,
          maxSizeMB: maxSize,
          validateMagicBytes: true,
        });

        if (!validation.valid) {
          toast.error(validation.error || `Arquivo ${file.name} inválido`);
          continue;
        }

        // Comprimir imagem antes do upload
        const compressedFile = await compressImage(file, {
          maxSizeMB: bucket === "avatars" ? 0.3 : 0.8,
          maxWidthOrHeight: bucket === "avatars" ? 512 : 1200,
          useWebWorker: true,
        });

        // Gerar nome único para o arquivo
        const fileExtension = compressedFile.name.split(".").pop();
        const fileName = `${profile.id}/${Date.now()}-${i}.${fileExtension}`;

        // Fazer upload para o Supabase Storage
        const { error } = await supabase.storage
          .from(bucket)
          .upload(fileName, compressedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        // Obter URL pública da imagem
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      const allUrls = [...previewUrls, ...uploadedUrls];
      setPreviewUrls(allUrls);

      if (onImageUploaded) {
        onImageUploaded(allUrls);
      }

      toast.success(
        uploadedUrls.length > 1 ? "Imagens enviadas!" : "Imagem enviada!",
      );
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
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

    if (e.dataTransfer.files) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesSelect(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newUrls);
    if (onImageUploaded) {
      onImageUploaded(newUrls);
    }
  };

  const clearImages = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewUrls([]);
    if (onImageUploaded) {
      onImageUploaded([]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área de Upload */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {previewUrls.length > 0 ? (
            <div
              className={`grid gap-3 ${multiple ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}
            >
              {previewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md"
                >
                  <img
                    src={url}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 p-1 text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeImage(index);
                    }}
                  >
                    <X className="h-5 w-5" strokeWidth={3} />
                  </button>
                </div>
              ))}
              {multiple && previewUrls.length < maxFiles && (
                <label
                  htmlFor={fileInputId.current}
                  className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                    <Upload className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <span className="mt-2 text-[10px] font-medium text-gray-500 group-hover:text-primary-600">
                    Adicionar
                  </span>
                </label>
              )}
            </div>
          ) : (
            <label
              htmlFor={fileInputId.current}
              className="group flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-900/5 transition-all cursor-pointer bg-white dark:bg-gray-950"
            >
              <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-all duration-300">
                <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {description}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Tipos aceitos: JPEG, PNG, WEBP | Máximo: {maxSize}MB
                </p>
              </div>
              <div className="mt-6">
                <span className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white text-xs font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95">
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Imagem
                </span>
              </div>
            </label>
          )}
        </div>

        {/* Input de arquivo oculto */}
        <input
          id={fileInputId.current}
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Botão de upload/limpar */}
        {previewUrls.length > 0 && !multiple && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearImages}
            className="w-full"
          >
            Trocar Imagem
          </Button>
        )}

        {/* Informações adicionais */}
        <div className="text-xs text-gray-500">
          <p>
            • Tamanho máximo: <strong>{maxSize}MB</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
