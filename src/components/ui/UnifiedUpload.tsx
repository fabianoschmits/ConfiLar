"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  UploadCloud,
  FileText,
  X,
  Camera,
  AlertCircle,
  Loader2,
  ImagePlus,
} from "lucide-react";
import { Button } from "./button";
import { LoadingButton } from "./LoadingButton";
import { useImageCompression } from "@/hooks/useImageCompression";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UnifiedUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  maxFiles?: number;
  accept?: string;
  title?: string;
  description?: string;
  subDescription?: string;
  className?: string;
  multiple?: boolean;
  isLoading?: boolean;
  maxSizeMB?: number;
  compressOptions?: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
  };
  existingUrls?: string[];
  onRemoveExisting?: (index: number) => void;
}

export function UnifiedUpload({
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  maxFiles = 5,
  accept = "image/*,.pdf",
  title = "Clique para enviar seus arquivos",
  description = "Arraste e solte ou clique para selecionar",
  subDescription = "JPG, PNG ou PDF até 5MB",
  className = "",
  multiple = true,
  isLoading = false,
  maxSizeMB = 5,
  compressOptions,
  existingUrls = [],
  onRemoveExisting,
}: UnifiedUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { compressImage, isCompressing, compressionProgress } =
    useImageCompression();
  const [previews, setPreviews] = useState<string[]>([]);

  // Gerar e limpar URLs de preview
  React.useEffect(() => {
    const urls = selectedFiles.map((file) =>
      file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    );
    setPreviews(urls);

    return () => urls.forEach((url) => url && URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileList = Array.from(files);

      if (fileList.length === 0) return;

      if (!multiple && fileList.length > 1) {
        toast.error("Selecione apenas um arquivo.");
        return;
      }

      if (selectedFiles.length + fileList.length > maxFiles) {
        toast.error(`Você pode selecionar no máximo ${maxFiles} arquivos.`);
        return;
      }

      const { validateImageFile } = await import("@/lib/fileValidation");
      const processedFiles: File[] = [];

      for (const file of fileList) {
        // Validate size before compression
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(
            `O arquivo ${file.name} excede o limite de ${maxSizeMB}MB.`,
          );
          continue;
        }

        if (file.type.startsWith("image/")) {
          try {
            // Comprehensive validation
            const validation = await validateImageFile(file, {
              maxSizeMB,
              validateMagicBytes: true,
            });

            if (!validation.valid) {
              toast.error(`${file.name}: ${validation.error}`);
              continue;
            }

            // Compress if it's an image
            const compressed = await compressImage(file, {
              maxSizeMB: compressOptions?.maxSizeMB || 0.8,
              maxWidthOrHeight: compressOptions?.maxWidthOrHeight || 1080,
            });

            processedFiles.push(compressed);
          } catch (error) {
            console.error("Error processing image:", error);
            processedFiles.push(file); // Fallback to original if compression fails
          }
        } else {
          // For non-images (like PDFs), just add them if they passed size check
          processedFiles.push(file);
        }
      }

      if (processedFiles.length > 0) {
        onFilesSelected(processedFiles);
      }
    },
    [
      multiple,
      selectedFiles.length,
      maxFiles,
      maxSizeMB,
      compressOptions,
      compressImage,
      onFilesSelected,
    ],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
          dragActive
            ? "border-blue-500 bg-[var(--cl-mist)]/50 dark:bg-blue-900/20"
            : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 hover:border-blue-400 dark:hover:border-blue-500",
          isLoading || isCompressing ? "opacity-50 cursor-not-allowed" : "",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple={multiple}
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
          disabled={isLoading || isCompressing}
        />

        <div className="flex flex-col items-center">
          {selectedFiles.length > 0 || existingUrls.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 w-full mb-6">
              {/* Imagens Existentes */}
              {existingUrls.map((url, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm transition-transform hover:scale-[1.02]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={url}
                    alt={`Existing ${index}`}
                    className="w-full h-full object-cover"
                  />
                  {onRemoveExisting && (
                    <button
                      type="button"
                      onClick={() => onRemoveExisting(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-3 h-3" strokeWidth={3} />
                    </button>
                  )}
                </div>
              ))}

              {/* Novos Arquivos Selecionados */}
              {selectedFiles.map((file, index) => (
                <div
                  key={`new-${file.name}-${index}`}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm transition-transform hover:scale-[1.02]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {file.type.startsWith("image/") ? (
                    <img
                      src={previews[index]}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--cl-mist)] dark:bg-blue-900/20 p-2">
                      <FileText className="w-6 h-6 text-blue-500 mb-1" />
                      <span className="text-[10px] font-medium text-gray-500 truncate w-full text-center px-1">
                        {file.name}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="w-3 h-3" strokeWidth={3} />
                  </button>
                </div>
              ))}

              {/* Botão de Adicionar mais */}
              {selectedFiles.length + existingUrls.length < maxFiles && (
                <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-white/50 dark:bg-gray-800/50">
                  <ImagePlus className="w-6 h-6 text-gray-400" />
                  <span className="text-[10px] font-medium text-gray-400 mt-1">
                    Adicionar
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              className={cn(
                "w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mb-4 transition-transform ring-1",
                dragActive
                  ? "scale-110 bg-blue-100 dark:bg-blue-900/40 ring-blue-200 dark:ring-blue-800"
                  : "bg-white dark:bg-gray-800 ring-gray-100 dark:ring-gray-700",
              )}
            >
              {isCompressing ? (
                <div className="relative">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--cl-teal)]">
                    {compressionProgress}%
                  </span>
                </div>
              ) : (
                <UploadCloud
                  className={cn(
                    "w-8 h-8",
                    dragActive ? "text-[var(--cl-teal)]" : "text-blue-500",
                  )}
                />
              )}
            </div>
          )}

          <div className="space-y-1">
            <p className="text-base font-bold text-gray-900 dark:text-white">
              {isCompressing
                ? "Otimizando arquivos..."
                : selectedFiles.length > 0 || existingUrls.length > 0
                  ? "Arraste ou clique para adicionar mais fotos"
                  : title}
            </p>
            {selectedFiles.length === 0 && existingUrls.length === 0 && (
              <>
                <p className="text-sm text-gray-500">{description}</p>
                <p className="text-xs text-gray-400 mt-2">{subDescription}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
