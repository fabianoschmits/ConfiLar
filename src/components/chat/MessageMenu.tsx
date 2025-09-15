'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  MoreHorizontal, 
  Trash2, 
  Edit,
  Copy,
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

interface MessageMenuProps {
  messageId: string
  messageContent: string
  onDelete: (messageId: string) => void
  onEdit?: (messageId: string, newContent: string) => void
  disabled?: boolean
}

export function MessageMenu({ 
  messageId, 
  messageContent,
  onDelete, 
  onEdit,
  disabled = false 
}: MessageMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete(messageId)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(messageContent)
    // Você pode adicionar um toast aqui se quiser
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="p-1 hover:bg-black/10 rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-40 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none"
        >
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              handleCopy()
            }}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 font-black text-black text-xs"
          >
            <Copy className="h-3 w-3" />
            Copiar
          </DropdownMenuItem>
          
          {onEdit && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onEdit(messageId, messageContent)
              }}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 font-black text-black text-xs"
            >
              <Edit className="h-3 w-3" />
              Editar
            </DropdownMenuItem>
          )}
          
          {onEdit && (
            <DropdownMenuSeparator className="bg-black" />
          )}
          
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              setShowDeleteDialog(true)
            }}
            className="flex items-center gap-2 cursor-pointer hover:bg-red-100 focus:bg-red-100 font-black text-red-600 text-xs"
          >
            <Trash2 className="h-3 w-3" />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-black text-black text-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              DELETAR MENSAGEM
            </AlertDialogTitle>
            <AlertDialogDescription className="font-bold text-gray-700 space-y-2">
              <p>Tem certeza que deseja deletar esta mensagem?</p>
              <div className="bg-yellow-100 border-2 border-yellow-400 p-3 rounded">
                <p className="text-sm font-black text-yellow-800">
                  ⚠️ IMPORTANTE:
                </p>
                <p className="text-sm text-yellow-700">
                  • Esta ação não pode ser desfeita
                </p>
                <p className="text-sm text-yellow-700">
                  • A mensagem será removida para você E para o outro usuário
                </p>
                <p className="text-sm text-yellow-700">
                  • Ambos não conseguirão mais ver esta mensagem
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              onClick={() => setShowDeleteDialog(false)}
              className="bg-gray-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black rounded-none text-sm"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-black rounded-none text-sm disabled:opacity-50"
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
