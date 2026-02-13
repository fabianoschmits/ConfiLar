import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  MessageCircle,
  UserCheck,
  Star,
  Eye,
  Briefcase,
  User,
  CheckCircle,
  Wrench,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { Badge } from "@/components/ui/badge";
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
import { useAvailabilityContext } from "@/contexts/AvailabilityContext";
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

  return (
    <Card className="group h-full flex flex-col relative border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white dark:bg-black">
      {/* Badge de Serviços - Canto Superior Direito */}
      {profile.user_type === "professional" &&
        profile.professional_services &&
        profile.professional_services.length > 0 && (
          <div className="absolute top-2 right-2 z-30">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  <Wrench className="h-3 w-3 mr-1" />
                  Serviços
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                align="end"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                    <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Serviços Oferecidos
                    </h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {profile.professional_services.map(
                      (service: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {service}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    {profile.professional_services.length}{" "}
                    {profile.professional_services.length === 1
                      ? "serviço"
                      : "serviços"}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

      {/* Guest Header Overlay (Matched Position - Puts explicit User Avatar and Name above the blur) */}
      {isGuest && (
        <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-6 pb-0 pointer-events-none">
          <div className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0 pointer-events-auto">
              <UserAvatar
                src={profile.avatar_url}
                alt={profile.full_name}
                fallback={profile.full_name?.charAt(0).toUpperCase() || "P"}
                size="lg"
                userId={profile.id}
                className="border-2 border-gray-100 dark:border-gray-800"
              />
            </div>
            <div className="flex-1 min-w-0 pt-1 pointer-events-auto">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">
                {profile.full_name}
              </h3>
            </div>
          </div>
        </div>
      )}

      <GuestBlurOverlay
        isGuest={isGuest}
        overlayClassName="inset-0 rounded-none bg-black/5"
        className="flex-1 flex flex-col h-full"
      >
        <CardContent className="p-6 flex-1 flex flex-col">
          {/* Header do Card (Duplicated content for layout spacing under the specific absolute overlay) */}
          <div className="flex items-start space-x-3 mb-4 opacity-0">
            {" "}
            {/* Hidden but takes up space */}
            <div className="flex-shrink-0">
              <UserAvatar src={profile.avatar_url} size="lg" />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-semibold text-transparent">Placeholder</h3>
            </div>
          </div>

          {/* Content below header which is NOT overlayed if not guest, or IS underneath if guest */}

          {/* If NOT guest, we need to show the real clickable header here to be interactive */}
          {!isGuest && (
            <div className="flex items-start space-x-3 mb-4 absolute top-0 left-0 right-0 p-6 z-10">
              <div
                onClick={() => handleProfileClick(profile.id)}
                className="flex-shrink-0 cursor-pointer"
              >
                <UserAvatar
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  fallback={profile.full_name?.charAt(0).toUpperCase() || "P"}
                  size="lg"
                  userId={profile.id}
                  showReferralBadge={true}
                  className="hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  onClick={() => handleProfileClick(profile.id)}
                  className="cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors max-w-[180px]">
                    {profile.full_name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {/* Tag de Tipo de Usuário */}
                  <Badge
                    variant={
                      profile.user_type === "professional"
                        ? "default"
                        : "secondary"
                    }
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 transition-all duration-300",
                      profile.user_type === "professional"
                        ? "bg-primary-100 text-primary-800 border border-primary-200 shadow-sm"
                        : "bg-purple-100 text-purple-800 border border-purple-200 shadow-sm",
                    )}
                  >
                    {profile.user_type === "professional" ? (
                      <>
                        <Briefcase className="h-3 w-3" />
                        Profissional
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3" />
                        Cliente
                      </>
                    )}
                  </Badge>

                  {/* Disponibilidade */}
                  <Badge
                    variant={isAvailable ? "default" : "secondary"}
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 transition-all duration-300",
                      isAvailable
                        ? "bg-success-100 text-success-800 border border-success-200 shadow-sm"
                        : "bg-error-100 text-error-800 border border-error-200 shadow-sm",
                    )}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        isAvailable ? "bg-success-500" : "bg-error-500",
                      )}
                    ></div>
                    {isAvailable
                      ? t
                        ? t("available")
                        : "Disponível"
                      : t
                        ? t("unavailable")
                        : "Indisponível"}
                  </Badge>

                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {profile.location_city}
                    {profile.location_city && profile.location_state && ", "}
                    {profile.location_state}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* For Guest mode, we still need to render the badges/location underneath the header space */}
          {isGuest && (
            <div className="flex items-center gap-2 mt-[-1rem] mb-4 flex-wrap pl-[calc(3rem+0.75rem)]">
              {/* Adjusted margin to pull it up under the absolute header, and padding to align with text */}
              <Badge
                variant={
                  profile.user_type === "professional" ? "default" : "secondary"
                }
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
                  profile.user_type === "professional"
                    ? "bg-primary-100 text-primary-800 border border-primary-200 shadow-sm"
                    : "bg-purple-100 text-purple-800 border border-purple-200 shadow-sm",
                )}
              >
                {profile.user_type === "professional" ? (
                  <>
                    <Briefcase className="h-3 w-3" />
                    Profissional
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3" />
                    Cliente
                  </>
                )}
              </Badge>
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                {profile.location_city}
                {profile.location_city && profile.location_state && ", "}
                {profile.location_state}
              </div>
            </div>
          )}

          {/* Separator Line */}
          <div className="h-px bg-gray-100 dark:bg-gray-800 my-3 mt-auto" />

          {/* Bio */}
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {profile.bio || "Profissional qualificado e experiente."}
          </p>

          {/* Separator Line Bottom */}
          <div className="h-px bg-gray-100 dark:bg-gray-800 my-3" />

          {/* Stats & Avaliações */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(stats.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300",
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
              {stats.rating > 0
                ? `${stats.rating.toFixed(1)} (${stats.reviewCount} avaliações)`
                : "Sem avaliações"}
            </span>
          </div>

          {/* Footer do Card */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col items-center text-xs text-gray-500">
              <div className="flex items-center mb-0.5">
                <Eye className="h-3 w-3 mr-1" />
                <span className="font-medium">{views || 0}</span>
              </div>
              <span className="text-xs">{t ? t("views") : "visitas"}</span>
            </div>

            <div className="flex gap-2 items-center">
              <div onClick={(e) => e.stopPropagation()}>
                <FavoriteButton
                  userId={profile.id}
                  userName={profile.full_name || "Usuário"}
                  size="sm"
                  variant="outline"
                />
              </div>

              <RecommendationButton
                userId={profile.id}
                userName={profile.full_name || "Usuário"}
                size="sm"
                variant="outline"
                showCount={false}
                className="text-xs"
                label="Ver"
                vertical={true}
              />

              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleProfileClick(profile.id)}
              >
                {t ? t("viewProfile") : "Ver Perfil"}
              </Button>

              {profile.user_type === "professional" && (
                <Button
                  size="sm"
                  onClick={handleContactClick}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  title={t ? t("contact") : "Contatar"}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </GuestBlurOverlay>
    </Card>
  );
}
