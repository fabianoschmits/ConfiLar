"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Crown,
  Flame,
  Loader2,
  Coins,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuthContext } from "@/contexts/AuthContext";
import { useReactions, useReactionCounts } from "@/hooks/useReactions";
import { useComments } from "@/hooks/useComments";
import { useCommentsCount } from "@/hooks/useCommentsCount";
import { usePostShares } from "@/hooks/usePostShares";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProVerifiedBadge } from "@/components/ui/ProVerifiedBadge";
import { PostOptionsMenu } from "@/components/timeline/PostOptionsMenu";
import { PostMedia } from "@/components/timeline/PostMedia";
import { MentionText } from "@/components/ui/MentionText";
import { MentionInput } from "@/components/ui/MentionInput";
import { CommentOptionsMenu } from "@/components/timeline/CommentOptionsMenu";
import { SharePostModal } from "@/components/timeline/SharePostModal";
import { PremiumLikeButton } from "@/components/points/PremiumLikeButton";
import { LikedBy } from "@/components/timeline/LikedBy";
import { PremiumTimeRemaining } from "@/components/timeline/PremiumTimeRemaining";
import { GuestBlurOverlay } from "@/components/auth/GuestBlurOverlay";
import { detectYouTubeUrls, removeYouTubeUrls } from "@/utils/youtube";
import { getCategoryById } from "@/data/serviceCategories";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: any;
  onLike?: () => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onRenewPremium?: (postId: string) => void;
  isTrending?: boolean;
  isDeleting?: boolean;
  isHighlighted?: boolean;
}

export function PostCard({
  post,
  onLike,
  onEdit,
  onDelete,
  onRenewPremium,
  isTrending,
  isDeleting = false,
  isHighlighted = false,
}: PostCardProps) {
  const t = useTranslations("feed");
  const { profile, user } = useAuthContext();
  const queryClient = useQueryClient();
  const [showFull, setShowFull] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isPremiumLiking, setIsPremiumLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Hook de reações (likes)
  const {
    addReaction,
    userReaction,
    isLoading: isReactionLoading,
  } = useReactions(post.id, post.user_id, post.user_name || "Usuário");

  // Hook para contagem de reações
  const { reactionCounts } = useReactionCounts(post.id);

  // Verificar se o usuário curtiu
  const isLikedByUser = userReaction === "like";
  const likesCount = reactionCounts.like || 0;

  // Hook de comentários
  const {
    comments,
    isLoading: commentsLoading,
    addComment,
    likeComment,
    editComment,
    deleteComment,
    isAddingComment,
    isLikingComment,
    isEditingComment,
    isDeletingComment,
  } = useComments({
    post_id: post.id,
    postOwnerId: post.user_id,
    postOwnerName: post.user_name || "Usuário",
  });

  // Hook para contagem de comentários
  const { count: commentsCount } = useCommentsCount(post.id);

  // Hook para contagem de compartilhamentos
  const { sharesCount } = usePostShares(post.id);

  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  // Função para curtir/descurtir
  const handleLikeClick = () => {
    setIsLiking(true);
    addReaction("like");
    if (onLike) onLike();

    if (!isLikedByUser) {
      toast.success("❤️ Post curtido!", {
        duration: 1500,
        position: "bottom-center",
      });
    }

    setTimeout(() => setIsLiking(false), 300);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isAddingComment) return;
    try {
      await addComment(newComment.trim());
      setNewComment("");
      toast.success("💬 Comentário publicado!", {
        duration: 2000,
        position: "bottom-center",
      });
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      toast.error("Erro ao adicionar comentário. Tente novamente.");
    }
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingComment(commentId);
    setEditCommentContent(currentContent);
  };

  const handleSaveEditComment = async () => {
    if (!editingComment || !editCommentContent.trim() || isEditingComment)
      return;
    try {
      await editComment(editingComment, editCommentContent.trim());
      setEditingComment(null);
      setEditCommentContent("");
      toast.success("✏️ Comentário atualizado!", {
        duration: 2000,
        position: "bottom-center",
      });
    } catch (error) {
      console.error("Erro ao editar comentário:", error);
      toast.error("Erro ao editar comentário. Tente novamente.");
    }
  };

  const handleCancelEditComment = () => {
    setEditingComment(null);
    setEditCommentContent("");
  };

  const handleDeleteComment = async (commentId: string) => {
    if (isDeletingComment) return;
    if (confirm("Tem certeza que deseja deletar este comentário?")) {
      try {
        await deleteComment(commentId);
        toast.success("🗑️ Comentário deletado!", {
          duration: 2000,
          position: "bottom-center",
        });
      } catch (error) {
        console.error("Erro ao deletar comentário:", error);
        toast.error("Erro ao deletar comentário. Tente novamente.");
      }
    }
  };

  const postUser = post.professional || post.user || {};
  const postImages = post.images || [];
  const youtubeVideoId = (post.metadata as any)?.youtube_video_id || null;
  const youtubeVideos = youtubeVideoId
    ? [
        {
          id: youtubeVideoId,
          url: (post.metadata as any)?.youtube_video_url || "",
          thumbnail: `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`,
        },
      ]
    : detectYouTubeUrls(post.description || "");
  const cleanDescription = removeYouTubeUrls(post.description || "");

  const userAvatar =
    postUser?.avatar_url ||
    post.user_avatar ||
    post.user_avatar_url ||
    post.professional?.avatar_url ||
    post.user?.avatar_url ||
    undefined;

  const userName =
    (postUser as any)?.full_name ||
    post.user_name ||
    (post.professional as any)?.full_name ||
    (post.user as any)?.full_name ||
    (post as any).metadata?.user ||
    "Usuário";

  const userId =
    postUser?.id ||
    post.user_id ||
    post.professional?.id ||
    post.user?.id ||
    "";

  const displayUserName = userName && userName !== "" ? userName : "Usuário";
  const displayText = cleanDescription || post.title || "";
  const shouldTruncate = displayText.length > 120;
  const finalDisplayText = showFull
    ? displayText
    : displayText.slice(0, 120) + (shouldTruncate ? "..." : "");

  const isPremium =
    post.is_premium ||
    post.tags?.includes("premium") ||
    post.metadata?.type === "premium";
  const premiumExpired = post.premium_expires_at
    ? new Date(post.premium_expires_at) < new Date()
    : false;
  const isActivePremium = isPremium && !premiumExpired;

  const isOwner = user?.id === userId;
  const serviceCategory = post.service_category_id
    ? getCategoryById(post.service_category_id)
    : null;
  const isGuest = !user;

  return (
    <article
      id={`post-${post.id}`}
      className={`social-post relative overflow-hidden border scroll-mt-24 ${
        isHighlighted
          ? "border-blue-400 dark:border-blue-700 z-10 shadow-lg shadow-blue-500/20"
          : isActivePremium
            ? "ring-2 ring-[var(--cl-teal)]/45 border-[var(--cl-teal)]/35 shadow-[0_12px_30px_-22px_rgba(0,176,176,0.5)] premium-border-shine"
            : "border-[var(--cl-border)]"
      }`}
    >
      {isHighlighted && (
        <div className="absolute inset-0 ring-4 ring-blue-500 dark:ring-blue-600 pointer-events-none z-10 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
      )}

      {isGuest && (
        <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-4 pb-2 border-b border-transparent pointer-events-none">
          <div className="flex items-center gap-3">
            <Link href={`/perfil/${userId}`} className="pointer-events-auto">
              <Avatar className="w-10 h-10 border-2 border-[var(--cl-border)] transition-transform hover:scale-105">
                <AvatarImage src={userAvatar} alt={displayUserName} />
                <AvatarFallback className="bg-[var(--cl-mist)] text-[var(--cl-ink)] font-semibold">
                  {displayUserName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Link href={`/perfil/${userId}`} className="pointer-events-auto">
              <p className="font-semibold text-base text-[var(--cl-ink)] hover:underline transition-all leading-none">
                {displayUserName}
              </p>
            </Link>
          </div>
        </div>
      )}

      <GuestBlurOverlay isGuest={isGuest} className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={`/perfil/${userId}`}>
              <Avatar className="w-10 h-10 border-2 border-[var(--cl-border)]">
                <AvatarImage src={userAvatar} alt={displayUserName} />
                <AvatarFallback className="bg-[var(--cl-mist)] text-[var(--cl-ink)] font-semibold">
                  {displayUserName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/perfil/${userId}`}>
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-sm text-[var(--cl-ink)]">
                    {displayUserName}
                  </p>
                  <ProVerifiedBadge
                    isVerified={(postUser as any)?.is_verified}
                    isPro={(postUser as any)?.is_pro}
                    proExpiresAt={(postUser as any)?.pro_expires_at}
                    iconSize={2.5}
                  />
                </div>
              </Link>
              <p className="text-xs text-[var(--cl-ink-muted)]">
                {post.location_city &&
                  post.location_city !== "null" &&
                  `${post.location_city}, ${post.location_state || ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {serviceCategory && (
              <Badge
                variant="secondary"
                className="text-[10px] font-medium px-2 py-0.5 rounded-full text-[var(--cl-ink-secondary)] bg-[var(--cl-mist)] hover:brightness-95 border-none items-center"
              >
                {serviceCategory.name}
              </Badge>
            )}
            {isActivePremium && (
              <Badge variant="premium" className="text-[10px] px-1.5 py-0.5">
                <Crown className="h-2.5 w-2.5 mr-1" />
                Premium
              </Badge>
            )}
            {isTrending && (
              <Badge className="bg-gradient-to-r from-warning-500 to-error-500 text-white border-0 text-[10px] px-1.5 py-0.5">
                <Flame className="h-2.5 w-2.5 mr-1" />
                Popular
              </Badge>
            )}
            <PostOptionsMenu
              postId={post.id}
              postUserId={userId}
              postTitle={post.title || post.description || "Post"}
              onEdit={(postId) => {
                if (onEdit) onEdit(postId);
              }}
              onDelete={(postId) => {
                if (onDelete) onDelete(postId);
              }}
              onRenewPremium={onRenewPremium}
              isDeleting={isDeleting}
              isPremium={isPremium}
              premiumExpired={premiumExpired}
            />
          </div>
        </div>

        {postImages.length > 0 || youtubeVideos.length > 0 || youtubeVideoId ? (
          <>
            <PostMedia
              images={postImages}
              youtubeVideoId={youtubeVideoId}
              onDoubleClick={handleLikeClick}
              isLiking={isLiking}
              isPremiumLiking={isPremiumLiking}
            />
            {finalDisplayText && (
              <div className="px-4 py-3">
                <p className="text-sm text-[var(--cl-ink)] whitespace-pre-wrap break-words leading-relaxed">
                  <MentionText text={finalDisplayText} />
                  {shouldTruncate && !showFull && (
                    <button
                      onClick={() => setShowFull(true)}
                      className="text-[var(--cl-ink-muted)] ml-1 font-medium hover:text-[var(--cl-ink)]"
                    >
                      mais
                    </button>
                  )}
                </p>
              </div>
            )}
          </>
        ) : (
          finalDisplayText && (
            <div className="px-4 py-4 relative">
              <p className="text-sm text-[var(--cl-ink)] whitespace-pre-wrap break-words leading-relaxed">
                {finalDisplayText}
                {shouldTruncate && !showFull && (
                  <button
                    onClick={() => setShowFull(true)}
                    className="text-[var(--cl-ink-muted)] ml-1 font-medium hover:text-[var(--cl-ink)]"
                  >
                    mais
                  </button>
                )}
              </p>
              {isLiking && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <Heart className="h-20 w-20 text-red-500 fill-red-500 animate-ping" />
                </div>
              )}
              {isPremiumLiking && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="relative h-20 w-20">
                    <Coins
                      className="h-20 w-20 absolute inset-0 text-[var(--cl-teal)] animate-ping"
                      style={{
                        fill: "currentColor",
                        stroke: "none",
                        zIndex: 1,
                      }}
                    />
                    <Coins
                      className="h-20 w-20 absolute inset-0 text-gray-700 dark:text-gray-300 animate-ping"
                      style={{
                        fill: "none",
                        stroke: "currentColor",
                        strokeWidth: 3,
                        zIndex: 2,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        )}

        <div className="social-post-actions px-4 py-2.5 border-t border-[var(--cl-border)]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLikeClick}
              disabled={isLiking || isReactionLoading}
              aria-label={isLikedByUser ? "Descurtir post" : "Curtir post"}
              className="min-h-[44px] min-w-[44px] p-2 transition-transform active:scale-125 disabled:opacity-50 flex items-center gap-1.5 rounded-lg hover:bg-[var(--cl-mist)]"
            >
              <Heart
                className={`h-5 w-5 transition-all ${
                  isLikedByUser
                    ? "text-red-500 fill-red-500"
                    : "text-[var(--cl-ink-secondary)]"
                }`}
              />
              <span className="text-sm text-[var(--cl-ink-secondary)] font-medium">
                {likesCount > 0 ? likesCount.toLocaleString("pt-BR") : "0"}
              </span>
            </button>

            <PremiumLikeButton
              postId={post.id}
              postCreatorId={userId}
              size="sm"
              showStats={false}
              onPremiumLikeClick={() => {
                setIsPremiumLiking(true);
                setTimeout(() => setIsPremiumLiking(false), 600);
              }}
            />

            <button
              onClick={() => setShowComments(!showComments)}
              aria-label={
                showComments ? "Ocultar comentários" : "Ver comentários"
              }
              aria-expanded={showComments}
              className="min-h-[44px] min-w-[44px] p-2 transition-transform active:scale-125 flex items-center gap-1.5 rounded-lg hover:bg-[var(--cl-mist)]"
            >
              <MessageCircle
                className={`h-5 w-5 transition-all ${
                  showComments
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-[var(--cl-ink-secondary)]"
                }`}
              />
              <span className="text-sm text-[var(--cl-ink-secondary)] font-medium">
                {(commentsCount ?? 0).toLocaleString("pt-BR")}
              </span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              aria-label="Compartilhar post"
              className="min-h-[44px] min-w-[44px] p-2 transition-transform active:scale-125 flex items-center gap-1.5 rounded-lg hover:bg-[var(--cl-mist)]"
            >
              <Share2 className="h-5 w-5 text-[var(--cl-ink-secondary)]" />
              <span className="text-sm text-[var(--cl-ink-secondary)] font-medium">
                {sharesCount > 0 ? sharesCount.toLocaleString("pt-BR") : "0"}
              </span>
            </button>
          </div>

          <LikedBy postId={post.id} likesCount={likesCount} />
        </div>

        {showComments && (
          <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-900 px-4 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {commentsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.slice(0, 10).map((comment: any) => (
                  <div key={comment.id} className="flex gap-2">
                    <Link
                      href={`/perfil/${comment.user?.id || comment.user_id}`}
                      className="block shrink-0"
                    >
                      <Avatar className="w-6 h-6 hover:opacity-80 transition-opacity cursor-pointer">
                        <AvatarImage src={comment.user?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {comment.user?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm">
                            <Link
                              href={`/perfil/${comment.user?.id || comment.user_id}`}
                              className="hover:underline"
                            >
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {comment.user?.full_name || "Usuário"}
                              </span>
                            </Link>{" "}
                            {editingComment === comment.id ? (
                              <div className="mt-2 space-y-2">
                                <MentionInput
                                  value={editCommentContent}
                                  onChange={(value) =>
                                    setEditCommentContent(value)
                                  }
                                  placeholder={t("editComment")}
                                  className="w-full bg-transparent text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 focus:border-primary-500 dark:focus:border-primary-400 outline-none pb-1"
                                  onKeyPress={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSaveEditComment();
                                    }
                                    if (e.key === "Escape") {
                                      handleCancelEditComment();
                                    }
                                  }}
                                  minHeight="40px"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleSaveEditComment}
                                    disabled={
                                      isEditingComment ||
                                      !editCommentContent.trim()
                                    }
                                    className="text-xs text-[var(--cl-teal)] dark:text-blue-400 font-semibold disabled:opacity-50"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={handleCancelEditComment}
                                    className="text-xs text-gray-500 dark:text-gray-400"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-700 dark:text-gray-300">
                                <MentionText text={comment.content} />
                              </span>
                            )}
                          </p>
                          {editingComment !== comment.id && (
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(
                                  comment.created_at,
                                ).toLocaleDateString("pt-BR", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </p>
                              <button
                                onClick={() => likeComment(comment.id)}
                                disabled={isLikingComment}
                                className={cn(
                                  "flex items-center gap-1 text-xs transition-all duration-200",
                                  comment.is_liked
                                    ? "text-red-500 hover:text-red-600"
                                    : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400",
                                )}
                              >
                                <Heart
                                  className={cn(
                                    "w-3.5 h-3.5 transition-all duration-300",
                                    comment.is_liked && "fill-current",
                                  )}
                                />
                                <span className="font-medium">
                                  {comment.likes_count || 0}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                        {editingComment !== comment.id && (
                          <CommentOptionsMenu
                            commentId={comment.id}
                            commentUserId={comment.user?.id || comment.user_id}
                            onEdit={() =>
                              handleEditComment(comment.id, comment.content)
                            }
                            onDelete={() => handleDeleteComment(comment.id)}
                            isDeleting={isDeletingComment}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {comments.length > 10 && (
                  <button className="text-xs text-gray-500 dark:text-gray-400">
                    Ver mais comentários
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                Nenhum comentário ainda. Seja o primeiro!
              </p>
            )}

            <div className="flex gap-2 items-start">
              {profile?.avatar_url && (
                <Avatar className="w-6 h-6 mt-1 flex-shrink-0">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    {profile.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1">
                <MentionInput
                  value={newComment}
                  onChange={(value) => setNewComment(value)}
                  placeholder={t("addComment")}
                  disabled={isAddingComment}
                  className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none border-b border-gray-200 dark:border-gray-800 focus:border-primary-500 dark:focus:border-primary-400 pb-1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  minHeight="48px"
                />
              </div>
            </div>
            {newComment.trim() && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddComment}
                  disabled={isAddingComment}
                  className="text-primary-600 dark:text-primary-400 font-semibold text-sm disabled:opacity-50"
                >
                  {isAddingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Publicar"
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        <SharePostModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          postId={post.id}
          postTitle={post.title || post.description || "Post"}
          onShareRecorded={() => {
            queryClient.invalidateQueries({
              queryKey: ["post-shares", post.id],
            });
          }}
        />

        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="social-post-timestamp">
              {new Date(post.created_at).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {isPremium && isOwner && post.premium_expires_at && (
              <>
                <span className="text-xs text-gray-400 dark:text-gray-600">
                  |
                </span>
                <PremiumTimeRemaining
                  expiresAt={post.premium_expires_at}
                  isOwner={isOwner}
                />
              </>
            )}
          </div>
        </div>
      </GuestBlurOverlay>
    </article>
  );
}
