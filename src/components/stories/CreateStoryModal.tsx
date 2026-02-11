"use client";

import { useState, useRef } from "react";
import { X, Camera, Upload, Loader2 } from "lucide-react";
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo - APENAS imagens, SEM vídeos
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem (foto)");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 10MB");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Armazenar o arquivo e criar preview (aceita qualquer resolução/orientação)
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.onerror = () => {
      toast.error("Erro ao carregar a imagem");
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedImage || !selectedFile || !user?.id) {
      console.error("❌ Erro: dados incompletos", {
        hasImage: !!selectedImage,
        hasFile: !!selectedFile,
        hasUserId: !!user?.id,
      });
      toast.error(
        "Erro: dados incompletos. Por favor, selecione a foto novamente.",
      );
      return;
    }

    const file = selectedFile;

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
      setSelectedImage(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
        {!selectedImage ? (
          <div className="space-y-4">
            <label
              htmlFor="story-upload"
              className="group flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50/30 dark:hover:bg-primary-900/5 transition-all cursor-pointer bg-white dark:bg-gray-950"
            >
              <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-all duration-300">
                <Camera className="h-10 w-10 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Clique para selecionar uma foto
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  PNG, JPG ou WEBP até 10MB
                </p>
              </div>
              <div className="mt-6">
                <span className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white text-xs font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95">
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Foto
                </span>
              </div>
            </label>

            <input
              id="story-upload"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative group w-full max-h-[600px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
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
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
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
