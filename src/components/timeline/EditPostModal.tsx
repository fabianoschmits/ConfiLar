"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Info, AlertCircle, X } from "lucide-react";
import { ImageUploadFeed } from "@/components/ui/ImageUploadFeed";
import { ServiceAutocomplete } from "@/components/ui/ServiceAutocomplete";
import { MentionInput } from "@/components/ui/MentionInput";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/contexts/AuthContext";
import { detectYouTubeUrls, removeYouTubeUrls } from "@/utils/youtube";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    description: string;
    images: string[];
    service?: string;
  };
  onSave: (
    postId: string,
    updatedPost: {
      description: string;
      images: string[];
    },
  ) => Promise<void>;
}

export function EditPostModal({
  isOpen,
  onClose,
  post,
  onSave,
}: EditPostModalProps) {
  const { profile } = useAuthContext();
  const isProfessional = profile?.user_type === "professional";
  const [isLoading, setIsLoading] = useState(false);
  const [editedPost, setEditedPost] = useState({
    description: post.description || "",
    images: post.images || [],
    service: post.service || "",
  });
  const textareaWrapperRef = useRef<HTMLDivElement>(null);

  // Detectar vídeos do YouTube
  const youtubeVideos = detectYouTubeUrls(editedPost.description || "");
  const firstVideo = youtubeVideos.length > 0 ? youtubeVideos[0] : null;
  const hasMultipleVideos = youtubeVideos.length > 1;

  // Contador de caracteres
  const charCount = editedPost.description.length;
  const maxChars = 2200;

  // Ref para controlar se já processamos múltiplos vídeos
  const hasProcessedMultipleVideos = useRef(false);

  // Processar múltiplos vídeos
  useEffect(() => {
    if (
      hasMultipleVideos &&
      youtubeVideos.length > 1 &&
      !hasProcessedMultipleVideos.current
    ) {
      // Pegar apenas o primeiro vídeo
      const firstVideoUrl = youtubeVideos[0].url;

      // Remover todos os outros vídeos da descrição
      const otherVideoUrls = youtubeVideos.slice(1).map((v) => v.url);
      let cleanedDescription = editedPost.description;

      otherVideoUrls.forEach((videoUrl) => {
        // Escapar caracteres especiais da URL para usar em regex
        const escapedUrl = videoUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        cleanedDescription = cleanedDescription
          .replace(new RegExp(escapedUrl, "g"), "")
          .trim();
      });
      // Limpar espaços múltiplos e quebras de linha
      cleanedDescription = cleanedDescription.replace(/\s+/g, " ").trim();

      // Atualizar descrição apenas se mudou e ainda não processamos
      if (
        cleanedDescription !== editedPost.description &&
        cleanedDescription.length > 0
      ) {
        hasProcessedMultipleVideos.current = true;
        setEditedPost((prev) => ({ ...prev, description: cleanedDescription }));

        // Mostrar aviso apenas uma vez
        toast.warning(`${youtubeVideos.length - 1} vídeo(s) removido(s)`, {
          description:
            "Apenas um vídeo por post é permitido. Apenas o primeiro vídeo será mantido.",
        });
      }
    }

    // Resetar o flag se não há múltiplos vídeos
    if (!hasMultipleVideos) {
      hasProcessedMultipleVideos.current = false;
    }
  }, [hasMultipleVideos, youtubeVideos.length, editedPost.description]);

  // Atualizar o estado quando o post mudar
  useEffect(() => {
    setEditedPost({
      description: post.description || "",
      images: post.images || [],
      service: post.service || "",
    });
  }, [post]);

  // Scroll automático para manter campos visíveis no mobile quando teclado aparecer
  useEffect(() => {
    const wrapper = textareaWrapperRef.current;
    if (!wrapper) return;

    const handleFocusIn = () => {
      if (window.innerWidth < 768) {
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (activeElement && wrapper.contains(activeElement)) {
            activeElement.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "nearest",
            });
          }
        }, 300);
      }
    };

    wrapper.addEventListener("focusin", handleFocusIn);
    return () => wrapper.removeEventListener("focusin", handleFocusIn);
  }, []);

  const handleSave = async () => {
    if (!editedPost.description.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      // Remover URLs do YouTube da descrição antes de salvar
      const cleanedDescription = removeYouTubeUrls(
        editedPost.description.trim(),
      );

      await onSave(post.id, {
        description: cleanedDescription,
        images: editedPost.images,
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar post:", error);
      toast.error("Erro ao salvar post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
      fullContent={true}
      showCloseButton={false}
    >
      {/* HEADER FIXO */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black flex-shrink-0 z-10">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          disabled={isLoading}
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate px-2">
          Editar Post
        </h2>
        <LoadingButton
          onClick={handleSave}
          disabled={!editedPost.description.trim() || isLoading}
          isLoading={isLoading}
          size="sm"
          className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black min-w-[80px] transition-colors"
        >
          {isLoading ? "Salvando..." : "Salvar"}
        </LoadingButton>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-6">
        <div className="space-y-4" ref={textareaWrapperRef}>
          {/* DESCRIÇÃO COM CONTADOR */}
          <div className="relative">
            <MentionInput
              value={editedPost.description}
              onChange={(v) =>
                setEditedPost((prev) => ({ ...prev, description: v }))
              }
              placeholder={
                isProfessional
                  ? "Descreva o trabalho, materiais, tempo, desafios..."
                  : "Conte sua experiência, o que mais gostou..."
              }
              disabled={isLoading}
              className="pr-16 min-h-24 resize-none text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              minHeight="96px"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <span
                className={`text-xs ${charCount > maxChars * 0.9 ? "text-error-500" : "text-gray-400"}`}
              >
                {charCount}/{maxChars}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Info className="h-3 w-3 text-success-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Use @ para mencionar • Cole um link do YouTube para adicionar
                vídeo
              </p>
            </div>

            {/* Aviso sobre vídeos do YouTube */}
            {firstVideo && (
              <div className="mt-1.5 p-1.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                <div className="flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-primary-800 dark:text-primary-300 font-medium">
                      Vídeo do YouTube detectado
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">
                      O vídeo será exibido acima da descrição no post
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* IMAGENS - CARROSSEL GRANDE */}
        <div>
          <ImageUploadFeed
            currentImages={editedPost.images}
            onImagesUpload={(images) =>
              setEditedPost((prev) => ({ ...prev, images }))
            }
            maxImages={5}
            className="rounded-xl overflow-hidden"
          />
          {editedPost.images.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 text-center">
              {editedPost.images.length}/5 fotos • Arraste para reordenar
            </p>
          )}
        </div>

        {/* SERVIÇO */}
        <div className="pb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-1.5">
            Serviço{" "}
            <span className="text-gray-500 font-normal">(opcional)</span>
          </label>
          <ServiceAutocomplete
            value={editedPost.service}
            onChange={(v) => setEditedPost((prev) => ({ ...prev, service: v }))}
            placeholder="Selecione um serviço..."
            disabled={isLoading}
          />
        </div>
      </div>
    </ResponsiveModal>
  );
}
