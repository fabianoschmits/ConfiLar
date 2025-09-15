'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  MoreVertical, 
  Trash2, 
  Archive, 
  Pin,
  AlertTriangle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

interface ConversationMenuProps {
  conversationId: string
  onDelete: (conversationId: string) => void
  onArchive?: (conversationId: string) => void
  onPin?: (conversationId: string) => void
  disabled?: boolean
}

export function ConversationMenu({ 
  conversationId, 
  onDelete, 
  onArchive, 
  onPin,
  disabled = false 
}: ConversationMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete(conversationId)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Erro ao deletar conversa:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="p-1 hover:bg-gray-200 rounded-none"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4 text-gray-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none"
        >
          {onPin && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onPin(conversationId)
              }}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 font-black text-black"
            >
              <Pin className="h-4 w-4" />
              Fixar Conversa
            </DropdownMenuItem>
          )}
          
          {onArchive && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onArchive(conversationId)
              }}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 font-black text-black"
            >
              <Archive className="h-4 w-4" />
              Arquivar
            </DropdownMenuItem>
          )}
          
          {(onPin || onArchive) && (
            <DropdownMenuSeparator className="bg-black" />
          )}
          
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              setShowDeleteDialog(true)
            }}
            className="flex items-center gap-2 cursor-pointer hover:bg-red-100 focus:bg-red-100 font-black text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Deletar Conversa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-black text-black text-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              DELETAR CONVERSA
            </AlertDialogTitle>
            <AlertDialogDescription className="font-bold text-gray-700">
              Tem certeza que deseja deletar esta conversa? Esta ação não pode ser desfeita e todas as mensagens serão perdidas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              onClick={() => setShowDeleteDialog(false)}
              className="bg-gray-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black rounded-none"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black rounded-none disabled:opacity-50"
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
