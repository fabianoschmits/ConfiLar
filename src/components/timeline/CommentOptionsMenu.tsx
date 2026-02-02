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

  useCloseOnScroll(isOpen, setIsOpen);

  // Só mostrar o menu se for o autor do comentário
  if (!user || user.id !== commentUserId) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
