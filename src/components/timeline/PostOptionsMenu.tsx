'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

interface PostOptionsMenuProps {
  postId: string
  postUserId: string
  onEdit: (postId: string) => void
  onDelete: (postId: string) => void
  isDeleting?: boolean
}

export function PostOptionsMenu({ 
  postId, 
  postUserId, 
  onEdit, 
  onDelete, 
  isDeleting = false 
}: PostOptionsMenuProps) {
  const { user } = useAuthContext()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Só mostrar opções se for o dono do post
  if (!user || user.id !== postUserId) {
    return null
  }

  const handleDelete = () => {
    onDelete(postId)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-gray-100"
            disabled={isDeleting}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={() => onEdit(postId)}
            className="cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Post
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar Post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Post</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.
              O post e todas as suas interações (curtidas, comentários) serão removidas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Deletar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
