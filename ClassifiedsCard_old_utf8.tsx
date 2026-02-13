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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { PostMedia } from "@/components/timeline/PostMedia";
import { MentionText } from "@/components/ui/MentionText";
import { ReportButton } from "@/components/ReportButton";
import { ReportDialog } from "@/components/ReportDialog";
import { useCloseOnScroll } from "@/hooks/useCloseOnScroll";
import { PremiumTimeRemaining } from "@/components/classifieds/PremiumTimeRemaining";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getCategoryById } from "@/data/serviceCategories"; // Assuming this helper exists or similar logic

// Defining props based on usage
interface ClassifiedsCardProps {
  ad: any; // Using any for now matching the existing data structure loosely
  onEdit?: (ad: any) => void;
  onDelete?: (adId: string) => void;
  onRenewPremium?: (adId: string) => void;
  isDeleting?: boolean;
  isHighlighted?: boolean;
  onShare?: (ad: any) => void;
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
  const [userInfoExpanded, setUserInfoExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useCloseOnScroll(isOpen, setIsOpen);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images && images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images && images.length > 1) {
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

  const isOwner = user?.id === ad.user_id;

  // Ensure images is safely parsed as an array
  let images: string[] = [];
  try {
    if (Array.isArray(ad.images)) {
      images = ad.images;
    } else if (typeof ad.images === "string") {
      // If it's a JSON string, parse it
      const parsed = JSON.parse(ad.images);
      if (Array.isArray(parsed)) images = parsed;
    }
  } catch (e) {
    console.error("Error parsing images:", e);
    images = [];
  }

  // Premium Logic
  const isPremiumAd = ad.is_premium || false;
  const premiumExpired = ad.premium_expires_at
    ? new Date(ad.premium_expires_at) < new Date()
    : false;
  const isActivePremium = isPremiumAd && !premiumExpired;

  // Contact Handler
  const handleContactClick = () => {
    if (isOwner) {
      toast.info("Este ├® o seu pr├│prio an├║ncio!");
      return;
    }
    openChat(ad.user_id, ad.user_name || "Usu├írio");
    toast.success(`Abrindo chat com ${ad.user_name}...`);
  };

  // Truncate Description
  const description = ad.description || "";
  const shouldTruncate = description.length > 150;
  const displayDescription =
    shouldTruncate && !showFullDescription
      ? description.slice(0, 150) + "..."
      : description;

  // Category Icon helper (inline or import)
  // Reusing logic from page.tsx: services are imported there, maybe should pass category object or just string
  const categoryIcon = "­ƒöº"; // Default, could be improved by looking up service icon

  return (
    <div
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-3xl bg-white dark:bg-black border transition-all duration-500",
        isHighlighted
          ? "border-blue-400 dark:border-blue-700 z-10 shadow-sm"
          : isActivePremium
            ? "border-warning-200 dark:border-warning-800 ring-1 ring-warning-100 dark:ring-warning-900 shadow-sm"
            : "border-gray-200 dark:border-gray-800",
        "hover:shadow-lg",
      )}
    >
      {isHighlighted && (
        <div className="absolute inset-0 rounded-3xl ring-4 ring-blue-500 dark:ring-blue-600 animate-pulse pointer-events-none z-10 shadow-[0_0_25px_rgba(59,130,246,0.6)]" />
      )}
      {/* 1. Header: Tags + Location */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Ad Type Badge */}
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              ad.ad_type === "oferecer"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            )}
          >
            {ad.ad_type === "oferecer" ? "Oferta" : "Solicita├º├úo"}
          </Badge>

          {/* Location Badge */}
          {ad.location_city && (
            <Badge
              variant="outline"
              className="text-[10px] font-medium px-2 py-0.5 rounded-full border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 gap-1"
            >
              <MapPin className="w-3 h-3" />
              {ad.location_city}
            </Badge>
          )}

          {/* Premium Badge */}
          {isActivePremium && (
            <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm gap-1">
              <Crown className="h-3 w-3" />
              Premium
            </Badge>
          )}

          {/* Creation Date */}
          {ad.created_at && (
            <div
              className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 ml-1"
              title={`Criado em: ${new Date(ad.created_at).toLocaleDateString("pt-BR")}`}
            >
              <Clock className="w-3 h-3" />
              <span className="capitalize">
                {formatDistanceToNow(new Date(ad.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          )}
        </div>

        {/* Options Menu */}
        {/* Options Menu */}
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner && (
              <DropdownMenuItem onClick={() => onEdit && onEdit(ad)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            )}

            {isOwner && isActivePremium && premiumExpired && (
              <DropdownMenuItem
                onClick={() => onRenewPremium && onRenewPremium(ad.id)}
                className="text-yellow-600 dark:text-yellow-400"
              >
                <Crown className="h-4 w-4 mr-2" />
                Renovar Premium
              </DropdownMenuItem>
            )}

            {(isOwner || isAdmin) && (
              <DropdownMenuItem
                onClick={() => onDelete && onDelete(ad.id)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isAdmin && !isOwner ? "Deletar (Admin)" : "Deletar"}
              </DropdownMenuItem>
            )}

            {!isOwner && (
              <DropdownMenuItem
                onClick={() => setShowReportDialog(true)}
                className="text-red-600 hover:text-red-700"
              >
                <div className="flex items-center w-full">
                  <Flag className="h-4 w-4 mr-2" />
                  Denunciar
                </div>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => onShare && onShare(ad)}>
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

      {/* 2. Title */}
      <div className="px-5 pb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
          {ad.title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {ad.category}
          </Badge>
        </div>
      </div>

      {/* 3. Media Area (Only if images exist) */}
      {/* 3. Media Area (Only if images exist) */}
      {/* 3. Media Area (Only if images exist) */}
      {images && images.length > 0 && (
        <div
          className={cn(
            "w-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden group/media transition-all duration-500 ease-in-out cursor-pointer",
            isImageExpanded ? "h-auto" : "aspect-video",
          )}
          onClick={toggleImageExpand}
        >
          <img
            key={currentImageIndex} // Trigger animation on change
            src={images[currentImageIndex]}
            alt={`${ad.title} - Foto ${currentImageIndex + 1}`}
            className={cn(
              "w-full animate-in fade-in zoom-in-95 duration-300", // Animation classes
              isImageExpanded
                ? "h-auto max-h-[600px] object-contain"
                : "h-full object-cover group-hover:scale-105 transition-transform",
            )}
          />

          {/* Expand Hint Icon (Only on hover when not expanded) */}
          {/* Expand Hint Icon (Only on hover when not expanded) - REMOVED */}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-1 top-1/2 -translate-y-1/2 text-white/90 hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-0 group-hover/media:opacity-100 transition-all hover:scale-110 z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-white/90 hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-0 group-hover/media:opacity-100 transition-all hover:scale-110 z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Count badge */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium pointer-events-none">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}

      {/* 4. Description */}
      <div className="px-5 py-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          <MentionText text={displayDescription} />
          {shouldTruncate && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-primary-600 dark:text-primary-400 ml-1 font-medium hover:underline text-xs"
            >
              {showFullDescription ? "ler menos" : "ler mais"}
            </button>
          )}
        </p>

        {/* Price Range if available */}
        {ad.price_range && (
          <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
            <span className="text-green-600 dark:text-green-500">R$</span>
            {ad.price_range}
          </div>
        )}
      </div>

      {/* 5. Footer: User + Contact */}
      <div className="mt-auto bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800">
        <div className="px-5 py-4 flex items-center justify-between">
          {/* User Info with Badge at Bottom Right */}
          <div className="flex items-center gap-3">
            <Link href={`/perfil/${ad.user_id}`} className="block">
              <UserAvatar
                src={ad.user_avatar_url}
                alt={ad.user_name}
                fallback={ad.user_name?.charAt(0).toUpperCase()}
                size="md"
                userId={ad.user_id}
                showReferralBadge={true}
                badgePlacement="top-right" // Moved to top as requested
                className="border border-white dark:border-gray-700 shadow-sm"
              />
            </Link>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                Anunciante
              </span>
              <div className="flex items-center gap-1">
                <Link
                  href={`/perfil/${ad.user_id}`}
                  className="text-sm font-bold text-gray-900 dark:text-white hover:underline truncate max-w-[120px] sm:max-w-[150px]"
                >
                  {ad.user_name}
                </Link>
                <button
                  onClick={() => setUserInfoExpanded(!userInfoExpanded)}
                  className="h-4 w-4 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400"
                >
                  <ChevronDown
                    className={cn(
                      "w-2.5 h-2.5 transition-transform",
                      userInfoExpanded && "transform rotate-180",
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Contact Button */}
          <Button
            onClick={handleContactClick}
            disabled={isOwner}
            className={cn(
              "rounded-full px-5 font-semibold shadow-sm transition-all hover:shadow-md active:scale-95",
              isOwner ? "opacity-50 cursor-not-allowed" : "",
            )}
            variant={isActivePremium ? "default" : "secondary"}
            size="sm"
          >
            Contatar
          </Button>
        </div>

        {/* Expanded User Info (Stats) */}
        {userInfoExpanded && ad.user_profile && (
          <div className="px-5 pb-4 pt-0 text-xs animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              {ad.user_profile.idade && (
                <div className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-white block text-[10px] uppercase opacity-70">
                    Idade
                  </span>
                  {ad.user_profile.idade} anos
                </div>
              )}
              {ad.user_profile.estado_civil && (
                <div className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-white block text-[10px] uppercase opacity-70">
                    Estado Civil
                  </span>
                  {ad.user_profile.estado_civil}
                </div>
              )}
              {ad.user_profile.escolaridade && (
                <div className="text-gray-600 dark:text-gray-300 col-span-2">
                  <span className="font-semibold text-gray-900 dark:text-white block text-[10px] uppercase opacity-70">
                    Escolaridade
                  </span>
                  {ad.user_profile.escolaridade.replace(/_/g, " ")}
                </div>
              )}
              {ad.user_profile.filhos !== undefined &&
                ad.user_profile.filhos > 0 && (
                  <div className="text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-gray-900 dark:text-white block text-[10px] uppercase opacity-70">
                      Filhos
                    </span>
                    {ad.user_profile.filhos}
                  </div>
                )}
              {ad.user_profile.professional_experience_years && (
                <div className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-white block text-[10px] uppercase opacity-70">
                    Experi├¬ncia
                  </span>
                  {ad.user_profile.professional_experience_years} anos
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
