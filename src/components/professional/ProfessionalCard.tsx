import Link from "next/link";
import {
  MapPin,
  MessageCircle,
  Star,
  Eye,
  Briefcase,
  User,
  CheckCircle,
  Wrench,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { GuestBlurOverlay } from "@/components/auth/GuestBlurOverlay";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { RecommendationButton } from "@/components/ui/RecommendationButton";
import { ProVerifiedBadge } from "@/components/ui/ProVerifiedBadge";
import { useAvailabilityContext } from "@/contexts/AvailabilityContext";
import { RequestEvaluationButton } from "@/components/chat/RequestEvaluationButton";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface ProfessionalCardProps {
  profile: any;
  stats?: { rating: number; reviewCount: number };
  views?: number;
  isGuest?: boolean;
}

export function ProfessionalCard({
  profile,
  stats = { rating: 0, reviewCount: 0 },
  views = 0,
  isGuest = false,
}: ProfessionalCardProps) {
  const { user } = useAuthContext();
  const { openChat } = useFloatingChat();
  const { userAvailability } = useAvailabilityContext();
  const router = useRouter();
  const t = useTranslations("search");

  // Reuse existing logic
  const isOwner = user?.id === profile.id;

  // Availability Logic
  const isAvailable =
    userAvailability[profile.id] !== undefined
      ? userAvailability[profile.id]
      : profile.is_available;

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOwner) {
      toast.info("Este é o seu próprio perfil!");
      return;
    }
    openChat(profile.id, profile.full_name);
  };

  const handleProfileClick = (id: string) => {
    router.push(`/perfil/${id}`);
  };

  const servicesMenu =
    profile.user_type === "professional" &&
    profile.professional_services &&
    profile.professional_services.length > 0 ? (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="profile-card-services"
            aria-label={`Ver ${profile.professional_services.length} serviços de ${profile.full_name}`}
          >
            <Wrench className="h-3 w-3 mr-1" />
            Serviços <span>({profile.professional_services.length})</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 sm:w-80 bg-[var(--cl-surface)] border-gray-200 dark:border-gray-800 shadow-2xl p-0 overflow-hidden"
          align="end"
          sideOffset={5}
        >
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-primary-500" />
              <h4 className="font-semibold text-sm text-[var(--cl-ink)]">
                Serviços Oferecidos
              </h4>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-2 grid grid-cols-1 gap-1">
            {profile.professional_services.map(
              (service: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-md transition-colors group/item"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-[var(--cl-ink-muted)] mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-tight">
                    {service}
                  </span>
                </div>
              ),
            )}
          </div>
          <div className="p-2 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-500 text-center font-medium">
            {profile.professional_services.length}{" "}
            {profile.professional_services.length === 1
              ? "serviço cadastrado"
              : "serviços cadastrados"}
          </div>
        </PopoverContent>
      </Popover>
    ) : null;

  return (
    <Card className="professional-card">
      <CardContent className="professional-card-content">
        {/* Header - Interactive for Auth, Static for Guest */}
        <div className="profile-card-header">
          <Link
            href={isGuest ? "/auth" : `/perfil/${profile.id}`}
            aria-label={`Ver perfil de ${profile.full_name}`}
            className="profile-card-avatar-link"
          >
            <UserAvatar
              src={profile.avatar_url}
              alt={profile.full_name}
              fallback={profile.full_name?.charAt(0).toUpperCase() || "P"}
              size="lg"
              userId={profile.id}
              showReferralBadge={!isGuest}
              className={cn("profile-card-avatar")}
            />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="profile-card-name-row">
              <h3 className="profile-card-name">
                <Link href={isGuest ? "/auth" : `/perfil/${profile.id}`}>
                  {profile.full_name}
                </Link>
              </h3>
              <ProVerifiedBadge
                isVerified={profile.is_verified}
                isPro={profile.is_pro}
                proExpiresAt={profile.pro_expires_at}
                iconSize={3}
              />
            </div>

            <div className="profile-card-meta">
              <span className="profile-card-role">
                {profile.user_type === "professional" ? (
                  <Briefcase className="h-2.5 w-2.5" />
                ) : (
                  <User className="h-2.5 w-2.5" />
                )}
                {profile.user_type === "professional"
                  ? "Profissional"
                  : "Cliente"}
              </span>

              <span
                className="profile-card-availability"
                data-available={!!isAvailable}
              >
                <span className="profile-card-status-dot" aria-hidden="true" />
                {isAvailable
                  ? t?.("available") || "Disponível"
                  : t?.("unavailable") || "Indisponível"}
              </span>

              <div className="profile-card-location">
                <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
                {profile.location_city}
                {profile.location_city && profile.location_state && ", "}
                {profile.location_state}
              </div>
            </div>
          </div>
        </div>

        {/* Content with Blur for Guests */}
        <GuestBlurOverlay
          isGuest={isGuest}
          overlayClassName="bg-white/50 dark:bg-black/50 backdrop-blur-[2px] rounded-lg"
          className="profile-card-details"
        >
          {/* Bio */}
          <p className="profile-card-bio">
            {profile.bio ||
              "Este perfil ainda não possui uma biografia detalhada."}
          </p>

          {/* Stats Bar */}
          <div className="profile-card-stats">
            <div
              className="profile-card-rating"
              aria-label={`Nota ${stats.rating > 0 ? stats.rating.toFixed(1) : "não disponível"}, ${stats.reviewCount} avaliações`}
            >
              <div className="profile-card-stars" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.floor(stats.rating)
                        ? "profile-card-star-filled"
                        : "profile-card-star-empty",
                    )}
                  />
                ))}
              </div>
              <span className="profile-card-rating-value">
                {stats.rating > 0 ? stats.rating.toFixed(1) : "N/A"}
              </span>
              <span className="profile-card-review-count">
                {stats.reviewCount}{" "}
                {stats.reviewCount === 1 ? "avaliação" : "avaliações"}
              </span>
            </div>

            <div className="profile-card-views">
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{views || 0}</span>
              <span>{t?.("views") || "visitas"}</span>
            </div>
          </div>
          {servicesMenu && (
            <div className="profile-card-services-row">{servicesMenu}</div>
          )}

          {/* Actions */}
          <div className="profile-card-footer">
            <div
              onClick={(e) => e.stopPropagation()}
              className="profile-card-social-actions"
            >
              <FavoriteButton
                userId={profile.id}
                userName={profile.full_name || "Usuário"}
                size="sm"
                variant="ghost"
                compact
                customLabel="Favoritar"
                activeLabel="Favoritado"
                vertical={true}
              />

              <RecommendationButton
                userId={profile.id}
                userName={profile.full_name || "Usuário"}
                size="sm"
                variant="ghost"
                showCount={true}
                compact
                vertical={true}
                customLabel="Indicar"
                activeLabel="Indicado"
              />

              {!isOwner && !isGuest && (
                <RequestEvaluationButton
                  targetUserId={profile.id}
                  targetUserName={profile.full_name || "Usuário"}
                  evaluationCount={stats.reviewCount}
                  compact
                />
              )}
            </div>
            <div className="profile-card-primary-actions">
              <Button
                size="sm"
                variant="outline"
                className="profile-card-profile-button"
                onClick={() => handleProfileClick(profile.id)}
              >
                Perfil
              </Button>

              {!isOwner && profile.user_type === "professional" && (
                <Button
                  size="sm"
                  onClick={handleContactClick}
                  className="profile-card-contact-button"
                  aria-label={t?.("contact") || "Contatar"}
                  title={t?.("contact") || "Contatar"}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Contato</span>
                </Button>
              )}
            </div>
          </div>
        </GuestBlurOverlay>
      </CardContent>
    </Card>
  );
}
