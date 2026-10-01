"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  MapPin,
  Megaphone,
  MessageCircle,
  Send,
  Tag,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProVerifiedBadge } from "@/components/ui/ProVerifiedBadge";

interface ClassifiedAdDetailModalProps {
  ad: any | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  onToggleLike: () => void;
  isLikePending?: boolean;
  onCommentsCountChange: (change: number) => void;
  focusCommentInput?: boolean;
}

interface ClassifiedComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    full_name?: string | null;
    avatar_url?: string | null;
    profile_photo_url?: string | null;
  } | null;
}

function parseImages(imagesValue: unknown): string[] {
  if (Array.isArray(imagesValue)) return imagesValue;
  if (typeof imagesValue !== "string") return [];

  try {
    const parsedImages = JSON.parse(imagesValue);
    return Array.isArray(parsedImages) ? parsedImages : [];
  } catch {
    return [];
  }
}

function relativeTime(iso?: string): string {
  if (!iso) return "";

  return formatDistanceToNow(new Date(iso), {
    addSuffix: true,
    locale: ptBR,
  });
}

export function ClassifiedAdDetailModal({
  ad,
  isOpen,
  onOpenChange,
  isLiked,
  likesCount,
  commentsCount,
  onToggleLike,
  isLikePending = false,
  onCommentsCountChange,
  focusCommentInput = false,
}: ClassifiedAdDetailModalProps) {
  const { user } = useAuthContext();
  const { openChat } = useFloatingChat();
  const queryClient = useQueryClient();
  const commentLock = useRef(false);
  const deleteLocks = useRef(new Set<string>());
  const activeAdId = useRef(ad?.id);
  activeAdId.current = ad?.id;
  const {
    data: commentPages,
    error: queryError,
    isLoading: isLoadingComments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["classified-comments", ad?.id, user?.id],
    enabled: isOpen && Boolean(ad?.id),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase
        .from("classified_ad_comments")
        .select(
          "id, user_id, content, created_at, user:profiles!classified_ad_comments_user_id_fkey(full_name, avatar_url, profile_photo_url)",
        )
        .eq("ad_id", ad.id)
        .order("created_at", { ascending: true })
        .order("id")
        .range(pageParam * 20, pageParam * 20 + 19);
      if (error) throw error;
      return (data || []) as ClassifiedComment[];
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 20 ? pages.length : undefined,
    retry: 1,
    staleTime: 30000,
  });
  const comments = commentPages?.pages.flat() || [];
  const commentsError = queryError
    ? "Não foi possível carregar os comentários agora. Tente novamente mais tarde."
    : null;
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = parseImages(ad?.images);
  const isOffer = ad?.ad_type === "oferecer";
  const isOwner = user?.id === ad?.user_id;
  const locationLabel = [ad?.location_city, ad?.location_state]
    .filter(Boolean)
    .join(" - ");
  const priceLabel = ad?.price_range
    ? isOffer
      ? "A partir de R$ " + ad.price_range
      : "Tenho até R$ " + ad.price_range
    : null;

  useEffect(() => {
    if (!isOpen || !ad) return;

    setCurrentImageIndex(0);
    setCommentText("");
  }, [isOpen, ad?.id]);

  const handleContact = () => {
    if (!user) {
      toast.info("Faça login para conversar com o anunciante");
      return;
    }

    if (isOwner) {
      toast.info("Este é o seu próprio anúncio");
      return;
    }

    openChat(ad.user_id, ad.user_name || "Usuário");
    onOpenChange(false);
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.info("Faça login para comentar em anúncios");
      return;
    }

    const content = commentText.trim();
    if (!content || content.length > 1000 || !ad || commentLock.current) return;

    commentLock.current = true;
    setIsSubmittingComment(true);
    const submittedAdId = ad.id;
    try {
      const { error } = await supabase.from("classified_ad_comments").insert({
        ad_id: ad.id,
        user_id: user.id,
        content,
      });

      if (error) throw error;
      if (activeAdId.current === submittedAdId) {
        setCommentText((current) =>
          current.trim() === content ? "" : current,
        );
        onCommentsCountChange(1);
      }
      await queryClient.invalidateQueries({
        queryKey: ["classified-comments", submittedAdId],
      });
    } catch {
      toast.error(
        "Não foi possível publicar o comentário. Seu texto foi mantido para tentar novamente.",
      );
    } finally {
      commentLock.current = false;
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || deleteLocks.current.has(commentId)) return;
    deleteLocks.current.add(commentId);
    const deletedAdId = ad.id;

    try {
      const { data, error } = await supabase
        .from("classified_ad_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id)
        .select("id");

      if (error) {
        throw error;
      }

      if (data?.length && activeAdId.current === deletedAdId)
        onCommentsCountChange(-1);
      await queryClient.invalidateQueries({
        queryKey: ["classified-comments", deletedAdId],
      });
    } catch {
      toast.error("Não foi possível remover o comentário. Tente novamente.");
    } finally {
      deleteLocks.current.delete(commentId);
    }
  };

  if (!ad) return null;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      fullContent
      title={ad.title}
      className="max-w-3xl"
      showHeaderBorder={false}
    >
      <div className="flex min-h-full flex-col">
        <header className="flex items-start gap-3 border-b border-[var(--cl-border)] px-4 py-4 pr-14 sm:px-6">
          <Link href={"/perfil/" + ad.user_id} className="shrink-0">
            <Avatar className="h-12 w-12 border border-[var(--cl-border)]">
              <AvatarImage
                src={ad.user_avatar || ad.user_avatar_url || ""}
                alt={ad.user_name || "Usuário"}
              />
              <AvatarFallback className="bg-[var(--cl-mist)] font-bold uppercase text-[var(--cl-ink)]">
                {(ad.user_name || "U").charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              href={"/perfil/" + ad.user_id}
              className="flex min-w-0 items-center gap-1.5"
            >
              <span className="truncate text-[16px] font-semibold text-[var(--cl-ink)] hover:underline">
                {ad.user_name}
              </span>
              <ProVerifiedBadge
                isVerified={ad.user_profile?.is_verified}
                isPro={ad.user_profile?.is_pro}
                proExpiresAt={ad.user_profile?.pro_expires_at}
                iconSize={2.5}
              />
            </Link>
            <p className="mt-0.5 truncate text-[13px] text-[var(--cl-ink-secondary)]">
              {isOffer ? ad.category || "Profissional" : "Pedido de serviço"}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--cl-ink-muted)]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{locationLabel}</span>
              <span className="opacity-60">·</span>
              <Clock3 className="h-3.5 w-3.5 shrink-0" />
              <span className="shrink-0">{relativeTime(ad.created_at)}</span>
            </p>
          </div>

          <span
            className={cn(
              "mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              isOffer
                ? "bg-[var(--cl-service-bg)] text-[var(--cl-service)]"
                : "bg-[var(--cl-request-bg)] text-[var(--cl-request)]",
            )}
          >
            {isOffer ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Megaphone className="h-3.5 w-3.5" />
            )}
            {isOffer ? "Serviço" : "Pedido"}
          </span>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
          {images.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-[var(--cl-mist)]">
              <img
                src={images[currentImageIndex]}
                alt={ad.title + " - Foto " + (currentImageIndex + 1).toString()}
                className="max-h-[48dvh] min-h-[220px] w-full object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentImageIndex((current) =>
                        current === 0 ? images.length - 1 : current - 1,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-1.5 text-white"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentImageIndex(
                        (current) => (current + 1) % images.length,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-1.5 text-white"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
                    {currentImageIndex + 1} de {images.length}
                  </span>
                </>
              )}
            </div>
          )}

          <section>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="max-w-xl text-[22px] font-bold leading-tight text-[var(--cl-ink)] sm:text-[26px]">
                {ad.title}
              </h2>
              {priceLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cl-mist)] px-3 py-1.5 text-sm font-semibold text-[var(--cl-ink)]">
                  <Tag className="h-4 w-4 text-[var(--cl-ink-muted)]" />
                  {priceLabel}
                </span>
              )}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--cl-ink-secondary)]">
              {ad.description}
            </p>
          </section>

          <section className="border-y border-[var(--cl-border)] py-3">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={onToggleLike}
                disabled={isLikePending}
                className={cn(
                  "inline-flex items-center gap-2 text-sm font-medium transition-colors",
                  isLiked
                    ? "text-[var(--cl-heart)]"
                    : "text-[var(--cl-ink-secondary)] hover:text-[var(--cl-heart)]",
                )}
                aria-label={isLiked ? "Remover curtida" : "Curtir anúncio"}
                aria-pressed={isLiked}
              >
                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                {likesCount} curtidas
              </button>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--cl-ink-secondary)]">
                <MessageCircle className="h-5 w-5" />
                {commentsCount} comentários
              </span>
            </div>
          </section>

          <section aria-labelledby="comments-title">
            <div className="mb-3 flex items-center justify-between">
              <h3
                id="comments-title"
                className="text-base font-semibold text-[var(--cl-ink)]"
              >
                Comentários
              </h3>
              {isLoadingComments && (
                <span className="text-xs text-[var(--cl-ink-muted)]">
                  Carregando…
                </span>
              )}
            </div>

            {commentsError ? (
              <p className="rounded-xl bg-[var(--cl-mist)] px-3 py-2 text-sm text-[var(--cl-ink-secondary)]">
                {commentsError}
              </p>
            ) : comments.length === 0 && !isLoadingComments ? (
              <p className="text-sm text-[var(--cl-ink-muted)]">
                Seja a primeira pessoa a comentar.
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <article key={comment.id} className="flex gap-2.5">
                    <Avatar className="mt-0.5 h-8 w-8">
                      <AvatarImage
                        src={
                          comment.user?.avatar_url ||
                          comment.user?.profile_photo_url ||
                          ""
                        }
                        alt={comment.user?.full_name || "Usuário"}
                      />
                      <AvatarFallback className="bg-[var(--cl-mist)] text-xs font-semibold text-[var(--cl-ink)]">
                        {(comment.user?.full_name || "U").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="rounded-2xl bg-[var(--cl-mist)] px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-semibold text-[var(--cl-ink)]">
                            {comment.user?.full_name || "Usuário"}
                          </span>
                          <span className="shrink-0 text-[11px] text-[var(--cl-ink-muted)]">
                            {relativeTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--cl-ink-secondary)]">
                          {comment.content}
                        </p>
                      </div>
                      {user?.id === comment.user_id && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteComment(comment.id)}
                          className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--cl-ink-muted)] hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                          Excluir
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
          {hasNextPage && (
            <Button
              type="button"
              variant="outline"
              disabled={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
              className="w-full"
            >
              {isFetchingNextPage ? "Carregando…" : "Carregar mais comentários"}
            </Button>
          )}
        </div>

        <footer className="border-t border-[var(--cl-border)] bg-[var(--cl-surface)] px-4 py-3 sm:px-6">
          <div className="flex items-end gap-2">
            <Textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder={
                user ? "Escreva um comentário…" : "Entre para comentar"
              }
              disabled={!user || isSubmittingComment || Boolean(commentsError)}
              autoFocus={focusCommentInput}
              maxLength={1000}
              className="min-h-10 max-h-24 resize-none rounded-xl border-[var(--cl-border)] bg-[var(--cl-paper)] px-3 py-2 text-sm text-[var(--cl-ink)] placeholder:text-[var(--cl-ink-muted)]"
            />
            <Button
              type="button"
              size="icon"
              onClick={() => void handleSubmitComment()}
              disabled={
                !user ||
                !commentText.trim() ||
                isSubmittingComment ||
                Boolean(commentsError)
              }
              className="mb-0.5 h-10 w-10 shrink-0 rounded-xl bg-[var(--cl-cta)] text-[var(--cl-on-cta)] hover:brightness-110"
              aria-label="Publicar comentário"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="button"
            onClick={handleContact}
            disabled={isOwner}
            className="mt-3 w-full rounded-xl bg-[var(--cl-cta)] text-[var(--cl-on-cta)] hover:brightness-110"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {isOwner ? "Este é o seu anúncio" : "Conversar com anunciante"}
          </Button>
        </footer>
      </div>
    </ResponsiveModal>
  );
}
