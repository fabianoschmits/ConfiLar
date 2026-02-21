"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Plus,
  Search,
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  Flame,
  X,
  Send,
  Camera,
  Loader2,
  RefreshCw,
  Crown,
  Coins,
  MapPin,
} from "lucide-react";
import { useUnifiedTimeline } from "@/hooks/useUnifiedTimeline";
import { useTimelineRealtime } from "@/hooks/useTimelineRealtime";
import { usePostRanking } from "@/hooks/usePostRanking";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { NewPostForm } from "@/components/timeline/NewPostForm";
import { PremiumPostForm } from "@/components/timeline/PremiumPostForm";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { ProVerifiedBadge } from "@/components/ui/ProVerifiedBadge";
import { InstagramPostSkeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { UnifiedTimelineItem } from "@/types/timeline";
import { useComments } from "@/hooks/useComments";
import { SharePostModal } from "@/components/timeline/SharePostModal";
import { useReactions, useReactionCounts } from "@/hooks/useReactions";
import { PostOptionsMenu } from "@/components/timeline/PostOptionsMenu";
import { CommentOptionsMenu } from "@/components/timeline/CommentOptionsMenu";
import { EditPostModal } from "@/components/timeline/EditPostModal";
import { useCommentsCount } from "@/hooks/useCommentsCount";
import { cn } from "@/lib/utils";
import { PremiumLikeButton } from "@/components/points/PremiumLikeButton";
import { usePostShares } from "@/hooks/usePostShares";
import { useQueryClient } from "@tanstack/react-query";
import { LikedBy } from "@/components/timeline/LikedBy";
import { PostMedia } from "@/components/timeline/PostMedia";
import { detectYouTubeUrls, removeYouTubeUrls } from "@/utils/youtube";
import { PremiumTimeRemaining } from "@/components/timeline/PremiumTimeRemaining";
import { MentionText } from "@/components/ui/MentionText";
import { MentionInput } from "@/components/ui/MentionInput";
import { FeedSearchHeader } from "@/components/feed/FeedSearchHeader";
import { useFeedSearch } from "@/hooks/useFeedSearch";
import { supabase } from "@/lib/supabase";
import { LocationFilter } from "@/hooks/useLocationFilters";
import { usePremiumNotifications } from "@/hooks/usePremiumNotifications";
import { useStories } from "@/hooks/useStories";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { CreateStoryModal } from "@/components/stories/CreateStoryModal";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { getCategoryById } from "@/data/serviceCategories";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { useNavigationShortcuts } from "@/hooks/useKeyboardShortcuts";
import { GuestBlurOverlay } from "@/components/auth/GuestBlurOverlay";
import { useProfileCheck } from "@/hooks/useProfileCheck";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

export default function FeedPage() {
  const t = useTranslations("feed");
  const tCommon = useTranslations("common");
  const [mounted, setMounted] = useState(false);
  const { profile } = useAuthContext();
  const { openChat } = useFloatingChat();
  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightPostId = searchParams.get("post");

  // Hook de verificação de perfil para controle do modal de onboarding
  const { needsOnboarding, checkProfile } = useProfileCheck();

  const [activeTab, setActiveTab] = useState<"all" | "posts" | "notifications">(
    "posts",
  );

  // New Search Hook
  const { searchQuery, locationFilter, setSearchQuery, setLocationFilter } =
    useFeedSearch();

  const [showNewPost, setShowNewPost] = useState(false);
  const [showPremiumPost, setShowPremiumPost] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState<"idle" | "sending" | "sent">(
    "idle",
  );
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [selectedStoryGroupIndex, setSelectedStoryGroupIndex] = useState(0);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  // State for toggling search visibility
  const [showSearch, setShowSearch] = useState(false);

  const {
    storyGroups,
    isLoading: storiesLoading,
    refetch: refetchStories,
  } = useStories();

  // Atalhos de teclado para navegação
  useNavigationShortcuts();

  const {
    items,
    isLoading,
    error,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
    likePost,
    addPost,
    addPremiumPost,
    renewPremiumPost,
    editPost,
    deletePost,
    refetch,
  } = useUnifiedTimeline({
    search: searchQuery,
    location_filter: locationFilter,
    pinPostId: highlightPostId || undefined,
  });

  const [editingPost, setEditingPost] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [renewingPostId, setRenewingPostId] = useState<string | null>(null);
  const [showRenewPremiumModal, setShowRenewPremiumModal] = useState(false);

  const { containerRef, isPulling, isRefreshing, pullDistance } =
    usePullToRefresh({
      onRefresh: async () => {
        await refetch();
      },
    });

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: loadMore,
    threshold: 400,
  });

  useTimelineRealtime();

  // Verificar notificações premium automaticamente
  usePremiumNotifications();

  const { trendingPosts } = usePostRanking({
    location_city: profile?.location_city,
    location_state: profile?.location_state,
    limit: 5,
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (highlightPostId && mounted) {
      setTimeout(() => {
        const el = document.getElementById(`post-${highlightPostId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 800);
    }
  }, [highlightPostId, mounted]);

  const filteredItems = items.filter((item) => {
    if (activeTab === "posts") {
      // Incluir todos os posts (normais e premium)
      // Excluir apenas notificações automáticas (que têm metadata.type diferente de 'premium')
      if (item.type !== "post") return false;
      const metadataType = (item as any).metadata?.type;
      // Incluir posts sem metadata.type, posts premium, e excluir notificações automáticas
      return !metadataType || metadataType === "premium";
    }
    if (activeTab === "notifications") {
      return (
        item.type === "notification" ||
        ((item as any).metadata?.type &&
          (item as any).metadata?.type !== "premium")
      );
    }
    return true;
  });

  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleLike = (postId: string) => {
    likePost(postId);
    setLikedPosts((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const handleEditPost = (postId: string) => {
    const post = items.find(
      (item) => item.type === "post" && item.id === postId,
    );
    if (post) {
      setEditingPost(post);
      setShowEditModal(true);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setDeletingPostId(postId);
    try {
      await deletePost(postId);
      await refetch();
    } catch (error) {
      console.error("Erro ao deletar post:", error);
      toast.error("Erro ao deletar post. Tente novamente.");
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleCameraClick = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Tentar abrir câmera
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => {
          setShowNewPost(true);
        })
        .catch(() => {
          setShowNewPost(true);
        });
    } else {
      setShowNewPost(true);
    }
  };

  // Preparar lista de stories para exibição
  // Verificar se o usuário tem stories próprios
  const myStoryGroup = storyGroups.find(
    (group) => group.userId === profile?.id,
  );

  const displayStories = [
    // Stories de outros usuários
    ...storyGroups
      .filter((group) => group.userId !== profile?.id)
      .map((group) => ({
        id: group.userId,
        userId: group.userId,
        userName: group.userName,
        userAvatar: group.userAvatar,
        hasNew: group.hasNew,
        isVerified: group.isVerified,
        isPro: group.isPro,
        proExpiresAt: group.proExpiresAt,
        isMyStory: false,
        stories: group.stories,
      })),
  ];

  // Adicionar "Seu story" apenas se logado
  if (profile) {
    displayStories.unshift({
      id: "my-story",
      userId: profile.id,
      userName: "Seu story",
      userAvatar: profile.avatar_url || null,
      hasNew: false,
      isVerified: profile.is_verified,
      isPro: profile.is_pro,
      proExpiresAt: profile.pro_expires_at,
      isMyStory: true,
      stories: myStoryGroup?.stories || [],
    });
  }

  if (!mounted) return null;

  return (
    <MainLayout requireAuth={false}>
      {/* Modal de Onboarding integrado */}
      <OnboardingModal
        isOpen={needsOnboarding}
        onComplete={() => {
          checkProfile();
          refetch();
          router.push("/home"); // Redirecionar para Home após completar onboarding
        }}
      />

      {/* Story Viewer */}
      {showStoryViewer && (
        <StoryViewer
          initialGroupIndex={selectedStoryGroupIndex}
          initialStoryIndex={selectedStoryIndex}
          onClose={() => setShowStoryViewer(false)}
        />
      )}

      {/* Create Story Modal */}
      {showCreateStory && (
        <CreateStoryModal
          isOpen={showCreateStory}
          onClose={() => setShowCreateStory(false)}
          onStoryCreated={async () => {
            await refetchStories();
          }}
        />
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-black">
        {/* HEADER FIXO NOVO */}
        {/* HEADER QUE SOBE COM A PÁGINA */}
        <header className="bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-gray-900">
          <div className="max-w-2xl mx-auto">
            {/* Top Bar with Logo and Actions */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-black">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                ConfiLar
              </h1>
              <div className="flex items-center gap-2">
                {profile && (
                  <button
                    onClick={() => setShowNewPost(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
                    title={t("createPost")}
                  >
                    <Plus className="h-5 w-5 text-gray-900 dark:text-white" />
                  </button>
                )}
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={`p-2 rounded-full transition-colors ${
                    showSearch || searchQuery
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-900 dark:text-white"
                  }`}
                  title={t("title")} // Using translation key for search/title
                >
                  <Search className="h-5 w-5" />
                </button>
                {profile && (
                  <button
                    onClick={() => openChat()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors relative"
                  >
                    <MessageCircle className="h-5 w-5 text-gray-900 dark:text-white" />
                    {/* Chat badge placeholder if needed */}
                  </button>
                )}
              </div>
            </div>

            {/* Search & Filter Component - INTEGRATED */}
            {(showSearch || searchQuery) && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300 border-b border-gray-100 dark:border-gray-900">
                <FeedSearchHeader
                  currentSearch={searchQuery}
                  currentFilter={locationFilter}
                  onSearch={setSearchQuery}
                  onFilterChange={setLocationFilter}
                />
              </div>
            )}

            {/* Tabs */}
            <div className="flex px-4 pt-1">
              {(["all", "posts", "notifications"] as const)
                .filter((tab) => (profile ? true : tab !== "notifications"))
                .map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`mr-6 pb-2 border-b-2 transition-all font-medium text-sm capitalize ${
                      activeTab === tab
                        ? "border-brand text-gray-900 dark:text-white"
                        : "border-transparent text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {tab === "all"
                      ? t("all")
                      : tab === "posts"
                        ? t("posts")
                        : t("notifications")}
                  </button>
                ))}
            </div>
          </div>
        </header>

        {/* STORIES */}
        <div className="bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-gray-900">
          <div className="max-w-2xl mx-auto px-4 py-3">
            {storiesLoading ? (
              <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 min-w-[70px] flex-shrink-0"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse border-2 border-gray-300 dark:border-gray-700" />
                    </div>
                    <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                {displayStories.map((story, i) => (
                  <div
                    key={story.id}
                    className="flex flex-col items-center gap-2 min-w-[70px] flex-shrink-0"
                  >
                    <div className="relative">
                      {/* Avatar clicável - abre stories do usuário */}
                      <button
                        onClick={() => {
                          if (story.isMyStory) {
                            // Se for "Seu story", verificar se tem stories para ver
                            if (
                              myStoryGroup &&
                              myStoryGroup.stories.length > 0
                            ) {
                              // Encontrar o índice do grupo do usuário
                              const groupIndex = storyGroups.findIndex(
                                (g) => g.userId === profile?.id,
                              );
                              if (groupIndex !== -1) {
                                setSelectedStoryGroupIndex(groupIndex);
                                setSelectedStoryIndex(0);
                                setShowStoryViewer(true);
                              }
                            } else {
                              // Se não tem stories, abrir modal de criar
                              setShowCreateStory(true);
                            }
                          } else {
                            // Encontrar o índice do grupo na lista real
                            const groupIndex = storyGroups.findIndex(
                              (g) => g.userId === story.userId,
                            );
                            if (groupIndex !== -1) {
                              setSelectedStoryGroupIndex(groupIndex);
                              setSelectedStoryIndex(0);
                              setShowStoryViewer(true);
                            }
                          }
                        }}
                        className={`relative w-16 h-16 rounded-full p-0.5 block ${
                          story.hasNew
                            ? "bg-gradient-to-tr from-warning-400 via-error-500 to-primary-500"
                            : "bg-gray-300 dark:bg-gray-700"
                        }`}
                      >
                        <div className="w-full h-full rounded-full bg-gray-50 dark:bg-black p-0.5">
                          {story.userAvatar ? (
                            <img
                              src={story.userAvatar}
                              alt={story.userName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-900 flex items-center justify-center">
                              <span className="text-lg text-gray-600 dark:text-gray-400">
                                {story.userName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                      {/* Botão + apenas para "Seu story" - abre modal de criar */}
                      {story.isMyStory && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCreateStory(true);
                          }}
                          className="absolute -bottom-3 -right-3 bg-transparent border-0 flex items-center justify-center hover:opacity-80 transition-opacity z-10 p-0"
                          title={t("createStory")}
                        >
                          <Plus className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[70px]">
                      {story.userName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PULL TO REFRESH */}
        {(isPulling || isRefreshing) && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white dark:bg-black rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-800">
              {isRefreshing ? (
                <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
              ) : (
                <RefreshCw
                  className="h-5 w-5 text-primary-600 dark:text-primary-400"
                  style={{ transform: `rotate(${pullDistance * 2}deg)` }}
                />
              )}
            </div>
          </div>
        )}

        {/* FEED */}
        <div
          id="feed-container"
          ref={containerRef}
          className="max-w-2xl mx-auto pb-20"
        >
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <InstagramPostSkeleton key={i} />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-4">
                <MessageCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum post encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                {searchQuery || locationFilter.type !== "all"
                  ? "Não encontramos posts com os filtros selecionados."
                  : "Seja o primeiro a compartilhar algo!"}
              </p>
              {(searchQuery || locationFilter.type !== "all") && (
                <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 max-w-md">
                  <p className="text-sm text-primary-900 dark:text-primary-200 font-medium mb-2">
                    💡 Dicas para encontrar mais posts:
                  </p>
                  <ul className="text-xs text-primary-800 dark:text-primary-300 space-y-1 list-disc list-inside">
                    <li>
                      Limpe a pesquisa usando o botão "Resetar" nas
                      configurações
                    </li>
                    <li>
                      Mude o filtro de localização para outra cidade ou estado
                    </li>
                    <li>
                      Selecione "Todos os Locais" para ver posts de qualquer
                      lugar
                    </li>
                    <li>Verifique se os termos de pesquisa estão corretos</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 px-4 sm:px-0">
              {filteredItems.map(
                (item, index) =>
                  item.type === "post" && (
                    <div
                      key={item.id}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                      style={{
                        animationDelay: `${Math.min(index * 50, 300)}ms`,
                      }}
                    >
                      <InstagramPost
                        post={item}
                        isLiked={likedPosts.has(item.id)}
                        onLike={() => handleLike(item.id)}
                        onEdit={handleEditPost}
                        onDelete={handleDeletePost}
                        onRenewPremium={(postId: string) => {
                          setRenewingPostId(postId);
                          setShowRenewPremiumModal(true);
                        }}
                        isTrending={trendingPosts.some((t) => t.id === item.id)}
                        isDeleting={deletingPostId === item.id}
                        isHighlighted={item.id === highlightPostId}
                      />
                    </div>
                  ),
              )}

              {hasNextPage && (
                <div
                  ref={loadingRef}
                  className="flex flex-col items-center gap-2 py-8"
                >
                  {isFetchingNextPage && (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                        Carregando mais posts...
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAIS */}
        <ResponsiveModal
          isOpen={showNewPost}
          onOpenChange={setShowNewPost}
          fullContent={true}
          showCloseButton={false}
        >
          <NewPostForm
            onSubmit={async (data) => {
              if (!profile?.id) {
                toast.error("Erro: Usuário não autenticado");
                return;
              }

              setIsPosting(true);
              setPostStatus("sending");

              try {
                // Se for post premium, usar addPremiumPost
                if (data.isPremium && data.pointsToSpend && data.durationDays) {
                  const finalCityPremium =
                    data.location_city !== undefined
                      ? data.location_city
                      : profile.location_city;
                  const finalStatePremium =
                    data.location_state !== undefined
                      ? data.location_state
                      : profile.location_state;

                  await addPremiumPost({
                    type: "post",
                    user_id: profile.id,
                    user_name: profile.full_name || "Usuário",
                    user_avatar: profile.avatar_url,
                    user_type: profile.user_type,
                    title: data.description.trim().slice(0, 100),
                    description: data.description,
                    images: data.images,
                    service_category_id: data.service,
                    location_state: finalStatePremium,
                    location_city: finalCityPremium,
                    location_country:
                      data.location_country ||
                      (profile as any)?.country ||
                      "BR",
                    pointsToSpend: data.pointsToSpend,
                    durationDays: data.durationDays,
                    likes_count: 0,
                    comments_count: 0,
                    is_liked: false,
                  } as any);
                } else {
                  const finalCity =
                    data.location_city !== undefined
                      ? data.location_city
                      : profile.location_city;
                  const finalState =
                    data.location_state !== undefined
                      ? data.location_state
                      : profile.location_state;

                  await addPost({
                    type: "post",
                    user_id: profile.id,
                    user_name: profile.full_name || "Usuário",
                    user_avatar: profile.avatar_url,
                    user_type: profile.user_type,
                    title: data.description.trim().slice(0, 100),
                    description: data.description,
                    images: data.images,
                    service_category_id: data.service,
                    location_state: finalState,
                    location_city: finalCity,
                    location_country:
                      data.location_country ||
                      (profile as any)?.country ||
                      "BR",
                    likes_count: 0,
                    comments_count: 0,
                    is_liked: false,
                  });
                }

                setPostStatus("sent");
                setTimeout(async () => {
                  setShowNewPost(false);
                  setPostStatus("idle");
                  await new Promise((resolve) => setTimeout(resolve, 500));
                  await refetch();
                }, 1000);
              } catch (error: any) {
                console.error("Erro ao criar post:", error);
                const errorMessage = error?.message || "Erro ao criar post";
                toast.error(`Erro ao criar post: ${errorMessage}`);
                setPostStatus("idle");
              } finally {
                setIsPosting(false);
              }
            }}
            onCancel={() => setShowNewPost(false)}
            isLoading={isPosting}
            postStatus={postStatus}
          />
        </ResponsiveModal>

        <ResponsiveModal
          isOpen={showPremiumPost}
          onOpenChange={setShowPremiumPost}
          title={t("premiumPost")}
        >
          <PremiumPostForm
            onSubmit={async (data) => {
              if (!profile?.id) return;
              await addPremiumPost({
                type: "post",
                user_id: profile.id,
                user_name: profile.full_name || "",
                user_avatar: profile.avatar_url || undefined,
                user_type: profile.user_type || "professional",
                title: data.title,
                description: data.description,
                images: data.images || [],
                service_category_id: data.service || undefined,
                location_state: profile.location_state || undefined,
                location_city: profile.location_city || undefined,
                pointsToSpend: data.pointsToSpend,
                durationDays: data.durationDays,
              } as any);
              setShowPremiumPost(false);
            }}
            onCancel={() => setShowPremiumPost(false)}
            isLoading={false}
            postStatus="idle"
          />
        </ResponsiveModal>

        {/* Modal de edição de post */}
        {editingPost && (
          <EditPostModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingPost(null);
            }}
            post={{
              id: editingPost.id,
              description: editingPost.description || "",
              images: editingPost.images || [],
              service: editingPost.service_category_id || "",
            }}
            onSave={async (
              postId: string,
              updatedPost: { description: string; images: string[] },
            ) => {
              try {
                await editPost(postId, {
                  title: updatedPost.description.slice(0, 100), // Gerar título automaticamente
                  description: updatedPost.description,
                  images: updatedPost.images,
                });
                setShowEditModal(false);
                setEditingPost(null);
                await refetch();
              } catch (error) {
                console.error("Erro ao editar post:", error);
                toast.error("Erro ao editar post. Tente novamente.");
              }
            }}
          />
        )}

        {/* Modal de renovação premium */}
        {renewingPostId && (
          <ResponsiveModal
            isOpen={showRenewPremiumModal}
            onOpenChange={(open) => {
              if (!open) {
                setShowRenewPremiumModal(false);
                setRenewingPostId(null);
              }
            }}
            title={t("renewPremium")}
          >
            <PremiumPostForm
              isRenewal={true}
              onSubmit={async (data) => {
                if (!profile?.id || !renewingPostId) return;
                try {
                  setIsPosting(true);
                  setPostStatus("sending");
                  await renewPremiumPost(
                    renewingPostId,
                    data.pointsToSpend,
                    data.durationDays,
                  );
                  setPostStatus("sent");
                  setTimeout(() => {
                    setShowRenewPremiumModal(false);
                    setRenewingPostId(null);
                    setPostStatus("idle");
                    refetch();
                  }, 1000);
                } catch (error: any) {
                  console.error("Erro ao renovar post premium:", error);
                  toast.error(
                    `Erro ao renovar post premium: ${error?.message || "Erro desconhecido"}`,
                  );
                  setPostStatus("idle");
                } finally {
                  setIsPosting(false);
                }
              }}
              onCancel={() => {
                setShowRenewPremiumModal(false);
                setRenewingPostId(null);
              }}
              isLoading={isPosting}
              postStatus={postStatus}
            />
          </ResponsiveModal>
        )}

        {/* Botão Voltar ao Topo */}
        <ScrollToTop showAfter={400} />
      </div>
    </MainLayout>
  );
}

// COMPONENTE DE POST (INSTAGRAM STYLE)
function InstagramPost({
  post,
  isLiked,
  onLike,
  onEdit,
  onDelete,
  onRenewPremium,
  isTrending,
  isDeleting = false,
  isHighlighted = false,
}: any) {
  const t = useTranslations("feed");
  const { profile, user } = useAuthContext();
  const queryClient = useQueryClient();
  const [showFull, setShowFull] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isPremiumLiking, setIsPremiumLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Hook de reações (likes) - igual ao usado na página principal
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

  // Função para curtir/descurtir usando o hook de reações
  const handleLikeClick = () => {
    setIsLiking(true);
    addReaction("like");
    // Atualizar cache e chamar callback
    onLike();

    // Feedback visual
    if (!isLikedByUser) {
      toast.success("❤️ Post curtido!", {
        duration: 1500,
        position: "bottom-center",
      });
    }

    setTimeout(() => setIsLiking(false), 300);
  };

  // Função para adicionar comentário
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

  // Função para editar comentário
  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingComment(commentId);
    setEditCommentContent(currentContent);
  };

  // Função para salvar edição de comentário
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

  // Função para cancelar edição de comentário
  const handleCancelEditComment = () => {
    setEditingComment(null);
    setEditCommentContent("");
  };

  // Função para deletar comentário
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

  // Pegar dados do usuário de diferentes fontes possíveis
  const postUser = post.professional || post.user || {};
  const postImages = post.images || [];

  // Detectar vídeos do YouTube: primeiro verificar metadata, depois descrição (para compatibilidade com posts antigos)
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

  // Garantir que temos todos os dados do usuário, tentando todas as fontes possíveis
  const userAvatar =
    postUser?.avatar_url ||
    post.user_avatar ||
    post.user_avatar_url ||
    post.professional?.avatar_url ||
    post.user?.avatar_url ||
    undefined;

  // Extrair nome do usuário de todas as fontes possíveis
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

  // Garantir que sempre temos um nome válido
  const displayUserName = userName && userName !== "" ? userName : "Usuário";

  // Texto para exibir (sem vídeos do YouTube)
  const displayText = cleanDescription || post.title || "";
  const shouldTruncate = displayText.length > 120;
  const finalDisplayText = showFull
    ? displayText
    : displayText.slice(0, 120) + (shouldTruncate ? "..." : "");

  // Verificar se é post premium
  const isPremium =
    post.is_premium ||
    post.tags?.includes("premium") ||
    post.metadata?.type === "premium";
  const premiumExpired = post.premium_expires_at
    ? new Date(post.premium_expires_at) < new Date()
    : false;
  const isActivePremium = isPremium && !premiumExpired;

  // Verificar se o usuário atual é o dono do post
  const isOwner = user?.id === userId;

  // Buscar categoria de serviço se houver service_category_id
  const serviceCategory = post.service_category_id
    ? getCategoryById(post.service_category_id)
    : null;

  // Debug: verificar service_category_id
  if (post.service_category_id) {
    console.log("🔍 [InstagramPost] service_category_id encontrado:", {
      postId: post.id,
      service_category_id: post.service_category_id,
      categoryFound: !!serviceCategory,
      categoryName: serviceCategory?.name,
    });
  }

  const isGuest = !user;

  return (
    <article
      id={`post-${post.id}`}
      className={`relative bg-white dark:bg-black border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 scroll-mt-24 ${
        isHighlighted
          ? "border-blue-400 dark:border-blue-700 z-10 shadow-lg shadow-blue-500/20"
          : isActivePremium
            ? "ring-2 ring-warning-400 dark:ring-warning-500 border-warning-200 dark:border-warning-800 bg-gradient-to-r from-warning-50/30 to-transparent dark:from-warning-900/10 dark:to-transparent shadow-[0_15px_30px_-15px_rgba(251,191,36,0.6)] dark:shadow-[0_15px_30px_-15px_rgba(251,191,36,0.3)] premium-border-shine"
            : "border-gray-200 dark:border-gray-800"
      }`}
    >
      {isHighlighted && (
        <div className="absolute inset-0 rounded-xl ring-4 ring-blue-500 dark:ring-blue-600 animate-pulse pointer-events-none z-10 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
      )}

      {/* Guest Header (Overlay) - Visible only to guests */}
      {isGuest && (
        <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-4 pb-2 border-b border-transparent pointer-events-none">
          <div className="flex items-center gap-3">
            <Link href={`/perfil/${userId}`} className="pointer-events-auto">
              <Avatar className="w-10 h-10 border-2 border-gray-100 dark:border-gray-800 transition-transform hover:scale-105">
                <AvatarImage src={userAvatar} alt={displayUserName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                  {displayUserName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Link href={`/perfil/${userId}`} className="pointer-events-auto">
              <p className="font-semibold text-base text-gray-900 dark:text-white hover:underline transition-all leading-none">
                {displayUserName}
              </p>
            </Link>
          </div>
        </div>
      )}

      <GuestBlurOverlay isGuest={isGuest} className="flex flex-col h-full">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={`/perfil/${userId}`}>
              <Avatar className="w-10 h-10 border-2 border-gray-200 dark:border-gray-800">
                <AvatarImage src={userAvatar} alt={displayUserName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                  {displayUserName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/perfil/${userId}`}>
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
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
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {post.location_city &&
                  post.location_city !== "null" &&
                  `${post.location_city}, ${post.location_state || ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Badge de Serviço */}
            {serviceCategory && (
              <Badge
                variant="outline"
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border-success-200 dark:border-success-800 text-success-700 dark:text-success-400 bg-success-50 dark:bg-success-900/30 flex items-center gap-1"
              >
                <span>{serviceCategory.icon}</span>
                <span>{serviceCategory.name}</span>
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

        {/* MÍDIA (FOTOS E/OU VÍDEO) - Sempre mostrar se houver */}
        {postImages.length > 0 || youtubeVideos.length > 0 || youtubeVideoId ? (
          <>
            <PostMedia
              images={postImages}
              youtubeVideoId={youtubeVideoId}
              onDoubleClick={handleLikeClick}
              isLiking={isLiking}
              isPremiumLiking={isPremiumLiking}
            />
            {/* DESCRIÇÃO - Mostrar abaixo da mídia se houver texto */}
            {finalDisplayText && (
              <div className="px-4 py-3">
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-words leading-relaxed">
                  <MentionText text={finalDisplayText} />
                  {shouldTruncate && !showFull && (
                    <button
                      onClick={() => setShowFull(true)}
                      className="text-gray-500 dark:text-gray-400 ml-1 font-medium hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      mais
                    </button>
                  )}
                </p>
              </div>
            )}
          </>
        ) : (
          /* DESCRIÇÃO NO LUGAR DA MÍDIA - Se não houver mídia */
          finalDisplayText && (
            <div className="px-4 py-4 relative">
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-words leading-relaxed">
                {finalDisplayText}
                {shouldTruncate && !showFull && (
                  <button
                    onClick={() => setShowFull(true)}
                    className="text-gray-500 dark:text-gray-400 ml-1 font-medium hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    mais
                  </button>
                )}
              </p>
              {/* Animações de like para posts sem mídia */}
              {isLiking && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <Heart className="h-20 w-20 text-red-500 fill-red-500 animate-ping" />
                </div>
              )}
              {isPremiumLiking && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="relative h-20 w-20">
                    <Coins
                      className="h-20 w-20 absolute inset-0 text-warning-500 animate-ping"
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

        {/* AÇÕES */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800/50">
          <div className="flex items-center gap-2">
            {/* Botão de Like Normal */}
            <button
              onClick={handleLikeClick}
              disabled={isLiking || isReactionLoading}
              aria-label={isLikedByUser ? "Descurtir post" : "Curtir post"}
              className="min-h-[44px] min-w-[44px] p-2 transition-transform active:scale-125 disabled:opacity-50 flex items-center gap-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Heart
                className={`h-5 w-5 transition-all ${
                  isLikedByUser
                    ? "text-red-500 fill-red-500"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {likesCount > 0 ? likesCount.toLocaleString("pt-BR") : "0"}
              </span>
            </button>

            {/* Botão de Like Premium */}
            <PremiumLikeButton
              postId={post.id}
              postCreatorId={userId}
              size="sm"
              showStats={false}
              onPremiumLikeClick={() => {
                setIsPremiumLiking(true);
                setTimeout(() => setIsPremiumLiking(false), 600); // Duração da animação
              }}
            />

            {/* Botão de Comentários */}
            <button
              onClick={() => setShowComments(!showComments)}
              aria-label={
                showComments ? "Ocultar comentários" : "Ver comentários"
              }
              aria-expanded={showComments}
              className="min-h-[44px] min-w-[44px] p-2 transition-transform active:scale-125 flex items-center gap-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MessageCircle
                className={`h-5 w-5 transition-all ${
                  showComments
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {(commentsCount ?? 0).toLocaleString("pt-BR")}
              </span>
            </button>

            {/* Botão de Compartilhar */}
            <button
              onClick={() => setShowShareModal(true)}
              aria-label="Compartilhar post"
              className="min-h-[44px] min-w-[44px] p-2 transition-transform active:scale-125 flex items-center gap-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Share2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {sharesCount > 0 ? sharesCount.toLocaleString("pt-BR") : "0"}
              </span>
            </button>
          </div>

          {/* Mostrar quem curtiu */}
          <LikedBy postId={post.id} likesCount={likesCount} />
        </div>

        {/* COMENTÁRIOS */}
        {showComments && (
          <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-900 px-4 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Lista de comentários */}
            {commentsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.slice(0, 10).map((comment: any) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={comment.user?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {comment.user?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {comment.user?.full_name || "Usuário"}
                            </span>{" "}
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
                                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold disabled:opacity-50"
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
                              {/* Botão de Like */}
                              <button
                                onClick={() => {
                                  likeComment(comment.id);
                                }}
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

            {/* Input de comentário */}
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

        {/* Modal de compartilhamento */}
        <SharePostModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          postId={post.id}
          postTitle={post.title || post.description || "Post"}
          onShareRecorded={() => {
            // Invalidar query para atualizar contador
            queryClient.invalidateQueries({
              queryKey: ["post-shares", post.id],
            });
          }}
        />

        {/* TIMESTAMP */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
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
