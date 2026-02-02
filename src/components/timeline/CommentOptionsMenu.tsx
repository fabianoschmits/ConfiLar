import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCloseOnScroll } from "@/hooks/useCloseOnScroll";
import { ReportButton, ReportDialog } from "@/components/ReportButton";

interface CommentOptionsMenuProps {
  commentId: string;
  commentUserId: string;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function CommentOptionsMenu({
  commentId,
  commentUserId,
  onEdit,
  onDelete,
  isDeleting = false,
}: CommentOptionsMenuProps) {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useCloseOnScroll(isOpen, setIsOpen);

  // Se não houver usuário logado
  if (!user) {
    return null;
  }

  const isOwner = user.id === commentUserId;

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-100"
            disabled={isDeleting}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {isOwner ? (
            <>
              <DropdownMenuItem
                onClick={() => {
                  onEdit();
                  setIsOpen(false);
                }}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => setShowReportDialog(true)} asChild>
              <ReportButton
                type="comment"
                targetId={commentId}
                targetName="Comentário"
                reportedUserId={commentUserId}
                asDropdownItem={true}
                className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-gray-50 border-0 h-8"
              />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDialog
        isOpen={showReportDialog}
        onOpenChange={setShowReportDialog}
        type="comment"
        targetId={commentId}
        targetName="Comentário"
        reportedUserId={commentUserId}
      />
    </>
  );
}
