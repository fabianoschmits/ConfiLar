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
}: UnifiedUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { compressImage, isCompressing, compressionProgress } =
    useImageCompression();

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
              maxSizeMB: compressOptions?.maxSizeMB || 1,
              maxWidthOrHeight: compressOptions?.maxWidthOrHeight || 1200,
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
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
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
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-600">
                  {compressionProgress}%
                </span>
              </div>
            ) : (
              <UploadCloud
                className={cn(
                  "w-8 h-8",
                  dragActive ? "text-blue-600" : "text-blue-500",
                )}
              />
            )}
          </div>

          <p className="text-base font-bold text-gray-900 dark:text-white">
            {isCompressing ? "Otimizando arquivos..." : title}
          </p>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
          <p className="text-xs text-gray-400 mt-2">{subDescription}</p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Arquivos selecionados ({selectedFiles.length})
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    {file.type.startsWith("image/") ? (
                      <Camera className="w-4 h-4 text-blue-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
