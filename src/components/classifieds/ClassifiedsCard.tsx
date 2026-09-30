"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  MessageCircle,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Crown,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  CheckCircle2,
  Megaphone,
  Tag,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MentionText } from "@/components/ui/MentionText";
import { ReportDialog } from "@/components/ReportDialog";
import { useCloseOnScroll } from "@/hooks/useCloseOnScroll";
import { ProVerifiedBadge } from "@/components/ui/ProVerifiedBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { GuestBlurOverlay } from "@/components/auth/GuestBlurOverlay";

interface ClassifiedsCardProps {
  ad: any;
  onEdit?: (ad: any) => void;
  onDelete?: (adId: string) => void;
  onRenewPremium?: (adId: string) => void;
  isDeleting?: boolean;
  isHighlighted?: boolean;
  onShare?: (ad: any) => void;
}

function parseTags(category?: string, title?: string): string[] {
  const tags: string[] = [];
  if (category) {
    tags.push(
      ...category
        .split(/[,|/·•]/)
        .map((t) => t.trim())
        .filter(Boolean),
    );
  }
  if (tags.length === 0 && title) {
    const words = title
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 2);
    tags.push(...words);
  }
  return [...new Set(tags)].slice(0, 4);
}

export function ClassifiedsCard({
  ad,
  onEdit,
  onDelete,
  onRenewPremium,
  isDeleting = false,
  isHighlighted = false,
  onShare,
}: ClassifiedsCardProps) {
  const { user } = useAuthContext();
  const { openChat } = useFloatingChat();
  const { isAdmin } = useIsAdmin();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [liked, setLiked] = useState(false);

  useCloseOnScroll(isOpen, setIsOpen);

  let images: string[] = [];
  try {
    if (Array.isArray(ad.images)) {
      images = ad.images;
    } else if (typeof ad.images === "string") {
      const parsed = JSON.parse(ad.images);
      if (Array.isArray(parsed)) images = parsed;
    }
  } catch {
    images = [];
  }

  const isOwner = user?.id === ad.user_id;
  const isOffer = ad.ad_type === "oferecer";
  const isPremiumAd = ad.is_premium || false;
  const premiumExpired = ad.premium_expires_at
    ? new Date(ad.premium_expires_at) < new Date()
    : false;
  const isActivePremium = isPremiumAd && !premiumExpired;

  const tags = parseTags(ad.category, ad.title);
  const likesCount = (ad.likes_count || 0) + (liked ? 1 : 0);
  const viewsCount = ad.views_count ?? ad.views ?? 0;
  const subtitle = isOffer
    ? ad.category || "Profissional"
    : "Preciso de um profissional";

  const locationLabel = [ad.location_city, ad.location_state]
    .filter(Boolean)
    .join(" - ");

  const timeLabel = ad.created_at
    ? formatDistanceToNow(new Date(ad.created_at), {
        addSuffix: true,
        locale: ptBR,
      })
    : "";

  const priceLabel = ad.price_range
    ? isOffer
      ? `A partir de R$ ${ad.price_range}`
      : `Tenho até R$ ${ad.price_range}`
    : null;

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1,
      );
    }
  };

  const toggleImageExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageExpanded(!isImageExpanded);
  };

  const handleContactClick = () => {
    if (isOwner) {
      toast.info("Este é o seu próprio anúncio!");
      return;
    }
    openChat(ad.user_id, ad.user_name || "Usuário");
    toast.success(`Abrindo chat com ${ad.user_name}...`);
  };

  const handleLikeClick = () => {
    if (!user) {
      toast.info("Faça login para curtir anúncios");
      return;
    }
    setLiked((prev) => !prev);
  };

  const description = ad.description || "";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-transparent shadow-[0_2px_12px_rgba(15,23,42,0.06)] transition-all duration-300",
        isHighlighted &&
          "ring-2 ring-blue-400 dark:ring-blue-600 z-10 shadow-md",
        isActivePremium &&
          "ring-2 ring-[#00b0b0]/35 border-[#00b0b0]/30 premium-border-shine shadow-[0_8px_24px_-8px_rgba(0,176,176,0.25)]",
        !isHighlighted &&
          !isActivePremium &&
          "hover:shadow-[0_8px_24px_rgba(15,23,42,0.1)]",
      )}
    >
      {!user && (
        <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-4 pb-2 pointer-events-none">
          <div className="flex items-center gap-3">
            <Link
              href={`/perfil/${ad.user_id}`}
              className="pointer-events-auto"
            >
              <Avatar className="h-10 w-10 border border-gray-100">
                <AvatarImage
                  src={ad.user_avatar || ad.user_avatar_url || ""}
                  alt={ad.user_name || "Usuário"}
                />
                <AvatarFallback className="bg-slate-100 text-slate-700 font-bold uppercase">
                  {(ad.user_name || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Link
              href={`/perfil/${ad.user_id}`}
              className="text-sm font-semibold text-slate-900 dark:text-white hover:underline pointer-events-auto"
            >
              {ad.user_name}
            </Link>
          </div>
        </div>
      )}

      <GuestBlurOverlay isGuest={!user} className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Link href={`/perfil/${ad.user_id}`} className="shrink-0">
              <Avatar className="h-11 w-11 border border-slate-100 dark:border-zinc-700">
                <AvatarImage
                  src={ad.user_avatar || ad.user_avatar_url || ""}
                  alt={ad.user_name || "Usuário"}
                />
                <AvatarFallback className="bg-slate-100 text-slate-700 font-bold uppercase">
                  {(ad.user_name || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="min-w-0 flex-1">
              <Link href={`/perfil/${ad.user_id}`}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-[15px] text-slate-900 dark:text-white truncate hover:underline">
                    {ad.user_name}
                  </span>
                  <ProVerifiedBadge
                    isVerified={ad.user_profile?.is_verified}
                    isPro={ad.user_profile?.is_pro}
                    proExpiresAt={ad.user_profile?.pro_expires_at}
                    iconSize={2.5}
                  />
                </div>
              </Link>
              <p className="text-sm text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                {subtitle}
              </p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1 truncate">
                {locationLabel && (
                  <>
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{locationLabel}</span>
                  </>
                )}
                {locationLabel && timeLabel && (
                  <span className="shrink-0">·</span>
                )}
                {timeLabel && (
                  <span className="capitalize shrink-0">{timeLabel}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-1.5 shrink-0">
            {/* Type badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                isOffer
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
              )}
            >
              {isOffer ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Megaphone className="h-3 w-3" />
              )}
              {isOffer ? "Serviço" : "Pedido"}
            </span>

            {isActivePremium && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold bg-[#00b0b0] text-white">
                <Crown className="h-3 w-3" />
              </span>
            )}

            <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <DropdownMenuItem onClick={() => onEdit?.(ad)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {isOwner && isActivePremium && premiumExpired && (
                  <DropdownMenuItem
                    onClick={() => onRenewPremium?.(ad.id)}
                    className="text-yellow-600 dark:text-yellow-400"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Renovar Premium
                  </DropdownMenuItem>
                )}
                {(isOwner || isAdmin) && (
                  <DropdownMenuItem
                    onClick={() => onDelete?.(ad.id)}
                    className="text-red-600 dark:text-red-400"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isAdmin && !isOwner ? "Deletar (Admin)" : "Deletar"}
                  </DropdownMenuItem>
                )}
                {!isOwner && (
                  <DropdownMenuItem
                    onClick={() => setShowReportDialog(true)}
                    className="text-red-600"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Denunciar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onShare?.(ad)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ReportDialog
              isOpen={showReportDialog}
              onOpenChange={setShowReportDialog}
              type="classified"
              targetId={ad.id}
              targetName={ad.title}
              reportedUserId={ad.user_id}
            />
          </div>
        </div>

        {/* Body: image + content */}
        <div
          className={cn(
            "px-4 pb-3",
            images.length > 0
              ? "grid grid-cols-1 sm:grid-cols-[minmax(0,42%)_1fr] gap-3 sm:gap-4"
              : "",
          )}
        >
          {images.length > 0 && (
            <div
              className={cn(
                "relative overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800 cursor-pointer group/media",
                isImageExpanded
                  ? "sm:col-span-2 aspect-auto"
                  : "aspect-[4/3] sm:aspect-square",
              )}
              onClick={toggleImageExpand}
            >
              <img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={`${ad.title} - Foto ${currentImageIndex + 1}`}
                className={cn(
                  "w-full h-full animate-in fade-in duration-300",
                  isImageExpanded
                    ? "max-h-[560px] object-contain"
                    : "object-cover group-hover/media:scale-[1.02] transition-transform duration-500",
                )}
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 text-white drop-shadow-md opacity-0 group-hover/media:opacity-100 transition-opacity z-10"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-7 h-7" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white drop-shadow-md opacity-0 group-hover/media:opacity-100 transition-opacity z-10"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                  <div className="absolute bottom-2 right-2 bg-slate-900/70 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md pointer-events-none">
                    +{images.length - 1}
                  </div>
                </>
              )}
            </div>
          )}

          <div
            className={cn(
              "flex flex-col min-w-0",
              images.length > 0 && isImageExpanded && "sm:col-span-2",
            )}
          >
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
              {ad.title}
            </h3>

            <div className="mt-1.5">
              <p
                className={cn(
                  "text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap",
                  !showFullDescription && "line-clamp-3",
                )}
              >
                <MentionText text={description} />
              </p>
              {!showFullDescription &&
                (description.length > 120 ||
                  description.split("\n").length > 3) && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowFullDescription(true);
                    }}
                    className="text-slate-800 dark:text-zinc-200 mt-1 font-semibold hover:underline text-sm"
                  >
                    ler mais
                  </button>
                )}
              {showFullDescription && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFullDescription(false);
                  }}
                  className="text-slate-800 dark:text-zinc-200 mt-1 font-semibold hover:underline text-sm"
                >
                  ver menos
                </button>
              )}
            </div>

            {(tags.length > 0 || isActivePremium) && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[11px] font-medium px-2.5 py-1"
                  >
                    {tag}
                  </span>
                ))}
                {isActivePremium && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[11px] font-medium px-2.5 py-1">
                    Destaque
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto px-4 py-3 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
            <button
              type="button"
              onClick={handleLikeClick}
              className={cn(
                "inline-flex items-center gap-1 text-sm transition-colors",
                liked ? "text-rose-500" : "hover:text-rose-500",
              )}
              aria-label="Curtir"
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              <span className="tabular-nums">
                {likesCount || viewsCount || 0}
              </span>
            </button>
            <button
              type="button"
              onClick={handleContactClick}
              disabled={isOwner}
              className="inline-flex items-center gap-1 text-sm hover:text-sky-600 transition-colors disabled:opacity-40"
              aria-label="Conversar"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="tabular-nums hidden xs:inline">
                {viewsCount > 0 ? viewsCount : ""}
              </span>
            </button>
            {viewsCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Eye className="h-3.5 w-3.5" />
                {viewsCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            {priceLabel && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-300 truncate max-w-[140px] lg:max-w-[180px]">
                <Tag className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                {priceLabel}
              </span>
            )}

            <Button
              onClick={handleContactClick}
              disabled={isOwner}
              size="sm"
              className={cn(
                "rounded-full px-4 h-9 font-semibold shadow-sm transition-all active:scale-[0.98]",
                "bg-slate-800 hover:bg-slate-900 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-slate-900",
                isOwner && "opacity-50 cursor-not-allowed",
              )}
            >
              Ver mais
              <ChevronRightIcon className="h-4 w-4 ml-0.5" />
            </Button>
          </div>
        </div>

        {/* Price on mobile */}
        {priceLabel && (
          <div className="sm:hidden px-4 pb-3 -mt-1">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-zinc-300">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              {priceLabel}
            </span>
          </div>
        )}
      </GuestBlurOverlay>
    </article>
  );
}
