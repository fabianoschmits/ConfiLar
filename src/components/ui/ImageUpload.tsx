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
  onImageUploaded?: (url: string) => void;
  currentImageUrl?: string | null;
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
  bucket = "avatars",
  folder = "avatars",
  maxSize = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  title = "Upload de Imagem",
  description = "Clique para selecionar ou arraste uma imagem",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuthContext();
  const { compressImage, isCompressing, compressionProgress } =
    useImageCompression();

  const handleFileSelect = async (file: File) => {
    if (!profile?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    // ⚠️ SEGURANÇA: Validação completa de arquivo (tipo, tamanho e magic bytes)
    const { validateImageFile } = await import("@/lib/fileValidation");
    const validation = await validateImageFile(file, {
      allowedTypes: acceptedTypes,
      maxSizeMB: maxSize,
      validateMagicBytes: true,
    });

    if (!validation.valid) {
      toast.error(validation.error || "Arquivo inválido");
      return;
    }

    setIsUploading(true);

    try {
      // Comprimir imagem antes do upload
      console.log("🗜️ Comprimindo imagem...");
      const compressedFile = await compressImage(file, {
        maxSizeMB: 0.5, // 500KB máximo para avatares
        maxWidthOrHeight: 512, // 512px máximo
        useWebWorker: true,
      });

      console.log("✅ Imagem comprimida:", {
        original: `${(file.size / 1024).toFixed(1)}KB`,
        compressed: `${(compressedFile.size / 1024).toFixed(1)}KB`,
        reduction: `${Math.round((1 - compressedFile.size / file.size) * 100)}%`,
      });

      // Gerar nome único para o arquivo
      const fileExtension = compressedFile.name.split(".").pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExtension}`;

      console.log("🚀 Iniciando upload...");
      console.log("📁 Bucket:", bucket);
      console.log("📄 Nome do arquivo:", fileName);
      console.log("👤 User ID:", profile.id);

      // Fazer upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, compressedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("❌ Erro no upload:", error);
        throw error;
      }

      console.log("✅ Upload realizado com sucesso:", data);

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log("🔗 URL pública:", publicUrl);

      // Atualizar preview
      setPreviewUrl(publicUrl);

      // Chamar callback se fornecido
      if (onImageUploaded) {
        onImageUploaded(publicUrl);
      }

      toast.success("Imagem comprimida e enviada com sucesso!");
    } catch (error) {
      console.error("💥 Erro no upload:", error);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    if (onImageUploaded) {
      onImageUploaded("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
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
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="mx-auto max-h-48 rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-600">
                Arraste uma imagem aqui ou{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 underline"
                  onClick={openFileDialog}
                >
                  clique para selecionar
                </button>
              </p>
              <p className="text-xs text-gray-500">
                Tipos aceitos: {acceptedTypes.join(", ")} | Máximo: {maxSize}MB
              </p>
            </div>
          )}
        </div>

        {/* Input de arquivo oculto */}
        <Input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Botão de upload */}
        {!previewUrl && (
          <Button
            type="button"
            onClick={openFileDialog}
            disabled={isUploading || isCompressing}
            className="w-full"
          >
            {isUploading || isCompressing ? (
              <>
                <div
                  className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                  style={{ animationDuration: "0.6s" }}
                />
                {isCompressing
                  ? `Comprimindo... ${compressionProgress}%`
                  : "Enviando..."}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Imagem
              </>
            )}
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
