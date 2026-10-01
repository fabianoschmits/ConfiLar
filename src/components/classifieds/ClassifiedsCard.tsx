"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Edit,
  Flag,
  Heart,
  MapPin,
  Megaphone,
  MessageCircle,
  MoreVertical,
  Share2,
  Tag,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "@/components/ReportDialog";
import { useCloseOnScroll } from "@/hooks/useCloseOnScroll";
import { ProVerifiedBadge } from "@/components/ui/ProVerifiedBadge";
import { cn } from "@/lib/utils";
import { GuestBlurOverlay } from "@/components/auth/GuestBlurOverlay";

interface ClassifiedsCardProps {
  ad: any;
  onEdit?: (ad: any) => void;
  onDelete?: (adId: string) => void;
  onRenewPremium?: (adId: string) => void;
  isDeleting?: boolean;
  isHighlighted?: boolean;
  onShare?: (ad: any) => void;
  onOpenDetails?: (ad: any, focusComments?: boolean) => void;
  onToggleLike?: (ad: any) => void;
  isLiked?: boolean;
  isLikePending?: boolean;
  likesCount?: number;
  commentsCount?: number;
}

function parseTags(category?: string): string[] {
  if (!category) return [];

  return [
    ...new Set(
      category
        .split(/[,|/·•]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ].slice(0, 4);
}

function relativeTime(iso?: string): string {
  if (!iso) return "";

  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));

  if (minutes < 60) return minutes + "min atrás";

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h atrás";

  const days = Math.floor(hours / 24);
  if (days < 7) return days + "d atrás";

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
  onOpenDetails,
  onToggleLike,
  isLiked = false,
  isLikePending = false,
  likesCount,
  commentsCount,
}: ClassifiedsCardProps) {
  const { user } = useAuthContext();
  const { isAdmin } = useIsAdmin();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useCloseOnScroll(isMenuOpen, setIsMenuOpen);

  let images: string[] = [];
  try {
    if (Array.isArray(ad.images)) {
      images = ad.images;
    } else if (typeof ad.images === "string") {
      const parsedImages = JSON.parse(ad.images);
      if (Array.isArray(parsedImages)) images = parsedImages;
    }
  } catch {
    images = [];
  }

  const isOwner = user?.id === ad.user_id;
  const isOffer = ad.ad_type === "oferecer";
  const premiumExpired = ad.premium_expires_at
    ? new Date(ad.premium_expires_at) < new Date()
    : false;
  const isActivePremium = Boolean(ad.is_premium) && !premiumExpired;
  const tags = parseTags(ad.category);
  const subtitle = isOffer
    ? ad.category || "Profissional"
    : "Preciso de um profissional";
  const locationLabel = [ad.location_city, ad.location_state]
    .filter(Boolean)
    .join(" - ");
  const timeLabel = relativeTime(ad.created_at);
  const priceLabel = ad.price_range
    ? isOffer
      ? "A partir de R$ " + ad.price_range
      : "Tenho até R$ " + ad.price_range
    : null;
  const displayLikesCount = likesCount ?? ad.likes_count ?? 0;
  const displayCommentsCount = commentsCount ?? ad.comments_count ?? 0;

  const showDetails = (focusComments = false) => {
    onOpenDetails?.(ad, focusComments);
  };

  const nextImage = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((current) => (current + 1) % images.length);
    }
  };

  const previousImage = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((current) =>
        current === 0 ? images.length - 1 : current - 1,
      );
    }
  };

  return (
    <article
      className={cn(
        "classifieds-card group relative flex flex-col overflow-hidden border border-[var(--cl-border)] bg-[var(--cl-surface)] shadow-[var(--cl-shadow)]",
        isHighlighted && "z-10 ring-2 ring-sky-400",
        isActivePremium &&
          "premium-border-shine border-[var(--cl-teal)]/40 ring-2 ring-[var(--cl-teal)]/35",
      )}
    >
      {!user && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-4 pt-4">
          <div className="flex items-center gap-3">
            <Link
              href={"/perfil/" + ad.user_id}
              className="pointer-events-auto"
            >
              <Avatar className="classifieds-author-avatar h-14 w-14 border border-[var(--cl-border)]">
                <AvatarImage
                  src={ad.user_avatar || ad.user_avatar_url || ""}
                  alt={ad.user_name || "Usuário"}
                />
                <AvatarFallback className="bg-[var(--cl-mist)] font-bold uppercase text-[var(--cl-ink)]">
                  {(ad.user_name || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Link
              href={"/perfil/" + ad.user_id}
              className="pointer-events-auto text-sm font-semibold text-[var(--cl-ink)] hover:underline"
            >
              {ad.user_name}
            </Link>
          </div>
        </div>
      )}

      <GuestBlurOverlay isGuest={!user} className="flex flex-1 flex-col">
        <header className="flex items-start gap-3 px-4 pb-3 pt-4">
          <Link href={"/perfil/" + ad.user_id} className="shrink-0">
            <Avatar className="classifieds-author-avatar h-14 w-14 border border-[var(--cl-border)]">
              <AvatarImage
                src={ad.user_avatar || ad.user_avatar_url || ""}
                alt={ad.user_name || "Usuário"}
              />
              <AvatarFallback className="bg-[var(--cl-mist)] font-bold uppercase text-[var(--cl-ink)]">
                {(ad.user_name || "U").charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="min-w-0 flex-1 pt-0.5">
            <Link
              href={"/perfil/" + ad.user_id}
              className="flex min-w-0 items-center gap-1.5"
            >
              <span className="truncate text-[16px] font-semibold leading-tight text-[var(--cl-ink)] hover:underline">
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
              {subtitle}
            </p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[var(--cl-ink-muted)]">
              {locationLabel && (
                <>
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{locationLabel}</span>
                </>
              )}
              {locationLabel && timeLabel && (
                <span className="shrink-0 opacity-60">·</span>
              )}
              {timeLabel && <span className="shrink-0">{timeLabel}</span>}
            </p>
          </div>

          <div className="flex shrink-0 items-start gap-1 pt-0.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
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
              <span className="hidden min-[390px]:inline">
                {isOffer ? "Serviço" : "Pedido"}
              </span>
            </span>

            {isActivePremium && (
              <span
                aria-label="Anúncio em destaque"
                className="inline-flex items-center rounded-full bg-[var(--cl-cta)] px-2 py-1 text-[var(--cl-on-cta)]"
              >
                <Crown className="h-3.5 w-3.5" />
              </span>
            )}

            <DropdownMenu
              open={isMenuOpen}
              onOpenChange={setIsMenuOpen}
              modal={false}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[var(--cl-ink-muted)] hover:text-[var(--cl-ink)]"
                  aria-label="Mais opções"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {isOwner && (
                  <DropdownMenuItem onClick={() => onEdit?.(ad)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {isOwner && !isActivePremium && Boolean(ad.is_premium) && (
                  <DropdownMenuItem
                    onClick={() => onRenewPremium?.(ad.id)}
                    className="text-amber-600"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Renovar Premium
                  </DropdownMenuItem>
                )}
                {(isOwner || isAdmin) && (
                  <DropdownMenuItem
                    onClick={() => onDelete?.(ad.id)}
                    className="text-red-600"
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isAdmin && !isOwner ? "Deletar (Admin)" : "Deletar"}
                  </DropdownMenuItem>
                )}
                {!isOwner && (
                  <DropdownMenuItem
                    onClick={() => setShowReportDialog(true)}
                    className="text-red-600"
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Denunciar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onShare?.(ad)}>
                  <Share2 className="mr-2 h-4 w-4" />
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
        </header>

        <div
          role="button"
          tabIndex={0}
          onClick={() => showDetails(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              showDetails(false);
            }
          }}
          className={cn(
            "mx-4 grid min-w-0 gap-3 text-left",
            images.length > 0
              ? "grid-cols-[132px_minmax(0,1fr)] sm:grid-cols-[minmax(0,42%)_minmax(0,1fr)]"
              : "grid-cols-1",
          )}
          aria-label={"Abrir detalhes de " + ad.title}
        >
          {images.length > 0 && (
            <div className="group/media relative aspect-[4/3] overflow-hidden rounded-[14px] bg-[var(--cl-mist)]">
              <img
                src={images[currentImageIndex]}
                alt={ad.title + " - Foto " + (currentImageIndex + 1).toString()}
                className="h-full w-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full p-1 text-white drop-shadow transition-opacity md:opacity-0 md:group-hover/media:opacity-100"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1 text-white drop-shadow transition-opacity md:opacity-0 md:group-hover/media:opacity-100"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <span className="pointer-events-none absolute bottom-2 right-2 rounded-lg bg-[var(--cl-cta)]/85 px-2 py-0.5 text-[11px] font-semibold text-[var(--cl-on-cta)]">
                    +{images.length - 1}
                  </span>
                </>
              )}
            </div>
          )}

          <div className="flex min-w-0 flex-col">
            <h3 className="line-clamp-2 text-[16px] font-bold leading-snug text-[var(--cl-ink)] sm:text-[18px]">
              {ad.title}
            </h3>
            <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-[var(--cl-ink-secondary)] sm:text-[14px]">
              {ad.description}
            </p>

            {(tags.length > 0 || isActivePremium) && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="classifieds-tag">
                    {tag}
                  </span>
                ))}
                {isActivePremium && (
                  <span className="classifieds-tag bg-amber-50 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200">
                    Destaque
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="mt-auto flex items-center gap-2 px-4 pb-4 pt-3">
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleLike?.(ad)}
              disabled={isLikePending}
              className={cn(
                "inline-flex items-center gap-1.5 text-[13px] transition-colors disabled:cursor-wait disabled:opacity-60",
                isLiked
                  ? "text-[var(--cl-heart)]"
                  : "text-[var(--cl-ink-muted)] hover:text-[var(--cl-heart)]",
              )}
              aria-label={isLiked ? "Remover curtida" : "Curtir anúncio"}
              aria-pressed={isLiked}
            >
              <Heart
                className={cn("h-[18px] w-[18px]", isLiked && "fill-current")}
              />
              <span className="tabular-nums text-[var(--cl-ink)]/80">
                {displayLikesCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => showDetails(true)}
              className="inline-flex items-center gap-1.5 text-[13px] text-[var(--cl-ink-muted)] transition-colors hover:text-[var(--cl-request)]"
              aria-label="Abrir comentários"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
              <span className="tabular-nums text-[var(--cl-ink)]/80">
                {displayCommentsCount}
              </span>
            </button>
          </div>

          <div className="ml-auto flex min-w-0 items-center gap-1.5">
            {priceLabel && (
              <span className="classifieds-price inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-medium text-[var(--cl-ink-secondary)] sm:text-[13px]">
                <Tag className="h-3.5 w-3.5 shrink-0" />
                <span>{priceLabel}</span>
              </span>
            )}
            <Button
              onClick={() => showDetails(false)}
              size="sm"
              className="classifieds-cta classifieds-cta--compact shrink-0"
            >
              Ver mais
              <ChevronRight className="ml-0.5 h-4 w-4" />
            </Button>
          </div>
        </footer>
      </GuestBlurOverlay>
    </article>
  );
}
