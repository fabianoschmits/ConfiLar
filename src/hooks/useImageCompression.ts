import { useState } from "react";
import imageCompression from "browser-image-compression";

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

interface UseImageCompressionReturn {
  compressImage: (file: File, options?: CompressionOptions) => Promise<File>;
  isCompressing: boolean;
  compressionProgress: number;
}

export function useImageCompression(): UseImageCompressionReturn {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const compressImage = async (
    file: File,
    options: CompressionOptions = {},
  ): Promise<File> => {
    setIsCompressing(true);
    setCompressionProgress(0);

    try {
      const defaultOptions = {
        maxSizeMB: 1, // 1MB máximo
        maxWidthOrHeight: 1080, // 1080px máximo
        useWebWorker: true,
        ...options,
      };

      const compressedFile = await imageCompression(file, {
        ...defaultOptions,
        onProgress: (progress) => {
          setCompressionProgress(Math.round(progress));
        },
      });

      console.log("Imagem comprimida:", {
        original: {
          size: file.size,
          name: file.name,
          type: file.type,
        },
        compressed: {
          size: compressedFile.size,
          name: compressedFile.name,
          type: compressedFile.type,
        },
        compressionRatio: Math.round(
          (1 - compressedFile.size / file.size) * 100,
        ),
      });

      return compressedFile;
    } catch (error) {
      console.error("Erro ao comprimir imagem:", error);
      throw error;
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  return {
    compressImage,
    isCompressing,
    compressionProgress,
  };
}
