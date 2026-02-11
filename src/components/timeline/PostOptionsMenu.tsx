"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

import {
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  Flag,
  Crown,
  Shield,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { ReportButton } from "@/components/ReportButton";
import { ReportDialog } from "@/components/ReportDialog";
import { useIsSuperAdmin } from "@/hooks/useAdmin";
import { useCloseOnScroll } from "@/hooks/useCloseOnScroll";

interface PostOptionsMenuProps {
  postId: string;
  postUserId: string;
  postTitle?: string;
  onEdit: (postId: string) => void;
  onDelete: (postId: string) => void;
  onRenewPremium?: (postId: string) => void;
  isDeleting?: boolean;
  isPremium?: boolean;
  premiumExpired?: boolean;
}

export function PostOptionsMenu({
  postId,
  postUserId,
  postTitle,
  onEdit,
  onDelete,
  onRenewPremium,
  isDeleting = false,
  isPremium = false,
  premiumExpired = false,
}: PostOptionsMenuProps) {
  const { user } = useAuthContext();
  const { isSuperAdmin } = useIsSuperAdmin();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fecha o menu ao rolar a página (UX Mobile)
  useCloseOnScroll(isOpen, setIsOpen);

  // Se não há usuário logado, não mostrar menu
  if (!user) {
    return null;
  }

  const isOwner = user.id === postUserId;

  const handleDelete = () => {
    onDelete(postId);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-400 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-900 border-0 shadow-none transition-colors"
            disabled={isDeleting}
            onClick={(e) => e.stopPropagation()}
            aria-label="Opções do post"
            aria-haspopup="true"
          >
            <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-white dark:bg-black border border-gray-200 dark:border-gray-900"
        >
          {isOwner ? (
            // Opções para o dono do post
            <>
              <DropdownMenuItem
                onClick={() => onEdit(postId)}
                className="cursor-pointer transition-smooth text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
                aria-label="Editar post"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Post
              </DropdownMenuItem>
              {isPremium && premiumExpired && onRenewPremium && (
                <DropdownMenuItem
                  onClick={() => onRenewPremium(postId)}
                  className="cursor-pointer text-yellow-600 dark:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-smooth"
                  aria-label="Renovar post premium"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Tornar Premium Novamente
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="cursor-pointer text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-smooth"
                aria-label="Deletar post"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar Post
              </DropdownMenuItem>
            </>
          ) : (
            // Opções para outros usuários
            <>
              {isSuperAdmin && (
                // Apenas super_admin pode deletar posts de outros usuários
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="cursor-pointer text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-smooth"
                  aria-label="Deletar post (super admin)"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Deletar Post (Super Admin)
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setShowReportDialog(true)}
                asChild
              >
                {/* O ReportButton aqui age apenas como o visual do botão */}
                <div className="flex items-center gap-2 w-full text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-500">
                  <Flag className="h-4 w-4" />
                  <span>Denunciar</span>
                </div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ResponsiveModal
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={
          isSuperAdmin && !isOwner
            ? "Deletar Post (Super Admin)"
            : "Deletar Post"
        }
        description={
          isSuperAdmin && !isOwner
            ? "Você está deletando este post como Super Administrador. Esta ação não pode ser desfeita. O post e todas as suas interações serão removidas permanentemente."
            : "Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita. O post e todas as suas interações serão removidas permanentemente."
        }
        footer={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="flex-1 sm:flex-none bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700"
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

      <ReportDialog
        isOpen={showReportDialog}
        onOpenChange={setShowReportDialog}
        type="post"
        targetId={postId}
        targetName={postTitle || "Post"}
        reportedUserId={postUserId}
      />
    </>
  );
}
