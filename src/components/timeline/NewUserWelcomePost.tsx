import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Eye,
  MessageCircle,
  Loader2,
  MoreHorizontal,
  User,
  Flag,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { DynamicAvailabilityBadge } from "@/components/ui/DynamicAvailabilityBadge";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { usePostViews, usePostViewTracker } from "@/hooks/usePostViews";
import { useCommentsCount } from "@/hooks/useCommentsCount";
import { useCloseOnScroll } from "@/hooks/useCloseOnScroll";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportButton } from "@/components/ReportButton";
import { ReportDialog } from "@/components/ReportDialog";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface NewUserWelcomePostProps {
  post: {
    id: string;
    title: string;
    user_id?: string;
    professional_id?: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    location_city?: string;
    location_state?: string;
    metadata?: {
      type?: string;
      user?: string;
      user_type?: string;
      location_city?: string;
      location_state?: string;
      bio?: string;
      avatar_url?: string;
    };
  };
  onDelete?: (postId: string) => void;
  isDeleting?: boolean;
  showComments?: boolean;
}

export function NewUserWelcomePost({
  post,
  onDelete,
  isDeleting = false,
  showComments = true,
}: NewUserWelcomePostProps) {
  const { user } = useAuthContext();
  const { openChat } = useFloatingChat();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useCloseOnScroll(isOpen, setIsOpen);

  // Hook para gerenciar visualizações
  const { viewsCount } = usePostViews(post.id);
  usePostViewTracker(post.id); // Registra visualização automaticamente

  // Hook para gerenciar contagem de comentários
  const { count: commentsCount } = useCommentsCount(post.id);

  const canDelete = user?.id === post.user_id;

  // Debug: verificar os dados recebidos
  console.log("🔍 NewUserWelcomePost Debug:", {
    postId: post.id,
    title: post.title,
    user_id: post.user_id,
    professional_id: post.professional_id,
    location_city: post.location_city,
    location_state: post.location_state,
    metadata: post.metadata,
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) {
      return "Agora mesmo";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d atrás`;
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
      setShowDeleteDialog(false);
    }
  };

  // Extrair dados do usuário - priorizando metadata, depois post
  const userName = post.metadata?.user || "Usuário";
  const userAvatar = post.metadata?.avatar_url || "";
  const userBio =
    post.metadata?.bio || "Profissional qualificado e experiente.";
  const userLocationCity =
    (post.metadata?.location_city && post.metadata.location_city !== "null") ||
    (post.location_city && post.location_city !== "null")
      ? post.metadata?.location_city || post.location_city
      : "Cidade";
  const userLocationState =
    post.metadata?.location_state || post.location_state || "Estado";
  const userType = post.metadata?.user_type || "profissional";

  return (
    <>
      <Card className="mb-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-3 md:p-4">
          {/* Header - Responsivo */}
          <div className="flex items-start space-x-3 mb-3">
            <div className="flex-shrink-0">
              <Link href={`/perfil/${post.user_id || ""}`}>
                <UserAvatar
                  src={userAvatar}
                  alt={userName}
                  fallback={userName.charAt(0).toUpperCase()}
                  size="lg"
                  userId={post.user_id}
                  showReferralBadge={true}
                  className="cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all w-12 h-12 md:w-14 md:h-14"
                />
              </Link>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white hover:text-blue-600 cursor-pointer transition-colors truncate">
                  <Link href={`/perfil/${post.user_id || ""}`}>{userName}</Link>
                </h3>

                {/* Badge Dinâmica de Status */}
                <div className="flex-shrink-0">
                  <DynamicAvailabilityBadge userId={post.user_id || ""} />
                </div>

                {/* Badge de Tipo de Usuário */}
                <Badge
                  variant="outline"
                  className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 flex items-center gap-0.5 sm:gap-1"
                >
                  <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="hidden sm:inline">
                    {userType === "professional" ? "Profissional" : "Cliente"}
                  </span>
                  <span className="sm:hidden">
                    {userType === "professional" ? "Prof" : "Cliente"}
                  </span>
                </Badge>
              </div>

              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">
                  {userLocationCity}, {userLocationState}
                </span>
              </div>

              {/* Mensagem de boas-vindas personalizada e responsiva */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-xs">
                      🎉
                    </span>
                  </div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                    Bem-vindo à ConfiLar!
                  </h4>
                </div>
                <p className="text-blue-800 dark:text-blue-200 text-xs md:text-sm leading-relaxed">
                  {userType === "professional"
                    ? `Olá! Sou ${userName} e acabei de me juntar à plataforma! 🎉 Estou aqui para oferecer meus serviços profissionais e prestar um excelente trabalho para clientes. Fico feliz em fazer parte desta comunidade!`
                    : `Olá! Sou ${userName} e acabei de me juntar à plataforma! 🎉 Estou aqui para encontrar profissionais qualificados para meus projetos. Mal posso esperar para conhecer a comunidade!`}
                </p>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimeAgo(post.created_at)}
              </div>
            </div>

            {/* Menu de opções */}
            <div className="flex-shrink-0">
              <DropdownMenu
                open={isOpen}
                onOpenChange={setIsOpen}
                modal={false}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 bg-transparent hover:bg-transparent border-0 shadow-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {canDelete ? (
                    // Opções para o dono do post
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Loader2 className="h-4 w-4 mr-2" />
                      Deletar Post
                    </DropdownMenuItem>
                  ) : (
                    // Opções para outros usuários
                    <DropdownMenuItem
                      onClick={() => setShowReportDialog(true)}
                      asChild
                    >
                      <div className="flex items-center gap-2 w-full justify-start text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-500">
                        <Flag className="h-4 w-4" />
                        <span>Denunciar</span>
                      </div>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <ReportDialog
                isOpen={showReportDialog}
                onOpenChange={setShowReportDialog}
                type="post"
                targetId={post.id}
                targetName={post.title}
                reportedUserId={post.user_id}
              />
            </div>
          </div>

          {/* Botões de ação - Responsivos */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-3">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Eye className="h-3 w-3 mr-1" />
                <span className="text-xs">{viewsCount || 0}</span>
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-3 w-3 mr-1" />
                <span className="text-xs">{commentsCount || 0}</span>
              </div>
            </div>

            <div className="flex gap-1 md:gap-2">
              <Button
                size="sm"
                variant="outline"
                asChild
                className="text-xs px-2 py-1 h-7"
              >
                <Link href={`/perfil/${post.user_id || ""}`}>
                  <span className="hidden sm:inline">Ver Perfil</span>
                  <span className="sm:hidden">Perfil</span>
                </Link>
              </Button>
              <Button
                size="sm"
                onClick={() => openChat(post.user_id || "", userName)}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs px-2 py-1 h-7"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Contatar</span>
                <span className="sm:hidden">Chat</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <ResponsiveModal
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Deletar Post de Boas-Vindas"
        description="Tem certeza que deseja deletar este post de boas-vindas? Esta ação não pode ser desfeita."
        footer={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                "Deletar"
              )}
            </Button>
          </div>
        }
      >
        <div />
      </ResponsiveModal>
    </>
  );
}
