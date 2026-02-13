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
    <Card className="group h-full flex flex-col relative border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white dark:bg-black">
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
                  className="h-7 py-0 px-2 text-[10px] sm:text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-colors uppercase font-bold tracking-wider"
                >
                  <Wrench className="h-3 w-3 mr-1" />
                  Serviços
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-72 sm:w-80 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-2xl p-0 overflow-hidden"
                align="end"
                sideOffset={5}
              >
                <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-primary-500" />
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tight">
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
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
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
          </div>
        )}

      <CardContent className="p-5 sm:p-6 flex-1 flex flex-col h-full overflow-hidden">
        {/* Header - Interactive for Auth, Static for Guest */}
        <div className="flex items-start space-x-4 mb-4">
          <div
            className={cn("flex-shrink-0", !isGuest && "cursor-pointer")}
            onClick={() => !isGuest && handleProfileClick(profile.id)}
          >
            <UserAvatar
              src={profile.avatar_url}
              alt={profile.full_name}
              fallback={profile.full_name?.charAt(0).toUpperCase() || "P"}
              size="lg"
              userId={profile.id}
              showReferralBadge={!isGuest}
              className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 ring-1 ring-gray-100 dark:ring-gray-800",
                !isGuest &&
                  "hover:ring-2 hover:ring-primary-400 transition-all duration-300",
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div
              className={cn(!isGuest && "cursor-pointer group/name")}
              onClick={() => !isGuest && handleProfileClick(profile.id)}
            >
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate transition-colors group-hover/name:text-primary-600 dark:group-hover/name:text-primary-400">
                {profile.full_name}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <Badge
                variant={
                  profile.user_type === "professional" ? "default" : "secondary"
                }
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider h-5",
                  profile.user_type === "professional"
                    ? "bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-950/30 dark:text-primary-400 dark:border-primary-900"
                    : "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900",
                )}
              >
                {profile.user_type === "professional" ? (
                  <Briefcase className="h-2.5 w-2.5" />
                ) : (
                  <User className="h-2.5 w-2.5" />
                )}
                {profile.user_type === "professional"
                  ? "Profissional"
                  : "Cliente"}
              </Badge>

              <Badge
                variant={isAvailable ? "default" : "secondary"}
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider h-5",
                  isAvailable
                    ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900"
                    : "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900",
                )}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isAvailable ? "bg-green-500 animate-pulse" : "bg-red-500",
                  )}
                />
                {isAvailable
                  ? t?.("available") || "Disponível"
                  : t?.("unavailable") || "Indisponível"}
              </Badge>

              <div className="flex items-center text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-tighter sm:tracking-normal whitespace-nowrap">
                <MapPin className="h-2.5 w-2.5 mr-1 text-gray-400" />
                {profile.location_city}
                {profile.location_city && profile.location_state && ", "}
                {profile.location_state}
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-50 dark:bg-gray-800/50 mb-4" />

        {/* Content with Blur for Guests */}
        <GuestBlurOverlay
          isGuest={isGuest}
          overlayClassName="bg-white/50 dark:bg-black/50 backdrop-blur-[2px] rounded-lg"
          className="flex-1 flex flex-col"
        >
          {/* Bio */}
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2 italic h-[2.5rem] mb-4">
            {profile.bio ||
              "Este perfil ainda não possui uma biografia detalhada."}
          </p>

          {/* Stats Bar */}
          <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800/50 mb-4">
            <div className="flex flex-col">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.floor(stats.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-200 dark:text-gray-700",
                    )}
                  />
                ))}
                <span className="text-xs font-bold text-gray-900 dark:text-white ml-1.5">
                  {stats.rating > 0 ? stats.rating.toFixed(1) : "N/A"}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-500 font-medium">
                {stats.reviewCount}{" "}
                {stats.reviewCount === 1 ? "avaliação" : "avaliações"}
              </span>
            </div>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-800" />

            <div className="flex flex-col items-center">
              <div className="flex items-center text-gray-900 dark:text-white font-bold text-xs">
                <Eye className="h-3 w-3 mr-1 text-blue-500" />
                {views || 0}
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-500 font-medium uppercase tracking-widest">
                {t?.("views") || "visitas"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-auto pt-2">
            <div onClick={(e) => e.stopPropagation()} className="flex gap-1.5">
              <FavoriteButton
                userId={profile.id}
                userName={profile.full_name || "Usuário"}
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0 hover:bg-red-50 dark:hover:bg-red-950/20"
              />
              <RecommendationButton
                userId={profile.id}
                userName={profile.full_name || "Usuário"}
                size="sm"
                variant="ghost"
                showCount={false}
                className="h-9 w-9 p-0 hover:bg-green-50 dark:hover:bg-green-950/20"
                vertical={true}
              />
            </div>

            <div className="flex-1" />

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-4 text-xs font-bold border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5"
                onClick={() => handleProfileClick(profile.id)}
              >
                {t?.("viewProfile") || "Ver Perfil"}
              </Button>

              {!isOwner && profile.user_type === "professional" && (
                <Button
                  size="sm"
                  onClick={handleContactClick}
                  className="h-9 w-9 p-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all active:scale-95"
                  title={t?.("contact") || "Contatar"}
                >
                  <MessageCircle className="h-4.5 w-4.5" />
                </Button>
              )}
            </div>
          </div>
        </GuestBlurOverlay>
      </CardContent>
    </Card>
  );
}
