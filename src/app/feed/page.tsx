"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Plus, Search, MessageCircle, Loader2 } from "lucide-react";
import { useUnifiedTimeline } from "@/hooks/useUnifiedTimeline";
import { useTimelineRealtime } from "@/hooks/useTimelineRealtime";
import { usePostRanking } from "@/hooks/usePostRanking";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { NewPostForm } from "@/components/timeline/NewPostForm";
import { PremiumPostForm } from "@/components/timeline/PremiumPostForm";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { InstagramPostSkeleton } from "@/components/ui/skeleton";
import { EditPostModal } from "@/components/timeline/EditPostModal";
import { FeedSearchHeader } from "@/components/feed/FeedSearchHeader";
import { useFeedSearch } from "@/hooks/useFeedSearch";
import { useStories } from "@/hooks/useStories";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { CreateStoryModal } from "@/components/stories/CreateStoryModal";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { useNavigationShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useProfileCheck } from "@/hooks/useProfileCheck";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { PostCard } from "@/components/timeline/PostCard";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { LogoSplashScreen } from "@/components/common/LogoSplashScreen";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";

export default function FeedPage() {
  const t = useTranslations("feed");
  const { profile } = useAuthContext();
  const { openChat } = useFloatingChat();
  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightPostId = searchParams.get("post");

  const { needsOnboarding, checkProfile } = useProfileCheck();

  const [activeTab, setActiveTab] = useState<"all" | "posts" | "notifications">(
    "posts",
  );

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
  const [showSearch, setShowSearch] = useState(false);

  const {
    storyGroups,
    isLoading: storiesLoading,
    refetch: refetchStories,
  } = useStories();

  useNavigationShortcuts();

  const {
    items,
    isLoading,
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
    onlyRealPosts: activeTab === "posts",
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

  const { trendingPosts } = usePostRanking({
    location_city: profile?.location_city,
    location_state: profile?.location_state,
    limit: 5,
  });

  const [mounted, setMounted] = useState(false);
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
      if (item.type !== "post") return false;
      const metadataType = (item as any).metadata?.type;
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

  const myStoryGroup = storyGroups.find(
    (group) => group.userId === profile?.id,
  );

  const displayStories = [
    ...storyGroups
      .filter((group) => group.userId !== profile?.id)
      .map((group) => ({
        id: group.userId,
        userId: group.userId,
        userName: group.userName,
        userAvatar: group.userAvatar,
        hasNew: group.hasNew,
        stories: group.stories,
      })),
  ];

  if (profile) {
    displayStories.unshift({
      id: "my-story",
      userId: profile.id,
      userName: "Seu story",
      userAvatar: profile.avatar_url || null,
      hasNew: false,
      stories: myStoryGroup?.stories || [],
    } as any);
  }

  if (!mounted) return <LogoSplashScreen />;

  return (
    <MainLayout requireAuth={false}>
      <OnboardingModal
        isOpen={needsOnboarding}
        onComplete={() => {
          checkProfile();
          refetch();
          router.push("/home");
        }}
      />

      {showStoryViewer && (
        <StoryViewer
          initialGroupIndex={selectedStoryGroupIndex}
          initialStoryIndex={selectedStoryIndex}
          onClose={() => setShowStoryViewer(false)}
        />
      )}

      {showCreateStory && (
        <CreateStoryModal
          isOpen={showCreateStory}
          onClose={() => setShowCreateStory(false)}
          onStoryCreated={async () => {
            await refetchStories();
          }}
        />
      )}

      <div className="social-feed min-h-screen">
        <div className="social-feed-shell">
          <header className="social-feed-masthead">
            <div className="social-feed-title-row">
              <div>
                <h1>Feed social</h1>
                <p>O que acontece na sua comunidade</p>
              </div>

              <div className="social-feed-actions">
                <button
                  type="button"
                  onClick={() => setShowSearch(!showSearch)}
                  className={cn(
                    "social-feed-icon-button",
                    (showSearch || searchQuery) &&
                      "social-feed-icon-button--active",
                  )}
                  aria-label={showSearch ? "Fechar busca" : "Buscar no feed"}
                  aria-pressed={showSearch}
                >
                  <Search className="h-5 w-5" />
                </button>

                {profile && (
                  <button
                    type="button"
                    onClick={() => openChat()}
                    className="social-feed-icon-button"
                    aria-label="Abrir conversas"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                )}

                {profile && (
                  <button
                    type="button"
                    onClick={() => setShowNewPost(true)}
                    className="social-feed-create-button"
                  >
                    <Plus className="h-[18px] w-[18px]" />
                    <span>Criar</span>
                  </button>
                )}
              </div>
            </div>

            {(showSearch || searchQuery) && (
              <FeedSearchHeader
                currentSearch={searchQuery}
                currentFilter={locationFilter}
                onSearch={setSearchQuery}
                onFilterChange={setLocationFilter}
              />
            )}

            <div
              className="social-feed-tabs"
              role="tablist"
              aria-label="Conteúdo do feed"
            >
              {(["all", "posts", "notifications"] as const)
                .filter((tab) => (profile ? true : tab !== "notifications"))
                .map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "social-feed-tab",
                      activeTab === tab && "social-feed-tab--active",
                    )}
                  >
                    {t(tab)}
                  </button>
                ))}
            </div>
          </header>

          {displayStories.length > 0 && (
            <section className="social-feed-stories" aria-label="Stories">
              <div className="social-feed-stories-track">
                {displayStories.map((group, index) => (
                  <button
                    key={group.id}
                    type="button"
                    className="social-feed-story"
                    onClick={() => {
                      if (
                        group.id === "my-story" &&
                        group.stories.length === 0
                      ) {
                        setShowCreateStory(true);
                      } else {
                        setSelectedStoryGroupIndex(index);
                        setSelectedStoryIndex(0);
                        setShowStoryViewer(true);
                      }
                    }}
                  >
                    <span className="social-feed-story-avatar">
                      <span
                        className={cn(
                          "social-feed-story-ring",
                          group.hasNew
                            ? "social-feed-story-ring--new"
                            : group.stories.length > 0
                              ? "social-feed-story-ring--seen"
                              : "social-feed-story-ring--empty",
                        )}
                      />
                      <span className="social-feed-story-image">
                        <UserAvatar
                          src={group.userAvatar}
                          alt={group.userName}
                          size="lg"
                          showReferralBadge={false}
                          className="h-full w-full object-cover"
                        />
                        {group.id === "my-story" &&
                          group.stories.length === 0 && (
                            <span className="social-feed-story-add">
                              <Plus className="h-3.5 w-3.5" />
                            </span>
                          )}
                      </span>
                    </span>
                    <span className="social-feed-story-name">
                      {group.id === "my-story" ? "Seu story" : group.userName}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {profile && (
            <section
              className="social-feed-composer"
              aria-label="Criar publicação"
            >
              <button
                type="button"
                onClick={() => setShowNewPost(true)}
                className="social-feed-composer-button"
              >
                <UserAvatar
                  src={profile.avatar_url}
                  alt={profile.full_name || "Seu perfil"}
                  fallback={profile.full_name?.charAt(0) || "U"}
                  size="md"
                  showReferralBadge={false}
                  className="h-10 w-10"
                />
                <span className="social-feed-composer-copy">
                  Compartilhe uma novidade
                </span>
                <span className="social-feed-composer-action">
                  <Plus className="h-4 w-4" />
                  Publicar
                </span>
              </button>
            </section>
          )}

          <div
            id="feed-container"
            ref={containerRef}
            className="social-feed-content"
          >
            <PullToRefresh
              isPulling={isPulling}
              isRefreshing={isRefreshing}
              pullDistance={pullDistance}
              shouldRefresh={pullDistance >= 80}
            />
            {isLoading ? (
              <div className="social-feed-loading">
                <InstagramPostSkeleton />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="social-feed-empty">
                <p>Nenhuma publicação encontrada</p>
                <span>Tente uma nova busca ou volte mais tarde.</span>
              </div>
            ) : (
              <div className="social-feed-posts">
                {filteredItems.map(
                  (item) =>
                    item.type === "post" && (
                      <PostCard
                        key={item.id}
                        post={item}
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
                    ),
                )}
                {hasNextPage && (
                  <div ref={loadingRef} className="social-feed-loading-more">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <ResponsiveModal
        isOpen={showNewPost}
        onOpenChange={setShowNewPost}
        fullContent={true}
        showCloseButton={false}
      >
        <NewPostForm
          onSubmit={async (data) => {
            setIsPosting(true);
            setPostStatus("sending");
            try {
              await addPost({
                ...data,
                type: "post",
                user_id: profile?.id || "",
                user_name: profile?.full_name || "",
                user_avatar: profile?.avatar_url || "",
                user_type: profile?.user_type || "client",
                service_category_id: data.service,
                description: data.description || "",
                title: data.description?.slice(0, 100) || "",
                images: data.images || [],
              });
              setPostStatus("sent");
              toast.success("Post publicado com sucesso!");
              setTimeout(() => {
                setShowNewPost(false);
                setPostStatus("idle");
              }, 1500);
            } catch (error) {
              console.error("Erro ao criar post:", error);
              toast.error("Erro ao criar post. Tente novamente.");
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
            setIsPosting(true);
            setPostStatus("sending");
            try {
              await addPremiumPost({
                ...data,
                type: "post",
                user_id: profile?.id || "",
                user_name: profile?.full_name || "",
                user_avatar: profile?.avatar_url || "",
                user_type: profile?.user_type || "client",
                service_category_id: data.service,
                title: data.title || "",
                description: data.description || "",
                images: data.images || [],
              });
              setPostStatus("sent");
              toast.success("Post premium publicado com sucesso!");
              setTimeout(() => {
                setShowPremiumPost(false);
                setPostStatus("idle");
              }, 1500);
            } catch (error) {
              console.error("Erro ao criar post premium:", error);
              toast.error("Erro ao criar post premium. Tente novamente.");
              setPostStatus("idle");
            } finally {
              setIsPosting(false);
            }
          }}
          onCancel={() => setShowPremiumPost(false)}
          isLoading={false}
          postStatus="idle"
        />
      </ResponsiveModal>

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
            location_state: editingPost.location_state || null,
            location_city: editingPost.location_city || null,
            location_country: editingPost.location_country || null,
            is_premium: editingPost.is_premium || false,
          }}
          onSave={async (postId, updatedPost) => {
            await editPost(postId, {
              title: updatedPost.description.slice(0, 100),
              description: updatedPost.description,
              images: updatedPost.images,
              service_category_id: updatedPost.service,
              location_state: updatedPost.location_state,
              location_city: updatedPost.location_city,
              location_country: updatedPost.location_country,
            });
            setShowEditModal(false);
            setEditingPost(null);
            await refetch();
          }}
          onMakePremium={async (pointsToSpend, durationDays) => {
            try {
              await renewPremiumPost(
                editingPost.id,
                pointsToSpend,
                durationDays,
              );
              setShowEditModal(false);
              setEditingPost(null);
              await refetch();
            } catch (error) {
              console.error("Failed to upgrade post:", error);
            }
          }}
        />
      )}

      {renewingPostId &&
        (() => {
          const renewingPost = filteredItems.find(
            (p) => p.id === renewingPostId,
          );
          const isActuallyRenewal = renewingPost
            ? renewingPost.is_premium
            : false;

          return (
            <ResponsiveModal
              isOpen={showRenewPremiumModal}
              onOpenChange={(open) => {
                if (!open) {
                  setShowRenewPremiumModal(false);
                  setRenewingPostId(null);
                }
              }}
              title={
                isActuallyRenewal ? t("renewPremium") : "Tornar Post Premium"
              }
            >
              <PremiumPostForm
                isRenewal={isActuallyRenewal}
                onSubmit={async (data) => {
                  await renewPremiumPost(
                    renewingPostId,
                    data.pointsToSpend,
                    data.durationDays,
                  );
                  setShowRenewPremiumModal(false);
                  setRenewingPostId(null);
                  refetch();
                }}
                onCancel={() => {
                  setShowRenewPremiumModal(false);
                  setRenewingPostId(null);
                }}
                isLoading={isPosting}
                postStatus={postStatus}
              />
            </ResponsiveModal>
          );
        })()}

      <ScrollToTop showAfter={400} />
    </MainLayout>
  );
}
