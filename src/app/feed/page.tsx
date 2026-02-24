"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Plus, Search, MessageCircle, Loader2, RefreshCw } from "lucide-react";
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
import { usePremiumNotifications } from "@/hooks/usePremiumNotifications";
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
  usePremiumNotifications();

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

  if (!mounted) return null;

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

      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <header className="bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-gray-900">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-black">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                ConfiLar
              </h1>
              <div className="flex items-center gap-2">
                {profile && (
                  <button
                    onClick={() => setShowNewPost(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full"
                  >
                    <Plus className="h-5 w-5 text-gray-900 dark:text-white" />
                  </button>
                )}
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={`p-2 rounded-full ${showSearch || searchQuery ? "text-primary-600" : ""}`}
                >
                  <Search className="h-5 w-5" />
                </button>
                {profile && (
                  <button
                    onClick={() => openChat()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full"
                  >
                    <MessageCircle className="h-5 w-5 text-gray-900 dark:text-white" />
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
                    {t(tab)}
                  </button>
                ))}
            </div>
          </div>
        </header>

        {/* Stories Section Simplified for brevity in reconstruction */}
        <div className="bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-gray-900">
          <div className="max-w-2xl mx-auto px-4 py-3">
            {/* ... rendering displayStories ... */}
          </div>
        </div>

        <div
          id="feed-container"
          ref={containerRef}
          className="max-w-2xl mx-auto pb-20 relative"
        >
          <PullToRefresh
            isPulling={isPulling}
            isRefreshing={isRefreshing}
            pullDistance={pullDistance}
            shouldRefresh={pullDistance >= 80}
          />
          {isLoading ? (
            <div className="space-y-4">
              <InstagramPostSkeleton />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 px-4">
              <p className="text-gray-500">Nenhum post encontrado</p>
            </div>
          ) : (
            <div className="space-y-4 px-4 sm:px-0">
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
                <div ref={loadingRef} className="flex justify-center py-8">
                  <Loader2 className="animate-spin" />
                </div>
              )}
            </div>
          )}
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
            images: editingPost.images || "",
            service: editingPost.service_category_id || "",
          }}
          onSave={async (postId, updatedPost) => {
            await editPost(postId, {
              title: updatedPost.description.slice(0, 100),
              description: updatedPost.description,
              images: updatedPost.images,
            });
            setShowEditModal(false);
            setEditingPost(null);
            await refetch();
          }}
        />
      )}

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
      )}

      <ScrollToTop showAfter={400} />
    </MainLayout>
  );
}
