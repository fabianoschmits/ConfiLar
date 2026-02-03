"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Sparkles,
  Share2,
} from "lucide-react";
import { useStories, StoryGroup } from "@/hooks/useStories";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStoryLikes } from "@/hooks/useStoryLikes";
import { FloatingLikes } from "@/components/stories/FloatingLikes";
import { ShareStoryModal } from "@/components/stories/ShareStoryModal";
import { useAuthContext } from "@/contexts/AuthContext";

interface StoryViewerProps {
  initialGroupIndex: number;
  initialStoryIndex: number;
  onClose: () => void;
}

const STORY_DURATION = 5000; // 5 segundos

export function StoryViewer({
  initialGroupIndex,
  initialStoryIndex,
  onClose,
}: StoryViewerProps) {
  const { storyGroups, viewStory } = useStories();
  const { user } = useAuthContext();
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const storyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const viewedStoryIdsRef = useRef<Set<string>>(new Set()); // Rastrear stories já visualizados nesta sessão
  const pausedTimeRef = useRef<number | null>(null); // Tempo quando foi pausado
  const startTimeRef = useRef<number>(0); // Tempo de início do story atual

  const currentGroup: StoryGroup | undefined = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];

  // Hook para likes do story atual - só chamar se tiver story válido
  const {
    toggleLike,
    givePremiumLike,
    isLiking,
    isPremiumLiking,
    isLiked,
    isPremiumLiked,
    likeCounts,
    likeUsers,
  } = useStoryLikes({
    storyId: currentStory?.id || "",
    storyOwnerId: currentGroup?.userId || "",
    storyOwnerName: currentGroup?.userName || "Usuário",
  });

  // Só mostrar likes flutuantes se houver likes
  const shouldShowFloatingLikes = likeUsers && likeUsers.length > 0;

  const goToNextStory = useCallback(() => {
    if (!currentGroup) return;

    // Limpar timers antes de mudar
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Próximo story do mesmo usuário
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
      return;
    }

    // Próximo usuário
    if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
      return;
    }

    // Fim dos stories, fechar
    try {
      onClose();
    } catch (error) {
      console.error("Erro ao fechar stories:", error);
    }
  }, [
    currentGroup,
    currentStoryIndex,
    currentGroupIndex,
    storyGroups.length,
    onClose,
  ]);

  const goToPreviousStory = useCallback(() => {
    // Limpar timers antes de mudar
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Story anterior do mesmo usuário
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
      return;
    }

    // Usuário anterior
    if (currentGroupIndex > 0) {
      const prevGroup = storyGroups[currentGroupIndex - 1];
      setCurrentGroupIndex(currentGroupIndex - 1);
      setCurrentStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
      return;
    }
  }, [currentStoryIndex, currentGroupIndex, storyGroups]);

  // Resetar progresso quando mudar de story
  useEffect(() => {
    if (!currentStory) return;

    // Limpar timers anteriores
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (storyTimeoutRef.current) {
      clearTimeout(storyTimeoutRef.current);
    }

    setProgress(0);

    // Registrar visualização (apenas uma vez por story)
    if (!viewedStoryIdsRef.current.has(currentStory.id)) {
      viewedStoryIdsRef.current.add(currentStory.id);
      try {
        viewStory(currentStory.id);
      } catch (err) {
        console.error("Erro ao registrar visualização:", err);
      }
    }

    // Iniciar progresso
    const startTime = Date.now();
    startTimeRef.current = startTime;
    pausedTimeRef.current = null;

    const updateProgress = () => {
      // Se estiver pausado ou modal aberto, não atualizar
      if (isPaused || showShareModal) {
        // Salvar o tempo quando pausar pela primeira vez
        if (pausedTimeRef.current === null && (isPaused || showShareModal)) {
          pausedTimeRef.current = Date.now();
        }
        return;
      }

      // Se estava pausado, ajustar o tempo de início
      if (pausedTimeRef.current !== null) {
        const pauseDuration = Date.now() - pausedTimeRef.current;
        startTimeRef.current = startTimeRef.current + pauseDuration;
        pausedTimeRef.current = null;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        goToNextStory();
      }
    };

    progressIntervalRef.current = setInterval(updateProgress, 16); // ~60fps para animação suave

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (storyTimeoutRef.current) {
        clearTimeout(storyTimeoutRef.current);
        storyTimeoutRef.current = null;
      }
    };
  }, [currentStory?.id, goToNextStory, isPaused, showShareModal]); // Adicionado isPaused e showShareModal

  // Handlers de toque para swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNextStory();
    } else if (isRightSwipe) {
      goToPreviousStory();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Handler de clique na tela (canto direito para próximo, esquerdo para anterior)
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Evitar navegação se clicar no header (botão X, avatar, etc) ou nos botões de ação
    const target = e.target as HTMLElement;
    if (
      target.closest(".story-header") ||
      target.closest(".story-actions") ||
      target.closest("button") ||
      target.closest("svg")
    ) {
      return;
    }

    const screenWidth = e.currentTarget.clientWidth;
    const clickX = e.clientX - e.currentTarget.getBoundingClientRect().left;

    // Se clicou no lado direito (últimos 30% da tela) - próximo
    if (clickX > screenWidth * 0.7) {
      goToNextStory();
    } else if (clickX < screenWidth * 0.3) {
      // Se clicou no lado esquerdo (primeiros 30% da tela) - anterior
      goToPreviousStory();
    }
    // Se clicou no meio (30% a 70%), não faz nada (permite pausar visualmente)
  };

  // Handler para abrir modal de compartilhamento
  const handleShare = () => {
    // Pausar o story
    setIsPaused(true);
    if (pausedTimeRef.current === null) {
      pausedTimeRef.current = Date.now();
    }
    setShowShareModal(true);
  };

  // Handler para fechar modal de compartilhamento
  const handleCloseShareModal = () => {
    setShowShareModal(false);
    // Retomar o story
    setIsPaused(false);
    // O pausedTimeRef será limpo automaticamente quando o updateProgress retomar
  };

  if (!currentStory || !currentGroup) {
    return null;
  }

  const timeAgo = formatDistanceToNow(new Date(currentStory.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div
      className="fixed inset-0 z-[100] bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleScreenClick}
    >
      {/* Header com barra de progresso e informações do usuário */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 story-header">
        {/* Container centralizado para desktop */}
        <div className="max-w-2xl mx-auto">
          {/* Barras de progresso */}
          <div className="flex gap-1 mb-4">
            {currentGroup.stories.map((story, index) => (
              <div
                key={story.id}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full bg-white transition-all duration-75 ${
                    index < currentStoryIndex
                      ? "w-full"
                      : index === currentStoryIndex
                        ? "w-full"
                        : "w-0"
                  }`}
                  style={{
                    width:
                      index < currentStoryIndex
                        ? "100%"
                        : index === currentStoryIndex
                          ? `${progress}%`
                          : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Informações do usuário */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 pl-2 md:pl-4">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={currentGroup.userAvatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                  {currentGroup.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold text-sm">
                  {currentGroup.userName}
                </p>
                <p className="text-white/70 text-xs">{timeAgo}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Imagem do story */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-center h-full">
          <img
            src={currentStory.image_url}
            alt={`Story de ${currentGroup.userName}`}
            className="max-w-full max-h-full w-auto h-full object-contain"
            style={{ aspectRatio: "9/16" }}
          />
        </div>
      </div>

      {/* Botões de navegação (apenas para desktop, invisíveis mas clicáveis) */}
      <button
        onClick={goToPreviousStory}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors opacity-0 md:opacity-100"
        aria-label="Story anterior"
      >
        <ChevronLeft className="h-8 w-8 text-white" />
      </button>
      <button
        onClick={goToNextStory}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors opacity-0 md:opacity-100"
        aria-label="Próximo story"
      >
        <ChevronRight className="h-8 w-8 text-white" />
      </button>

      {/* Botões de ação (Like, Like Premium, Compartilhar) */}
      {user && (
        <div className="absolute bottom-20 right-4 md:right-[calc((100vw-42rem)/2+1rem)] z-10 flex flex-col gap-3 story-actions">
          {/* Botão Like Normal */}
          <button
            onClick={toggleLike}
            disabled={isLiking}
            className={`relative flex flex-col items-center justify-center gap-1 bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all hover:bg-white/30 active:scale-95 disabled:opacity-50 ${
              isLiked ? "bg-red-500/30" : ""
            }`}
            title="Curtir story"
          >
            <Heart
              className={`h-6 w-6 ${
                isLiked ? "text-red-500 fill-red-500" : "text-white"
              } transition-all`}
            />
            {likeCounts.normal > 0 && (
              <span className="text-white text-xs font-bold">
                {likeCounts.normal > 999
                  ? `${Math.floor(likeCounts.normal / 1000)}k`
                  : likeCounts.normal}
              </span>
            )}
          </button>

          {/* Botão Like Premium */}
          <button
            onClick={givePremiumLike}
            disabled={isPremiumLiking}
            className="relative flex flex-col items-center justify-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-600 p-3 rounded-full transition-all hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Like Premium (5 pontos)"
          >
            <Sparkles className="h-6 w-6 text-white transition-all" />
            {likeCounts.premium > 0 && (
              <span className="text-white text-xs font-bold">
                {likeCounts.premium > 999
                  ? `${Math.floor(likeCounts.premium / 1000)}k`
                  : likeCounts.premium}
              </span>
            )}
          </button>

          {/* Botão Compartilhar */}
          <button
            onClick={handleShare}
            className="relative bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all hover:bg-white/30 active:scale-95"
            title="Compartilhar story"
          >
            <Share2 className="h-6 w-6 text-white" />
          </button>
        </div>
      )}

      {/* Modal de Compartilhamento */}
      {currentStory && currentGroup && (
        <ShareStoryModal
          isOpen={showShareModal}
          onClose={handleCloseShareModal}
          storyId={currentStory.id}
          userName={currentGroup.userName}
        />
      )}

      {/* Componente de Likes Flutuantes */}
      {shouldShowFloatingLikes && (
        <FloatingLikes likeUsers={likeUsers} isVisible={true} />
      )}
    </div>
  );
}
