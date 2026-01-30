"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Upload, X, Check, AlertCircle } from "lucide-react";
import { useImageCompression } from "@/hooks/useImageCompression";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUpload: (
    file: File,
  ) => Promise<{ data: string | null; error: { message: string } | null }>;
  className?: string;
}

export function AvatarUpload({
  currentAvatarUrl,
  onUpload,
  className,
}: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { compressImage, isCompressing, compressionProgress } =
    useImageCompression();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ⚠️ SEGURANÇA: Validação completa de arquivo (tipo, tamanho e magic bytes)
    const { validateImageFile } = await import("@/lib/fileValidation");
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const validation = await validateImageFile(file, {
      allowedTypes,
      maxSizeMB: 5,
      validateMagicBytes: true,
    });

    if (!validation.valid) {
      setUploadError(validation.error || "Arquivo inválido");
      return;
    }

    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Comprimir imagem
      console.log("🗜️ Comprimindo avatar...");
      const compressedFile = await compressImage(file, {
        maxSizeMB: 0.5, // 500KB máximo para avatares
        maxWidthOrHeight: 512, // 512px máximo
        useWebWorker: true,
      });

      console.log("✅ Avatar comprimido:", {
        original: `${(file.size / 1024).toFixed(1)}KB`,
        compressed: `${(compressedFile.size / 1024).toFixed(1)}KB`,
        reduction: `${Math.round((1 - compressedFile.size / file.size) * 100)}%`,
      });

      setSelectedFile(compressedFile);

      // Criar preview com arquivo comprimido
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Erro ao comprimir imagem:", error);
      setUploadError("Erro ao processar imagem. Tente novamente.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const result = await onUpload(selectedFile);

      if (result.error) {
        setUploadError(result.error.message);
      } else {
        setUploadSuccess(true);
        // Limpar arquivo selecionado após sucesso
        setTimeout(() => {
          setSelectedFile(null);
          setPreviewUrl(null);
          setUploadSuccess(false);
        }, 2000);
      }
    } catch (error) {
      setUploadError("Erro inesperado no upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Avatar Atual */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <UserAvatar
            src={currentAvatarUrl}
            alt="Avatar atual"
            fallback="U"
            size="lg"
          />
          {uploadSuccess && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white border-2 border-black rounded-full p-1">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>

        <p className="text-sm text-black font-bold text-center">AVATAR ATUAL</p>
      </div>

      {/* Upload de Novo Avatar */}
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!selectedFile ? (
          <Button
            onClick={handleClickUpload}
            className="w-full bg-blue-500 text-white border-2 border-black hover:bg-blue-600 font-black"
            disabled={isUploading || isCompressing}
          >
            <Upload className="w-4 h-4 mr-2" />
            SELECIONAR NOVA FOTO
          </Button>
        ) : (
          <div className="space-y-3">
            {/* Preview */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <img
                  src={previewUrl!}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-black"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 p-1 text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  title="Remover"
                >
                  <X className="h-5 w-5" strokeWidth={3} />
                </button>
              </div>
              <p className="text-xs text-black font-bold text-center">
                {selectedFile.name.toUpperCase()}
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="flex space-x-2">
              <Button
                onClick={handleUpload}
                className="flex-1 bg-green-500 text-white border-2 border-black hover:bg-green-600 font-black"
                disabled={isUploading || isCompressing}
              >
                {isUploading || isCompressing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {isCompressing
                      ? `COMPRIMINDO... ${compressionProgress}%`
                      : "FAZENDO UPLOAD..."}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    SALVAR AVATAR
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mensagens de Status */}
      {uploadError && (
        <div className="flex items-center space-x-2 p-3 bg-red-500 border-2 border-black">
          <AlertCircle className="w-4 h-4 text-white" />
          <p className="text-sm text-white font-bold">
            {uploadError.toUpperCase()}
          </p>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center space-x-2 p-3 bg-green-500 border-2 border-black">
          <Check className="w-4 h-4 text-white" />
          <p className="text-sm text-white font-bold">
            AVATAR ATUALIZADO COM SUCESSO!
          </p>
        </div>
      )}

      {/* Informações */}
      <div className="text-xs text-black font-bold text-center space-y-1">
        <p>FORMATOS SUPORTADOS: JPEG, PNG, WEBP</p>
        <p>TAMANHO MÁXIMO: 5MB</p>
      </div>
    </div>
  );
}
