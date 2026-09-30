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
  CheckCircle2,
  Megaphone,
  Tag,
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

function parseTags(category?: string): string[] {
  if (!category) return [];
  return [
    ...new Set(
      category
        .split(/[,|/·•]/)
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ].slice(0, 4);
}

function relativeTime(iso?: string): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return formatDistanceToNow(new Date(iso), {
    addSuffix: true,
    locale: ptBR,
  });
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
    if (Array.isArray(ad.images)) images = ad.images;
    else if (typeof ad.images === "string") {
      const parsed = JSON.parse(ad.images);
      if (Array.isArray(parsed)) images = parsed;
    }
  } catch {
    images = [];
  }

  const isOwner = user?.id === ad.user_id;
  const isOffer = ad.ad_type === "oferecer";
  const isPremiumAd = Boolean(ad.is_premium);
  const premiumExpired = ad.premium_expires_at
    ? new Date(ad.premium_expires_at) < new Date()
    : false;
  const isActivePremium = isPremiumAd && !premiumExpired;
  const tags = parseTags(ad.category);
  const likesCount = (ad.likes_count || 0) + (liked ? 1 : 0);
  const commentsCount = ad.comments_count ?? ad.views_count ?? ad.views ?? 0;
  const subtitle = isOffer
    ? ad.category || "Profissional"
    : "Preciso de um profissional";
  const locationLabel = [ad.location_city, ad.location_state]
    .filter(Boolean)
    .join(" - ");
  const timeLabel = relativeTime(ad.created_at);
  const priceLabel = ad.price_range
    ? isOffer
      ? `A partir de R$ ${ad.price_range}`
      : `Tenho até R$ ${ad.price_range}`
    : null;
  const description = ad.description || "";

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

  const handleContactClick = () => {
    if (isOwner) {
      toast.info("Este é o seu próprio anúncio!");
      return;
    }
    openChat(ad.user_id, ad.user_name || "Usuário");
    toast.success(`Abrindo chat com ${ad.user_name}...`);
  };

  return (
    <article
      className={cn(
        "classifieds-card group relative flex flex-col overflow-hidden bg-[var(--cl-surface)] border border-[var(--cl-border)] shadow-[var(--cl-shadow)]",
        isHighlighted && "ring-2 ring-sky-400 z-10",
        isActivePremium &&
          "ring-2 ring-[var(--cl-teal)]/35 border-[var(--cl-teal)]/40 premium-border-shine",
      )}
    >
      {!user && (
        <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-4 pointer-events-none">
          <div className="flex items-center gap-3">
            <Link
              href={`/perfil/${ad.user_id}`}
              className="pointer-events-auto"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={ad.user_avatar || ad.user_avatar_url || ""}
                  alt={ad.user_name || "Usuário"}
                />
                <AvatarFallback className="bg-[var(--cl-mist)] text-[var(--cl-ink)] font-bold uppercase">
                  {(ad.user_name || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Link
              href={`/perfil/${ad.user_id}`}
              className="text-sm font-semibold text-[var(--cl-ink)] hover:underline pointer-events-auto"
            >
              {ad.user_name}
            </Link>
          </div>
        </div>
      )}

      <GuestBlurOverlay isGuest={!user} className="flex-1 flex flex-col">
        {/* Header: avatar | identity | badge + menu */}
        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          <Link href={`/perfil/${ad.user_id}`} className="shrink-0">
            <Avatar className="h-11 w-11 border border-[var(--cl-border)]">
              <AvatarImage
                src={ad.user_avatar || ad.user_avatar_url || ""}
                alt={ad.user_name || "Usuário"}
              />
              <AvatarFallback className="bg-[var(--cl-mist)] text-[var(--cl-ink)] font-bold uppercase">
                {(ad.user_name || "U").charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="min-w-0 flex-1">
            <Link href={`/perfil/${ad.user_id}`}>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-semibold text-[15px] text-[var(--cl-ink)] dark:text-white truncate hover:underline">
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
            <p className="text-[13px] text-[var(--cl-ink-secondary)] truncate mt-0.5">
              {subtitle}
            </p>
            <p className="text-xs text-[var(--cl-ink-muted)] mt-0.5 flex items-center gap-1 truncate">
              {locationLabel && (
                <>
                  <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                  <span className="truncate">{locationLabel}</span>
                </>
              )}
              {locationLabel && timeLabel && (
                <span className="shrink-0 opacity-60">·</span>
              )}
              {timeLabel && <span className="shrink-0">{timeLabel}</span>}
            </p>
          </div>

          <div className="flex items-start gap-1.5 shrink-0 pt-0.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                isOffer
                  ? "bg-[var(--cl-service-bg)] text-[var(--cl-service)]"
                  : "bg-[var(--cl-request-bg)] text-[var(--cl-request)]",
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
              <span className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-bold bg-[var(--cl-teal)] text-white">
                <Crown className="h-3 w-3" />
              </span>
            )}

            <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[var(--cl-ink-muted)] hover:text-[var(--cl-ink)]"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {isOwner && (
                  <DropdownMenuItem onClick={() => onEdit?.(ad)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {isOwner && isActivePremium && premiumExpired && (
                  <DropdownMenuItem
                    onClick={() => onRenewPremium?.(ad.id)}
                    className="text-amber-600"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Renovar Premium
                  </DropdownMenuItem>
                )}
                {(isOwner || isAdmin) && (
                  <DropdownMenuItem
                    onClick={() => onDelete?.(ad.id)}
                    className="text-red-600"
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

        {/* Body: image left + copy right */}
        <div
          className={cn(
            "px-4 pb-3",
            images.length > 0 &&
              "grid grid-cols-[112px_1fr] sm:grid-cols-[minmax(0,38%)_1fr] gap-3",
          )}
        >
          {images.length > 0 && (
            <div
              className={cn(
                "relative overflow-hidden rounded-[14px] bg-[var(--cl-mist)] cursor-pointer group/media",
                isImageExpanded ? "col-span-2 aspect-auto" : "aspect-[4/3]",
              )}
              onClick={() => setIsImageExpanded((v) => !v)}
            >
              <img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={`${ad.title} - Foto ${currentImageIndex + 1}`}
                className={cn(
                  "w-full h-full",
                  isImageExpanded
                    ? "max-h-[560px] object-contain"
                    : "object-cover",
                )}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-1 top-1/2 -translate-y-1/2 text-white drop-shadow opacity-0 group-hover/media:opacity-100 transition-opacity z-10"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-7 h-7" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-white drop-shadow opacity-0 group-hover/media:opacity-100 transition-opacity z-10"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                  <div className="absolute bottom-2 right-2 bg-[var(--cl-ink)]/75 text-white text-[11px] font-semibold px-2 py-0.5 rounded-lg pointer-events-none">
                    +{images.length - 1}
                  </div>
                </>
              )}
            </div>
          )}

          <div
            className={cn(
              "flex flex-col min-w-0",
              images.length > 0 && isImageExpanded && "col-span-2",
            )}
          >
            <h3 className="text-[15px] sm:text-base font-bold text-[var(--cl-ink)] dark:text-white leading-snug line-clamp-2">
              {ad.title}
            </h3>
            <p
              className={cn(
                "mt-1 text-[13px] text-[var(--cl-ink-secondary)] leading-relaxed whitespace-pre-wrap",
                !showFullDescription && "line-clamp-2 sm:line-clamp-3",
              )}
            >
              <MentionText text={description} />
            </p>
            {(description.length > 100 ||
              description.split("\n").length > 2) && (
              <button
                type="button"
                onClick={() => setShowFullDescription((v) => !v)}
                className="mt-1 self-start text-[13px] font-semibold text-[var(--cl-ink)] hover:underline"
              >
                {showFullDescription ? "ver menos" : "ler mais"}
              </button>
            )}

            {(tags.length > 0 || isActivePremium) && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {tags.map((tag) => (
                  <span key={tag} className="classifieds-tag">
                    {tag}
                  </span>
                ))}
                {isActivePremium && (
                  <span className="classifieds-tag bg-amber-50 text-amber-700">
                    Destaque
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto px-4 pb-4 pt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  toast.info("Faça login para curtir anúncios");
                  return;
                }
                setLiked((v) => !v);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 text-[13px] text-[var(--cl-ink-muted)] transition-colors",
                liked && "text-[var(--cl-heart)]",
              )}
              aria-label="Curtir"
            >
              <Heart
                className={cn(
                  "h-4 w-4 text-[var(--cl-heart)]",
                  liked && "fill-current",
                )}
              />
              <span className="tabular-nums text-[var(--cl-ink)]/80">
                {likesCount}
              </span>
            </button>
            <button
              type="button"
              onClick={handleContactClick}
              disabled={isOwner}
              className="inline-flex items-center gap-1.5 text-[13px] text-[var(--cl-ink-muted)] hover:text-[var(--cl-request)] transition-colors disabled:opacity-40"
              aria-label="Conversar"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="tabular-nums text-[var(--cl-ink)]/80">
                {commentsCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            {priceLabel && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[12px] font-medium text-[var(--cl-ink-secondary)] truncate max-w-[160px]">
                <Tag className="h-3.5 w-3.5 shrink-0" />
                {priceLabel}
              </span>
            )}
            <Button
              onClick={handleContactClick}
              disabled={isOwner}
              size="sm"
              className={cn(
                "classifieds-cta",
                isOwner && "opacity-50 cursor-not-allowed",
              )}
            >
              Ver mais
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </Button>
          </div>
        </div>

        {priceLabel && (
          <div className="sm:hidden px-4 pb-3 -mt-1">
            <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--cl-ink-secondary)]">
              <Tag className="h-3.5 w-3.5" />
              {priceLabel}
            </span>
          </div>
        )}
      </GuestBlurOverlay>
    </article>
  );
}
